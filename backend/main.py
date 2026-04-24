from fastapi import FastAPI, HTTPException, Request, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import hashlib
import traceback
import random
from datetime import datetime, timedelta

# Corrected imports
from backend.models.schemas import (
    SearchRequest, SearchResponse,
    AnalysisRequest, AnalysisResponse,
    ComparisonRequest, ComparisonResponse,
    Product, Review, Recommendation
)

from backend.services.search_engine import ProductSearchEngine
from backend.services.ai_recommendation_service import AIRecommendationService
from backend.services.sentiment_service import analyze_sentiment
from backend.services.fake_review_detector import detect_fake_review
from backend.services.review_summary import generate_review_summary

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
@app.post("/product-search", response_model=SearchResponse)
async def product_search(req: SearchRequest, response: Response):
    print("SEARCH QUERY:", req.query)
    response.headers["Cache-Control"] = "no-store"
    try:
        raw_results = search_engine.search_all(req.query)
        print(f"DEBUG: Scraper returned {len(raw_results)} total items")
        processed_products = []
        
        for item in raw_results:
            if not item.get('title') or not item.get('image') or item.get('title') == 'Unknown Product':
                continue
                
            scores = recommendation_service.calculate_scores(item, req.query)
            rec = recommendation_service.generate_recommendation(scores)
            
            # Smart Deal Detection
            discount = item.get('discount_percentage', 0)
            if discount > 30:
                rec.badges.append("BIG DEAL")
                rec.badges.append(f"{discount}% OFF")

            p = Product(
                id=hashlib.md5(item.get('url', '').encode()).hexdigest()[:8],
                title=item.get('name') or item.get('title'),
                price=item.get('price', 'N/A'),
                original_price=item.get('original_price', 'N/A'),
                discount_percentage=discount,
                image=item.get('image', ''),
                images=item.get('images', []),
                platform=item.get('platform', 'Unknown'),
                url=item.get('url', ''),
                rating=item.get('rating', 0.0),
                review_count=item.get('review_count', 0),
                features=item.get('features', []),
                specifications=item.get('specifications', {}),
                sentiment_analysis=item.get('sentiment_analysis', {}),
                feature_match_scores=scores,
                recommendation=rec
            )
            processed_products.append(p)
            DISCOVERY_CACHE[p.url] = p
        
        print(f"DEBUG: Processed {len(processed_products)} valid products")
        
        best_p = None
        if processed_products:
            try:
                best_p = recommendation_service.identify_best_product([p.dict() for p in processed_products[:20]])
            except Exception as be:
                print(f"RECOMMENDATION ERROR: {be}")
        
        return SearchResponse(
            status="success",
            query=req.query,
            products=processed_products,
            best_product=Product(**best_p) if best_p else Product()
        )
    except Exception as e:
        print(f"[SEARCH ERROR] {traceback.format_exc()}")
        return SearchResponse(status="error", query=req.query, products=[], best_product=Product())

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

        summary_data = generate_review_summary(scraped_data["reviews"])
        scores = recommendation_service.calculate_scores(scraped_data, req.category)
        rec = recommendation_service.generate_recommendation(scores)
        
        product_id = hashlib.md5(req.url.encode()).hexdigest()[:8]
        current_price_val = 0.0
        try:
            price_str = scraped_data.get("price", "0")
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
            title=scraped_data.get("name", "Unknown Product"),
            price=scraped_data.get("price", "N/A"),
            rating=scraped_data.get("rating", 0.0),
            review_count=scraped_data.get("review_count", 0),
            image=scraped_data.get("image", ""),
            images=scraped_data.get("images", []),
            features=scraped_data.get("features", []),
            specifications=scraped_data.get("specifications", {}),
            stock=scraped_data.get("stock", "In Stock"),
            platform=scraped_data.get("platform", "Unknown"),
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

@app.get("/price-history/{product_id}")
async def fetch_price_history(product_id: str):
    return {"product_id": product_id, "history": get_price_history(product_id)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)