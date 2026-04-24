from .base_scraper import BaseScraper
from bs4 import BeautifulSoup
import re
import json

class FlipkartScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.platform = "Flipkart"
        self.base_url = "https://www.flipkart.com"

    def _normalize_image_url(self, url: str) -> str:
        if not url: return ""
        # Transform small images to high-res and strip size params
        res = url.replace('128/128', '832/832').replace('416/416', '832/832').replace('200/200', '832/832')
        return res

    def search(self, query: str):
        print("SEARCH QUERY:", query)
        try:
            search_url = f"{self.base_url}/search?q={query.replace(' ', '%20')}"
            html = self.fetch_url(search_url)
            if not html: return []
            
            soup = BeautifulSoup(html, 'lxml')
            results = []
            
            items = soup.select('div[data-id]')
            for item in items[:48]:
                try:
                    title_el = (item.select_one('div.KzDlHZ') or 
                                item.select_one('a.w1YgeL') or 
                                item.select_one('a.IRpwTa') or 
                                item.select_one('div.CGtC98') or
                                item.select_one('a.V2SBy_'))
                    
                    link_el = item.select_one('a[href]')
                    if not title_el or not link_el or not title_el.text.strip(): continue

                    price_el = item.select_one('div.Nx930q') or item.select_one('div._30jeq3')
                    original_price_el = item.select_one('div.yRaY8j') or item.select_one('div._3I9_wc')
                    discount_el = item.select_one('div.Uk-s91') or item.select_one('div._3Ay6Sb')
                    rating_el = item.select_one('div.XQD_n7') or item.select_one('div._3LWZlK')
                    image_el = item.select_one('img.DByo0n') or item.select_one('img._53u06y') or item.select_one('img._2r_T1I')
                    
                    discount = 0
                    if discount_el:
                        match = re.search(r'(\d+)%', discount_el.text)
                        if match: discount = int(match.group(1))

                    results.append({
                        "title": title_el.text.strip(),
                        "url": (self.base_url + link_el['href']) if not link_el['href'].startswith('http') else link_el['href'],
                        "price": self.clean_price(price_el.text) if price_el else "N/A",
                        "original_price": self.clean_price(original_price_el.text) if original_price_el else "N/A",
                        "discount_percentage": discount,
                        "rating": float(rating_el.text.split()[0]) if rating_el else 0.0,
                        "image": self._normalize_image_url(image_el['src']) if image_el else "",
                        "platform": self.platform
                    })
                except: continue
                    
            return results
        except Exception as e:
            print(f"Flipkart Search Error: {e}")
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
                title_el = (soup.select_one("span.VU-Z7x") or 
                            soup.select_one("span.B_NuCI") or 
                            soup.select_one("h1.rPooS1") or
                            soup.select_one("h1"))
                data["name"] = title_el.text.strip() if title_el else "Unknown Product"
                
                # Price
                price_el = soup.select_one("div.Nx930q") or soup.select_one("div._30jeq3._16Jk6d")
                data["price"] = self.clean_price(price_el.text) if price_el else "N/A"
                
                original_price_el = soup.select_one("div.yRaY8j") or soup.select_one("div._3I9_wc._2p63h9")
                data["original_price"] = self.clean_price(original_price_el.text) if original_price_el else "N/A"
                
                discount_el = soup.select_one("div.Uk-s91") or soup.select_one("div._3Ay6Sb._3uS9v0")
                if discount_el:
                    match = re.search(r'(\d+)%', discount_el.text)
                    data["discount_percentage"] = int(match.group(1)) if match else 0
                
                # Rating
                rating_el = soup.select_one("div.XQD_n7") or soup.select_one("div._3LWZlK") or soup.select_one("div.ipR_q")
                if rating_el:
                    try:
                        data["rating"] = float(rating_el.text.split()[0])
                    except: data["rating"] = 0.0
                
                # Features
                feature_items = soup.select("li._21l60g") or soup.select("div.yN+eY8 li") or soup.select("._2id1nE li")
                data["features"] = [f.text.strip() for f in feature_items if f.text.strip()][:12]
                
                # Specifications
                specs = {}
                rows = soup.select("tr._1s_Smc") or soup.select(".W_67R3") or soup.select(".row.Gv-9_z")
                for row in rows:
                    cols = row.select("td") or row.select("div")
                    if len(cols) >= 2:
                        key = cols[0].text.strip()
                        val = cols[1].text.strip()
                        if key and val: specs[key] = val
                data["specifications"] = specs

                # Images
                img_tags = soup.select("img.DByo0n") or soup.select("img._2r_T1I") or soup.select("img._396cs4") or soup.select("div.X69V6V img")
                raw_imgs = [img.get('src') for img in img_tags if img.get('src')]
                
                # Normalize and Uniquify
                normalized_imgs = []
                for img in raw_imgs:
                    norm = self._normalize_image_url(img)
                    if norm and norm not in normalized_imgs:
                        normalized_imgs.append(norm)
                
                data["images"] = normalized_imgs[:10]
                data["image"] = data["images"][0] if data["images"] else ""
                
                # Reviews
                review_items = soup.select("div.EPCY96") or soup.select("div.col._2w7999") or soup.select("div._27M-N9") or soup.select("div.ZmyHeS")
                for item in review_items[:15]:
                    try:
                        txt = self.safe_extract(item, "div.ZmyHeS") or self.safe_extract(item, "div.t-yY7S") or item.text.strip()
                        if len(txt) < 10: continue
                        data["reviews"].append({
                            "author": self.safe_extract(item, "p._2NsDsF") or "Verified Buyer",
                            "rating": float(self.safe_extract(item, "div.XQD_n7") or self.safe_extract(item, "div._3LWZlK") or 4.0),
                            "text": txt,
                            "date": "Recent",
                            "verified": True
                        })
                    except: pass
            except Exception as e:
                print(f"Flipkart Extraction Error: {e}")
            
            return data
        except Exception as e:
            print(f"Flipkart Scrape Error: {e}")
            return self.get_schema()
