"""
ProductSearchEngine — thin async wrapper around the Node.js scraper bridge.
Cache is managed upstream in main.py.
"""
from backend.services.scraper_service import run_node_search, run_node_scraper
from backend.services.logger import logger
from typing import List, Dict, Any


class ProductSearchEngine:
    def __init__(self):
        logger.info("Search Engine initialised (Node.js async bridge + SQLite cache)")

    async def search_all(self, query: str) -> List[Dict[str, Any]]:
        """Run multi-platform search. Returns raw product list."""
        logger.info(f"Live scraping query={query!r}")
        try:
            results = await run_node_search(query)
            logger.info(f"Scraper returned {len(results)} items for query={query!r}")
            return results or []
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise

    async def get_product_details(self, url: str) -> Dict[str, Any]:
        """Deep-dive product analysis for a single URL."""
        try:
            return await run_node_scraper(url)
        except Exception as e:
            logger.error(f"Product detail scrape failed url={url[:60]}: {e}")
            return None
