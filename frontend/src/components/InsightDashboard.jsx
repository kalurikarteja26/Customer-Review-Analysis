import React from 'react';
import ProductHero from './ProductHero';
import AIConsensusPanel from './AIConsensusPanel';
import LivePulseFeed from './LivePulseFeed';
import RatingDistChart from './RatingDistChart';
import SentimentPieChart from './SentimentPieChart';
import PriceHistoryChart from './PriceHistoryChart';
import ReviewSummary from './ReviewSummary';

const SectionTag = ({ n, label }) => (
    <div className="flex items-center gap-3 mb-6">
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
              style={{ background: 'var(--olive)' }}>
            {String(n).padStart(2, '0')}
        </span>
        <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text)' }}>
            {label}
        </h2>
    </div>
);

const EmptyState = ({ text }) => (
    <div className="p-8 text-center rounded-2xl"
         style={{ background: 'var(--beige)', border: '1.5px dashed var(--beige-2)' }}>
        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-lt)' }}>{text}</p>
    </div>
);

const InsightDashboard = ({ data = {} }) => {
    if (!data || Object.keys(data).length === 0) return null;

    const reviews   = Array.isArray(data?.reviews) ? data.reviews : [];
    const hasHistory = Array.isArray(data?.price_history) && data.price_history.length > 0;
    const specs     = data?.specifications || {};

    return (
        <div className="w-full space-y-14 pb-20 fade-in">

            {/* 01 — Product Overview */}
            <section>
                <SectionTag n={1} label="Product Overview" />
                <ProductHero product={data} />
            </section>

            {/* 02 — AI Verdict */}
            {data?.recommendation && (
                <section>
                    <SectionTag n={2} label="AI Analysis & Verdict" />
                    <AIConsensusPanel
                        recommendation={data.recommendation}
                        featureScores={data?.feature_match_scores || {}}
                    />
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-14">

                    {/* 03 — Review Analytics */}
                    <section>
                        <SectionTag n={3} label="Review Analytics" />
                        {reviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="h-[300px] rounded-2xl p-4"
                                     style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid var(--beige-2)' }}>
                                    <RatingDistChart distribution={data?.rating_distribution || {5:0,4:0,3:0,2:0,1:0}} />
                                </div>
                                <div className="h-[300px] rounded-2xl p-4"
                                     style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid var(--beige-2)' }}>
                                    <SentimentPieChart reviews={reviews} />
                                </div>
                            </div>
                        ) : <EmptyState text="No customer review data available" />}
                    </section>

                    {/* 04 — AI Summary */}
                    <section>
                        <SectionTag n={4} label="AI Summary" />
                        <ReviewSummary summary={data?.sentiment_analysis || {}} />
                    </section>

                    {/* 05 — Specifications */}
                    {Object.keys(specs).length > 0 && (
                        <section>
                            <SectionTag n={5} label="Specifications" />
                            <div className="rounded-2xl overflow-hidden"
                                 style={{ border: '1px solid var(--beige-2)', background: 'rgba(255,255,255,0.8)' }}>
                                <table className="w-full text-left border-collapse">
                                    <tbody>
                                        {Object.entries(specs).map(([key, val], idx) => (
                                            <tr key={key}
                                                style={{ background: idx % 2 === 0 ? 'var(--beige)' : 'rgba(255,255,255,0.9)' }}>
                                                <td className="py-3 px-5 text-xs font-black uppercase tracking-wider w-1/3"
                                                    style={{ color: 'var(--text-lt)' }}>{key}</td>
                                                <td className="py-3 px-5 text-sm font-medium"
                                                    style={{ color: 'var(--text)' }}>{val}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* 06 — Price History */}
                    <section>
                        <SectionTag n={6} label="Price History" />
                        {hasHistory ? (
                            <div className="h-[360px] rounded-2xl p-4"
                                 style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid var(--beige-2)' }}>
                                <PriceHistoryChart history={data?.price_history || []} />
                            </div>
                        ) : <EmptyState text="No price history yet — check back after more searches" />}
                    </section>
                </div>

                {/* RIGHT — Live Reviews */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 h-[900px]">
                    <LivePulseFeed reviews={reviews} />
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-10 text-[10px] font-bold uppercase tracking-widest"
                 style={{ color: 'var(--text-lt)', borderTop: '1px solid var(--beige-2)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--olive)' }} />
                AI Commerce Analyzer · Python 3.10 · SQLite v3 · Gemini Pro
            </div>
        </div>
    );
};

export default InsightDashboard;
