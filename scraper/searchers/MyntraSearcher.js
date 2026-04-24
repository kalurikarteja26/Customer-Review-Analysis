import { BaseSearcher } from './BaseSearcher.js';

export class MyntraSearcher extends BaseSearcher {
    constructor(ua) {
        super(ua);
        this.useBrowser = true;
    }

    async search(query) {
        const url = `https://www.myntra.com/${encodeURIComponent(query.replace(/\s+/g, '-'))}`;
        const $ = await this.fetch(url);
        if (!$) return [];

        const products = [];
        $('.product-base').each((i, el) => {
            if (products.length >= 5) return;
            const brand = $(el).find('.product-brand').text().trim();
            const name = $(el).find('.product-product').text().trim();
            const link = $(el).find('a').attr('href');
            const price = $(el).find('.product-discountedPrice').text().replace(/[^0-9]/g, '') ||
                          $(el).find('.product-price').text().replace(/[^0-9]/g, '');
            const image = $(el).find('img').attr('src');

            if (name && link) {
                products.push({
                    title: brand ? `${brand} ${name}` : name,
                    url: link.startsWith('http') ? link : `https://www.myntra.com/${link}`,
                    price: price ? parseFloat(price) : null,
                    image,
                    source: 'myntra'
                });
            }
        });

        return products;
    }

    async searchWithBrowser(page, query) {
        const url = `https://www.myntra.com/${encodeURIComponent(query.replace(/\s+/g, '-'))}`;
        console.error(`[Playwright] Myntra: ${url}`);

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            // Wait for products to appear
            await page.waitForSelector('.product-base', { timeout: 10000 });

            // Scroll to trigger lazy loading
            await page.evaluate(async () => {
                window.scrollBy(0, 1000);
                await new Promise(r => setTimeout(r, 1000));
            });
        } catch (e) {
            console.error("[Playwright] Myntra: Products not found within timeout.");
            return [];
        }

        const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.product-base'));
            return items.slice(0, 5).map(el => {
                const brandEl = el.querySelector('.product-brand');
                const nameEl = el.querySelector('.product-product');
                const linkEl = el.querySelector('a');
                const priceEl = el.querySelector('.product-discountedPrice') || el.querySelector('.product-price');
                const imageEl = el.querySelector('img');

                let imgSrc = null;
                if (imageEl) {
                    imgSrc = imageEl.src || imageEl.getAttribute('data-src');
                    // Avoid Myntra's placeholder base64 images if possible
                    if (imgSrc && imgSrc.startsWith('data:image')) {
                        imgSrc = imageEl.getAttribute('data-src') || imageEl.getAttribute('srcset')?.split(' ')[0] || imgSrc;
                    }
                }

                return {
                    title: brandEl ? `${brandEl.innerText} ${nameEl?.innerText}` : nameEl?.innerText,
                    url: linkEl ? linkEl.href : null,
                    price: priceEl ? parseFloat(priceEl.innerText.replace(/[^0-9]/g, '')) : null,
                    image: imgSrc,
                    source: 'myntra'
                };
            }).filter(item => item.title && item.url);
        });

        return results;
    }
}
