import { BaseExtractor } from './BaseExtractor.js';

export class MyntraExtractor extends BaseExtractor {
    extractFallbackSelectors() {
        const fallback = super.extractFallbackSelectors();

        // ── Title ─────────────────────────────────────────────────────────
        const brand = this.$('.pdp-title').text().trim() || this.$('h1.pdp-name > strong').text().trim();
        const name  = this.$('.pdp-name').text().trim();
        fallback.title = (`${brand} ${name}`).trim() || this.$('h1').first().text().trim();

        // ── Price ─────────────────────────────────────────────────────────
        const priceText = this.$('.pdp-price').text() ||
                          this.$('[class*="pdp-price"]').first().text() ||
                          this.$('.pdp-mrp').text();
        if (priceText) {
            const p = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            if (!isNaN(p)) fallback.price = p;
        }

        // ── Stock / Availability ──────────────────────────────────────────
        const outOfStock = this.$('.pdp-out-of-stock, [class*="out-of-stock"]').length > 0 ||
                           this.$('body').text().toLowerCase().includes('out of stock');
        fallback.stock = !outOfStock ? "In Stock" : "Out of Stock";

        // ── Image ─────────────────────────────────────────────────────────
        const imgEl = this.$('.image-grid-image').first();
        if (imgEl.length) {
            const style = imgEl.attr('style') || '';
            const match = style.match(/url\("?(.+?)"?\)/);
            fallback.image = match ? match[1] : imgEl.attr('src') || null;
        }
        if (!fallback.image) {
            fallback.image = this.$('.pdp-image img, img.pdp-product-image, .thumbnails-imgContainer img').attr('src');
        }

        // ── Specifications ────────────────────────────────────────────────
        const specs = {};
        this.$('.index-row').each((i, el) => {
            const key = this.$(el).find('.index-rowKey').text().trim();
            const val = this.$(el).find('.index-rowValue').text().trim();
            if (key && val) specs[key] = val;
        });
        if (Object.keys(specs).length === 0) {
            this.$('.product-specification-row').each((i, el) => {
                const key = this.$(el).find('.product-specification-key').text().trim();
                const val = this.$(el).find('.product-specification-value').text().trim();
                if (key && val) specs[key] = val;
            });
        }
        fallback.specifications = specs;

        // ── Reviews ───────────────────────────────────────────────────────
        const reviews = [];
        const reviewSelectors = ['.user-review-review', '[class*="user-review"]', '[class*="reviewCard"]'];

        for (const sel of reviewSelectors) {
            this.$(sel).each((i, el) => {
                if (reviews.length >= 20) return;
                const author = this.$(el).find('.user-review-reviewerName, [class*="reviewerName"]').first().text().trim() || 'Myntra Customer';
                const ratingMatch = (this.$(el).find('.user-review-starRating, [class*="starRating"]').text() || '0').match(/([0-9.]+)/);
                const rating = ratingMatch ? ratingMatch[1] : '0';
                const text = this.$(el).find('.user-review-reviewText, [class*="reviewText"]').first().text().trim();
                const date = this.$(el).find('.user-review-reviewerName').siblings('span').last().text().trim();
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
