import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import SkeletonLoader from '../components/SkeletonLoader';
import LivePulseFeed from '../components/LivePulseFeed';
import HistoricalTrendChart from '../components/HistoricalTrendChart';
import ProductHero from '../components/ProductHero';
import AIConsensusPanel from '../components/AIConsensusPanel';
import PredictiveChart from '../components/PredictiveChart';
import { ArrowLeft, RefreshCw, AlertTriangle, Box, Fingerprint, CheckCircle } from 'lucide-react';

const ProductDisplay = () => {
    const navigate = useNavigate();
    const {
        currentProductData,
        isLoading,
        error,
        liveSyncEnabled,
        toggleLiveSync,
        clearProduct,
        fetchProductData
    } = useStore();

    useEffect(() => {
        // If we land here after a direct refresh with no data, redirect to home
        if (!currentProductData && !isLoading && !error) {
            navigate('/');
        }
    }, [currentProductData, isLoading, error, navigate]);

    // Show error inline (don't throw — that crashes the UI)
    if (error && !isLoading && !currentProductData) {
        return (
            <div className="w-full h-full flex flex-col gap-6">
                <button
                    onClick={() => { clearProduct(); navigate('/'); }}
                    className="flex items-center gap-2 text-textMuted hover:text-white w-fit transition-colors font-mono text-xs uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Mount
                </button>
                <div className="bloomberg-panel p-10 flex flex-col items-center justify-center text-center gap-4">
                    <AlertTriangle className="w-12 h-12 text-negative opacity-70" />
                    <h2 className="font-mono text-negative uppercase tracking-widest text-sm">Agent Rejection</h2>
                    <p className="text-white text-lg font-semibold">{error}</p>
                    <p className="text-textMuted text-sm max-w-md">The scraper could not identify a valid product category from the URL. Please provide a direct Amazon product link for Shoes, Electronics, or Apparel.</p>
                    <button
                        onClick={() => { clearProduct(); navigate('/'); }}
                        className="mt-2 neon-button px-6 py-2 text-xs font-mono uppercase tracking-widest"
                    >
                        Try Another URL
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading || !currentProductData) {
        return (
            <div className="w-full h-full flex flex-col gap-6">
                <button
                    onClick={() => { clearProduct(); navigate('/'); }}
                    className="flex items-center gap-2 text-textMuted hover:text-white w-fit transition-colors font-mono text-xs uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" /> Abort Transfer
                </button>
                <SkeletonLoader />
            </div>
        );
    }

    const {
        category,
        attributes,
        live_feed,
        historical_trend,
        historical_average_score,
        ai_consensus,
        projected_sales_demand
    } = currentProductData;

    const handleLiveSyncToggle = () => {
        toggleLiveSync();
        // Always pass only the URL — backend auto-detects category
        fetchProductData(currentProductData.url);
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in-up">

            {/* ── Header Bar ── */}
            <div className="bloomberg-panel p-5 border-t-4 border-t-primary flex justify-between items-center flex-col sm:flex-row gap-4">
                <div>
                    <button
                        onClick={() => { clearProduct(); navigate('/'); }}
                        className="flex items-center gap-2 text-primary hover:text-white mb-1 text-xs font-mono uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" /> Back to Mount
                    </button>
                    <h1 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-textMuted" />
                        {currentProductData.product_meta?.name
                            ? currentProductData.product_meta.name.slice(0, 60) + (currentProductData.product_meta.name.length > 60 ? '…' : '')
                            : 'Intelligence Dashboard'
                        }
                    </h1>
                    <p className="text-xs text-textMuted mt-1 font-mono">
                        Category Detected:&nbsp;
                        <span className="text-white bg-white/10 px-2 py-0.5 rounded">{category}</span>
                    </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-textMuted uppercase font-mono tracking-widest">Stream Control</span>
                    <button
                        onClick={handleLiveSyncToggle}
                        disabled={isLoading}
                        className={`px-4 py-2 border rounded font-mono text-xs flex items-center gap-2 transition-all
                            ${liveSyncEnabled
                                ? 'border-positive text-positive bg-positive/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                : 'border-textMuted text-textMuted bg-white/5'}
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                    >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        {liveSyncEnabled ? 'LIVE SYNC: ON' : 'HISTORICAL ONLY'}
                    </button>
                </div>
            </div>

            {/* ── Stage 1: Product Hero & Gallery ── */}
            <ProductHero productData={currentProductData} />

            {/* ── Stage 2: Feature Attribute Matrix ── */}
            {attributes && Object.keys(attributes).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Object.entries(attributes).map(([key, value]) => (
                        <div
                            key={key}
                            className="bg-surface border border-white/5 rounded-lg p-4 flex flex-col justify-between hover:border-primary/30 hover:bg-primary/5 transition-all"
                        >
                            <span className="text-[10px] uppercase tracking-widest text-textMuted font-mono mb-3 leading-snug">{key}</span>
                            <div>
                                <span className="text-2xl font-bold font-mono text-white">{value}</span>
                                <span className="text-xs text-textMuted font-sans ml-1">/ 5</span>
                            </div>
                            {/* Mini bar */}
                            <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary/60 rounded-full transition-all"
                                    style={{ width: `${(value / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {/* Net Sentiment Score card */}
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex flex-col justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-primary font-mono mb-3">Net Score</span>
                        <div>
                            <span className="text-2xl font-bold font-mono text-primary">
                                {currentProductData.current_sentiment_score}
                            </span>
                            <span className="text-xs text-textMuted font-sans ml-1">/ 5</span>
                        </div>
                        <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(currentProductData.current_sentiment_score / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Stage 3: AI Consensus + Prediction Charts ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                <AIConsensusPanel consensus={ai_consensus} />
                <PredictiveChart forecast={projected_sales_demand} />
            </div>

            {/* ── Stage 4: Live Feed + Historical Trend ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    {liveSyncEnabled ? (
                        <LivePulseFeed
                            liveFeed={live_feed}
                            productName={currentProductData.product_meta?.name ?? 'Product'}
                            category={category}
                            attributes={attributes}
                        />
                    ) : (
                        <div className="bloomberg-panel p-5 h-[400px] flex flex-col items-center justify-center text-textMuted border-dashed border-2 border-white/10">
                            <AlertTriangle className="w-8 h-8 opacity-40 mb-4" />
                            <p className="font-mono text-xs uppercase tracking-widest text-center">
                                Live Sync Disabled.<br />Enable to stream active NLP pipeline.
                            </p>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2">
                    <HistoricalTrendChart historicalTrend={historical_trend} historicalAvg={historical_average_score} />
                </div>
            </div>

            {/* ── Stage 5: Auditor Synthesis Block ── */}
            {ai_consensus?.extraction && (
                <div className="bloomberg-panel p-8 bg-gradient-to-r from-surface to-primary/5">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-5 h-5 text-primary opacity-75" />
                        <h3 className="text-xs text-primary font-mono uppercase tracking-widest">Multimodal Sentiment Synthesis</h3>
                    </div>
                    <p className="text-base text-white/90 leading-relaxed font-sans border-l-4 border-primary pl-4">
                        {ai_consensus.extraction}
                    </p>
                </div>
            )}

        </div>
    );
};

export default ProductDisplay;
