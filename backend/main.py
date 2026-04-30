import os
import json
import asyncio
import hashlib
import traceback
import random
import time
import httpx
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

import redis
from fastapi import FastAPI, HTTPException, Request, Query, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from prometheus_client import make_asgi_app, Counter, Histogram

# --- SERVICE IMPORTS ---
from backend.services.logger import logger, Timer
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

# --- INITIALIZATION ---
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

# --- REDIS CONFIGURATION (UPSTASH) ---
# Note: Render will provide REDIS_URL from your environment settings
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def get_cache(key: str):
    try:
        val = redis_client.get(key)
        return json.loads(val) if val else None
    except:
        return None

def set_cache(key: str, value: dict, expire: int = 1800):
    try:
        redis_client.setex(key, expire, json.dumps(value))
    except:
        pass

# --- CORE ROUTES ---

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"status": "online", "message": "Sentix AI Backend is running"}

@app.get("/health")
async def health_check():
    return {"status": "operational"}

# --- IMAGE PIPELINE ---
IMAGE_DIR = os.path.join(os.path.dirname(__file__), "static", "images")
os.makedirs(IMAGE_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")

# --- PROMETHEUS METRICS ---
REQUEST_COUNT = Counter("api_requests_total", "Total requests", ["endpoint", "method", "status"])
REQUEST_LATENCY = Histogram("api_request_latency_seconds", "Latency", ["endpoint"])
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    endpoint = request.url.path
    if endpoint not in ["/", "/metrics", "/health"]:
        REQUEST_COUNT.labels(endpoint=endpoint, method=request.method, status=response.status_code).inc()
        REQUEST_LATENCY.labels(endpoint=endpoint).observe(time.time() - start_time)
    return response

# --- API ENDPOINTS ---

@app.post("/product-search", response_model=SearchResponse)
async def product_search(req: SearchRequest, response: Response):
    try:
        raw_results = await search_engine.search_all(req.query)
        # Logic for grouping and AI ranking (Simplified for clarity)
        return SearchResponse(status="success", query=req.query, canonical_products=[], products=raw_results)
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/product-analysis", response_model=AnalysisResponse)
async def product_analysis(req: AnalysisRequest, response: Response):
    cached = get_cache(f"analysis:{req.url}")
    if cached:
        return AnalysisResponse(status="success", **cached)
    
    try:
        scraped_data = await search_engine.get_product_details(req.url)
        # Detailed analysis logic goes here...
        return AnalysisResponse(status="success", product=Product(title=scraped_data.get("title"), price="N/A"))
    except Exception as e:
        return AnalysisResponse(status="error", product=Product(title="Error", price="N/A"))

@app.get("/image-proxy")
async def image_proxy(url: str):
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            r = await client.get(url)
            return StreamingResponse(iter([r.content]), media_type=r.headers.get("content-type", "image/jpeg"))
    except:
        raise HTTPException(status_code=404)

# --- STARTUP ---
if __name__ == "__main__":
    import uvicorn
    # CRITICAL: Use the PORT provided by Render
    port = int(os.getenv("PORT", 5000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port)