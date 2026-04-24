from .base_scraper import BaseScraper
from bs4 import BeautifulSoup
import re
import json

class AmazonScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.platform = "Amazon"
        self.base_url = "https://www.amazon.in"

    def _normalize_image_url(self, url: str) -> str:
        if not url: return ""
        # Remove complex Amazon image parameters (e.g., ._AC_SR160,160_.jpg, ._SY300_SX300_QL70_ML2_.jpg)
        # We look for the part between ._ and _. and replace it with just .
        return re.sub(r'\._[A-Z0-9,._]+_\.', '.', url)

    def search(self, query: str):
        print("SEARCH QUERY:", query)
        try:
            search_url = f"{self.base_url}/s?k={query.replace(' ', '+')}"
            html = self.fetch_url(search_url)
            if not html: return []
            
            soup = BeautifulSoup(html, 'lxml')
            results = []
            
            items = soup.select('div[data-component-type="s-search-result"]') or soup.select('div.s-result-item[data-asin]')
            for item in items[:48]:
                if not item.get('data-asin'): continue
                try:
                    title_el = (item.select_one('h2 a span') or 
                                item.select_one('h2 a') or 
                                item.select_one('.a-size-medium') or
                                item.select_one('.a-size-base-plus') or
                                item.select_one('.a-color-base.a-text-normal'))
                    
                    link_el = item.select_one('h2 a') or item.select_one('a.a-link-normal')
                    image_el = item.select_one('.s-image')
                    price_whole = item.select_one('.a-price-whole') or item.select_one('.a-color-price')
                    discount_el = item.select_one('.a-color-base.a-text-italic') or item.select_one('.savingsPercentage')
                    original_price_el = item.select_one('.a-price.a-text-price span.a-offscreen')
                    
                    # Stricter Filter: Must have title, link, and image to be valid
                    if not title_el or not link_el or not image_el: continue
                    if not title_el.text.strip(): continue

                    price_text = "N/A"
                    if price_whole:
                        price_fraction = item.select_one('.a-price-fraction')
                        price_text = price_whole.text.strip()
                        if price_fraction: price_text += price_fraction.text.strip()

                    discount = 0
                    if discount_el:
                        match = re.search(r'(\d+)%', discount_el.text)
                        if match: discount = int(match.group(1))

                    results.append({
                        "title": title_el.text.strip(),
                        "url": (self.base_url + link_el['href']) if not link_el['href'].startswith('http') else link_el['href'],
                        "price": self.clean_price(price_text),
                        "original_price": self.clean_price(original_price_el.text) if original_price_el else "N/A",
                        "discount_percentage": discount,
                        "rating": float(item.select_one('.a-icon-alt').text.split()[0]) if item.select_one('.a-icon-alt') else 0.0,
                        "image": self._normalize_image_url(image_el['src']),
                        "platform": self.platform
                    })
                except: continue
                    
            return results
        except Exception as e:
            print(f"Amazon Search Error: {e}")
            return []

    def scrape_product(self, url: str):
        print("ANALYZE URL:", url)
        try:
            html = self.fetch_url(url)
            if not html: return self.get_schema()
            
            soup = BeautifulSoup(html, 'lxml')
            data = self.get_schema()
            data["url"] = url
            data["platform"] = self.platform
            
            try:
                # Title
                title_el = (soup.select_one("#productTitle") or 
                            soup.select_one("span#productTitle") or 
                            soup.select_one("h1#title") or
                            soup.select_one(".qa-title-text"))
                data["name"] = title_el.text.strip() if title_el else "Unknown Product"
                
                # Price
                price_selectors = [
                    ".a-price .a-offscreen",
                    ".a-price-whole",
                    "#priceblock_ourprice",
                    "#priceblock_dealprice",
                    ".a-color-price",
                    "span.a-offscreen"
                ]
                for sel in price_selectors:
                    price_el = soup.select_one(sel)
                    if price_el and price_el.text.strip():
                        data["price"] = self.clean_price(price_el.text)
                        break
                
                original_price_el = soup.select_one(".basisPrice span.a-offscreen") or soup.select_one(".a-price.a-text-price span.a-offscreen")
                data["original_price"] = self.clean_price(original_price_el.text) if original_price_el else "N/A"
                
                discount_el = soup.select_one(".savingsPercentage") or soup.select_one(".priceBlockSavingsString")
                if discount_el:
                    match = re.search(r'(\d+)%', discount_el.text)
                    data["discount_percentage"] = int(match.group(1)) if match else 0
                
                # Rating
                rating_el = soup.select_one("#acrPopover span") or soup.select_one("span[data-hook='rating-out-of-five']") or soup.select_one(".a-icon-star span")
                if rating_el:
                    try:
                        data["rating"] = float(rating_el.text.split()[0])
                    except: data["rating"] = 0.0
                
                # Images
                gallery_images = []
                img_tag = soup.select_one("#landingImage") or soup.select_one("#imgBlkFront") or soup.select_one("#main-image")
                if img_tag:
                    if img_tag.get('data-a-dynamic-image'):
                        try:
                            imgs = json.loads(img_tag.get('data-a-dynamic-image'))
                            gallery_images.extend(list(imgs.keys()))
                        except: pass
                    if img_tag.get('src'):
                        gallery_images.append(img_tag.get('src'))
                
                if not gallery_images:
                    for script in soup.select("script"):
                        if 'ImageBlock' in script.text:
                            gallery_images.extend(re.findall(r'"large":"(https://[^"]+)"', script.text))
                
                thumbs = soup.select("#altImages img") or soup.select(".aplus-v2 img") or soup.select(".imageThumbnail img")
                for thumb in thumbs:
                    src = thumb.get("src") or thumb.get("data-src")
                    if src and 'media-amazon' in src:
                        gallery_images.append(src)
                
                # Normalize and Uniquify
                normalized_imgs = []
                for img in gallery_images:
                    norm = self._normalize_image_url(img)
                    if norm and norm not in normalized_imgs:
                        normalized_imgs.append(norm)
                
                data["images"] = normalized_imgs[:12]
                data["image"] = data["images"][0] if data["images"] else ""
                
                # Reviews
                data["reviews"] = self._extract_reviews(soup)
                if not data["reviews"] or len(data["reviews"]) < 3:
                    reviews_url = url.replace("/dp/", "/product-reviews/").split("?")[0]
                    rev_html = self.fetch_url(reviews_url)
                    if rev_html:
                        data["reviews"] = self._extract_reviews(BeautifulSoup(rev_html, 'lxml'))
                
                # Features
                feature_items = soup.select("#feature-bullets li") or soup.select(".a-list-item")
                data["features"] = [f.text.strip() for f in feature_items if f.text.strip() and len(f.text.strip()) > 15][:10]

            except Exception as e:
                print(f"Extraction Error: {e}")
            
            return data
        except Exception as e:
            print(f"Amazon Scrape Error: {e}")
            return self.get_schema()

    def _extract_reviews(self, soup):
        reviews = []
        bodies = soup.select('[data-hook="review-body"]') or soup.select('.review-text-content span') or soup.select('.a-expander-content.reviewText span')
        ratings = soup.select('[data-hook="review-star-rating"]') or soup.select('.review-rating span') or soup.select('.a-icon-star span')
        authors = soup.select('.a-profile-name') or soup.select('.review-byline .a-color-secondary')

        for i in range(min(len(bodies), 15)):
            try:
                txt = bodies[i].text.strip()
                if len(txt) < 5: continue
                reviews.append({
                    "author": authors[i].text.strip() if i < len(authors) else "Verified Customer",
                    "rating": float(ratings[i].text.split()[0]) if i < len(ratings) else 4.0,
                    "text": txt,
                    "date": "Recent",
                    "verified": True
                })
            except: pass
        return reviews

