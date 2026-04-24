import sqlite3
import os
import time
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "products.db")
CACHE_TTL_HOURS = 6  # Re-scrape after 6 hours

def get_db_connection():
    retries = 5
    while retries > 0:
        try:
            conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=10)
            conn.row_factory = sqlite3.Row
            return conn
        except sqlite3.OperationalError as e:
            if "locked" in str(e):
                retries -= 1
                time.sleep(0.5)
            else:
                raise e
    raise sqlite3.OperationalError("Database is locked after multiple retries")

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Canonical Products Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            normalized_name TEXT NOT NULL,
            brand TEXT,
            category TEXT,
            tags TEXT,
            main_image TEXT,
            embeddings TEXT
        )
    """)

    # 2. Platform Listings Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS platform_listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT,
            platform_name TEXT NOT NULL,
            product_url TEXT NOT NULL,
            current_price REAL,
            original_price REAL,
            discount_percentage INTEGER DEFAULT 0,
            rating REAL,
            review_count INTEGER DEFAULT 0,
            availability TEXT DEFAULT 'in_stock',
            last_updated DATETIME NOT NULL,
            FOREIGN KEY(product_id) REFERENCES products(id)
        )
    """)

    # 3. Price History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT,
            platform TEXT,
            price REAL,
            timestamp DATETIME,
            FOREIGN KEY(product_id) REFERENCES products(id)
        )
    """)

    # Indexes for fast lookup
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_product_name ON products(normalized_name)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_listing_product ON platform_listings(product_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id)")

    conn.commit()
    conn.close()

# ── PRICE HISTORY ──────────────────────────────────────────────────────────────

def log_price(product_id: str, platform: str, price: float):
    if price is None:
        return
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO price_history (product_id, platform, price, timestamp) VALUES (?, ?, ?, ?)",
            (product_id, platform, price, datetime.now())
        )
        conn.commit()
    finally:
        conn.close()

def get_price_history(product_id: str):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT platform, price, timestamp FROM price_history WHERE product_id = ? ORDER BY timestamp ASC",
            (product_id,)
        )
        rows = cursor.fetchall()
        return [{"platform": row["platform"], "price": row["price"], "timestamp": row["timestamp"]} for row in rows]
    finally:
        conn.close()

# ── PRODUCT CACHE ──────────────────────────────────────────────────────────────

import hashlib

def normalize_query(query: str) -> str:
    return " ".join(sorted(query.lower().strip().split()))

def get_cached_results(query: str):
    """Return cached products for query if fresh (< CACHE_TTL_HOURS old)."""
    # This uses a simple LIKE match for now. In Phase 4, this will be semantic search.
    query_parts = query.lower().split()
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Simple match: fetch products where normalized_name contains query words
        like_clause = " AND ".join(["normalized_name LIKE ?" for _ in query_parts])
        params = [f"%{q}%" for q in query_parts]
        
        cursor.execute(f"SELECT * FROM products WHERE {like_clause}", params)
        product_rows = cursor.fetchall()
        
        if not product_rows:
            return None
            
        results = []
        for p in product_rows:
            product_dict = dict(p)
            cursor.execute("SELECT * FROM platform_listings WHERE product_id = ?", (p['id'],))
            listings = cursor.fetchall()
            
            # If listings are stale, we should re-scrape
            is_stale = False
            cutoff = datetime.now() - timedelta(hours=CACHE_TTL_HOURS)
            
            variants = []
            for l in listings:
                if datetime.strptime(l['last_updated'], "%Y-%m-%d %H:%M:%S.%f") < cutoff:
                    is_stale = True
                    break
                variants.append(dict(l))
                
            if is_stale:
                continue # Skip stale products so they get re-scraped
                
            product_dict['variants'] = variants
            results.append(product_dict)
            
        return results if results else None
    finally:
        conn.close()

def save_canonical_product(canonical_product):
    """Store a full CanonicalProduct from Phase 1 + Phase 4 deduplication."""
    now = datetime.now()
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # 1. Upsert Canonical Product
        cursor.execute("""
            INSERT OR IGNORE INTO products (id, normalized_name, brand, category, tags, main_image, embeddings)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            canonical_product.id,
            canonical_product.title.lower(),
            "", # brand
            "", # category
            "", # tags
            canonical_product.image,
            ""  # embeddings
        ))
        
        # 2. Insert/Update Platform Listings & Price History
        for v in canonical_product.variants:
            cursor.execute("""
                SELECT id FROM platform_listings 
                WHERE product_id = ? AND platform_name = ?
            """, (canonical_product.id, v.platform))
            existing = cursor.fetchone()
            
            if existing:
                cursor.execute("""
                    UPDATE platform_listings SET
                        current_price = ?, original_price = ?, discount_percentage = ?, 
                        rating = ?, review_count = ?, last_updated = ?
                    WHERE id = ?
                """, (
                    v.price if v.price != 'N/A' else None,
                    v.original_price if v.original_price != 'N/A' else None,
                    v.discount_percentage,
                    v.rating,
                    v.review_count,
                    now,
                    existing['id']
                ))
            else:
                cursor.execute("""
                    INSERT INTO platform_listings 
                        (product_id, platform_name, product_url, current_price, original_price, discount_percentage, rating, review_count, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    canonical_product.id,
                    v.platform,
                    v.url,
                    v.price if v.price != 'N/A' else None,
                    v.original_price if v.original_price != 'N/A' else None,
                    v.discount_percentage,
                    v.rating,
                    v.review_count,
                    now
                ))
                
            # Log price history with safe cleaning
            if v.price != 'N/A':
                try:
                    clean_price = float(str(v.price).replace(',', '').replace('₹', '').strip())
                    cursor.execute(
                        "INSERT INTO price_history (product_id, platform, price, timestamp) VALUES (?, ?, ?, ?)",
                        (canonical_product.id, v.platform, clean_price, now)
                    )
                except (ValueError, TypeError):
                    pass

        conn.commit()
    finally:
        conn.close()

# Initialize on import
init_db()
