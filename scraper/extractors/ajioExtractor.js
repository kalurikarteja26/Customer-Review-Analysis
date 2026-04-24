import { BaseExtractor } from './BaseExtractor.js';

export class AjioExtractor extends BaseExtractor {
    extractFallbackSelectors() {
        const fallback = super.extractFallbackSelectors();

        // ── Title ─────────────────────────────────────────────────────────
        fallback.title = this.$('h1.prod-name').text().trim() ||
                         this.$('[class*="prod-name"]').first().text().trim() ||
                         fallback.title;

        // ── Price ─────────────────────────────────────────────────────────
        const priceText = this.$('.prod-sp').text() ||
                          this.$('[class*="prod-sp"]').first().text();
        if (priceText) {
            const p = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            if (!isNaN(p)) fallback.price = p;
        }

        // ── Stock / Availability ──────────────────────────────────────────
        const outOfStock = this.$('.out-of-stock, [class*="out-of-stock"]').length > 0 ||
                           this.$('body').text().toLowerCase().includes('out of stock');
        fallback.stock = !outOfStock;

        // ── Image ─────────────────────────────────────────────────────────
        const imgEl = this.$('.rilrtl-lazy-img, .main-img, [class*="prod-image"] img').first();
        if (imgEl.length) {
            fallback.image = imgEl.attr('src') || imgEl.attr('data-src');
        }

        // ── Reviews ───────────────────────────────────────────────────────
        const reviews = [];
        const reviewSelectors = ['.review-summary-card', '[class*="review-summary"]', '[class*="review-card"]'];

        for (const sel of reviewSelectors) {
            this.$(sel).each((i, el) => {
                if (reviews.length >= 20) return;
                const author = this.$(el).find('.reviewer-name, [class*="reviewer-name"]').first().text().trim() || 'Ajio Customer';
                const rating = (this.$(el).find('.user-rating-star, [class*="rating-star"]').text().match(/([0-9.]+)/) || ['0'])[0];
                const text = this.$(el).find('.review-text, .desc, [class*="review-text"]').first().text().trim();
                const date = this.$(el).find('.review-date').first().text().trim();
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
