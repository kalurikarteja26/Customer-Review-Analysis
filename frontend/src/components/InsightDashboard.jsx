import React from 'react';
import ProductHero from './ProductHero';
import AIConsensusPanel from './AIConsensusPanel';
import LivePulseFeed from './LivePulseFeed';
import RatingDistChart from './RatingDistChart';
import SentimentPieChart from './SentimentPieChart';
import PriceHistoryChart from './PriceHistoryChart';
import ReviewSummary from './ReviewSummary';

const InsightDashboard = ({ data = {} }) => {
    if (!data || Object.keys(data).length === 0) return null;

    const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
    const hasReviews = reviews.length > 0;
    const hasHistory = Array.isArray(data?.price_history) && data.price_history.length > 0;
    const specs = data?.specifications || {};

    return (
        <div className="w-full space-y-16 fade-in pb-20">
            {/* SECTION 1: Product Overview */}
            <section id="product-overview">
                <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">Section 01</span>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Product Overview</h2>
                </div>
                <ProductHero product={data} />
            </section>

            {/* SECTION 2: AI Recommendation Verdict */}
            {data?.recommendation && (
                <section id="ai-recommendation">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">Section 02</span>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">AI Analysis & Verdict</h2>
                    </div>
                    <AIConsensusPanel 
                        recommendation={data.recommendation} 
                        featureScores={data?.feature_match_scores || {}} 
                    />
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* LEFT COLUMN: Analytics & Insights */}
                <div className="lg:col-span-8 space-y-16">
                    
                    {/* SECTION 3: Review Analytics */}
                    <section id="review-analytics">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">Section 03</span>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Review Analytics</h2>
                        </div>
                        {hasReviews ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="h-[350px]">
                                    <RatingDistChart distribution={data?.rating_distribution || {5:0, 4:0, 3:0, 2:0, 1:0}} />
                                </div>
                                <div className="h-[350px]">
                                    <SentimentPieChart reviews={reviews} />
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 text-center">
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No customer review data available for analysis</p>
                            </div>
                        )}
                    </section>

                    {/* SECTION 4: AI Insights */}
                    <section id="ai-insights">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">Section 04</span>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">AI Summary</h2>
                        </div>
                        <ReviewSummary summary={data?.sentiment_analysis || {}} />
                    </section>

                    {/* SECTION 5: Specifications */}
                    {Object.keys(specs).length > 0 && (
                        <section id="specifications">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">Section 05</span>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Specifications</h2>
                            </div>
                            <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-zinc-800/50 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <tbody>
                                        {Object.entries(specs).map(([key, val], idx) => (
                                            <tr key={key} className={idx % 2 === 0 ? 'bg-zinc-50/50 dark:bg-zinc-800/20' : ''}>
                                                <td className="py-4 px-6 text-xs font-black uppercase text-zinc-400 tracking-wider w-1/3">{key}</td>
                                                <td className="py-4 px-6 text-sm text-gray-800 dark:text-zinc-200 font-medium">{val}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* SECTION 6: Price History */}
                    <section id="price-history">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">Section 06</span>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Price History</h2>
                        </div>
                        {hasHistory ? (
                            <div className="h-[400px]">
                                <PriceHistoryChart history={data?.price_history || []} />
                            </div>
                        ) : (
                            <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 text-center">
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No price history available yet</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN: Review Feed */}
                <div className="lg:col-span-4 h-[1200px] sticky top-28">
                    <LivePulseFeed reviews={reviews} />
                </div>
            </div>

            {/* System Status Footer */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] pt-10 border-t border-gray-100 dark:border-zinc-800">
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                AI Commerce Analyzer Active
                <span className="opacity-20">|</span>
                Core: Python 3.10
                <span className="opacity-20">|</span>
                Scraper: Universal Python
                <span className="opacity-20">|</span>
                Database: SQLite v3
                <span className="opacity-20">|</span>
                Status: Robust
            </div>
        </div>
    );
};

export default InsightDashboard;
