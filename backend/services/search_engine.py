from backend.services.scraper_service import run_node_search, run_node_scraper
import concurrent.futures
from typing import List, Dict, Any

class ProductSearchEngine:
    def __init__(self):
        print("DEBUG: Search Engine Initialized with Node.js Scraper Bridge + SQLite Cache")

    def search_all(self, query: str, platforms: List[str] = None) -> List[Dict[str, Any]]:
        # ── LIVE SCRAPE ONLY (Cache handled by main.py now) ────────────────
        print(f"DEBUG: Live scraping for '{query}'")
        try:
            results = run_node_search(query)
            print(f"DEBUG: Scraper returned {len(results) if results else 0} total items")
            return results or []
        except Exception as e:
            print(f"SEARCH ERROR: {e}")
            return []

    def get_product_details(self, url: str) -> Dict[str, Any]:
        try:
            return run_node_scraper(url)
        except Exception as e:
            print(f"SCRAPE ERROR: {e}")
            return None
