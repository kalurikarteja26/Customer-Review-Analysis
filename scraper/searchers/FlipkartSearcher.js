import { BaseSearcher } from './BaseSearcher.js';

export class FlipkartSearcher extends BaseSearcher {
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
}
