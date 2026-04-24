import { BaseExtractor } from './BaseExtractor.js';

export class FlipkartExtractor extends BaseExtractor {
    extractFallbackSelectors() {
        const fallback = super.extractFallbackSelectors();

        // ── Title ─────────────────────────────────────────────────────────
        fallback.title = this.$('span.B_NuCI').text().trim() ||
                         this.$('.VU-ZEz').text().trim() ||
                         this.$('.yhB1nd').text().trim() ||
                         this.$('h1').first().text().trim() ||
                         fallback.title;

        // ── Price ─────────────────────────────────────────────────────────
        const priceText = this.$('div._30jeq3._16Jk6d').text() ||
                          this.$('.Nx9bqj.CxhGGd').text() ||
                          this.$('._30jeq3').first().text();
        if (priceText) {
            const p = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            if (!isNaN(p)) fallback.price = p;
        }

        // ── Stock / Availability ──────────────────────────────────────────
        const stockText = (this.$('div._16FRp0').text() + 
                          this.$('.Z-sO-q').text() +
                          this.$('._1kVtv5').text() +
                          this.$('body').text()).toLowerCase();
        
        fallback.stock = !(stockText.includes('sold out') || stockText.includes('out of stock') || stockText.includes('notify me'));

        // ── Image ─────────────────────────────────────────────────────────
        const imgEl = this.$('img.DByo4Z, img._396cs4, img.v2V51U').first();
        if (imgEl.length) {
            let src = imgEl.attr('src');
            if (src) {
                fallback.image = src.replace(/q=\d+/i, 'q=90').replace(/\{width\}/g, '800');
            }
        }
        if (!fallback.image) {
            fallback.image = this.$('div._373u9W img').attr('src') || this.$('.CXW795 img').attr('src');
        }

        // ── Category ──────────────────────────────────────────────────────
        const categories = [];
        this.$('a._2whKao, ._1MR4o5').each((i, el) => {
            const text = this.$(el).text().trim();
            if (text && text !== 'Home') categories.push(text);
        });
        if (categories.length > 0) fallback.category = categories;

        // ── Reviews ───────────────────────────────────────────────────────
        const reviews = [];
        const reviewSelectors = ['div._27M-vq', 'div.col._2wzgFH', 'div.gqVXv1', 'div.t-ZTKy'];

        for (const sel of reviewSelectors) {
            this.$(sel).each((i, el) => {
                if (reviews.length >= 20) return;
                const author = this.$(el).find('p._2sc7ZR, ._2NsDsF').first().text().trim() || 'Flipkart Customer';
                const rating = this.$(el).find('div._3LWZlK, .XQDdHH').first().text().trim() || '0';
                const text = this.$(el).find('div.t-ZTKy div div, .vMCK2k').first().text().trim();
                const date = this.$(el).find('p._2sc7ZR').last().text().trim();
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
