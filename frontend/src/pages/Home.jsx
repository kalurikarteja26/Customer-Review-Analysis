import React, { useState } from 'react';
import ProductIngestor from '../components/ProductIngestor';
import DiscoveryResults from '../components/DiscoveryResults';
import ComparisonTable from '../components/ComparisonTable';
import ErrorMessage from '../components/ErrorMessage';
import InsightDashboard from '../components/InsightDashboard';
import SkeletonLoader from '../components/SkeletonLoader';
import { analyzeURL, smartSearch } from '../services/api';

const Home = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [productData, setProductData] = useState(null);
    const [discoveryData, setDiscoveryData] = useState([]);
    const [error, setError] = useState('');

    const handleSearch = async (query) => {
        setIsLoading(true);
        setError('');
        setProductData(null);
        setDiscoveryData([]);

        try {
            const data = await smartSearch(query);
            if (data?.status === 'success') {
                setDiscoveryData(data?.products || []);
            } else {
                setError(data?.error || "Search failed");
            }
        } catch (err) {
            console.error("SEARCH QUERY ERROR:", err);
            setError("Search failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectProduct = async (product) => {
        setIsDetailLoading(true);
        setError('');
        setProductData(null);
        
        // Scroll to top or detail section
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            const data = await analyzeURL(product.url);
            if (data?.status === 'success') {
                setProductData(data?.product || {});
            } else {
                setError("Unable to fetch complete details for this product.");
            }
        } catch (err) {
            console.error("DETAIL FETCH ERROR:", err);
            setError("Failed to load product details.");
        } finally {
            setIsDetailLoading(false);
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
            {/* NEW PREMIUM BACKGROUND */}
            <div 
                className="fixed inset-0 z-0 opacity-40 grayscale-[0.2]"
                style={{
                    backgroundImage: `url('file:///C:/Users/KALURI%20KARTEJA/.gemini/antigravity/brain/d70b5002-917d-4a37-90de-cfdf38251c2b/ecommerce_workspace_bg_1777016398311.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(2px)'
                }}
            />
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950"></div>

            <div className="relative z-10 pt-28 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
                
                <div className="text-center mb-12 fade-in">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
                        AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Shop Intel</span>
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-3xl mx-auto font-medium">
                        Professional e-commerce discovery. We crawl the market to suggest the best for you, with real-time price history and AI sentiment analytics.
                    </p>
                </div>

                <div className="w-full max-w-4xl backdrop-blur-xl bg-white/5 rounded-[3rem] p-4 border border-white/10 shadow-2xl mb-16">
                    <ProductIngestor 
                        onSearch={handleSearch} 
                        isLoading={isLoading} 
                    />
                </div>
                
                <div className="w-full relative min-h-[400px]">
                    {(isLoading || isDetailLoading) && (
                        <div className="w-full mt-10">
                            <SkeletonLoader />
                        </div>
                    )}

                    {!isLoading && !isDetailLoading && error && (
                        <ErrorMessage message={error} />
                    )}

                    {!isLoading && !isDetailLoading && productData && !error && (
                        <div className="mb-20">
                            <div className="flex justify-start mb-8">
                                <button 
                                    onClick={() => setProductData(null)}
                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                    </svg>
                                    Return to Discovery
                                </button>
                            </div>
                            <InsightDashboard data={productData} />
                        </div>
                    )}

                    {!isLoading && !isDetailLoading && discoveryData && discoveryData.length > 0 && !productData && (
                        <DiscoveryResults 
                            results={discoveryData} 
                            onSelect={handleSelectProduct} 
                        />
                    )}
                    
                    {!isLoading && !isDetailLoading && !productData && (!discoveryData || discoveryData.length === 0) && !error && (
                        <div className="text-center p-16 backdrop-blur-md bg-white/5 rounded-[3rem] border border-white/10 text-zinc-500 fade-in flex flex-col items-center">
                            <div className="w-20 h-20 mb-6 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <svg className="w-10 h-10 text-indigo-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                </svg>
                            </div>
                            <p className="font-black uppercase tracking-[0.2em] text-xs">Awaiting Query • Suggesting the Best for You</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Home;
