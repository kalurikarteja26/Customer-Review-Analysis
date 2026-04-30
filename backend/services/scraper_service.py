"""
Async scraper service bridge — calls the Node.js scraper as a subprocess.
Uses asyncio.create_subprocess_exec so the FastAPI event loop is NEVER blocked.
"""
import asyncio
import json
import os
import httpx
from fastapi import HTTPException
from backend.services.logger import logger, Timer

# Get the Scraper URL from Render (defaults to local if not set)
SCRAPER_URL = os.getenv("SCRAPER_URL", "http://localhost:3000").rstrip("/")

async def run_node_scraper(url: str) -> dict:
    """Deep-dive: fetch full product data for a single URL via Microservice."""
    logger.info(f"SCRAPE url={url[:80]}")
    with Timer() as t:
        try:
            # --- FIX: Timeout increased to 95 seconds ---
            async with httpx.AsyncClient(timeout=95.0) as client:
                res = await client.post(f"{SCRAPER_URL}/process", json={"url": url})
            
            if res.status_code == 404:
                raise HTTPException(status_code=404, detail="Product not found.")
            elif res.status_code == 400:
                error_data = res.json()
                raise HTTPException(status_code=400, detail=error_data.get("error", "Bad request"))
            elif res.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Scraper error: {res.text[:300]}")
            
            data = res.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Scraper timed out after 95s")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    if not data:
        raise HTTPException(status_code=500, detail="Scraper returned empty response.")

    if not isinstance(data, dict):
        raise HTTPException(status_code=500, detail="Invalid scraper response format.")

    logger.info(f"SCRAPE OK url={url[:60]} duration={t.ms:.0f}ms reviews={len(data.get('reviews', []))}")
    return {
        "title":          data.get("title") or "Unknown Product",
        "price":          data.get("price"),
        "original_price": data.get("original_price"),
        "discount":       data.get("discount"),
        "rating":         data.get("rating"),
        "image":          data.get("image"),
        "images":         data.get("images", []),
        "category":       data.get("category") or [],
        "stock":          data.get("stock", "In Stock"),
        "source":         data.get("source") or "Unknown",
        "reviews":        data.get("reviews") or [],
        "specifications": data.get("specifications") or {},
    }


async def run_node_search(query: str) -> list:
    """Multi-platform search — returns list of raw product dicts via Microservice."""
    logger.info(f"SEARCH query={query!r}")
    with Timer() as t:
        try:
            # --- FIX: Timeout increased to 95 seconds ---
            async with httpx.AsyncClient(timeout=95.0) as client:
                res = await client.get(f"{SCRAPER_URL}/search", params={"q": query})
            
            if res.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Scraper search error: {res.text[:300]}")
            
            results = res.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Search timed out after 95s")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    logger.info(f"SEARCH OK query={query!r} results={len(results)} duration={t.ms:.0f}ms")
    return results