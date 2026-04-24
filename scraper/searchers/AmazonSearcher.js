import { BaseSearcher } from './BaseSearcher.js';

export class AmazonSearcher extends BaseSearcher {
    constructor(ua) {
        super(ua);
        this.useBrowser = true;
    }

    async search(query) {
        const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
        const $ = await this.fetch(url);
        if (!$) return [];

        const products = [];
        $('.s-result-item[data-component-type="s-search-result"]').each((i, el) => {
            if (products.length >= 5) return;
            const title = $(el).find('h2 a span').text().trim();
            const link = $(el).find('h2 a').attr('href');
            const price = $(el).find('.a-price-whole').first().text().replace(/[^0-9]/g, '');
            const rating = $(el).find('.a-icon-star-small .a-icon-alt').text().split(' ')[0];
            const image = $(el).find('.s-image').attr('src');

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
        const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
        console.error(`[Playwright] Amazon: ${url}`);
        
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            // Random delay to mimic human behavior
            await page.waitForTimeout(2000 + Math.random() * 3000);

            // Wait for results
            await page.waitForSelector('.s-result-item[data-component-type="s-search-result"]', { timeout: 10000 });
        } catch (e) {
            console.error("[Playwright] Amazon: Results not found within timeout.");
            // Check for captcha
            try {
                if ((await page.content()).includes('captcha')) {
                    console.error("[Playwright] Amazon: CAPTCHA detected.");
                }
            } catch (err) {}
            return [];
        }

        const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]'));
            return items.slice(0, 5).map(el => {
                const titleEl = el.querySelector('h2 a span');
                const linkEl = el.querySelector('h2 a');
                const priceEl = el.querySelector('.a-price-whole');
                const imageEl = el.querySelector('.s-image');
                
                // Get high res from srcset if possible
                let imgSrc = imageEl ? imageEl.src : null;
                if (imageEl) {
                    const dataSrc = imageEl.getAttribute('data-src');
                    if (dataSrc) imgSrc = dataSrc;
                    
                    const srcset = imageEl.getAttribute('srcset');
                    if (srcset) {
                        const sets = srcset.split(',').map(s => s.trim().split(' '));
                        if (sets.length > 0) imgSrc = sets[sets.length - 1][0]; // Take largest
                    }
                }

                return {
                    title: titleEl ? titleEl.innerText.trim() : null,
                    url: linkEl ? (linkEl.href.startsWith('http') ? linkEl.href : 'https://www.amazon.in' + linkEl.getAttribute('href')) : null,
                    price: priceEl ? parseFloat(priceEl.innerText.replace(/[^0-9]/g, '')) : null,
                    image: imgSrc,
                    source: 'amazon'
                };
            }).filter(item => item.title && item.url);
        });

        return results;
    }
}
