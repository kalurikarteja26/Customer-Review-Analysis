from .base_scraper import BaseScraper
from bs4 import BeautifulSoup

class SnapdealScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.platform = "Snapdeal"
        self.base_url = "https://www.snapdeal.com"

    def search(self, query: str):
        try:
            search_url = f"{self.base_url}/search?keyword={query.replace(' ', '%20')}&sort=rlvncy"
            html = self.fetch_url(search_url)
            if not html: return []
            
            soup = BeautifulSoup(html, 'lxml')
            results = []
            
            items = soup.select('.product-tuple-listing')
            for item in items[:40]:
                try:
                    title_el = item.select_one('.product-title')
                    link_el = item.select_one('a.product-tuple-image')
                    price_el = item.select_one('.product-price')
                    image_el = item.select_one('img.product-image') or item.select_one('source')
                    
                    if not title_el or not link_el: continue

                    results.append({
                        "title": title_el.text.strip(),
                        "url": link_el['href'],
                        "price": self.clean_price(price_el.text) if price_el else "N/A",
                        "rating": 4.0, # Snapdeal search usually doesn't show stars clearly
                        "image": image_el.get('src') or image_el.get('srcset') or "",
                        "platform": self.platform
                    })
                except: continue
                    
            return results
        except: return []

    def scrape_product(self, url: str):
        try:
            html = self.fetch_url(url)
            if not html: return self.get_schema()
            
            soup = BeautifulSoup(html, 'lxml')
            data = self.get_schema()
            data["url"] = url
            data["platform"] = self.platform
            
            data["name"] = self.safe_extract(soup, "h1[itemprop='name']") or "Snapdeal Product"
            data["price"] = self.clean_price(self.safe_extract(soup, ".payBlkBig")) or "N/A"
            data["rating"] = float(self.safe_extract(soup, "span[itemprop='ratingValue']") or 4.0)
            
            img_tags = soup.select(".cloudzoom") or soup.select("img.item-image")
            data["images"] = [img.get("src") or img.get("data-src") for img in img_tags if img.get("src") or img.get("data-src")]
            data["image"] = data["images"][0] if data["images"] else ""
            
            # Snapdeal reviews are often in a separate section
            review_texts = soup.select(".user-review p")
            for txt in review_texts[:5]:
                data["reviews"].append({
                    "author": "Snapdeal Buyer",
                    "rating": 4.0,
                    "text": txt.text.strip(),
                    "date": "Recent",
                    "verified": True
                })
                
            return data
        except: return self.get_schema()
