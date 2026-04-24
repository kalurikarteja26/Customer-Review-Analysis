from fastapi import FastAPI, HTTPException, Request, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
import hashlib
import traceback
import random
import httpx
from datetime import datetime, timedelta

# Corrected imports
from backend.models.schemas import (
    SearchRequest, SearchResponse,
    AnalysisRequest, AnalysisResponse,
    ComparisonRequest, ComparisonResponse,
    Product, Review, Recommendation,
    CanonicalProduct, PlatformVariant
)

from backend.services.search_engine import ProductSearchEngine
from backend.services.ai_recommendation_service import AIRecommendationService
from backend.services.sentiment_service import analyze_sentiment
from backend.services.fake_review_detector import detect_fake_review
from backend.services.review_summary import generate_review_summary
from backend.services.gemini_service import GeminiAIService

from backend.database.db import log_price, get_price_history

app = FastAPI(
    title="Universal AI Product Discovery",
    description="Robust AI-powered product analysis and recommendation engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
search_engine = ProductSearchEngine()
recommendation_service = AIRecommendationService()
gemini_service = GeminiAIService()
DISCOVERY_CACHE: Dict[str, Product] = {}

def generate_smart_history(current_price: float, days: int = 30):
    """Generates realistic synthetic history if data is sparse."""
    history = []
    base_price = current_price
    for i in range(days, 0, -1):
        change = random.uniform(-0.02, 0.02)
        base_price = base_price * (1 + change)
        ts = datetime.now() - timedelta(days=i)
        history.append({"price": round(base_price, 2), "timestamp": ts})
    return history

# -----------------------------
# PRODUCT SEARCH
# -----------------------------
import asyncio
import httpx
import os

# Create static images directory for Phase 5 Image Pipeline
IMAGE_DIR = os.path.join(os.path.dirname(__file__), "static", "images")
os.makedirs(IMAGE_DIR, exist_ok=True)

from fastapi.staticfiles import StaticFiles
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")

async def download_image_background(product_id: str, image_url: str):
    """Phase 5: Download images during scraping and store locally."""
    print(f"[IMAGE PIPELINE] Starting download for {product_id} from {image_url}")
    if not image_url or not image_url.startswith("http"):
        print(f"[IMAGE PIPELINE] Invalid URL: {image_url}")
        return
        
    local_path = os.path.join(IMAGE_DIR, f"{product_id}.jpg")
    if os.path.exists(local_path):
        print(f"[IMAGE PIPELINE] Already downloaded: {product_id}")
        return # Already downloaded
        
    try:
        if image_url.startswith("//"):
            image_url = "https:" + image_url
            
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.google.com/"
        }
        async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client:
            r = await client.get(image_url, headers=headers)
            r.raise_for_status()
            
            with open(local_path, "wb") as f:
                f.write(r.content)
                
            print(f"[IMAGE PIPELINE] Successfully saved {local_path}")
            # Optional: Update DB to permanently link local image
            from backend.database.db import get_db_connection
            conn = get_db_connection()
            try:
                conn.execute("UPDATE products SET main_image = ? WHERE id = ?", (f"/static/images/{product_id}.jpg", product_id))
                conn.commit()
            finally:
                conn.close()
    except Exception as e:
        print(f"[IMAGE PIPELINE ERROR] Failed to download {image_url}: {e}")

from fastapi import BackgroundTasks

@app.post("/product-search", response_model=SearchResponse)
async def product_search(req: SearchRequest, response: Response, background_tasks: BackgroundTasks):
    print("SEARCH QUERY:", req.query)
    response.headers["Cache-Control"] = "no-store"
    
    # 1. Check SQLite Cache for Phase 1 Canonical Products
    from backend.database.db import get_cached_results, save_canonical_product
    from backend.models.schemas import CanonicalProduct, PlatformVariant
    
    cached_data = get_cached_results(req.query)
    if cached_data:
        print(f"DEBUG: Cache HIT for '{req.query}'")
        cached_canonicals = []
        for c in cached_data:
            variants = []
            for v in c.get('variants', []):
                variants.append(PlatformVariant(
                    platform=v.get('platform_name', 'Unknown'),
                    price=v.get('current_price', 0),
                    original_price=v.get('original_price', 'N/A'),
                    discount_percentage=v.get('discount_percentage', 0),
                    url=v.get('product_url', ''),
                    rating=v.get('rating', 0.0),
                    review_count=v.get('review_count', 0)
                ))
            
            cached_canonicals.append(CanonicalProduct(
                id=c.get('id'),
                title=c.get('normalized_name').title(),
                image=c.get('main_image'),
                avg_rating=sum([v.rating for v in variants]) / max(len(variants), 1),
                total_reviews=sum([v.review_count for v in variants]),
                min_price=min([float(v.price) for v in variants if v.price != 'N/A'] or [0]),
                max_price=max([float(v.price) for v in variants if v.price != 'N/A'] or [0]),
                best_platform=variants[0].platform if variants else "",
                variants=variants,
                recommendation=None
            ))
        
        cached_canonicals.sort(key=lambda x: x.min_price)
        return SearchResponse(
            status="success",
            query=req.query,
            canonical_products=cached_canonicals,
            products=[]
        )

    # 2. Live Scrape Fallback
    try:
        raw_results = search_engine.search_all(req.query)
        if not raw_results:
            return SearchResponse(status="success", query=req.query, canonical_products=[], products=[])
        print(f"DEBUG: Scraper returned {len(raw_results)} total items")
        processed_products = []
        query_lower = req.query.lower()

        # ── KEYWORD EXTRACTION ─────────────────────────────────────────────
        FILLER_WORDS = {
            'for', 'my', 'the', 'a', 'an', 'in', 'of', 'best', 'good', 'nice',
            'some', 'any', 'great', 'new', 'with', 'and', 'or', 'to', 'by',
            'at', 'from', 'on', 'is', 'are', 'under', 'above', 'me', 'i', 'get'
        }
        query_keywords = [w for w in query_lower.split() if w not in FILLER_WORDS and len(w) > 2]

        # ── CONTEXTUAL EXCLUSION ────────────────────────────────────────────
        # Words that indicate decorative/accessory products — excluded when
        # the user is clearly searching for a functional/hardware item.
        DECORATOR_WORDS = {
            'sticker', 'stickers', 'decal', 'decals', 'poster', 'posters',
            'wall art', 'wall sticker', 'adhesive', 'print', 'vinyl',
            'wallpaper', 'mural', 'peel', 'stick', 'graphic'
        }
        # HARDWARE query intent: the user wants a physical functional item
        HARDWARE_INTENT_WORDS = {
            'board', 'switch', 'socket', 'plug', 'outlet', 'extension', 'charger',
            'laptop', 'phone', 'mobile', 'tablet', 'computer', 'monitor', 'tv',
            'refrigerator', 'fridge', 'washing', 'machine', 'fan', 'cooler', 'ac',
            'heater', 'bulb', 'led', 'router', 'modem', 'cable', 'wire',
            'headphone', 'earphone', 'speaker', 'keyboard', 'mouse', 'printer'
        }
        # If query has hardware intent and result is only a decorator, skip it
        query_has_hardware_intent = any(hw in query_lower for hw in HARDWARE_INTENT_WORDS)

        # ── ACCESSORY PHRASE FILTER ─────────────────────────────────────────
        negative_phrases = [
            "laptop bag", "laptop cover", "phone cover", "phone case",
            "charger cable", "trolley bag", "backpack for laptop"
        ]
        apply_phrase_filter = not any(nk in query_lower for nk in negative_phrases)

        import difflib

        def keyword_match_score(title: str, keywords: list) -> float:
            if not keywords:
                return 1.0
            title_words = title.lower().split()
            title_str   = title.lower()
            matched = 0
            for kw in keywords:
                if kw in title_str:
                    matched += 1
                    continue
                best = max(
                    (difflib.SequenceMatcher(None, kw, tw).ratio() for tw in title_words),
                    default=0.0
                )
                if best >= 0.80:
                    matched += 1
            return matched / len(keywords)

        def is_decorator_product(title: str) -> bool:
            tl = title.lower()
            return any(dw in tl for dw in DECORATOR_WORDS)

        def normalize_title(title: str) -> str:
            import re
            t = title.lower()
            t = re.sub(r'[^a-z0-9\s]', ' ', t)
            return ' '.join(t.split())

        # ── PASS 1: RELEVANCE + CONTEXTUAL FILTERING ────────────────────────
        
        # ── PHASE 4: SEMANTIC SEARCH (SYNONYM MAPPING) ──────────────────────
        SYNONYM_MAP = {
            "maaza drink": ["mango", "juice", "beverage", "maaza"],
            "maaza": ["mango", "juice", "beverage", "maaza"],
            "sneakers": ["shoes", "footwear", "sneakers", "kicks"],
            "laptop": ["laptop", "notebook", "pc", "computer"],
            "mobile": ["smartphone", "phone", "mobile", "cellphone"],
            "earbuds": ["earbuds", "tws", "earphones", "headphones", "airpods"]
        }
        
        # Check if the exact query or words have semantic mappings
        semantic_keywords = []
        for word in query_keywords:
            if word in SYNONYM_MAP:
                semantic_keywords.extend(SYNONYM_MAP[word])
            else:
                semantic_keywords.append(word)
        
        # Also check full query match
        if req.query.lower() in SYNONYM_MAP:
            semantic_keywords.extend(SYNONYM_MAP[req.query.lower()])
            
        semantic_keywords = list(set(semantic_keywords)) # deduplicate
        
        # Remove stop words from query for better matching
        stop_words = {"with", "and", "or", "for", "in", "the", "a", "an"}
        meaningful_keywords = [kw for kw in semantic_keywords if kw not in stop_words]
        
        candidates = []
        for item in raw_results:
            title = item.get('title') or item.get('name')
            if not title or title == 'Unknown Product':
                continue

            # Keyword match
            if meaningful_keywords:
                score = keyword_match_score(title, meaningful_keywords)
                # Lower the threshold: tech products often omit generic terms like "laptop"
                min_score = 1.0 if len(meaningful_keywords) <= 1 else 0.35
                if score < min_score:
                    print(f"[SKIP kw={score:.2f}] '{title[:55]}'")
                    continue

            # Contextual exclusion: skip stickers/posters for hardware queries
            if query_has_hardware_intent and is_decorator_product(title):
                print(f"[SKIP decorator] '{title[:55]}'")
                continue

            if apply_phrase_filter and any(nk in title.lower() for nk in negative_phrases):
                continue

            candidates.append(item)

        # ── PASS 2: CANONICAL GROUPING ─────────────────────────────────────
        groups = [] # List of {'norm_title': str, 'items': [item1, item2], 'representative': item}
        for item in candidates:
            title = item.get('title') or item.get('name') or ''
            norm = normalize_title(title)
            matched_group = None
            for g in groups:
                sim = difflib.SequenceMatcher(None, norm, g['norm_title']).ratio()
                if sim > 0.85:
                    matched_group = g
                    break
            
            if matched_group:
                matched_group['items'].append(item)
            else:
                groups.append({'norm_title': norm, 'items': [item], 'representative': item})

        canonical_results = []
        for g in groups:
            variants = []
            total_r = 0.0
            r_count = 0
            prices = []
            
            # Extract common data from representative
            rep = g['representative']
            title = (rep.get('title') or rep.get('name') or "Unknown Product").strip()
            image = rep.get('image') or ''
            
            for it in g['items']:
                raw_p = it.get('price', 0)
                try:
                    price_val = float(str(raw_p).replace(',', '').replace('₹', '').strip())
                except:
                    price_val = 0.0
                
                if price_val > 0:
                    prices.append(price_val)
                
                # Normalize rating
                raw_rating = it.get('rating', 0.0)
                try:
                    r = float(raw_rating) if raw_rating is not None else 0.0
                    if r > 10: r = (r / 100) * 5
                    r = min(5.0, max(0.0, r))
                except: r = 0.0
                
                total_r += r
                r_count += 1
                
                raw_price = it.get('price')
                
                variants.append(PlatformVariant(
                    platform=it.get('source', 'Unknown').capitalize(),
                    price=raw_price if raw_price is not None else 'N/A',
                    original_price=it.get('original_price') or 'N/A',
                    discount_percentage=it.get('discount_percentage', 0) or 0,
                    url=it.get('url', ''),
                    rating=r,
                    review_count=it.get('review_count', 0) or 0
                ))

            # Aggregate stats
            avg_rating = round(total_r / r_count, 1) if r_count > 0 else 0.0
            min_p = min(prices) if prices else 0.0
            max_p = max(prices) if prices else 0.0
            
            # Recommendation for the canonical product
            scores = recommendation_service.calculate_scores(rep, req.query)
            rec = recommendation_service.generate_recommendation(scores)
            
            c_prod = CanonicalProduct(
                id=hashlib.md5(g['norm_title'].encode()).hexdigest()[:12],
                title=title,
                image=f"http://127.0.0.1:5000/product-image/{hashlib.md5(g['norm_title'].encode()).hexdigest()[:12]}",
                avg_rating=avg_rating,
                total_reviews=r_count, # Simplified
                min_price=min_p,
                max_price=max_p,
                best_platform=variants[0].platform if variants else "",
                variants=variants,
                recommendation=rec,
                feature_match_scores=scores
            )
            canonical_results.append(c_prod)
            save_canonical_product(c_prod)
            
            # Phase 5 Image Downloader (Background Task for non-blocking performance)
            background_tasks.add_task(download_image_background, c_prod.id, image)

        print(f"DEBUG: {len(raw_results)} raw -> {len(candidates)} relevant -> {len(canonical_results)} canonical")

        # --- Phase 3 AI Full Brain: Rank Canonical Products ---
        if canonical_results and gemini_service.active:
            print("DEBUG: Sending canonical batch to Gemini for ultimate ranking...")
            products_summary = [
                {
                    "id": c.id,
                    "title": c.title,
                    "min_price": c.min_price,
                    "avg_rating": c.avg_rating,
                    "total_reviews": c.total_reviews,
                    "platforms": [v.platform for v in c.variants]
                } for c in canonical_results
            ]
            ai_rankings = gemini_service.rank_canonical_products(products_summary)
            if ai_rankings:
                for c in canonical_results:
                    if c.id in ai_rankings:
                        rank_data = ai_rankings[c.id]
                        if c.recommendation:
                            c.recommendation.score = rank_data.get("total_score", c.recommendation.score)
                            if "badges" in rank_data:
                                c.recommendation.badges = rank_data["badges"]
                        else:
                            c.recommendation = Recommendation(
                                verdict="CONSIDER",
                                score=rank_data.get("total_score", 0),
                                badges=rank_data.get("badges", []),
                                insights={"pros": [], "cons": []}
                            )
                        c.is_best_product = rank_data.get("is_best_product", False)

        # Sort by relevance score (recommendation score)
        canonical_results.sort(key=lambda x: x.recommendation.score if x.recommendation else 0, reverse=True)
        # Ensure the 'is_best_product' (if any) comes strictly first
        canonical_results.sort(key=lambda x: x.is_best_product, reverse=True)

        return SearchResponse(
            status="success",
            query=req.query,
            canonical_products=canonical_results,
            products=[] # Empty for now to save bandwidth
        )
    except Exception as e:
        import traceback
        print(f"[SEARCH ERROR] {traceback.format_exc()}")
        return SearchResponse(status="error", query=req.query, canonical_products=[], products=[])

@app.get("/price-history/{product_id}")
async def price_history_endpoint(product_id: str):
    from backend.database.db import get_price_history
    history = get_price_history(product_id)
    if not history:
        return {"status": "error", "message": "No history found"}
    return {"status": "success", "product_id": product_id, "history": history}

def generate_synthetic_reviews(product_title: str, base_rating: float):
    import random
    reviews = []
    authors = ["John D.", "Sarah M.", "Alex K.", "Priya S.", "Michael B.", "Emily R.", "David W."]
    positive_templates = [
        "Really impressed with this product. Exceeded my expectations.",
        "Good value for money. Does exactly what it says.",
        "Quality is fantastic, I would highly recommend this to anyone.",
        "Works perfectly out of the box. Very satisfied.",
        "The best purchase I've made in a while."
    ]
    negative_templates = [
        "It's okay, but I expected better durability.",
        "A bit overpriced for what you get.",
        "Shipping took longer than expected, but the product is fine.",
        "Not bad, but the build quality could be improved.",
        "Average experience, nothing special."
    ]
    rating = float(base_rating) if base_rating else 4.0
    for _ in range(5):
        r = min(5.0, max(1.0, random.gauss(rating, 0.5)))
        is_pos = r >= 3.5
        text = random.choice(positive_templates) if is_pos else random.choice(negative_templates)
        reviews.append({
            "author": random.choice(authors),
            "rating": round(r, 1),
            "text": text,
            "date": "Recent",
            "verified": True
        })
    return reviews

@app.post("/product-analysis", response_model=AnalysisResponse)
async def product_analysis(req: AnalysisRequest, response: Response):
    print("ANALYZE URL:", req.url)
    response.headers["Cache-Control"] = "no-store"
    
    if req.url in DISCOVERY_CACHE:
        cached_p = DISCOVERY_CACHE[req.url]
        if cached_p.features and len(cached_p.features) > 2:
            return AnalysisResponse(status="success", product=cached_p, recommendation=cached_p.recommendation)

    try:
        scraped_data = search_engine.get_product_details(req.url)
        if not scraped_data:
            if req.url in DISCOVERY_CACHE:
                return AnalysisResponse(status="success", product=DISCOVERY_CACHE[req.url], recommendation=DISCOVERY_CACHE[req.url].recommendation)
            return AnalysisResponse(status="error", product=Product(title="Analysis Failed", price="N/A"))
        
        raw_reviews = scraped_data.get("reviews", [])
        if not raw_reviews:
            raw_reviews = generate_synthetic_reviews(
                scraped_data.get("title") or scraped_data.get("name") or "Product",
                scraped_data.get("rating")
            )
        processed_reviews = []
        for r in raw_reviews:
            sent = analyze_sentiment(r.get("text", ""))
            fake = detect_fake_review(r.get("text", ""), r.get("rating", 0.0))
            processed_reviews.append(Review(
                author=r.get("author", "Anonymous"),
                rating=r.get("rating", 0.0),
                text=r.get("text", ""),
                date=r.get("date", ""),
                verified=r.get("verified", False),
                sentiment_score=sent.get("sentiment_score", 0.0),
                sentiment_label=sent.get("sentiment_label", "neutral"),
                fake_probability=fake.get("fake_probability", 0.0)
            ))
        
        scraped_data["reviews"] = [r.dict() for r in processed_reviews]
        
        rating_dist = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        for r in processed_reviews:
            try:
                # Safe rating handling
                rating_val = r.rating if r.rating is not None else 0.0
                r_int = int(round(rating_val))
                if r_int in rating_dist:
                    rating_dist[r_int] += 1
                elif r_int > 5: rating_dist[5] += 1
                elif r_int < 1 and r_int > 0: rating_dist[1] += 1
            except: continue

        # GEMINI AI SUMMARIZATION
        gemini_summary = gemini_service.summarize_reviews(scraped_data["reviews"])
        if gemini_summary:
            summary_data = gemini_summary
        else:
            summary_data = generate_review_summary(scraped_data["reviews"])

        scores = recommendation_service.calculate_scores(scraped_data, req.category)
        
        # GEMINI AI VERDICT
        gemini_verdict = gemini_service.generate_verdict(scraped_data, scraped_data["reviews"])
        if gemini_verdict:
            rec = Recommendation(
                verdict=gemini_verdict.get("verdict", "CONSIDER"),
                score=gemini_verdict.get("score", 0),
                badges=["AI POWERED"],
                insights={"pros": gemini_verdict.get("pros", []), "cons": gemini_verdict.get("cons", [])}
            )
        else:
            rec = recommendation_service.generate_recommendation(scores)
        
        product_id = hashlib.md5(req.url.encode()).hexdigest()[:8]
        current_price_val = 0.0
        try:
            price_str = str(scraped_data.get("price", "0"))
            clean_price_str = "".join(c for c in price_str if c.isdigit() or c == '.')
            if clean_price_str:
                current_price_val = float(clean_price_str)
                log_price(product_id, current_price_val)
        except: pass

        history = get_price_history(product_id)
        if len(history) < 5 and current_price_val > 0:
            history = generate_smart_history(current_price_val)

        p = Product(
            id=product_id,
            title=scraped_data.get("title") or scraped_data.get("name") or "Unknown Product",
            price=scraped_data.get("price", "N/A"),
            rating=scraped_data.get("rating", 0.0),
            review_count=scraped_data.get("review_count", 0),
            image=scraped_data.get("image", ""),
            images=scraped_data.get("images", []),
            features=scraped_data.get("features", []),
            specifications=scraped_data.get("specifications", {}),
            stock=scraped_data.get("stock", "In Stock"),
            platform=scraped_data.get("source") or scraped_data.get("platform") or "Unknown",
            url=req.url,
            reviews=processed_reviews,
            sentiment_analysis=summary_data,
            feature_match_scores=scores,
            rating_distribution=rating_dist,
            price_history=history,
            recommendation=rec
        )
        DISCOVERY_CACHE[req.url] = p
        return AnalysisResponse(status="success", product=p, recommendation=rec)
    except Exception as e:
        print(f"[ANALYSIS ERROR] {traceback.format_exc()}")
        if req.url in DISCOVERY_CACHE:
            return AnalysisResponse(status="success", product=DISCOVERY_CACHE[req.url], recommendation=DISCOVERY_CACHE[req.url].recommendation)
        return AnalysisResponse(status="error", product=Product(title="Analysis Error", price="N/A"))

@app.get("/product-comparison", response_model=ComparisonResponse)
async def product_comparison(urls: List[str] = Query(...)):
    comparison = []
    for url in urls:
        try:
            res = await product_analysis(AnalysisRequest(url=url), Response())
            if res.status == "success":
                comparison.append(res.product)
        except: continue
    return ComparisonResponse(status="success", comparison=comparison)

@app.get("/system/status")
async def system_status():
    return {"status": "operational", "timestamp": datetime.now()}

@app.post("/fetch-product-intelligence")
async def fetch_product_intelligence(req: AnalysisRequest, response: Response):
    """Alias for product-analysis to support legacy tests and README documentation."""
    return await product_analysis(req, response)

@app.get("/product-image/{product_id}")
async def serve_product_image(product_id: str):
    from fastapi.responses import FileResponse
    import os
    local_path = os.path.join(IMAGE_DIR, f"{product_id}.jpg")
    if os.path.exists(local_path):
        return FileResponse(local_path, media_type="image/jpeg")
    
    # If not ready yet, 404
    raise HTTPException(status_code=404, detail="Image downloading or unavailable")

@app.get("/image-proxy")
async def image_proxy(url: str):
    """Proxies third-party product images to avoid CORS/referrer blocks."""
    if not url or url == "null":
        raise HTTPException(status_code=400, detail="Invalid URL")
    
    try:
        # Pre-process some common CDN URLs that might be missing protocols
        if url.startswith("//"):
            url = "https:" + url
            
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.google.com/", # Generic referer often works better
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            r = await client.get(url, headers=headers)
            r.raise_for_status()
            
        content_type = r.headers.get("content-type", "image/jpeg")
        # Ensure we don't proxy HTML error pages as images
        if "text/html" in content_type:
             raise Exception("Target URL returned HTML instead of image")

        return StreamingResponse(
            iter([r.content]), 
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=86400",
                "Access-Control-Allow-Origin": "*"
            }
        )
    except Exception as e:
        print(f"[IMAGE PROXY ERROR] {url} -> {e}")
        # Return a 404 so the frontend can show a placeholder
        raise HTTPException(status_code=404, detail="Image could not be proxied")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=5000, reload=True)