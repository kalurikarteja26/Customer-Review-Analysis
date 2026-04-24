import { BaseSearcher } from './BaseSearcher.js';

export class FlipkartSearcher extends BaseSearcher {
    constructor(ua) {
        super(ua);
        this.useBrowser = true;
    }

    async search(query) {
        const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
        const $ = await this.fetch(url);
        const products = [];

        $('div._1AtVbE, div._2kHMtA, div._4ddWXP').each((i, el) => {
            if (products.length >= 5) return;
            const title = $(el).find('div._4rR01T, a.s1Q9rs, div._2Wk9S7').first().text().trim();
            const link = $(el).find('a._1fQZEK, a.s1Q9rs, a._2rpM_f').first().attr('href');
            const price = $(el).find('div._30jeq3').first().text().replace(/[^0-9]/g, '');
            const rating = $(el).find('div._3LWZlK').first().text().trim();
            const image = $(el).find('img._396cs4, img.CXW795').first().attr('src');

            if (title && link) {
                products.push({
                    title,
                    url: link.startsWith('http') ? link : `https://www.flipkart.com${link}`,
                    price: price ? parseFloat(price) : null,
                    rating: rating ? parseFloat(rating) : null,
                    image,
                    source: 'flipkart'
                });
            }
        });

        return products;
    }

    async searchWithBrowser(page, query) {
        const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
        console.error(`[Playwright] Flipkart: ${url}`);

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForSelector('a[target="_blank"][rel="noopener noreferrer"]', { timeout: 8000 });
        } catch (e) {
            console.error('[Playwright] Flipkart: Timeout waiting for products.');
            return [];
        }

        const results = await page.evaluate(() => {
            // Flipkart now wraps entire product cards in 'a' tags
            const items = Array.from(document.querySelectorAll('a[target="_blank"][rel="noopener noreferrer"], div.cPHDOP a, div.slAVV4 a')).filter(a => a.innerText.length > 30);
            
            return items.slice(0, 5).map(linkEl => {
                // Since the entire card is an 'a' tag, we extract from inside it
                const titleMatch = linkEl.innerText.split('\n').find(t => t.length > 10 && !t.includes('₹') && !t.includes('Reviews') && !t.includes('Add to Compare'));
                const priceMatch = linkEl.innerText.match(/₹([\d,]+)/);
                const imageEl = linkEl.querySelector('img');

                if (!titleMatch) return null;
                
                let imgSrc = null;
                if (imageEl) {
                    imgSrc = imageEl.src || imageEl.getAttribute('data-src') || imageEl.getAttribute('srcset')?.split(' ')[0];
                }

                return {
                    title: titleMatch.trim(),
                    url: linkEl.href.startsWith('http') ? linkEl.href : `https://www.flipkart.com${linkEl.getAttribute('href')}`,
                    price: priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null,
                    image: imgSrc,
                    source: 'flipkart'
                };
            }).filter(Boolean);
        });

        return results;
    }
}
