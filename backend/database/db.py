import sqlite3
import os
import time
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "products.db")

def get_db_connection():
    """Returns a connection with retry logic for locked databases."""
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
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT,
            price REAL,
            timestamp DATETIME
        )
    """)
    conn.commit()
    conn.close()

def log_price(product_id: str, price: float):
    if price is None:
        return
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO price_history (product_id, price, timestamp) VALUES (?, ?, ?)",
                       (product_id, price, datetime.now()))
        conn.commit()
    finally:
        conn.close()

def get_price_history(product_id: str):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT price, timestamp FROM price_history WHERE product_id = ? ORDER BY timestamp ASC", (product_id,))
        rows = cursor.fetchall()
        return [{"price": row["price"], "timestamp": row["timestamp"]} for row in rows]
    finally:
        conn.close()

# Initialize on import
init_db()
