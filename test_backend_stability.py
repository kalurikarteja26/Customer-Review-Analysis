import requests
import time

urls = [
    "https://www.amazon.in/dp/B08V8W3K9K",
    "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4",
    "https://www.myntra.com/shoes/nike/nike-men-black-air-zoom-pegasus-38-running-shoes/14318112/buy"
]

def test_backend():
    print("Starting Backend Stability Test...")
    
    for i, url in enumerate(urls):
        print(f"\n[{i + 1}/{len(urls)}] Testing: {url}")
        
        try:
            start = time.time()
            response = requests.post("http://localhost:8000/fetch-product-intelligence", json={"url": url})
            end = time.time()
            
            if response.status_code == 200:
                res_json = response.json()
                if res_json.get("success"):
                    data = res_json.get("data", {})
                    print(f"[SUCCESS] {end - start:.2f}s")
                    print(f"Title: {data.get('title')}")
                else:
                    print(f"[EXPECTED FAILURE] Backend reported error: {res_json.get('error')}")
            else:
                print(f"[ERROR] HTTP Error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[CRASH] Request crashed: {e}")
    
    print("\nTest Complete.")

if __name__ == "__main__":
    test_backend()
