import React, { useState, useMemo, useEffect, useRef } from 'react';
import ProductIngestor from '../components/ProductIngestor';
import DiscoveryResults from '../components/DiscoveryResults';
import FilterPanel from '../components/FilterPanel';
import ErrorMessage from '../components/ErrorMessage';
import InsightDashboard from '../components/InsightDashboard';
import SkeletonLoader from '../components/SkeletonLoader';
import GridSkeletonLoader from '../components/GridSkeletonLoader';
import { analyzeURL, smartSearch } from '../services/api';

const DEFAULT_FILTERS = { platforms: [], minPrice: '', maxPrice: '', minDiscount: 0, brand: '' };

const EXAMPLE_QUERIES = [
    'iPhone 15 Pro Max', 'boAt Airdopes 141', 'Samsung 8kg washing machine',
    'Nike running shoes', 'Dell laptop', 'Levi\'s jeans'
];

const Home = () => {
    const [isLoading, setIsLoading]           = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [productData, setProductData]       = useState(null);
    const [discoveryData, setDiscoveryData]   = useState([]);
    const [error, setError]                   = useState('');
    const [hasSearched, setHasSearched]       = useState(false);
    const [filters, setFilters]               = useState(DEFAULT_FILTERS);
    const [lastQuery, setLastQuery]           = useState('');
    const blobRef = useRef(null);

    // Parallax blob on scroll
    useEffect(() => {
        const onScroll = () => {
            if (blobRef.current) {
                const y = window.scrollY * 0.25;
                blobRef.current.style.transform = `translateY(${y}px)`;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleSearch = async (searchData) => {
        const query = typeof searchData === 'string' ? searchData : searchData.query;
        const selectedPlatforms = searchData.platforms || [];

        setIsLoading(true);
        setError('');
        setProductData(null);
        setDiscoveryData([]);
        setHasSearched(true);
        setLastQuery(query);
        
        // Apply pre-selected platforms to the filter panel
        setFilters(prev => ({ ...prev, platforms: selectedPlatforms }));

        try {
            const data = await smartSearch(query);
            if (data?.status === 'success') setDiscoveryData(data?.canonical_products || []);
            else setError(data?.error || 'Search failed');
        } catch { setError('Search failed'); }
        finally { setIsLoading(false); }
    };

    const handleSelectProduct = async (product) => {
        setIsDetailLoading(true);
        setError('');
        setProductData(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        try {
            const data = await analyzeURL(product.url);
            if (data?.status === 'success') setProductData(data?.product || {});
            else setError('Unable to fetch complete details.');
        } catch { setError('Failed to load product details.'); }
        finally { setIsDetailLoading(false); }
    };

    const categorizedResults = useMemo(() => {
        const results = { perfect: [], close: [] };
        
        discoveryData.forEach(p => {
            const variants = p.variants || [];
            const title = (p.title || '').toLowerCase();
            
            // Criteria scores
            let score = 0;
            const totalCriteria = 4; // Platform, Price, Discount, Brand

            // 1. Platform
            const hasPlatformMatch = filters.platforms.length === 0 || 
                                     variants.some(v => filters.platforms.includes(v.platform.toLowerCase()));
            if (hasPlatformMatch) score++;

            // 2. Price
            const minP = p.min_price || 0;
            const maxP = p.max_price || 0;
            let hasPriceMatch = true;
            if (filters.minPrice && maxP < parseFloat(filters.minPrice)) hasPriceMatch = false;
            if (filters.maxPrice && minP > parseFloat(filters.maxPrice)) hasPriceMatch = false;
            
            // "Close" price check (within 20%)
            const isClosePrice = !hasPriceMatch && (
                (!filters.minPrice || maxP >= parseFloat(filters.minPrice) * 0.8) &&
                (!filters.maxPrice || minP <= parseFloat(filters.maxPrice) * 1.2)
            );
            if (hasPriceMatch) score++;
            else if (isClosePrice) score += 0.5;

            // 3. Discount
            const maxDiscount = Math.max(...variants.map(v => v.discount_percentage || 0));
            let hasDiscountMatch = true;
            if (filters.minDiscount > 0 && maxDiscount < Number(filters.minDiscount)) hasDiscountMatch = false;
            
            // "Close" discount check (within 10% of target)
            const isCloseDiscount = !hasDiscountMatch && maxDiscount >= (Number(filters.minDiscount) - 10);
            if (hasDiscountMatch) score++;
            else if (isCloseDiscount) score += 0.5;

            // 4. Brand
            const hasBrandMatch = !filters.brand || title.includes(filters.brand.toLowerCase());
            if (hasBrandMatch) score++;

            const finalProduct = { ...p, filterScore: score };
            if (score === totalCriteria) results.perfect.push(finalProduct);
            else if (score >= 2.5) results.close.push(finalProduct);
        });

        const finalResults = { perfect: results.perfect, close: results.close };
        return finalResults;
    }, [discoveryData, filters]);

    return (
        <div className="relative min-h-screen" style={{ background: 'var(--cream)' }}>
            {/* ── BACKGROUND LAYER ── */}
            <div className="app-bg" />
            <div className="blob blob-1" ref={blobRef} />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-24">

                {/* ── HERO ── */}
                <div className="text-center mb-12 fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 fade-in-1"
                         style={{ background: 'rgba(112,130,56,0.1)', border: '1px solid rgba(112,130,56,0.25)', color: 'var(--olive)' }}>
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--olive)' }} />
                        <span className="text-xs font-black uppercase tracking-widest">Live Market Intelligence</span>
                    </div>

                    <h1 className="font-black tracking-tight leading-tight mb-4 fade-in-1"
                        style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--text)', fontFamily: "'Playfair Display', serif" }}>
                        AI{' '}
                        <span style={{ color: 'var(--olive)' }}>Shop</span>{' '}
                        <span style={{ color: 'var(--brown)' }}>Intel</span>
                    </h1>

                    <p className="text-base max-w-xl mx-auto fade-in-2" style={{ color: 'var(--text-md)' }}>
                        Search <strong>any product</strong> across Amazon, Flipkart, Myntra, Ajio, Snapdeal &amp; Meesho —
                        get AI sentiment, price history, and smart recommendations.
                    </p>
                </div>

                {/* ── SEARCH ── */}
                <div className="mb-6 fade-in-2">
                    <ProductIngestor onSearch={handleSearch} isLoading={isLoading} />
                </div>

                {/* ── EXAMPLE CHIPS ── */}
                {!hasSearched && (
                    <div className="text-center mb-12 fade-in-3">
                        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-lt)' }}>
                            Try searching for
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {EXAMPLE_QUERIES.map(q => (
                                <button
                                    key={q}
                                    onClick={() => handleSearch(q)}
                                    className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                                    style={{
                                        background: 'rgba(255,255,255,0.7)',
                                        border: '1px solid var(--beige-2)',
                                        color: 'var(--text-md)',
                                    }}
                                    onMouseEnter={e => { e.target.style.borderColor = 'var(--olive)'; e.target.style.color = 'var(--olive)'; }}
                                    onMouseLeave={e => { e.target.style.borderColor = 'var(--beige-2)'; e.target.style.color = 'var(--text-md)'; }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── FILTER PANEL ── */}
                {hasSearched && !productData && (
                    <div className="mb-8 fade-in">
                        <FilterPanel filters={filters} onChange={setFilters} />
                    </div>
                )}

                {/* ── CONTENT ── */}
                {isLoading && (
                    <div className="mt-8">
                        <p className="text-center text-[10px] font-black uppercase tracking-widest mb-6 fade-in" style={{ color: 'var(--olive)' }}>
                            🛒 Crawling 6 platforms for "{lastQuery}"…
                        </p>
                        <GridSkeletonLoader />
                    </div>
                )}

                {isDetailLoading && (
                    <div className="mt-8">
                        <p className="text-center text-[10px] font-black uppercase tracking-widest mb-6 fade-in" style={{ color: 'var(--olive)' }}>
                            🔍 Running AI Deep Dive Analysis…
                        </p>
                        <SkeletonLoader />
                    </div>
                )}

                {!isLoading && !isDetailLoading && error && <ErrorMessage message={error} />}

                {!isLoading && !isDetailLoading && productData && !error && (
                    <div className="mb-20 fade-in">
                        <button
                            onClick={() => setProductData(null)}
                            className="flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid var(--beige-2)', color: 'var(--text-md)' }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Results
                        </button>
                        <InsightDashboard data={productData} />
                    </div>
                )}

                {!isLoading && !isDetailLoading && !productData && hasSearched && !error && (
                    <DiscoveryResults
                        results={categorizedResults.perfect}
                        closeMatches={categorizedResults.close}
                        totalResults={discoveryData.length}
                        onSelect={handleSelectProduct}
                    />
                )}

                {!isLoading && !isDetailLoading && !productData && !hasSearched && !error && (
                    <div className="text-center py-20 fade-in-3">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
                             style={{ background: 'rgba(112,130,56,0.1)', border: '2px solid rgba(112,130,56,0.2)' }}>
                            <svg className="w-10 h-10" style={{ color: 'var(--olive)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="font-black text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--text-md)' }}>
                            Search Anything
                        </p>
                        <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-lt)' }}>
                            Type any product, brand, or category above. We'll crawl 6 major e-commerce platforms instantly.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
