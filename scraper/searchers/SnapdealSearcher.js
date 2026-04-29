import { BaseSearcher } from './BaseSearcher.js';

export class SnapdealSearcher extends BaseSearcher {
    constructor(ua) {
        super(ua);
        this.useBrowser = true;
    }

    async search(query) {
        const url = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=rlvncy`;
        const $ = await this.fetch(url);
        if (!$) return [];
        const products = [];

        $('.product-tuple-listing').each((i, el) => {
            if (products.length >= 10) return;
            const title = $(el).find('.product-title').text().trim();
            const link = $(el).find('.product-tuple-image a').attr('href');
            const price = $(el).find('.product-price').text().replace(/[^0-9]/g, '');
            const rating = $(el).find('.product-rating-count').text().replace(/[^0-9.]/g, '');
            const imageEl = $(el).find('img.product-tuple-image, img.product-image, img.compareImg, source');
            const srcset = imageEl.attr('srcset');
            let image = imageEl.attr('src') || imageEl.attr('data-src') || (srcset ? srcset.split(' ')[0] : null) || $(el).find('input.compareImg').val();
            // Filter out tracker/placeholder images
            if (image && (image.includes('pixel.gif') || image.startsWith('data:image') || image.includes('placeholder'))) image = null;
            if (image && image.startsWith('//')) image = 'https:' + image;

            if (title && link) {
                products.push({
                    title,
                    url: link.startsWith('http') ? link : `https://www.snapdeal.com${link}`,
                    price: price ? parseFloat(price) : null,
                    rating: rating ? (parseFloat(rating) / 20) : null,
                    image,
                    source: 'snapdeal'
                });
            }
        });

        return products;
    }

    async searchWithBrowser(page, query) {
        const url = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=relevance`;
        console.error(`[Playwright] Snapdeal: ${url}`);

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForSelector('.product-tuple-listing', { timeout: 8000 });
        } catch (e) {
            console.error('[Playwright] Snapdeal: Timeout waiting for products.');
            return [];
        }

        const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.product-tuple-listing'));
            return items.slice(0, 10).map(el => {
                const titleEl = el.querySelector('.product-title');
                const linkEl = el.querySelector('.product-tuple-image a, a.dp-widget-link');
                const priceEl = el.querySelector('.product-price');
                const imageEl = el.querySelector('img.product-image, img.product-tuple-image');
                const hiddenInputEl = el.querySelector('input.compareImg');

                if (!titleEl || !linkEl) return null;

                let imgSrc = null;
                if (imageEl) {
                    imgSrc = imageEl.getAttribute('data-src') || imageEl.src;
                    if (imgSrc && (imgSrc.startsWith('data:image') || imgSrc.includes('pixel.gif'))) {
                        imgSrc = imageEl.getAttribute('data-src') || imageEl.getAttribute('srcset')?.split(' ')[0] || null;
                    }
                }
                
                // Ultimate fallback for Snapdeal
                if (!imgSrc && hiddenInputEl) {
                    imgSrc = hiddenInputEl.value;
                }

                return {
                    title: titleEl.innerText.trim(),
                    url: linkEl.href,
                    price: priceEl ? parseFloat(priceEl.innerText.replace(/[^0-9]/g, '')) : null,
                    image: imgSrc,
                    source: 'snapdeal'
                };
            }).filter(Boolean);
        });

        return results;
    }
}
