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
            if (products.length >= 20) return;
            const title = $(el).find('h2 a span').text().trim();
            const link = $(el).find('h2 a').attr('href');
            const price = $(el).find('.a-price-whole').first().text().replace(/[^0-9]/g, '');
            const rating = $(el).find('.a-icon-star-small .a-icon-alt').text().split(' ')[0];
            const imageEl = $(el).find('.s-image');
            const srcset = imageEl.attr('srcset');
            const image = imageEl.attr('src') || imageEl.attr('data-src') || (srcset ? srcset.split(' ')[0] : null);

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
            return items.slice(0, 20).map(el => {
                const titleEl = el.querySelector('h2 a span');
                const linkEl = el.querySelector('h2 a');
                const priceEl = el.querySelector('.a-price-whole');
                const imageEl = el.querySelector('.s-image');
                
                let imgSrc = null;
                if (imageEl) {
                    imgSrc = imageEl.getAttribute('data-src') || imageEl.getAttribute('srcset')?.split(' ')[0] || imageEl.src;
                    if (imgSrc && imgSrc.startsWith('data:image')) {
                        imgSrc = imageEl.getAttribute('data-src') || imageEl.getAttribute('srcset')?.split(' ')[0] || null;
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
