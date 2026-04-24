import { BaseExtractor } from './BaseExtractor.js';

export class MeeshoExtractor extends BaseExtractor {
    extractFallbackSelectors() {
        const fallback = super.extractFallbackSelectors();

        // ── Title ─────────────────────────────────────────────────────────
        fallback.title = this.$('h1').first().text().trim() ||
                         this.$('.ProductDescription__ProductName-sc-1l1bxtj-0').text().trim() ||
                         fallback.title;

        // ── Price ─────────────────────────────────────────────────────────
        const priceEl = this.$('.PriceInfo__PriceValue-sc-1j2s1n8-0').text() ||
                        this.$('[class*="PriceValue"]').first().text();
        if (priceEl) {
            const p = parseFloat(priceEl.replace(/[^0-9.]/g, ''));
            if (!isNaN(p)) fallback.price = p;
        }

        // ── Stock / Availability ──────────────────────────────────────────
        const outOfStock = this.$('body').text().toLowerCase().includes('out of stock') || 
                           this.$('body').text().toLowerCase().includes('currently unavailable');
        fallback.stock = !outOfStock;

        // ── Image ─────────────────────────────────────────────────────────
        const imgEl = this.$('.ProductImages__Image-sc-1kuyrc5-0, [class*="ProductImage"] img').first();
        if (imgEl.length) {
            fallback.image = imgEl.attr('src');
        }

        // ── Reviews ───────────────────────────────────────────────────────
        const reviews = [];
        const reviewSelectors = ['.ReviewCard__ReviewCardStyled-sc-1ob17yo-0', '[class*="ReviewCard"]'];

        for (const sel of reviewSelectors) {
            this.$(sel).each((i, el) => {
                if (reviews.length >= 20) return;
                const author = this.$(el).find('[class*="ReviewerName"], .wlsbN').first().text().trim() || 'Meesho Customer';
                const rating = (this.$(el).find('[class*="RatingCount"], .bWqHkF').text().match(/([0-9.]+)/) || ['0'])[0];
                const text = this.$(el).find('[class*="ReviewText"], .dzxZid').first().text().trim();
                const date = this.$(el).find('[class*="ReviewDate"]').first().text().trim();
                if (text && text.length > 5) {
                    reviews.push({ author, rating, text, date });
                }
            });
            if (reviews.length > 0) break;
        }

        fallback.reviews = reviews;
        return fallback;
    }
}
