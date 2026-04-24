export function detectPlatform(url) {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname.toLowerCase();
        
        if (hostname.includes('amazon.')) return 'amazon';
        if (hostname.includes('flipkart.')) return 'flipkart';
        if (hostname.includes('meesho.')) return 'meesho';
        if (hostname.includes('myntra.')) return 'myntra';
        if (hostname.includes('ajio.')) return 'ajio';
        if (hostname.includes('snapdeal.')) return 'snapdeal';
        
        return null; // unsupported
    } catch (e) {
        return null;
    }
}
