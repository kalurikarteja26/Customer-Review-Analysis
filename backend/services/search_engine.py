from .scrapers import PLATFORM_MAP
import concurrent.futures
from typing import List, Dict, Any

class ProductSearchEngine:
    def __init__(self):
        self.scrapers = {name: cls() for name, cls in PLATFORM_MAP.items()}
        print(f"DEBUG: Search Engine Initialized with: {list(self.scrapers.keys())}")

    def search_all(self, query: str, platforms: List[str] = None) -> List[Dict[str, Any]]:
        if not platforms:
            platforms = ["amazon", "flipkart", "snapdeal", "croma", "ajio"]
        
        # SMART PRIORITY: If user specifies "from ajio" or "in flipkart", prioritize that platform
        query_lower = query.lower()
        priority_platform = None
        for p in platforms:
            if p in query_lower:
                priority_platform = p
                break
        
        if priority_platform:
            print(f"DEBUG: Prioritizing platform: {priority_platform}")
            platforms.remove(priority_platform)
            platforms.insert(0, priority_platform)
        
        print(f"DEBUG: Final platforms to search: {platforms}")

        platform_results = {p: [] for p in platforms}
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            future_to_platform = {
                executor.submit(self.scrapers[p].search, query): p 
                for p in platforms if p in self.scrapers
            }
            for future in concurrent.futures.as_completed(future_to_platform):
                p = future_to_platform[future]
                try:
                    results = future.result()
                    platform_results[p] = results
                except: continue
        
        # INTERLEAVED MIXING with priority influence
        mixed_results = []
        max_len = max(len(r) for r in platform_results.values()) if platform_results else 0
        for i in range(max_len):
            for p in platforms:
                if i < len(platform_results[p]):
                    mixed_results.append(platform_results[p][i])
        
        # Deep scrape top 12 for "all features" requirement (diverse set)
        top_picks = mixed_results[:12] 
        
        detailed_results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
            future_to_url = {
                executor.submit(self.get_product_details, item['url']): item
                for item in top_picks if item.get('url')
            }
            for future in concurrent.futures.as_completed(future_to_url):
                try:
                    details = future.result()
                    if details:
                        detailed_results.append(details)
                except: continue

        # Add ALL remaining mixed results to provide "all possible outcomes"
        detailed_urls = {d.get('url') for d in detailed_results}
        for item in mixed_results:
            if item.get('url') not in detailed_urls:
                detailed_results.append(item)

        return detailed_results # Return EVERYTHING found

    def get_product_details(self, url: str) -> Dict[str, Any]:
        url_lower = url.lower()
        platform = "amazon"
        if "flipkart.com" in url_lower: platform = "flipkart"
        elif "snapdeal.com" in url_lower: platform = "snapdeal"
        elif "croma.com" in url_lower: platform = "croma"
        elif "ajio.com" in url_lower: platform = "ajio"
        
        scraper = self.scrapers.get(platform)
        if scraper:
            return scraper.scrape_product(url)
        return None
