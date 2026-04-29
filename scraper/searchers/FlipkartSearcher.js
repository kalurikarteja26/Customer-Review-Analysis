import { BaseSearcher } from './BaseSearcher.js';

export class FlipkartSearcher extends BaseSearcher {
    constructor(ua) {
        super(ua);
        this.useBrowser = true;
    }

    async search(query) {
        // sort=relevance + exact phrase improves result accuracy
        const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&sort=relevance&as=on&as-show=on`;
        const $ = await this.fetch(url);
        if (!$) return [];
        const products = [];

        $('div._1AtVbE, div._2kHMtA, div._4ddWXP, div.cPHDOP, div.slAVV4').each((i, el) => {
            if (products.length >= 10) return;
            const title = $(el).find('div._4rR01T, a.s1Q9rs, div._2Wk9S7, span.B_NuCI, .VU-ZEz').first().text().trim();
            const link = $(el).find('a._1fQZEK, a.s1Q9rs, a._2rpM_f, a.CGtC98').first().attr('href');
            const price = $(el).find('div._30jeq3, div.Nx9bqj, div._16Jk6d').first().text().replace(/[^0-9]/g, '');
            const rating = $(el).find('div._3LWZlK, div.XQDdHH').first().text().trim();
            const imageEl = $(el).find('img._396cs4, img.CXW795, img._53u06y, img._2r_T1I, img.DByo4Z, img.v2V51U, img');
            let image = imageEl.attr('data-src') || imageEl.attr('src') || null;
            // Fix Flipkart CDN template URLs and clean up
            if (image) {
                image = image.replace(/\{width\}/g, '400').replace(/\{height\}/g, '400');
                if (image.startsWith('//')) image = 'https:' + image;
                if (image.startsWith('data:image') || image.includes('placeholder') || image.endsWith('.svg')) image = null;
            }

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
            const items = Array.from(document.querySelectorAll('a[target="_blank"][rel="noopener noreferrer"], div.cPHDOP a, div.slAVV4 a, div.tUxRFH a, div._75nlfW a')).filter(a => a.innerText.length > 30);
            
            return items.slice(0, 10).map(linkEl => {
                const titleEl = linkEl.querySelector('div._4rR01T, a.s1Q9rs, div._2Wk9S7, span.B_NuCI, .VU-ZEz, .KzDlHZ, .WKTcLC, .wjcEIp');
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
                // Try multiple price selectors
                const priceEl = linkEl.querySelector('div._30jeq3, div.Nx9bqj, div._16Jk6d, ._1_WHN1, .hl05eU .Nx9bqj');
                if (priceEl) {
                    priceValue = parseFloat(priceEl.innerText.replace(/[^0-9]/g, ''));
                }
                // Fallback: search all text for price patterns
                if (!priceValue) {
                    const allText = linkEl.innerText;
                    const priceMatch = allText.match(/₹\s*([\d,]+)/);
                    if (priceMatch) priceValue = parseFloat(priceMatch[1].replace(/,/g, ''));
                }

                // Rating extraction
                let ratingValue = null;
                const ratingEl = linkEl.querySelector('div._3LWZlK, div.XQDdHH, span.Y1HWO0');
                if (ratingEl) {
                    ratingValue = parseFloat(ratingEl.innerText.trim());
                }

                // Image extraction — try multiple approaches
                const imageEl = linkEl.querySelector('img._396cs4, img.CXW795, img._53u06y, img._2r_T1I, img.DByo4Z, img.v2V51U, img.DByuf4, img');
                let imgSrc = null;
                if (imageEl) {
                    imgSrc = imageEl.getAttribute('data-src') || 
                             imageEl.getAttribute('srcset')?.split(' ')[0] || 
                             imageEl.src;
                    
                    if (imgSrc && (imgSrc.includes('.svg') || imgSrc.includes('placeholder') || imgSrc.startsWith('data:'))) {
                        imgSrc = null;
                    }
                    if (imgSrc && imgSrc.startsWith('//')) {
                        imgSrc = 'https:' + imgSrc;
                    }
                }

                if (!title) return null;
                
                return {
                    title: title.trim(),
                    url: linkEl.href.startsWith('http') ? linkEl.href : `https://www.flipkart.com${linkEl.getAttribute('href')}`,
                    price: priceValue,
                    rating: ratingValue,
                    image: imgSrc,
                    source: 'flipkart'
                };
            }).filter(Boolean);
        });

        return results;
    }
}
