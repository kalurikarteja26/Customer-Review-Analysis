/**
 * Sentix-Prime Scraping Engine
 * 
 * - processUrl: deep-dive scrape for a single product URL (Playwright fallback)
 * - search: HTTP-only parallel multi-platform search (fast path, no browser)
 *
 * Stealth features:
 *  - Randomized User-Agents + Accept-Language headers
 *  - Human-like scroll depth + random pauses
 *  - CAPTCHA detection (safe skip, no illegal bypass)
 *  - Retry with exponential backoff for HTTP failures
 */
import axios from 'axios';
import * as cheerio from 'cheerio';
import { cleanUrl } from '../utils/cleanUrl.js';
import { detectPlatform } from '../utils/detector.js';
import { BrowserManager } from '../utils/BrowserManager.js';
import { selectorValidator } from './selectorValidator.js';

import { AmazonExtractor }   from '../extractors/AmazonExtractor.js';
import { FlipkartExtractor } from '../extractors/flipkartExtractor.js';
import { MeeshoExtractor }   from '../extractors/meeshoExtractor.js';
import { MyntraExtractor }   from '../extractors/myntraExtractor.js';
import { AjioExtractor }     from '../extractors/ajioExtractor.js';
import { SnapdealExtractor } from '../extractors/snapdealExtractor.js';

import { AmazonSearcher }   from '../searchers/AmazonSearcher.js';
import { FlipkartSearcher } from '../searchers/FlipkartSearcher.js';
import { AjioSearcher }     from '../searchers/AjioSearcher.js';
import { SnapdealSearcher } from '../searchers/SnapdealSearcher.js';
import { MeeshoSearcher }   from '../searchers/MeeshoSearcher.js';
import { MyntraSearcher }   from '../searchers/MyntraSearcher.js';

// ── Stealth UA pool ──────────────────────────────────────────────────────────
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

const ACCEPT_LANGS = [
    'en-IN,en-US;q=0.9,en;q=0.8',
    'en-US,en;q=0.9,hi;q=0.8',
    'en-IN,hi;q=0.8,en;q=0.7',
];

const CAPTCHA_SIGNALS = [
    'verify you are human', 'unusual traffic',
    'access denied', 'temporarily blocked', 'automated access',
    'are you a robot', 'prove you are a human'
];

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function isCaptchaPage(html) {
    const lower = (html || '').toLowerCase();
    return CAPTCHA_SIGNALS.some(s => lower.includes(s));
}

function stealthHeaders(ua) {
    return {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': pickRandom(ACCEPT_LANGS),
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
    };
}

// ── HTTP fetch for deep-dive (with retry) ────────────────────────────────────
async function fetchHtml(url, ua, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 1) await sleep(attempt * 800 + Math.random() * 400);
            const res = await axios.get(url, {
                headers: stealthHeaders(ua),
                timeout: 15000,
                maxRedirects: 5,
            });
            if (isCaptchaPage(res.data)) {
                console.error(`[Engine] CAPTCHA on ${url.substring(0, 60)} — skipping`);
                return null;
            }
            return res.data;
        } catch (e) {
            console.error(`[Engine] HTTP attempt ${attempt} failed: ${e.message}`);
        }
    }
    return null;
}

// ── Amazon dedicated review page fetch ──────────────────────────────────────
async function fetchAmazonReviews(asin, origin, ua) {
    const reviewUrl = `${origin}/product-reviews/${asin}?pageNumber=1&sortBy=recent`;
    try {
        console.error(`[Engine] Amazon review page: ${reviewUrl}`);
        const html = await fetchHtml(reviewUrl, ua, 2);
        if (!html) return [];
        const $ = cheerio.load(html);
        const reviews = [];
        $('div[data-hook="review"]').each((i, el) => {
            if (i >= 15) return;
            const author = $(el).find('[data-hook="review-author"], .a-profile-name').first().text().trim() || 'Amazon Customer';
            const ratingRaw = $(el).find('[data-hook="review-star-rating"] .a-icon-alt').first().text().trim();
            const ratingMatch = ratingRaw.match(/([0-9.]+)/);
            const rating = ratingMatch ? ratingMatch[1] : '0';
            const text = $(el).find('[data-hook="review-body"] span').first().text().trim();
            const date = $(el).find('[data-hook="review-date"]').first().text().trim();
            const verified = $(el).find('[data-hook="avp-verified-purchase"]').length > 0;
            if (text && text.length > 5) reviews.push({ author, rating, text, date, verified });
        });
        console.error(`[Engine] Amazon reviews fetched: ${reviews.length}`);
        return reviews;
    } catch (e) {
        console.error(`[Engine] Amazon review fetch failed: ${e.message}`);
        return [];
    }
}

// ── Flipkart review page fetch ───────────────────────────────────────────────
async function fetchFlipkartReviews(productUrl, ua) {
    try {
        const reviewUrl = productUrl.replace('/p/', '/product-reviews/');
        const html = await fetchHtml(reviewUrl, ua, 2);
        if (!html) return [];
        const $ = cheerio.load(html);
        const reviews = [];
        const selectors = ['div._27M-vq', 'div.col._2wzgFH', 'div.gqVXv1', 'div.t-ZTKy', 'div.ZmyHeo', 'div.row._3f4bJG'];
        for (const sel of selectors) {
            $(sel).each((i, el) => {
                if (reviews.length >= 15) return;
                const author = $(el).find('p._2sc7ZR, ._2NsDsF, .row .col ._2NsDsF').first().text().trim() || 'Flipkart Customer';
                const rating = $(el).find('div._3LWZlK, .XQDdHH').first().text().trim() || '0';
                const body = $(el).find('div.t-ZTKy div div, .vMCK2k, div.ZmyHeo').first().text().trim();
                const title = $(el).find('p._2-N8zT').first().text().trim();
                const text = body || title;
                const date = $(el).find('p._2sc7ZR').last().text().trim();
                if (text && text.length > 5) reviews.push({ author, rating, text, date });
            });
            if (reviews.length > 0) break;
        }
        console.error(`[Engine] Flipkart reviews fetched: ${reviews.length}`);
        return reviews;
    } catch (e) {
        console.error(`[Engine] Flipkart review fetch failed: ${e.message}`);
        return [];
    }
}

// ── Extractor factory ────────────────────────────────────────────────────────
function makeExtractor(html, url, platform) {
    switch (platform) {
        case 'amazon':   return new AmazonExtractor(html, url, platform);
        case 'flipkart': return new FlipkartExtractor(html, url, platform);
        case 'meesho':   return new MeeshoExtractor(html, url, platform);
        case 'myntra':   return new MyntraExtractor(html, url, platform);
        case 'ajio':     return new AjioExtractor(html, url, platform);
        case 'snapdeal': return new SnapdealExtractor(html, url, platform);
        default: throw new Error('Unsupported website');
    }
}

// ── Main Engine ──────────────────────────────────────────────────────────────
export class Engine {

    static async processUrl(rawUrl) {
        const cUrl = cleanUrl(rawUrl);
        const platform = detectPlatform(cUrl);
        if (!platform) throw new Error('Unsupported website');

        const ua = pickRandom(USER_AGENTS);
        let html = await fetchHtml(cUrl, ua);
        let needPlaywright = !html;

        if (!needPlaywright) {
            const test = makeExtractor(html, cUrl, platform).extract();
            if (!test.title || test.price === null) {
                console.error(`[Engine] HTTP data incomplete — using Playwright fallback`);
                needPlaywright = true;
            }
        }

        if (needPlaywright) {
            try {
                const page = await BrowserManager.createPage(ua);

                // Stealth viewport randomisation
                await page.setViewportSize({
                    width:  1280 + Math.floor(Math.random() * 200),
                    height: 800  + Math.floor(Math.random() * 100),
                });

                await page.goto(cUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

                // Human-like deep scroll
                await page.evaluate(async () => {
                    await new Promise(resolve => {
                        let scrolled = 0;
                        const id = setInterval(() => {
                            window.scrollBy(0, 400 + Math.floor(Math.random() * 200));
                            scrolled += 500;
                            if (scrolled > 10000 || scrolled >= document.body.scrollHeight) {
                                clearInterval(id);
                                resolve();
                            }
                        }, 100);
                    });
                });

                // Check for CAPTCHA in browser
                const pwHtml = await page.content();
                if (isCaptchaPage(pwHtml)) {
                    console.error('[Engine] CAPTCHA detected in Playwright — cannot proceed');
                    await BrowserManager.cleanup();
                    throw new Error('CAPTCHA detected — please try again later');
                }

                // Try clicking "Read All Reviews" buttons
                const reviewBtnSelectors = [
                    'a[data-hook="see-all-reviews-link-foot"]',
                    'a._2KhiXE', 'div._3UAT2v a',
                ];
                for (const sel of reviewBtnSelectors) {
                    const btn = await page.$(sel);
                    if (btn) { await btn.click().catch(() => {}); await sleep(2000); break; }
                }

                await sleep(3000); // Wait for AJAX review loads
                html = await page.content();
                await BrowserManager.cleanup();
            } catch (pwError) {
                await BrowserManager.cleanup();
                throw new Error(`Scrape failed: ${pwError.message}`);
            }
        }

        const extractor = makeExtractor(html, cUrl, platform);
        const rawData = extractor.extract();
        const validated = extractor.validate(rawData);

        // Enrich reviews from dedicated platform endpoints
        if (platform === 'amazon') {
            const m = new URL(cUrl).pathname.match(/\/dp\/([A-Z0-9]{10})/);
            if (m) {
                const extra = await fetchAmazonReviews(m[1], new URL(cUrl).origin, ua);
                if (extra.length > 0) {
                    const seen = new Set(extra.map(r => r.text.substring(0, 50)));
                    const unique = validated.reviews.filter(r => !seen.has(r.text.substring(0, 50)));
                    validated.reviews = [...extra, ...unique].slice(0, 20);
                }
            }
        } else if (platform === 'flipkart' && validated.reviews.length < 3) {
            const extra = await fetchFlipkartReviews(cUrl, ua);
            if (extra.length > 0) validated.reviews = extra;
        }

        return selectorValidator.validate(platform, validated);
    }

    static async search(query) {
        const ua = pickRandom(USER_AGENTS);
        const searchers = [
            new AmazonSearcher(ua),
            new FlipkartSearcher(ua),
            new SnapdealSearcher(ua),
            new MeeshoSearcher(ua),
            new MyntraSearcher(ua),
            new AjioSearcher(ua),
        ];

        console.error(`[Engine] Parallel HTTP search: "${query}"`);

        // All platforms in parallel with individual 10s timeout
        const settled = await Promise.allSettled(
            searchers.map(s =>
                Promise.race([
                    s.search(query),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 10000))
                ])
            )
        );

        const results = [];
        const browserSearchers = [];

        settled.forEach((res, i) => {
            const searcher = searchers[i];
            const name = searcher.constructor.name;
            if (res.status === 'fulfilled' && Array.isArray(res.value) && res.value.length > 0) {
                console.error(`[Engine] ${name}: ${res.value.length} results (HTTP)`);
                results.push(...res.value);
            } else {
                const reason = res.reason?.message || 'empty';
                console.error(`[Engine] ${name}: HTTP failed (${reason})`);
                if (searcher.useBrowser) {
                    browserSearchers.push(searcher);
                }
            }
        });

        // ── Browser Fallback for failed platforms ───────────────────────────
        if (browserSearchers.length > 0) {
            console.error(`[Engine] Attempting Playwright fallback for ${browserSearchers.length} platforms...`);
            try {
                const page = await BrowserManager.createPage(ua);
                for (const s of browserSearchers) {
                    try {
                        const browserResults = await s.searchWithBrowser(page, query);
                        if (browserResults && browserResults.length > 0) {
                            console.error(`[Engine] ${s.constructor.name}: ${browserResults.length} results (Playwright)`);
                            results.push(...browserResults);
                        }
                    } catch (e) {
                        console.error(`[Engine] ${s.constructor.name}: Playwright failed: ${e.message}`);
                    }
                }
                await BrowserManager.cleanup();
            } catch (e) {
                console.error(`[Engine] Browser fallback failed: ${e.message}`);
                await BrowserManager.cleanup();
            }
        }

        console.error(`[Engine] Total search results: ${results.length}`);
        return results;
    }
}
