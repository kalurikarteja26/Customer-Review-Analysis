import time
import requests
import sys

start = time.time()
try:
    response = requests.post("http://127.0.0.1:5000/product-search", json={"query": "laptop"}, timeout=30)
    elapsed = time.time() - start
    print(f"Search took {elapsed:.2f} seconds")
    
    data = response.json()
    print(f"Status: {data.get('status')}")
    print(f"Canonical products: {len(data.get('canonical_products', []))}")
    
    for p in data.get('canonical_products', []):
        title = p.get('title', '')[:50]
        img = p.get('image', '')
        img_status = "YES" if img else "EMPTY"
        print(f"  [{img_status}] {title}")

except Exception as e:
    print(f"Error: {e}")
