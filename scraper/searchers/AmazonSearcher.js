import { BaseSearcher } from './BaseSearcher.js';

export class AmazonSearcher extends BaseSearcher {
    async search(query) {
        const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
        const $ = await this.fetch(url);
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
}
