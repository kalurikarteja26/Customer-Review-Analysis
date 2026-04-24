const API_BASE = "http://127.0.0.1:8000";

export async function smartSearch(query) {
    try {
        const res = await fetch(`${API_BASE}/product-search`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            },
            body: JSON.stringify({ query })
        });
        if (!res.ok) throw new Error("Search failed");
        return res.json();
    } catch (err) {
        console.error("SEARCH ERROR:", err);
        return { status: "error", products: [], best_product: {} };
    }
}

export async function analyzeURL(url) {
    try {
        const res = await fetch(`${API_BASE}/product-analysis`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            },
            body: JSON.stringify({ url })
        });
        if (!res.ok) throw new Error("Analysis failed");
        return res.json();
    } catch (err) {
        console.error("ANALYZE URL ERROR:", err);
        return { status: "error", product: {}, recommendation: {} };
    }
}

export async function compareProducts(urls) {
    try {
        const urlParams = new URLSearchParams();
        urls.forEach(u => urlParams.append('urls', u));
        const res = await fetch(`${API_BASE}/product-comparison?${urlParams.toString()}`, {
            headers: { "Cache-Control": "no-cache" }
        });
        if (!res.ok) throw new Error("Comparison failed");
        return res.json();
    } catch (err) {
        console.error("COMPARISON ERROR:", err);
        return { status: "error", comparison: [] };
    }
}