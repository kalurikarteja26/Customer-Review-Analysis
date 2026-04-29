import { BaseSearcher } from './BaseSearcher.js';

export class AmazonSearcher extends BaseSearcher {
    constructor(ua) {
        super(ua);
        this.useBrowser = true;
    }

    async search(query) {
        const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss`;
        const $ = await this.fetch(url);
        if (!$) return [];

        const products = [];
        $('.s-result-item[data-component-type="s-search-result"]').each((i, el) => {
            if (products.length >= 10) return;
            const title = $(el).find('h2 a span, h2 span, h2').first().text().trim();
            const link = $(el).find('h2 a, .a-link-normal.s-no-outline').first().attr('href');
            const priceText = $(el).find('.a-price-whole').first().text() || $(el).find('.a-price .a-offscreen').first().text();
            const price = priceText ? priceText.replace(/[^0-9]/g, '') : null;
            
            const ratingText = $(el).find('.a-icon-star-small .a-icon-alt, .a-icon-star .a-icon-alt').first().text();
            const rating = ratingText ? ratingText.split(' ')[0] : null;
            
            const imageEl = $(el).find('.s-image');
            let image = imageEl.attr('src') || imageEl.attr('data-src');
            
            if (title && link) {
                products.push({
                    title,
                    url: link.startsWith('http') ? link : `https://www.amazon.in${link}`,
                    price: price ? parseFloat(price) : null,
                    rating: rating ? parseFloat(rating) : null,
                    image,
                    source: 'amazon'
                });
            }
        });

        return products;
    }

    async searchWithBrowser(page, query) {
        const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss`;
        console.error(`[Playwright] Amazon Search: ${url}`);
        
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
            
            // Wait for results with a shorter timeout first, then fallback
            try {
                await page.waitForSelector('.s-result-item[data-component-type="s-search-result"]', { timeout: 7000 });
            } catch (e) {
                console.error("[Playwright] Amazon: Slow results, trying backup selector...");
                await page.waitForSelector('.s-asin', { timeout: 5000 }).catch(() => {});
            }

            // Minimal scroll to trigger lazy loading
            await page.evaluate(() => window.scrollBy(0, 800));
            await page.waitForTimeout(1000);

        } catch (e) {
            console.error("[Playwright] Amazon: Search page navigation failed or timed out.");
            return [];
        }

        const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"], .s-asin'));
            return items.slice(0, 15).map(el => {
                const titleEl = el.querySelector('h2 a span, h2 span, h2, .a-size-medium.a-color-base.a-text-normal');
                const linkEl = el.querySelector('h2 a, .a-link-normal.s-no-outline, a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal');
                const priceEl = el.querySelector('.a-price-whole, .a-price .a-offscreen');
                const imageEl = el.querySelector('.s-image');
                
                let title = titleEl ? titleEl.innerText.trim() : null;
                let url = null;
                if (linkEl) {
                    const href = linkEl.getAttribute('href');
                    url = href.startsWith('http') ? href : 'https://www.amazon.in' + href;
                }

                let price = null;
                if (priceEl) {
                    const pText = priceEl.innerText.replace(/[^0-9]/g, '');
                    if (pText) price = parseFloat(pText);
                }

                let imgSrc = null;
                if (imageEl) {
                    imgSrc = imageEl.getAttribute('src') || imageEl.getAttribute('data-src');
                }

                return {
                    title,
                    url,
                    price,
                    image: imgSrc,
                    source: 'amazon'
                };
            }).filter(item => item.title && item.url);
        });

        console.error(`[Playwright] Amazon: Extracted ${results.length} items.`);
        return results;
    }
}
