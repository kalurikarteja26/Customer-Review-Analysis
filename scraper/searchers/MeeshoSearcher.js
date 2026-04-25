import { BaseSearcher } from './BaseSearcher.js';

export class MeeshoSearcher extends BaseSearcher {
    constructor(ua) {
        super(ua);
        this.useBrowser = true;
    }

    async search(query) {
        const url = `https://www.meesho.com/search?q=${encodeURIComponent(query)}`;
        const $ = await this.fetch(url);
        const products = [];

        $('div[class*="ProductCard"], .sc-bcXHqe').each((i, el) => {
            if (products.length >= 20) return;
            const title = $(el).find('p[class*="NewProductCardstyled__StyledName"]').text().trim() ||
                          $(el).find('p').first().text().trim();
            const link = $(el).find('a').attr('href');
            const price = $(el).find('h5').text().replace(/[^0-9]/g, '');
            const imageEl = $(el).find('img');
            const srcset = imageEl.attr('srcset');
            const image = imageEl.attr('src') || imageEl.attr('data-src') || (srcset ? srcset.split(' ')[0] : null);

            if (title && link) {
                products.push({
                    title,
                    url: link.startsWith('http') ? link : `https://www.meesho.com${link}`,
                    price: price ? parseFloat(price) : null,
                    rating: null,
                    image,
                    source: 'meesho'
                });
            }
        });

        return products;
    }

    async searchWithBrowser(page, query) {
        const url = `https://www.meesho.com/search?q=${encodeURIComponent(query)}`;
        console.error(`[Playwright] Meesho: ${url}`);

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            // Meesho is heavily React rendered - wait for cards
            await page.waitForSelector('div[class*="ProductCard"], div[data-testid="product-card"]', { timeout: 10000 });
        } catch (e) {
            console.error('[Playwright] Meesho: Timeout waiting for products.');
            return [];
        }

        const results = await page.evaluate(() => {
            const selectors = ['div[class*="ProductCard"]', 'div[data-testid="product-card"]', 'div.sc-bcXHqe'];
            let items = [];
            for (const sel of selectors) {
                const found = Array.from(document.querySelectorAll(sel));
                if (found.length > 2) { items = found; break; }
            }

            return items.slice(0, 20).map(el => {
                const titleEl = el.querySelector('p[class*="StyledName"], p[class*="name"], p');
                const linkEl = el.querySelector('a');
                const priceEl = el.querySelector('h5, span[class*="price"]');
                const imageEl = el.querySelector('img');

                if (!titleEl || !linkEl) return null;

                let imgSrc = null;
                if (imageEl) {
                    imgSrc = imageEl.getAttribute('src') || imageEl.getAttribute('data-src') || imageEl.getAttribute('srcset')?.split(' ')[0];
                }

                return {
                    title: titleEl.innerText.trim(),
                    url: linkEl.href.startsWith('http') ? linkEl.href : `https://www.meesho.com${linkEl.getAttribute('href')}`,
                    price: priceEl ? parseFloat(priceEl.innerText.replace(/[^0-9]/g, '')) : null,
                    image: imgSrc,
                    source: 'meesho'
                };
            }).filter(Boolean);
        });

        return results;
    }
}
