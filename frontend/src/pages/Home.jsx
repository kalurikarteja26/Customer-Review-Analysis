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
            let score = 0;
            const totalCriteria = 4;

            const hasPlatformMatch = filters.platforms.length === 0 || 
                                     variants.some(v => filters.platforms.includes(v.platform.toLowerCase()));
            if (hasPlatformMatch) score++;

            const minP = p.min_price || 0;
            const maxP = p.max_price || 0;
            let hasPriceMatch = true;
            if (filters.minPrice && maxP < parseFloat(filters.minPrice)) hasPriceMatch = false;
            if (filters.maxPrice && minP > parseFloat(filters.maxPrice)) hasPriceMatch = false;
            const isClosePrice = !hasPriceMatch && (
                (!filters.minPrice || maxP >= parseFloat(filters.minPrice) * 0.8) &&
                (!filters.maxPrice || minP <= parseFloat(filters.maxPrice) * 1.2)
            );
            if (hasPriceMatch) score++;
            else if (isClosePrice) score += 0.5;

            const maxDiscount = Math.max(...variants.map(v => v.discount_percentage || 0));
            let hasDiscountMatch = true;
            if (filters.minDiscount > 0 && maxDiscount < Number(filters.minDiscount)) hasDiscountMatch = false;
            const isCloseDiscount = !hasDiscountMatch && maxDiscount >= (Number(filters.minDiscount) - 10);
            if (hasDiscountMatch) score++;
            else if (isCloseDiscount) score += 0.5;

            const hasBrandMatch = !filters.brand || title.includes(filters.brand.toLowerCase());
            if (hasBrandMatch) score++;

            const finalProduct = { ...p, filterScore: score };
            if (score === totalCriteria) results.perfect.push(finalProduct);
            else if (score >= 2.5) results.close.push(finalProduct);
        });

        return results;
    }, [discoveryData, filters]);

    const availablePlatforms = useMemo(() => {
        const platforms = new Set();
        discoveryData.forEach(p => {
            p.variants?.forEach(v => {
                if (v.platform) platforms.add(v.platform.toLowerCase());
            });
        });
        return Array.from(platforms);
    }, [discoveryData]);

    return (
        <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-primary)', transition: 'background 0.4s ease' }}>
            {/* ── BACKGROUND ── */}
            <div className="app-bg" />
            <div className="blob blob-1" ref={blobRef} />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div style={{ position: 'relative', zIndex: 10, maxWidth: '72rem', margin: '0 auto', padding: '5rem 1rem 6rem' }}>

                {/* ── HERO ── */}
                <div className="fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="fade-in-1" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '100px', marginBottom: '1.5rem',
                        background: 'var(--accent-bg)', border: '1px solid var(--accent-glow)', color: 'var(--accent)'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulseGlow 2s infinite' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Live AI Sentiment Analysis
                        </span>
                    </div>

                    <h1 className="fade-in-1" style={{
                        fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1rem',
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text)',
                        fontFamily: "'Playfair Display', serif"
                    }}>
                        AI{' '}
                        <span style={{ color: 'var(--accent)' }}>Customer Sentiment</span><br/>
                        <span style={{ color: 'var(--text-md)', fontSize: '0.85em' }}>Classification System</span>
                    </h1>

                    <p className="fade-in-2" style={{ fontSize: '1rem', maxWidth: '36rem', margin: '0 auto', color: 'var(--text-md)' }}>
                        Search <strong>any product</strong> across Amazon, Flipkart, Myntra, Ajio, Snapdeal &amp; Meesho —
                        get AI sentiment, price history, and smart recommendations.
                    </p>
                </div>

                {/* ── SEARCH ── */}
                <div className="fade-in-2" style={{ marginBottom: '1.5rem' }}>
                    <ProductIngestor onSearch={handleSearch} isLoading={isLoading} />
                </div>

                {/* ── EXAMPLE CHIPS ── */}
                {!hasSearched && (
                    <div className="fade-in-3" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem', color: 'var(--text-lt)' }}>
                            Try searching for
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
                            {EXAMPLE_QUERIES.map(q => (
                                <button
                                    key={q}
                                    onClick={() => handleSearch(q)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '100px',
                                        fontSize: '0.75rem', fontWeight: 600,
                                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                                        color: 'var(--text-md)', cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
                                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-md)'; }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {hasSearched && !productData && (
                    <div className="fade-in" style={{ marginBottom: '2rem' }}>
                        <FilterPanel filters={filters} onChange={setFilters} availablePlatforms={availablePlatforms} />
                    </div>
                )}

                {/* ── LOADING ── */}
                {isLoading && (
                    <div style={{ marginTop: '2rem' }}>
                        <p className="fade-in" style={{
                            textAlign: 'center', fontSize: '0.65rem', fontWeight: 900,
                            textTransform: 'uppercase', letterSpacing: '0.15em',
                            marginBottom: '1.5rem', color: 'var(--accent)'
                        }}>
                            🛒 Crawling 6 platforms for "{lastQuery}"…
                        </p>
                        <GridSkeletonLoader />
                    </div>
                )}

                {isDetailLoading && (
                    <div style={{ marginTop: '2rem' }}>
                        <p className="fade-in" style={{
                            textAlign: 'center', fontSize: '0.65rem', fontWeight: 900,
                            textTransform: 'uppercase', letterSpacing: '0.15em',
                            marginBottom: '1.5rem', color: 'var(--accent)'
                        }}>
                            🔍 Running AI Deep Dive Analysis…
                        </p>
                        <SkeletonLoader />
                    </div>
                )}

                {!isLoading && !isDetailLoading && error && <ErrorMessage message={error} />}

                {!isLoading && !isDetailLoading && productData && !error && (
                    <div className="fade-in" style={{ marginBottom: '5rem' }}>
                        <button
                            onClick={() => setProductData(null)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                marginBottom: '2rem', padding: '0.625rem 1.25rem',
                                borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900,
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                color: 'var(--text-md)', cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="fade-in-3" style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '5rem', height: '5rem', borderRadius: '50%', marginBottom: '1.25rem',
                            background: 'var(--accent-bg)', border: '2px solid var(--accent-glow)'
                        }}>
                            <svg width="40" height="40" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p style={{ fontWeight: 900, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-md)' }}>
                            Search Anything
                        </p>
                        <p style={{ fontSize: '0.875rem', maxWidth: '24rem', margin: '0 auto', color: 'var(--text-lt)' }}>
                            Type any product, brand, or category above. We'll crawl 6 major e-commerce platforms instantly.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
