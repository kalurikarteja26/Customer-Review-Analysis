export class Detector {
    static detectPlatform(url) {
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname.toLowerCase();
            
            if (hostname.includes('amazon.')) {
                return 'Amazon';
            } else if (hostname.includes('flipkart.')) {
                return 'Flipkart';
            }
            return 'Generic';
        } catch (e) {
            return null;
        }
    }

    static sanitizeUrl(url) {
        try {
            const parsedUrl = new URL(url);
            // Remove common tracking parameters
            parsedUrl.searchParams.delete('tag');
            parsedUrl.searchParams.delete('ref');
            parsedUrl.searchParams.delete('ref_');
            parsedUrl.searchParams.delete('smid');
            // return clean URL
            return parsedUrl.toString();
        } catch (e) {
            return url;
        }
    }
}
