import { BaseExtractor } from './BaseExtractor.js';

export class AmazonExtractor extends BaseExtractor {
    extractFallbackSelectors() {
        const fallback = super.extractFallbackSelectors();

        // ── Title ──────────────────────────────────────────────────────────
        const title = this.$('#productTitle').text().trim() ||
                      this.$('.product-title-word-break').text().trim() ||
                      this.$('h1.a-spacing-none').text().trim() ||
                      this.$('h1').first().text().trim();
        if (title) fallback.title = title;

        // ── Price ──────────────────────────────────────────────────────────
        const priceWhole = this.$('.a-price-whole').first().text().replace(/[^0-9]/g, '');
        const priceFraction = this.$('.a-price-fraction').first().text().replace(/[^0-9]/g, '');
        const priceFromWhole = priceWhole ? parseFloat(`${priceWhole}.${priceFraction || '00'}`) : null;
        const priceFromBlock = parseFloat(
            (this.$('#priceblock_ourprice').text() ||
             this.$('#priceblock_dealprice').text() ||
             this.$('.a-color-price').first().text()).replace(/[^0-9.]/g, '')
        );
        const price = priceFromWhole || (!isNaN(priceFromBlock) ? priceFromBlock : null);
        if (price) fallback.price = price;

        // ── Original Price ─────────────────────────────────────────────────
        const origText = this.$('.a-text-price[data-a-strike="true"] .a-offscreen').first().text() ||
                         this.$('.basisPrice .a-offscreen').text() ||
                         this.$('#listPrice').text();
        if (origText) {
            const orig = parseFloat(origText.replace(/[^0-9.]/g, ''));
            if (!isNaN(orig)) fallback.original_price = orig;
        }

        // ── Discount ───────────────────────────────────────────────────────
        const discountText = this.$('.savingsPercentage').first().text() ||
                             this.$('#savingsPercentage').text();
        if (discountText) fallback.discount = discountText.trim();

        // ── Review Count ──────────────────────────────────────────────────
        const reviewCountText = this.$('#acrCustomerReviewText').first().text().replace(/[^0-9]/g, '');
        if (reviewCountText) fallback.review_count = parseInt(reviewCountText);

        // ── Stock / Availability ──────────────────────────────────────────
        const availText = this.$('#availability').text().toLowerCase() + 
                          this.$('#outOfStock').text().toLowerCase() +
                          this.$('.a-declarative[data-action="out-of-stock-label"]').text().toLowerCase();
        
        if (availText.includes('out of stock') || 
            availText.includes('currently unavailable') || 
            availText.includes('sold out')) {
            fallback.stock = "Out of Stock";
        } else if (availText.includes('only') && availText.includes('left in stock')) {
            fallback.stock = "Limited Stock";
        } else {
            fallback.stock = "In Stock";
        }

        // ── Images Gallery ─────────────────────────────────────────────────
        const images = [];
        const imgScripts = this.$('script').map((i, el) => this.$(el).html()).get();
        for (const script of imgScripts) {
            if (script.includes('ImageBlockATF') || script.includes('colorImages')) {
                const imgMatch = script.match(/'initial':\s*(\[[\s\S]*?\])/) || script.match(/"initial":\s*(\[[\s\S]*?\])/);
                if (imgMatch) {
                    try {
                        const parsed = JSON.parse(imgMatch[1].replace(/'/g, '"'));
                        parsed.forEach(img => {
                            if (img.large || img.hiRes) images.push(img.large || img.hiRes);
                        });
                    } catch (e) {}
                }
            }
        }
        if (images.length === 0) {
            this.$('#altImages ul li img').each((i, el) => {
                const src = this.$(el).attr('src');
                if (src) images.push(src.replace(/\._.*_\./, '.'));
            });
        }
        fallback.images = [...new Set(images)].slice(0, 10);
        if (fallback.images.length > 0 && !fallback.image) fallback.image = fallback.images[0];

        // ── Specifications ─────────────────────────────────────────────────
        const specs = {};
        this.$('#prodDetails tr, .prodDetTable tr').each((i, el) => {
            const key = this.$(el).find('th').text().trim();
            const val = this.$(el).find('td').text().trim();
            if (key && val) specs[key] = val;
        });
        this.$('#detailBullets_feature_div li').each((i, el) => {
            const text = this.$(el).text().trim();
            if (text.includes(':')) {
                const [key, ...val] = text.split(':');
                specs[key.trim()] = val.join(':').trim();
            }
        });
        fallback.specifications = specs;

        // ── Reviews — Multi-Strategy ───────────────────────────────────────
        const reviews = [];

        // Strategy 1: data-hook="review" DOM elements (product page inline reviews)
        this.$('div[data-hook="review"]').each((i, el) => {
            if (i >= 20) return;
            const author = this.$(el).find('[data-hook="review-author"], .a-profile-name').first().text().trim() || 'Amazon Customer';
            const ratingEl = this.$(el).find('[data-hook="review-star-rating"], [data-hook="cmps-review-star-rating"]').first();
            const ratingRaw = ratingEl.find('.a-icon-alt').text().trim() || ratingEl.attr('title') || ratingEl.text().trim();
            const ratingMatch = ratingRaw.match(/([0-9.]+)/);
            const rating = ratingMatch ? ratingMatch[1] : '0';
            const text = this.$(el).find('[data-hook="review-body"] span').first().text().trim() ||
                         this.$(el).find('[data-hook="review-collapsed"] span').first().text().trim() ||
                         this.$(el).find('.review-text-content span').first().text().trim();
            const date = this.$(el).find('[data-hook="review-date"]').first().text().trim();
            const verified = this.$(el).find('[data-hook="avp-verified-purchase"]').length > 0;
            if (text && text.length > 5) {
                reviews.push({ author, rating, text, date, verified });
            }
        });

        fallback.reviews = reviews;
        return fallback;
    }
    }
}
