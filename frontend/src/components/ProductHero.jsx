import React, { useMemo } from 'react';
import { Star, TrendingUp, Box, ShieldCheck, Activity, Droplet, Users, Zap, Tag, Globe } from 'lucide-react';
import DynamicGallery from './DynamicGallery';
import useCurrency from '../hooks/useCurrency';

const CATEGORY_CONFIG = {
    Shoes: {
        icon: <Users className="w-4 h-4" />,
        badge: 'Fit Verified',
        desc: 'Analyzed through the Sentix-Prime Footwear Intelligence Framework. Sole technology, comfort ratings, and material quality synthesized from live buyer feedback.',
        accent: 'text-emerald-400',
    },
    Footwear: {
        icon: <Users className="w-4 h-4" />,
        badge: 'Fit Verified',
        desc: 'Analyzed through the Sentix-Prime Footwear Intelligence Framework. Sole technology, comfort ratings, and material quality synthesized from live buyer feedback.',
        accent: 'text-emerald-400',
    },
    Electronics: {
        icon: <Activity className="w-4 h-4" />,
        badge: 'Warranty Verified',
        desc: 'Analyzed through the Sentix-Prime Electronics Framework. Performance benchmarks, battery longevity, and build quality aggregated across verified purchases.',
        accent: 'text-blue-400',
    },
    Beauty: {
        icon: <Droplet className="w-4 h-4" />,
        badge: 'Skin Safe Verified',
        desc: 'Analyzed through the Sentix-Prime Beauty Intelligence layer. Ingredient safety, skin compatibility, and longevity verified across dermatological reviews.',
        accent: 'text-pink-400',
    },
    Apparel: {
        icon: <Tag className="w-4 h-4" />,
        badge: 'Quality Stitched',
        desc: 'Material composition, sizing accuracy, and wash durability synthesized from verified fashion buyer sentiment.',
        accent: 'text-purple-400',
    },
};

const defaultConfig = {
    icon: <ShieldCheck className="w-4 h-4" />,
    badge: 'Quality Ensured',
    desc: 'Analyzed through the Sentix-Prime Universal Framework. Historical and semantic data synthesized to provide unbiased sentiment aggregation.',
    accent: 'text-primary',
};

const ProductHero = ({ productData }) => {
    if (!productData) return null;
    const { product_meta, category, current_sentiment_score } = productData;

    const config = CATEGORY_CONFIG[category] || defaultConfig;

    // Stable brand authority score (not re-randomized on every render)
    const brandScore = useMemo(() => Math.floor(Math.random() * 20 + 78), [product_meta?.name]);

    // ── Geospatial Currency Detection ──
    const { symbol, currency, countryName, countryCode, rateSource, isBaseCurrency, loading: currencyLoading, formatPrice } = useCurrency();

    // Base price is always stored as INR on the backend
    const basePriceINR = typeof product_meta?.price === 'number' ? product_meta.price : 0;
    const priceFormatted = formatPrice(basePriceINR);
    const displaySymbol = symbol;
    const displayPrice  = priceFormatted.display;
    const currencyLabel = `${countryName} · ${currency}`;
    const showConversionHint = !isBaseCurrency && basePriceINR > 0;

    return (
        <div className="bloomberg-panel p-6 lg:p-8 border border-white/5 rounded-xl mb-4 bg-gradient-to-b from-surface to-black/40">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Left: Image Gallery — Asset Hierarchy with View Labels */}
                <div className="w-full md:w-1/3 min-h-[340px]">
                    <DynamicGallery
                        images={product_meta?.images ?? []}
                        name={product_meta?.name ?? 'Product'}
                        viewLabels={product_meta?.view_labels ?? undefined}
                    />
                </div>

                {/* Right: Product Info */}
                <div className="w-full md:w-2/3 flex flex-col justify-between py-2">
                    <div>
                        {/* Category + Title + Price */}
                        <div className="flex justify-between items-start mb-3 gap-4">
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${config.accent}`}>
                                    Sentix / {category}
                                </p>
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                    {product_meta?.name ?? 'Unknown Product'}
                                </h1>
                            </div>
                            {/* 
                                PRICE BLOCK — Visual Weight & DCC Spec:
                                - Symbol and number: identical font-weight, size, color, lineHeight
                                - displaySymbol + displayPrice come from useCurrency (IP geolocation)
                                - showConversionHint shown for non-INR users
                            */}
                            <div className="text-right flex flex-col items-end flex-shrink-0">
                                {/* Loading skeleton */}
                                {currencyLoading ? (
                                    <div className="h-10 w-28 bg-white/5 rounded animate-pulse" />
                                ) : (
                                    <div className="flex items-baseline gap-0 leading-none">
                                        {/* Symbol — unit-cohesive, zero kerning, identical weight */}
                                        <span
                                            className="font-mono font-black text-white"
                                            style={{ fontSize: '1.85rem', lineHeight: 1, letterSpacing: '0' }}
                                        >
                                            {displaySymbol}
                                        </span>
                                        {/* Number — same exact styling */}
                                        <span
                                            className="font-mono font-black text-white"
                                            style={{ fontSize: '1.85rem', lineHeight: 1, letterSpacing: '-0.01em' }}
                                        >
                                            {displayPrice}
                                        </span>
                                    </div>
                                )}

                                {/* Currency label: dynamically updated via geolocation */}
                                <div className="flex items-center gap-1 mt-1">
                                    <Globe className="w-2.5 h-2.5 text-textMuted" />
                                    <span className="text-[9px] font-mono text-textMuted uppercase tracking-widest">
                                        {currencyLabel}
                                    </span>
                                    {rateSource === 'live' && (
                                        <span className="text-[8px] font-mono text-positive uppercase ml-1">· Live Rate</span>
                                    )}
                                </div>

                                {/* Conversion hint for non-India users */}
                                {showConversionHint && (
                                    <p className="text-[9px] text-textMuted font-mono mt-1">
                                        Base: ₹{basePriceINR.toLocaleString('en-IN')} INR
                                    </p>
                                )}

                                <p className="text-[10px] text-positive border border-positive/30 bg-positive/10 px-2 py-0.5 rounded font-mono tracking-widest mt-2 uppercase">
                                    In Stock
                                </p>
                            </div>
                        </div>

                        {/* Live Sentiment Score — Information Density per Master Spec */}
                        <div className="flex items-center gap-3 mb-5 bg-black/20 border border-white/5 rounded-lg px-4 py-3">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i <= Math.floor(current_sentiment_score)
                                                ? 'fill-amber-400 text-amber-400'
                                                : i - 0.5 <= current_sentiment_score
                                                ? 'fill-amber-400/50 text-amber-400'
                                                : 'text-slate-700'
                                        }`}
                                    />
                                ))}
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <div>
                                <span className="font-mono font-black text-white" style={{ fontSize: '1.1rem' }}>
                                    {current_sentiment_score}
                                </span>
                                <span className="font-mono text-textMuted text-sm"> / 5.0</span>
                            </div>
                            <span className="text-[9px] font-mono uppercase tracking-widest text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded ml-auto">
                                Live Sentiment Score
                            </span>
                        </div>

                        {/* Meta Row */}
                        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                            {product_meta?.material && (
                                <div className="flex items-center gap-2 text-textMuted">
                                    <Box className="w-4 h-4 flex-shrink-0" />
                                    <span>
                                        <span className="font-medium text-white">Material: </span>
                                        {product_meta.material}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-textMuted">
                                {config.icon}
                                <span className="font-medium text-white">{config.badge}</span>
                            </div>
                            {product_meta?.origin && product_meta.origin !== 'Unknown' && (
                                <div className="flex items-center gap-2 text-textMuted">
                                    <Zap className="w-4 h-4 flex-shrink-0" />
                                    <span>
                                        <span className="font-medium text-white">Origin: </span>
                                        {product_meta.origin}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-textMuted leading-relaxed text-sm max-w-2xl bg-black/30 p-4 rounded-lg border border-white/5 font-sans">
                            {config.desc}
                        </p>
                    </div>

                    {/* Sentix-Prime Footer — Brand Authority + Category Rank side-by-side */}
                    <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
                        {/* Brand Authority Score */}
                        <div className="flex items-center gap-3 bg-black/20 border border-primary/10 rounded-lg p-3">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg border border-primary/20 flex-shrink-0">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] text-textMuted font-mono uppercase tracking-widest">Brand Authority</p>
                                <p className="font-mono font-black text-white" style={{ fontSize: '1.2rem' }}>
                                    {brandScore}
                                    <span className="text-textMuted font-normal text-sm"> / 100</span>
                                </p>
                            </div>
                        </div>
                        {/* Category Rank */}
                        <div className="flex items-center gap-3 bg-black/20 border border-white/5 rounded-lg p-3">
                            <div className="bg-white/5 text-textMuted p-2 rounded-lg border border-white/10 flex-shrink-0">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] text-textMuted font-mono uppercase tracking-widest">Category Rank</p>
                                <p className="font-mono font-black text-white" style={{ fontSize: '1.2rem' }}>
                                    #{product_meta?.rank ?? 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductHero;
