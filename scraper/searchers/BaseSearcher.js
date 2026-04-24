import axios from 'axios';
import * as cheerio from 'cheerio';

export class BaseSearcher {
    constructor(ua) {
        this.ua = ua;
    }

    async fetch(url) {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': this.ua,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
            },
            timeout: 15000
        });
        return cheerio.load(response.data);
    }

    async search(query) {
        throw new Error("Search method not implemented");
    }
}
