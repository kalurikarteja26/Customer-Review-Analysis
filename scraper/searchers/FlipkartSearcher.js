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

        $('div._1AtVbE, div._2kHMtA, div._4ddWXP, div.cPHDOP, div.slAVV4').each((i, el) => {
            if (products.length >= 20) return;
            const title = $(el).find('div._4rR01T, a.s1Q9rs, div._2Wk9S7, span.B_NuCI, .VU-ZEz').first().text().trim();
            const link = $(el).find('a._1fQZEK, a.s1Q9rs, a._2rpM_f, a.CGtC98').first().attr('href');
            const price = $(el).find('div._30jeq3, div.Nx9bqj, div._16Jk6d').first().text().replace(/[^0-9]/g, '');
            const rating = $(el).find('div._3LWZlK, div.XQDdHH').first().text().trim();
            const imageEl = $(el).find('img._396cs4, img.CXW795, img._53u06y, img._2r_T1I, img.DByo4Z, img.v2V51U, img');
            const image = imageEl.attr('src') || imageEl.attr('data-src');

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
            
            return items.slice(0, 20).map(linkEl => {
                const titleEl = linkEl.querySelector('div._4rR01T, a.s1Q9rs, div._2Wk9S7, span.B_NuCI, .VU-ZEz, .KzDlHZ, .WKTcLC');
                let title = titleEl ? titleEl.innerText.trim() : null;
                if (!title) {
                    title = linkEl.innerText.split('\n').find(t => 
                        t.length > 10 && 
                        !t.includes('₹') && 
                        !t.includes('Reviews') && 
                        !t.includes('Add to Compare') && 
                        !t.includes('Currently unavailable') && 
                        !t.includes('Coming Soon')
                    );
                }
                
                let priceValue = null;
                const priceEl = linkEl.querySelector('div._30jeq3, div.Nx9bqj, div._16Jk6d');
                if (priceEl) {
                    priceValue = parseFloat(priceEl.innerText.replace(/[^0-9]/g, ''));
                } else {
                    const priceMatch = linkEl.innerText.match(/₹([\d,]+)/);
                    if (priceMatch) priceValue = parseFloat(priceMatch[1].replace(/,/g, ''));
                }

                const imageEl = linkEl.querySelector('img._396cs4, img.CXW795, img._53u06y, img._2r_T1I, img.DByo4Z, img.v2V51U, img');

                if (!title) return null;
                
                let imgSrc = null;
                if (imageEl) {
                    imgSrc = imageEl.getAttribute('data-src') || imageEl.getAttribute('srcset')?.split(' ')[0] || imageEl.src;
                    if (imgSrc && imgSrc.startsWith('data:image')) {
                        imgSrc = imageEl.getAttribute('data-src') || imageEl.getAttribute('srcset')?.split(' ')[0] || null;
                    }
                }

                return {
                    title: title.trim(),
                    url: linkEl.href.startsWith('http') ? linkEl.href : `https://www.flipkart.com${linkEl.getAttribute('href')}`,
                    price: priceValue,
                    image: imgSrc,
                    source: 'flipkart'
                };
            }).filter(Boolean);
        });

        return results;
    }
}
