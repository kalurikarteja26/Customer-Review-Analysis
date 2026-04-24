import requests
from bs4 import BeautifulSoup
import random
import time
from typing import Dict, Any, Optional

class BaseScraper:
    def __init__(self):
        self.headers = [
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Referer": "https://www.google.com/"
            },
            {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
                "Accept-Language": "en-GB,en;q=0.8",
            }
        ]

    def __init__(self):
        self.platform = "Base"
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }

    def get_headers(self):
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }

    def fetch_url(self, url: str, retries: int = 3):
        for i in range(retries):
            try:
                # Add a tiny delay to seem more human
                import time
                import random
                time.sleep(random.uniform(0.5, 1.5))
                
                response = self.session.get(url, headers=self.get_headers(), timeout=15)
                print(f"FETCH URL [{response.status_code}] ({i+1}): {url[:80]}...")
                
                if response.status_code == 200:
                    return response.text
                
                if response.status_code in [403, 503]:
                    print(f"BLOCK DETECTED: {response.status_code}. Retrying...")
                    # Update User-Agent for retry
                    self.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
            except Exception as e:
                print(f"FETCH ERROR: {e}")
        return None

    def safe_extract(self, soup: BeautifulSoup, selector: str, attr: str = None, text: bool = True):
        element = soup.select_one(selector)
        if not element:
            return ""
        if attr:
            return element.get(attr, "").strip()
        if text:
            return element.get_text().strip()
        return element

    def clean_price(self, price_str: str) -> str:
        if not price_str: return ""
        # Remove currency symbols and commas
        return "".join(c for c in price_str if c.isdigit() or c == ".")

    def get_schema(self) -> Dict[str, Any]:
        return {
            "name": "",
            "price": "",
            "rating": 0.0,
            "review_count": 0,
            "images": [],
            "feature_images": [],
            "features": [],
            "stock": "In Stock",
            "platform": "",
            "url": "",
            "reviews": [],
            "specifications": {}
        }
