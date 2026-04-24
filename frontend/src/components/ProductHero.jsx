import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
const proxyImage = (url) => {
    if (!url || url.startsWith('/') || url.startsWith('data:')) return url || '';
    if (url.includes('127.0.0.1') || url.includes('localhost') || url.includes('/product-image/')) return url;
    return `${API_BASE}/image-proxy?url=${encodeURIComponent(url)}`;
};

const PLATFORM_COLORS = {
    amazon:   { bg: '#fff8ed', text: '#c45000', border: '#f5a058' },
    flipkart: { bg: '#edf3ff', text: '#1855d4', border: '#8aabf7' },
    myntra:   { bg: '#fff0f6', text: '#c21b6e', border: '#f59ec4' },
    ajio:     { bg: '#f3f0ff', text: '#6340cc', border: '#c0aff7' },
    snapdeal: { bg: '#fff2ed', text: '#cc3300', border: '#f7a07a' },
    meesho:   { bg: '#fff0ff', text: '#aa1faa', border: '#e899e8' },
    default:  { bg: 'var(--beige)', text: 'var(--brown-dk)', border: 'var(--brown)' },
};

const StarRating = ({ rating }) => {
    const r = Math.min(5, Math.max(0, parseFloat(rating) || 0));
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4" viewBox="0 0 20 20"
                     style={{ fill: i < Math.round(r) ? '#e8a020' : '#ddd' }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="text-sm font-bold ml-1" style={{ color: 'var(--text-lt)' }}>
                {r > 0 ? r.toFixed(1) : '—'}
            </span>
        </div>
    );
};

const ProductHero = ({ product = {} }) => {
    const safe = product || {};
    if (Object.keys(safe).length === 0) return null;

    const platform = (safe?.platform || '').toLowerCase();
    const pc = PLATFORM_COLORS[platform] || PLATFORM_COLORS.default;

    // Build image list
    const rawImages = safe?.images?.length > 0 ? safe.images : (safe?.image ? [safe.image] : []);
    const images = rawImages.map(proxyImage).filter(Boolean);
    const [activeIdx, setActiveIdx] = useState(0);
    const mainImg = images[activeIdx] || '';

    const price = safe?.price;
    const origPrice = safe?.original_price;
    const discount = safe?.discount_percentage;

    return (
        <div className="rounded-3xl overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid var(--beige-2)', boxShadow: '0 8px 40px rgba(120,90,60,0.10)' }}>
            <div className="flex flex-col lg:flex-row">

                {/* ── IMAGE COLUMN ── */}
                <div className="w-full lg:w-[45%] flex flex-col p-6" style={{ background: 'var(--beige)' }}>
                    {/* Main image */}
                    <div className="relative w-full rounded-2xl overflow-hidden mb-4 flex items-center justify-center"
                         style={{ height: '340px', background: 'rgba(255,255,255,0.9)' }}>
                        {mainImg ? (
                            <img
                                src={mainImg}
                                alt={safe?.title || 'Product'}
                                className="max-w-full max-h-full object-contain p-4"
                                referrerPolicy="no-referrer"
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <svg className="w-14 h-14" style={{ color: 'var(--brown)', opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-lt)' }}>No image available</span>
                            </div>
                        )}
                        {/* Platform badge */}
                        <div className="absolute top-3 left-3">
                            <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
                                  style={{ background: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }}>
                                {safe?.platform || 'Store'}
                            </span>
                        </div>
                        {/* Stock badge */}
                        <div className="absolute top-3 right-3">
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                                  style={{
                                      background: safe?.stock === 'In Stock' ? 'rgba(112,130,56,0.12)' : 'rgba(204,51,0,0.08)',
                                      color: safe?.stock === 'In Stock' ? 'var(--olive)' : '#cc3300',
                                      border: `1px solid ${safe?.stock === 'In Stock' ? 'rgba(112,130,56,0.2)' : 'rgba(204,51,0,0.15)'}`,
                                  }}>
                                {safe?.stock || 'In Stock'}
                            </span>
                        </div>
                    </div>

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.slice(0, 6).map((img, i) => (
                                <button key={i}
                                    onClick={() => setActiveIdx(i)}
                                    className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all duration-200"
                                    style={{
                                        border: i === activeIdx ? '2px solid var(--olive)' : '1.5px solid var(--beige-2)',
                                        background: 'white',
                                    }}>
                                    <img src={img} alt="" className="w-full h-full object-contain p-1"
                                         referrerPolicy="no-referrer" onError={e => e.target.style.display='none'} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── INFO COLUMN ── */}
                <div className="w-full lg:w-[55%] p-8 lg:p-10 flex flex-col justify-center">
                    <h1 className="font-black leading-tight mb-5"
                        style={{ fontSize: 'clamp(1.3rem, 2.5vw, 2rem)', color: 'var(--text)' }}>
                        {safe?.title || 'Product Details'}
                    </h1>

                    {/* Price row */}
                    <div className="flex items-end gap-4 mb-6">
                        <span className="font-black" style={{ fontSize: '2.5rem', color: 'var(--text)', lineHeight: 1 }}>
                            {price && String(price) !== 'N/A'
                                ? `₹${Number(price).toLocaleString('en-IN')}`
                                : 'Price TBD'}
                        </span>
                        {origPrice && String(origPrice) !== 'N/A' && origPrice !== price && (
                            <span className="text-lg line-through" style={{ color: 'var(--text-lt)' }}>
                                ₹{Number(origPrice).toLocaleString('en-IN')}
                            </span>
                        )}
                        {discount > 0 && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-black text-white"
                                  style={{ background: 'var(--olive)' }}>
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    <div className="mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-lt)' }}>Customer Rating</p>
                        <StarRating rating={safe?.rating} />
                    </div>

                    {/* Category */}
                    {safe?.category && (
                        <div className="mb-6">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-lt)' }}>Category</p>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-md)' }}>
                                {Array.isArray(safe.category) ? safe.category[safe.category.length - 1] : safe.category}
                            </p>
                        </div>
                    )}

                    {/* Specs chips */}
                    {Object.keys(safe?.specifications || {}).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {Object.entries(safe.specifications).slice(0, 5).map(([k, v]) => (
                                <div key={k} className="px-3 py-2 rounded-xl flex flex-col"
                                     style={{ background: 'var(--beige)', border: '1px solid var(--beige-2)' }}>
                                    <span className="text-[9px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-lt)' }}>{k}</span>
                                    <span className="text-xs font-black" style={{ color: 'var(--text)' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <a href={safe?.url || '#'} target="_blank" rel="noopener noreferrer"
                       className="btn-primary inline-flex items-center justify-center gap-3 text-center w-full lg:w-auto"
                       style={{ maxWidth: '320px' }}>
                        View on {(safe?.platform || 'Platform').charAt(0).toUpperCase() + (safe?.platform || 'platform').slice(1)}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ProductHero;
