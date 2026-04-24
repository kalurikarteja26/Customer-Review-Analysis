import { BaseExtractor } from './BaseExtractor.js';

export class SnapdealExtractor extends BaseExtractor {
    extractFallbackSelectors() {
        const fallback = super.extractFallbackSelectors();

        // ── Title ─────────────────────────────────────────────────────────
        fallback.title = this.$('h1.pdp-e-i-head').text().trim() ||
                         this.$('.pdp-e-i-head').attr('title') ||
                         fallback.title;

        // ── Price ─────────────────────────────────────────────────────────
        const priceText = this.$('.payBlkBig').text() ||
                          this.$('[class*="payBlkBig"]').first().text();
        if (priceText) {
            const p = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            if (!isNaN(p)) fallback.price = p;
        }

        // ── Stock / Availability ──────────────────────────────────────────
        const outOfStock = this.$('.sold-out-err, [class*="sold-out"]').length > 0 ||
                           this.$('body').text().toLowerCase().includes('sold out');
        fallback.stock = !outOfStock;

        // ── Image ─────────────────────────────────────────────────────────
        const imgEl = this.$('#bx-slider-left-image-panel li img, .cloudzoom img, #mainImageWrapper img').first();
        if (imgEl.length) {
            fallback.image = imgEl.attr('src') || imgEl.attr('data-src');
        }

        // ── Reviews ───────────────────────────────────────────────────────
        const reviews = [];
        const reviewSelectors = ['.user-review', '[class*="user-review"]', '.review-block'];

        for (const sel of reviewSelectors) {
            this.$(sel).each((i, el) => {
                if (reviews.length >= 20) return;
                const author = this.$(el).find('.wgt100, .reviewer-name').first().text().trim() || 'Snapdeal Customer';
                const starStyle = this.$(el).find('.active-stars').attr('style') || '';
                const widthMatch = starStyle.match(/([0-9]+)%/);
                const rating = widthMatch ? (parseFloat(widthMatch[1]) / 20).toFixed(1) : '0';
                const text = this.$(el).find('p').last().text().trim();
                const date = this.$(el).find('.date').first().text().trim();
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
