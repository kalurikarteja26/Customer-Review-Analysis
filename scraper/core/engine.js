import axios from 'axios';
import * as cheerio from 'cheerio';
import { cleanUrl } from '../utils/cleanUrl.js';
import { detectPlatform } from '../utils/detector.js';
import { BrowserManager } from '../utils/BrowserManager.js';

import { AmazonExtractor } from '../extractors/AmazonExtractor.js';
import { FlipkartExtractor } from '../extractors/flipkartExtractor.js';
import { MeeshoExtractor } from '../extractors/meeshoExtractor.js';
import { MyntraExtractor } from '../extractors/myntraExtractor.js';
import { AjioExtractor } from '../extractors/ajioExtractor.js';
import { SnapdealExtractor } from '../extractors/snapdealExtractor.js';

import { AmazonSearcher } from '../searchers/AmazonSearcher.js';
import { FlipkartSearcher } from '../searchers/FlipkartSearcher.js';
import { AjioSearcher } from '../searchers/AjioSearcher.js';
import { SnapdealSearcher } from '../searchers/SnapdealSearcher.js';
import { MeeshoSearcher } from '../searchers/MeeshoSearcher.js';
import { MyntraSearcher } from '../searchers/MyntraSearcher.js';

// Realistic browser User-Agents
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

async function fetchHtml(url, ua) {
    const response = await axios.get(url, {
        headers: {
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        },
        timeout: 30000,
    });
    return response.data;
}

async function fetchAmazonReviews(asin, origin, ua) {
    const reviewsUrl = `${origin}/product-reviews/${asin}?pageNumber=1&sortBy=recent`;
    try {
        const html = await fetchHtml(reviewsUrl, ua);
        const $ = cheerio.load(html);
        const reviews = [];
        $('div[data-hook="review"]').each((i, el) => {
            if (i >= 10) return;
            const author = $(el).find('[data-hook="review-author"], .a-profile-name').first().text().trim() || 'Amazon Customer';
            const ratingRaw = $(el).find('[data-hook="review-star-rating"] .a-icon-alt').first().text().trim();
            const ratingMatch = ratingRaw.match(/([0-9.]+)/);
            const rating = ratingMatch ? ratingMatch[1] : '0';
            const text = $(el).find('[data-hook="review-body"] span').first().text().trim();
            if (text && text.length > 5) {
                reviews.push({ author, rating, text });
            }
        });
        return reviews;
    } catch (e) {
        return [];
    }
}

export class Engine {
    static async processUrl(rawUrl) {
        const cUrl = cleanUrl(rawUrl);
        const platform = detectPlatform(cUrl);
        if (!platform) throw new Error("Unsupported website");

        const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        let html;
        let needPlaywright = false;
        try {
            html = await fetchHtml(cUrl, ua);
        } catch (error) {
            console.error(`[Engine] HTTP failed for ${cUrl}: ${error.message}. Trying Playwright fallback...`);
            needPlaywright = true;
        }

        const getExtractor = (h) => {
            switch (platform) {
                case 'amazon': return new AmazonExtractor(h, cUrl, platform);
                case 'flipkart': return new FlipkartExtractor(h, cUrl, platform);
                case 'meesho': return new MeeshoExtractor(h, cUrl, platform);
                case 'myntra': return new MyntraExtractor(h, cUrl, platform);
                case 'ajio': return new AjioExtractor(h, cUrl, platform);
                case 'snapdeal': return new SnapdealExtractor(h, cUrl, platform);
                default: throw new Error("Unsupported website");
            }
        };

        if (!needPlaywright) {
            const testExtractor = getExtractor(html);
            const testData = testExtractor.extract();
            // Force Playwright if title/price are missing, OR if reviews are completely missing 
            // (since reviews are heavily lazy-loaded on most modern e-commerce sites).
            if (!testData.title || testData.price === null || (!testData.reviews || testData.reviews.length === 0)) {
                console.error(`[Engine] HTTP returned incomplete data or missing reviews for ${cUrl}. Trying Playwright fallback...`);
                needPlaywright = true;
            }
        }

        if (needPlaywright) {
            try {
                const browser = await BrowserManager.getBrowser();
                const page = await BrowserManager.createPage(ua);
                await page.goto(cUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
                // Robust deep scroll to trigger lazy-loaded reviews and ratings
                await page.evaluate(async () => {
                    await new Promise((resolve) => {
                        let totalHeight = 0;
                        const distance = 400;
                        const timer = setInterval(() => {
                            const scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;
                            if (totalHeight >= scrollHeight || totalHeight > 6000) {
                                clearInterval(timer);
                                resolve();
                            }
                        }, 100);
                    });
                });
                // Wait briefly for AJAX review loads
                await new Promise(r => setTimeout(r, 1500));
                html = await page.content();
                await BrowserManager.cleanup();
            } catch (pwError) {
                await BrowserManager.cleanup();
                throw new Error(`Network and Browser fallback failure: ${pwError.message}`);
            }
        }

        const extractor = getExtractor(html);
        const rawData = extractor.extract();
        const validatedData = extractor.validate(rawData);

        if (platform === 'amazon' && validatedData.reviews.length === 0) {
            const parsedUrl = new URL(cUrl);
            const asinMatch = parsedUrl.pathname.match(/\/dp\/([A-Z0-9]{10})/);
            if (asinMatch) {
                const extraReviews = await fetchAmazonReviews(asinMatch[1], parsedUrl.origin, ua);
                if (extraReviews.length > 0) validatedData.reviews = extraReviews;
            }
        }

        return validatedData;
    }

    static async search(query) {
        const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        const searchers = [
            new AmazonSearcher(ua),
            new FlipkartSearcher(ua),
            new AjioSearcher(ua),
            new SnapdealSearcher(ua),
            new MeeshoSearcher(ua),
            new MyntraSearcher(ua)
        ];

        console.log(`[Engine] Starting multi-platform search for: "${query}"`);

        // Phase 1: HTTP Search (Parallel)
        const httpResults = await Promise.allSettled(searchers.map(s => s.search(query)));
        
        const finalResults = [];
        const browserNeededFor = [];

        httpResults.forEach((res, index) => {
            const s = searchers[index];
            if (res.status === 'fulfilled' && res.value && res.value.length > 0) {
                console.log(`[Engine] ${s.constructor.name}: HTTP Success (${res.value.length} items)`);
                finalResults.push(...res.value);
            } else {
                if (s.useBrowser) {
                    console.log(`[Engine] ${s.constructor.name}: HTTP Failed/Empty. Queueing for Playwright.`);
                    browserNeededFor.push(s);
                } else {
                    console.log(`[Engine] ${s.constructor.name}: HTTP Failed/Empty. No browser fallback available.`);
                }
            }
        });

        // Phase 2: Playwright Fallback (Sequential to avoid overload)
        if (browserNeededFor.length > 0) {
            console.error(`[Engine] Launching browser for ${browserNeededFor.length} platforms...`);
            try {
                const browser = await BrowserManager.getBrowser();
                const page = await BrowserManager.createPage(ua);

                for (const s of browserNeededFor) {
                    try {
                        const results = await s.searchWithBrowser(page, query);
                        if (results && results.length > 0) {
                            console.error(`[Engine] ${s.constructor.name}: Playwright Success (${results.length} items)`);
                            finalResults.push(...results);
                        } else {
                            console.error(`[Engine] ${s.constructor.name}: Playwright returned no results.`);
                        }
                        
                        await new Promise(r => setTimeout(r, 500));
                    } catch (err) {
                        console.error(`[Engine] Playwright error for ${s.constructor.name}:`, err.message);
                    }
                }
                await BrowserManager.cleanup();
            } catch (err) {
                console.error("[Engine] Global Browser Error:", err.message);
                await BrowserManager.cleanup();
            }
        }

        console.error(`[Engine] Search complete. Total products found: ${finalResults.length}`);
        return finalResults;
    }
}
