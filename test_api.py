import urllib.request
import json

req = urllib.request.Request(
    'http://127.0.0.1:5000/product-search',
    data=json.dumps({"query": "sunscreen", "platforms": []}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        for r in result.get('canonical_products', []):
            print(f"[{r['best_platform']}] {r['title']} - {r['variants'][0]['price']}")
except Exception as e:
    print("Error:", e)
