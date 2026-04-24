import requests
import time

urls = [
    "https://www.amazon.in/dp/B08V8W3K9K",
    "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4",
    "https://www.myntra.com/shoes/nike/nike-men-black-air-zoom-pegasus-38-running-shoes/14318112/buy",
    "https://www.meesho.com/s/p/4p6z8z",
    "https://www.ajio.com/s/p/461234567"
]

def stress_test():
    print("Starting Stress Test: Sequential Analysis...")
    
    for i, url in enumerate(urls):
        print(f"\n[{i + 1}/{len(urls)}] Analyzing: {url}")
        
        try:
            start = time.time()
            response = requests.post("http://localhost:8000/fetch-product-intelligence", json={"url": url})
            end = time.time()
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print(f"[SUCCESS] {end - start:.2f}s")
                    print(f"Title: {data.get('title')[:50]}...")
                else:
                    print(f"[FAILURE] Backend reported failure: {data.get('error')}")
            else:
                print(f"[ERROR] HTTP Error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[CRASH] Request crashed: {e}")
    
    print("\nStress Test Complete.")

if __name__ == "__main__":
    stress_test()
