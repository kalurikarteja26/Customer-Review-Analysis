import axios from 'axios';
import * as cheerio from 'cheerio';

export class BaseSearcher {
    constructor(ua) {
        this.ua = ua;
        this.useBrowser = false; // Default to HTTP
    }

    async fetch(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.ua,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                timeout: 15000,
                validateStatus: (status) => status < 500
            });
            
            if (response.status !== 200) {
                console.warn(`[HTTP] ${url.substring(0, 50)} returned status ${response.status}`);
                return null;
            }
            
            return cheerio.load(response.data);
        } catch (error) {
            console.error(`[HTTP Error] ${error.message}`);
            return null;
        }
    }

    async search(query) {
        throw new Error("Search method not implemented");
    }

    async searchWithBrowser(page, query) {
        // Optional: Implement in subclasses for Playwright support
        return [];
    }
}
