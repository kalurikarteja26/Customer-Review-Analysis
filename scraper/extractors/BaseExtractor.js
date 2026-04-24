import * as cheerio from 'cheerio';
import { z } from 'zod';

const ProductSchema = z.object({
  title: z.string().nullable().default("Unknown Product"),
  price: z.number().nullable().default(null),
  original_price: z.number().nullable().default(null),
  discount: z.string().nullable().default(null),
  rating: z.number().nullable().default(null),
  review_count: z.number().nullable().default(null),
  category: z.array(z.string()).default([]),
  image: z.string().nullable().default(null),
  images: z.array(z.string()).default([]),
  stock: z.string().default("In Stock"),
  reviews: z.array(z.object({
      author: z.string().default("Anonymous"),
      rating: z.string().default("0"),
      text: z.string().default(""),
      date: z.string().nullable().default(null),
      verified: z.boolean().default(false)
  })).default([]),
  specifications: z.record(z.string()).default({}),
  source: z.string(),
  url: z.string().nullable().default(null)
});

export class BaseExtractor {
    constructor(html, url, platform) {
        this.$ = cheerio.load(html);
        this.url = url;
        this.platform = platform;
    }

    extract() {
        const jsonData = this.extractJSONLD();
        const metaData = this.extractOpenGraph();
        const fallbackData = this.extractFallbackSelectors();

        return this.mergeData(jsonData, metaData, fallbackData);
    }

    extractJSONLD() {
        let data = {};
        this.$('script[type="application/ld+json"]').each((i, el) => {
            try {
                const json = JSON.parse(this.$(el).html());
                const product = Array.isArray(json) ? json.find(j => j['@type'] === 'Product') : (json['@type'] === 'Product' ? json : null);
                
                if (product) {
                    if (product.name) data.title = product.name;
                    if (product.image) data.image = Array.isArray(product.image) ? product.image[0] : (typeof product.image === 'string' ? product.image : product.image.url);
                    if (product.offers) {
                        const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
                        if (offer.price) data.price = parseFloat(offer.price);
                        if (offer.availability) data.availability = offer.availability.includes('InStock');
                    }
                    if (product.aggregateRating && product.aggregateRating.ratingValue) {
                        data.rating = parseFloat(product.aggregateRating.ratingValue);
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        });
        return data;
    }

    extractOpenGraph() {
        return {
            title: this.$('meta[property="og:title"]').attr('content'),
            image: this.$('meta[property="og:image"]').attr('content'),
            price: parseFloat(this.$('meta[property="product:price:amount"]').attr('content')),
        };
    }

    extractFallbackSelectors() {
        return {
            title: this.$('h1').first().text().trim(),
            category: this.extractBreadcrumbs()
        };
    }

    extractBreadcrumbs() {
        const categories = [];
        this.$('ol, ul').find('li a').each((i, el) => {
            const text = this.$(el).text().trim();
            if (text && text.length > 2) {
                categories.push(text);
            }
        });
        return categories.length > 0 ? categories : [];
    }

    calculateDiscount(price, original_price) {
        if (price && original_price && price < original_price) {
            return Math.round(((original_price - price) / original_price) * 100) + '% OFF';
        }
        return null;
    }

    mergeData(ld, og, fallback) {
        const title = ld.title || og.title || fallback.title || 'Unknown Product';
        
        let price = null;
        if (ld.price && !isNaN(ld.price)) price = ld.price;
        else if (og.price && !isNaN(og.price)) price = og.price;
        else if (fallback.price && !isNaN(fallback.price)) price = fallback.price;

        let original_price = fallback.original_price || null;
        let discount = fallback.discount || this.calculateDiscount(price, original_price) || null;

        return {
            title: title.replace(/\s+/g, ' ').trim(),
            price: price,
            original_price: original_price,
            discount: discount,
            rating: ld.rating || fallback.rating || null,
            review_count: fallback.review_count || null,
            category: fallback.category || [],
            image: ld.image || og.image || fallback.image || null,
            images: fallback.images || [],
            stock: fallback.stock || (ld.availability !== undefined ? (ld.availability ? "In Stock" : "Out of Stock") : "In Stock"),
            reviews: fallback.reviews || [],
            specifications: fallback.specifications || {},
            source: this.platform,
            url: this.url
        };
    }

    validate(data) {
        return ProductSchema.parse(data);
    }
}
