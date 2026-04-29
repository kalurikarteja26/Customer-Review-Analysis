/**
 * BaseSearcher — resilient HTTP fetcher with:
 *  - Randomized stealth headers (UA, Accept-Language, Viewport hints)
 *  - Retry with exponential backoff (3 attempts)
 *  - CAPTCHA / block detection
 *  - Per-request timeout enforcement
 */
import axios from 'axios';
import * as cheerio from 'cheerio';
import { proxyManager } from '../utils/proxyManager.js';

// Pool of realistic desktop User-Agents
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
];

const ACCEPT_LANGUAGES = [
    'en-IN,en-US;q=0.9,en;q=0.8',
    'en-US,en;q=0.9,hi;q=0.8',
    'en-GB,en;q=0.9',
    'en-IN,hi;q=0.8,en;q=0.7',
];

// Known CAPTCHA / block signals in page content
const CAPTCHA_SIGNALS = [
    'verify you are human', 'unusual traffic',
    'access denied', 'temporarily blocked', 'please verify', 'automated access',
    '403 forbidden', 'rate limit', 'too many requests', 'are you a robot',
    'prove you are a human'
];

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function buildHeaders(ua) {
    return {
        'User-Agent': ua || pickRandom(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': pickRandom(ACCEPT_LANGUAGES),
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'DNT': '1',
    };
}

function isCaptchaPage(html) {
    const lower = html.toLowerCase();
    return CAPTCHA_SIGNALS.some(signal => lower.includes(signal));
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class BaseSearcher {
    constructor(ua) {
        this.ua = ua || pickRandom(USER_AGENTS);
        this.useBrowser = false;
    }

    /**
     * HTTP fetch with 3-retry exponential backoff.
     * Returns a cheerio instance or null on failure.
     */
    async fetch(url, maxRetries = 3) {
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Human-like random delay between retries
                if (attempt > 1) {
                    const backoffMs = Math.pow(2, attempt - 1) * 500 + Math.random() * 500;
                    console.error(`[Retry ${attempt}] Waiting ${backoffMs.toFixed(0)}ms before ${url.substring(0, 50)}`);
                    await sleep(backoffMs);
                }

                const axiosConfig = {
                    headers: buildHeaders(this.ua),
                    timeout: 12000,
                    validateStatus: status => status < 500,
                    maxRedirects: 5,
                };
                
                const proxyStr = process.env.ENABLE_PROXIES === 'true' ? await proxyManager.getProxy() : null;
                
                if (proxyStr) {
                    const proxyUrl = new URL(proxyStr);
                    axiosConfig.proxy = {
                        protocol: proxyUrl.protocol.replace(':', ''),
                        host: proxyUrl.hostname,
                        port: parseInt(proxyUrl.port, 10),
                    };
                }

                const response = await axios.get(url, axiosConfig);

                if (response.status === 429 || response.status === 403) {
                    console.error(`[Blocked] ${url.substring(0, 50)} returned ${response.status} on attempt ${attempt}`);
                    lastError = new Error(`HTTP ${response.status}`);
                    continue; // Retry with new headers next iteration
                }

                if (response.status !== 200) {
                    console.error(`[HTTP ${response.status}] ${url.substring(0, 50)}`);
                    return null;
                }

                const html = response.data;
                if (isCaptchaPage(html)) {
                    console.error(`[CAPTCHA] Detected on ${url.substring(0, 50)} — skipping safely`);
                    return null; // Do not retry — CAPTCHA requires human intervention
                }

                return cheerio.load(html);

            } catch (error) {
                lastError = error;
                console.error(`[Fetch Error] attempt=${attempt} url=${url.substring(0, 50)} err=${error.message}`);
                // If proxy failed, mark it so we don't use it again
                if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
                    // Try to get proxy from previous config if we stored it
                    // For simplicity, we just rely on retry mechanism to fetch a new proxy next time
                }
            }
        }
        console.error(`[Failed] All ${maxRetries} attempts exhausted for ${url.substring(0, 50)}: ${lastError?.message}`);
        return null;
    }

    async search(query) {
        throw new Error('search() not implemented in subclass');
    }

    async searchWithBrowser(page, query) {
        return [];
    }
}
