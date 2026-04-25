import { BaseSearcher } from './BaseSearcher.js';

export class AjioSearcher extends BaseSearcher {
    constructor(ua) {
        super(ua);
        this.useBrowser = true;
    }

    async search(query) {
        const url = `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`;
        const $ = await this.fetch(url);
        const products = [];

        $('.item').each((i, el) => {
            if (products.length >= 20) return;
            const title = $(el).find('.name').text().trim();
            const brand = $(el).find('.brand').text().trim();
            const link = $(el).find('a').attr('href');
            const price = $(el).find('.price').text().replace(/[^0-9]/g, '');
            const imageEl = $(el).find('img');
            const srcset = imageEl.attr('srcset');
            const image = imageEl.attr('src') || imageEl.attr('data-src') || (srcset ? srcset.split(' ')[0] : null);

            if (title && link) {
                products.push({
                    title: brand ? `${brand} ${title}` : title,
                    url: link.startsWith('http') ? link : `https://www.ajio.com${link}`,
                    price: price ? parseFloat(price) : null,
                    rating: null,
                    image,
                    source: 'ajio'
                });
            }
        });

        return products;
    }

    async searchWithBrowser(page, query) {
        const url = `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`;
        console.error(`[Playwright] Ajio: ${url}`);

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForSelector('.item, .rilrtl-products-list__item', { timeout: 8000 });
        } catch (e) {
            console.error('[Playwright] Ajio: Timeout waiting for products.');
            return [];
        }

        const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.item, [data-testid="product-item"], .rilrtl-products-list__item'));
            return items.slice(0, 20).map(el => {
                const brandEl = el.querySelector('.brand, .rilflex-ProductBrand, [data-testid="brand-name"]');
                const nameEl = el.querySelector('.name, .nameCls, [data-testid="product-name"]');
                const linkEl = el.querySelector('a');
                const priceEl = el.querySelector('.price, .rilflex-Price, [data-testid="final-price"]');
                const imageEl = el.querySelector('img');

                const title = brandEl && nameEl ? `${brandEl.innerText.trim()} ${nameEl.innerText.trim()}`
                    : nameEl?.innerText.trim() || brandEl?.innerText.trim();
                
                if (!title || !linkEl) return null;

                let imgSrc = null;
                if (imageEl) {
                    imgSrc = imageEl.getAttribute('src') || imageEl.getAttribute('data-src') || imageEl.getAttribute('srcset')?.split(' ')[0];
                    if (imgSrc && imgSrc.startsWith('data:image')) {
                        imgSrc = imageEl.getAttribute('data-src') || imageEl.getAttribute('srcset')?.split(' ')[0] || imgSrc;
                    }
                }

                return {
                    title,
                    url: linkEl.href,
                    price: priceEl ? parseFloat(priceEl.innerText.replace(/[^0-9]/g, '')) : null,
                    image: imgSrc,
                    source: 'ajio'
                };
            }).filter(Boolean);
        });

        return results;
    }
}
