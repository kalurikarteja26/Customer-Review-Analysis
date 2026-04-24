import axios from 'axios';
import * as cheerio from 'cheerio';
import { cleanUrl } from '../utils/cleanUrl.js';
import { detectPlatform } from '../utils/detector.js';

import { AmazonExtractor } from '../extractors/AmazonExtractor.js';
import { FlipkartExtractor } from '../extractors/flipkartExtractor.js';
import { MeeshoExtractor } from '../extractors/meeshoExtractor.js';
import { MyntraExtractor } from '../extractors/myntraExtractor.js';
import { AjioExtractor } from '../extractors/ajioExtractor.js';
import { SnapdealExtractor } from '../extractors/snapdealExtractor.js';
import { AmazonSearcher } from '../searchers/AmazonSearcher.js';
import { FlipkartSearcher } from '../searchers/FlipkartSearcher.js';

// Realistic browser User-Agents to rotate and avoid bot detection
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

/**
 * Fetches HTML from a URL with full anti-bot headers.
 * Returns the raw HTML string, or throws on network error.
 */
async function fetchHtml(url, ua) {
    const response = await axios.get(url, {
        headers: {
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'DNT': '1',
            'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
        },
        timeout: 30000, // 30 seconds per request
        maxRedirects: 5,
        decompress: true,
    });
    return response.data;
}

/**
 * Extracts public Amazon reviews from the dedicated /product-reviews/ page.
 * This page is server-rendered and does NOT require JavaScript.
 */
async function fetchAmazonReviews(asin, origin, ua) {
    const reviewsUrl = `${origin}/product-reviews/${asin}?pageNumber=1&sortBy=recent`;
    try {
        const html = await fetchHtml(reviewsUrl, ua);
        const $ = cheerio.load(html);
        const reviews = [];

        $('div[data-hook="review"]').each((i, el) => {
            if (i >= 10) return;
            const author = $(el).find('[data-hook="review-author"], .a-profile-name').first().text().trim() || 'Amazon Customer';
            const ratingRaw = $(el).find('[data-hook="review-star-rating"] .a-icon-alt, [data-hook="cmps-review-star-rating"] .a-icon-alt').first().text().trim();
            const ratingMatch = ratingRaw.match(/([0-9.]+)/);
            const rating = ratingMatch ? ratingMatch[1] : '0';
            const text = $(el).find('[data-hook="review-body"] span').first().text().trim() ||
                         $(el).find('[data-hook="review-collapsed"] span').first().text().trim();
            if (text && text.length > 5) {
                reviews.push({ author, rating, text });
            }
        });

        return reviews;
    } catch (e) {
        // Reviews page failed — return empty, never crash
        return [];
    }
}

export class Engine {
    static async processUrl(rawUrl) {
        // 1. Sanitize the URL
        const cUrl = cleanUrl(rawUrl);

        // 2. Detect Platform
        const platform = detectPlatform(cUrl);
        if (!platform) {
            throw new Error("Unsupported website");
        }

        // 3. Pick a random User-Agent
        const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

        // 4. Fetch HTML with Anti-Bot Resilience
        let html;
        try {
            html = await fetchHtml(cUrl, ua);
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                throw new Error("Network failure: Request timed out");
            }
            if (error.response && error.response.status === 404) {
                throw new Error("Product not found");
            }
            throw new Error(`Network failure: ${error.message}`);
        }

        // 5. Select the appropriate extractor
        let extractor;
        switch (platform) {
            case 'amazon':
                extractor = new AmazonExtractor(html, cUrl, platform);
                break;
            case 'flipkart':
                extractor = new FlipkartExtractor(html, cUrl, platform);
                break;
            case 'meesho':
                extractor = new MeeshoExtractor(html, cUrl, platform);
                break;
            case 'myntra':
                extractor = new MyntraExtractor(html, cUrl, platform);
                break;
            case 'ajio':
                extractor = new AjioExtractor(html, cUrl, platform);
                break;
            case 'snapdeal':
                extractor = new SnapdealExtractor(html, cUrl, platform);
                break;
            default:
                throw new Error("Unsupported website");
        }

        // 6. Extract and Validate
        const rawData = extractor.extract();
        const validatedData = extractor.validate(rawData);

        // 7. For Amazon: if reviews are empty from the product page (JS-rendered),
        //    fetch the dedicated static reviews page as a fallback.
        if (platform === 'amazon' && validatedData.reviews.length === 0) {
            try {
                const parsedUrl = new URL(cUrl);
                const asinMatch = parsedUrl.pathname.match(/\/dp\/([A-Z0-9]{10})/);
                if (asinMatch) {
                    const asin = asinMatch[1];
                    const origin = parsedUrl.origin;
                    const extraReviews = await fetchAmazonReviews(asin, origin, ua);
                    if (extraReviews.length > 0) {
                        validatedData.reviews = extraReviews;
                    }
                }
            } catch (e) {
                // Non-fatal: proceed with empty reviews
            }
        }

        return validatedData;
    }

    static async search(query) {
        const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        const searchers = [
            new AmazonSearcher(ua),
            new FlipkartSearcher(ua)
        ];

        const results = await Promise.allSettled(searchers.map(s => s.search(query)));
        const allProducts = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value);

        return allProducts;
    }
}
