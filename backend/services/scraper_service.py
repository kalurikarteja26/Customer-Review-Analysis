import subprocess
import json
import os
from fastapi import HTTPException

# Absolute path setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRAPER_SCRIPT = os.path.join(BASE_DIR, "scraper", "index.js")


def run_node_scraper(url: str) -> dict:
    try:
        print(f"\n[DEBUG] Incoming URL: {url}")

        # Run Node scraper with safe encoding
        result = subprocess.run(
            ["node", SCRAPER_SCRIPT, url],
            capture_output=True,
            text=True,
            encoding="utf-8",      # ✅ Fix Windows decode errors
            errors="ignore",       # ✅ Ignore invalid characters
            timeout=120,
            cwd=os.path.join(BASE_DIR, "scraper")
        )

        stdout = result.stdout or ""
        stderr = result.stderr or ""

        print(f"[DEBUG] Return Code: {result.returncode}")

        # ❌ If Node process failed
        if result.returncode != 0:
            error_message = stderr.strip()

            if "Product not found" in error_message:
                raise HTTPException(status_code=404, detail="Product not found.")
            elif "Network failure" in error_message:
                raise HTTPException(status_code=503, detail="Network failure. Please try again.")
            elif "Unsupported website" in error_message:
                raise HTTPException(status_code=400, detail="This website is not supported yet.")
            else:
                raise HTTPException(status_code=500, detail=f"Scraper error: {error_message}")

        # ❌ Empty response check (SAFE VERSION)
        if not stdout.strip():
            raise HTTPException(status_code=500, detail="Scraper returned empty response.")

        # ✅ Parse JSON safely
        try:
            data = json.loads(stdout.strip())
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON returned from scraper.")

        # ❌ Ensure valid format
        if not isinstance(data, dict):
            raise HTTPException(status_code=500, detail="Invalid scraper response format.")

        # ⚠️ Soft validation (DO NOT BLOCK)
        if not data.get("title"):
            print("[WARNING] Missing title, returning partial data instead of failing")

        # ✅ FINAL CLEAN RESPONSE
        return {
            "title": data.get("title") or "Unknown Product",
            "price": data.get("price"),
            "original_price": data.get("original_price"),
            "discount": data.get("discount"),
            "rating": data.get("rating"),
            "image": data.get("image"),
            "category": data.get("category") or [],
            "stock": data.get("stock", False),
            "source": data.get("source") or "Unknown",
            "reviews": data.get("reviews") or []
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Scraping process timed out (120s limit).")

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Search process timed out (120s limit).")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def run_node_search(query: str) -> list:
    try:
        print(f"\n[DEBUG] Incoming Search Query: {query}")

        result = subprocess.run(
            ["node", SCRAPER_SCRIPT, "--search", query],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            timeout=120,
            cwd=os.path.join(BASE_DIR, "scraper")
        )

        stdout = result.stdout or ""
        stderr = result.stderr or ""

        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Search error: {stderr.strip()}")

        if not stdout.strip():
            return []

        try:
            data = json.loads(stdout.strip())
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON returned from search.")

        return data if isinstance(data, list) else []

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))