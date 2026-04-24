export function cleanUrl(rawUrl) {
    try {
        const parsedUrl = new URL(rawUrl);
        // Remove common tracking parameters
        const paramsToRemove = ['tag', 'ref', 'ref_', 'smid', 'sr', 'qid', 'sprefix'];
        paramsToRemove.forEach(param => parsedUrl.searchParams.delete(param));
        
        let urlStr = parsedUrl.toString();
        
        // Custom Amazon generic fallback (keep dp or gp cleanly)
        if (parsedUrl.hostname.includes('amazon.')) {
            const dpMatch = parsedUrl.pathname.match(/\/(dp|gp\/product)\/([A-Z0-9]+)/);
            if (dpMatch) {
                return `${parsedUrl.origin}/dp/${dpMatch[2]}`;
            }
        }
        
        return urlStr;
    } catch (e) {
        return rawUrl;
    }
}
