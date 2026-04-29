import React from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const proxyImage = (url) => {
    if (!url || typeof url !== 'string') return '';
    // Filter out known bad image patterns
    if (url.startsWith('data:image')) return '';
    if (url.includes('pixel.gif') || url.includes('placeholder') || url.endsWith('.svg')) return '';
    if (url.length < 10) return '';
    // Fix protocol-relative URLs
    if (url.startsWith('//')) url = 'https:' + url;
    // Local/static paths
    if (url.startsWith('/')) return `${API_BASE}${url}`;
    if (url.includes('127.0.0.1') || url.includes('localhost') || url.includes('/product-image/')) return url;
    // Proxy everything else to avoid CORS
    return `${API_BASE}/image-proxy?url=${encodeURIComponent(url)}`;
};

const pillClass = (platform = '') => {
    const p = platform.toLowerCase();
    const map = { amazon: 'pill-amazon', flipkart: 'pill-flipkart', myntra: 'pill-myntra',
                  ajio: 'pill-ajio', snapdeal: 'pill-snapdeal', meesho: 'pill-meesho' };
    return `platform-pill ${map[p] || 'pill-default'}`;
};

const StarRating = ({ rating }) => {
    const r = Math.min(5, Math.max(0, parseFloat(rating) || 0));
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3" viewBox="0 0 20 20"
                     style={{ fill: i < Math.round(r) ? '#e8a020' : '#ddd' }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text-lt)' }}>
                {r > 0 ? r.toFixed(1) : '—'}
            </span>
        </div>
    );
};

const DiscoveryResults = ({ results = [], closeMatches = [], totalResults, onSelect }) => {
    const hasPerfect = results.length > 0;
    const hasClose = closeMatches.length > 0;

    if (!hasPerfect && !hasClose) {
        return (
            <div className="text-center py-16 rounded-3xl fade-in"
                 style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px dashed var(--beige-2)' }}>
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-lt)' }}>
                    {totalResults > 0
                        ? `Viewing all ${totalResults} discoveries (adjust filters to refine)`
                        : 'No products detected. Try adjusting your search query.'}
                </p>
            </div>
        );
    }

    const ProductCard = ({ product, isClose, idx, onSelect }) => {
        const [imgError, setImgError] = React.useState(false);
        const [expanded, setExpanded] = React.useState(false);
        const imgSrc = proxyImage(product?.image);
        const hasImage = Boolean(imgSrc) && !imgError;
        const variants = product.variants || [];
        const bestDiscount = Math.max(...variants.map(v => v.discount_percentage || 0));

        return (
            <div
                className={`product-card flex flex-col relative transition-all duration-300 ${product.is_best_product ? 'border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : ''}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
            >
                {product.is_best_product && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <svg className="w-3 h-3 text-yellow-100" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        AI TOP PICK
                    </div>
                )}
                {/* Image */}
                <div className="relative overflow-hidden group cursor-pointer" style={{ height: '230px', background: 'var(--beige)' }} onClick={() => onSelect && onSelect(variants[0])}>
                    {hasImage ? (
                        <img
                            src={imgSrc}
                            alt={product?.title || 'Product'}
                            className="w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:scale-105"
                            onLoad={e => e.target.classList.add('opacity-100')}
                            onError={() => setImgError(true)}
                            referrerPolicy="no-referrer"
                        />
                    ) : null}
                    
                    {/* Placeholder — shown when no image or image failed */}
                    {!hasImage && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <svg className="w-10 h-10" style={{ color: 'var(--brown)', opacity: 0.4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-lt)' }}>No Image</span>
                        </div>
                    )}

                    {/* Discount badge */}
                    {bestDiscount > 0 && (
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-black text-white shadow-md z-10"
                             style={{ background: 'var(--olive)' }}>
                            {bestDiscount}% OFF
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1 bg-white relative">
                    <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => onSelect && onSelect(variants[0])}>
                        <div className="flex gap-1">
                            {variants.slice(0, 3).map((v, vi) => (
                                <span key={`${v.platform}-${vi}`} className={pillClass(v.platform)} style={{ padding: '0.15rem 0.4rem', fontSize: '0.55rem' }}>
                                    {v.platform[0]}
                                </span>
                            ))}
                            {variants.length > 3 && <span className="text-[10px] text-zinc-400">+{variants.length-3}</span>}
                        </div>
                        <StarRating rating={product?.avg_rating} />
                    </div>

                    <h3 className="text-sm font-bold mb-4 line-clamp-2 leading-snug flex-1 cursor-pointer"
                        style={{ color: 'var(--text)' }} onClick={() => onSelect && onSelect(variants[0])}>
                        {product?.title || 'Product'}
                    </h3>

                    <div className="flex flex-col gap-3 pt-4 mt-auto" style={{ borderTop: '1px solid var(--beige-2)' }}>
                        <div className="flex items-end justify-between cursor-pointer" onClick={() => onSelect && onSelect(variants[0])}>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-lt)' }}>Best Price</p>
                                <span className="text-xl font-black" style={{ color: 'var(--text)' }}>
                                    ₹{Number(product.min_price).toLocaleString('en-IN')}
                                </span>
                            </div>
                            {product?.recommendation?.verdict && (
                                <span className="text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider"
                                      style={{
                                          background: product.recommendation.verdict === 'BUY'
                                              ? 'rgba(112,130,56,0.12)' : 'rgba(161,134,111,0.12)',
                                          color: product.recommendation.verdict === 'BUY'
                                              ? 'var(--olive)' : 'var(--brown)',
                                      }}>
                                    {product.recommendation.verdict}
                                </span>
                            )}
                        </div>

                        {/* Expandable Deals Section */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                            className="w-full py-2.5 mt-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                            style={{ 
                                background: expanded ? 'var(--beige)' : 'rgba(161,134,111,0.06)',
                                color: expanded ? 'var(--text)' : 'var(--brown)'
                            }}
                        >
                            {expanded ? 'Hide Deals' : `Check ${variants.length} Deals`}
                            <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div 
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[300px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="flex flex-col gap-2 p-3 rounded-xl" style={{ background: 'var(--cream)', border: '1px solid var(--beige-2)' }}>
                                {variants.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-dashed border-gray-200 last:border-0"
                                         onClick={(e) => { e.stopPropagation(); onSelect && onSelect(v); }}
                                         style={{ cursor: 'pointer' }}>
                                        <span className={pillClass(v.platform)}>{v.platform}</span>
                                        <div className="flex items-center gap-2">
                                            {v.discount_percentage > 0 && (
                                                <span className="text-[9px] text-green-600 font-bold px-1.5 py-0.5 bg-green-50 rounded">
                                                    -{v.discount_percentage}%
                                                </span>
                                            )}
                                            <span className="text-sm font-black text-gray-800">
                                                {v.price !== 'N/A' ? `₹${Number(v.price).toLocaleString('en-IN')}` : 'OOS'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderGrid = (items, isClose = false) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {items.map((product, idx) => (
                <ProductCard key={product.id || idx} product={product} isClose={isClose} idx={idx} onSelect={onSelect} />
            ))}
        </div>
    );

    return (
        <div className="fade-in space-y-16">
            {/* Perfect Matches */}
            {hasPerfect && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-0.5 rounded" style={{ background: 'var(--olive)' }} />
                            <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text)' }}>
                                Best Matches
                            </h2>
                        </div>
                        <span className="text-xs font-black px-4 py-1.5 rounded-full"
                              style={{ background: 'rgba(112,130,56,0.12)', color: 'var(--olive)', border: '1px solid rgba(112,130,56,0.2)' }}>
                            {results.length} Found
                        </span>
                    </div>
                    {renderGrid(results)}
                </div>
            )}

            {/* Close Matches */}
            {hasClose && (
                <div className="space-y-6 pt-8 border-t border-dashed border-beige-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-0.5 rounded" style={{ background: 'var(--brown)' }} />
                        <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--brown)' }}>
                            Near Your Filters
                        </h2>
                        <span className="text-[10px] font-bold text-zinc-400 italic">(Close price or platform matches)</span>
                    </div>
                    {renderGrid(closeMatches, true)}
                </div>
            )}
        </div>
    );
};

export default DiscoveryResults;
