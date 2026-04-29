import React from 'react';
import ProductHero from './ProductHero';
import AIConsensusPanel from './AIConsensusPanel';
import LivePulseFeed from './LivePulseFeed';
import RatingDistChart from './RatingDistChart';
import SentimentPieChart from './SentimentPieChart';
import PriceHistoryChart from './PriceHistoryChart';
import ReviewSummary from './ReviewSummary';

const SectionTag = ({ n, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{
            padding: '0.25rem 0.75rem', borderRadius: '100px',
            fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: '#fff', background: 'var(--accent)'
        }}>
            {String(n).padStart(2, '0')}
        </span>
        <h2 style={{
            fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '-0.02em', color: 'var(--text)', margin: 0
        }}>
            {label}
        </h2>
    </div>
);

const EmptyState = ({ text }) => (
    <div style={{
        padding: '2rem', textAlign: 'center', borderRadius: '1rem',
        background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)'
    }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-lt)' }}>{text}</p>
    </div>
);

const InsightDashboard = ({ data = {} }) => {
    if (!data || Object.keys(data).length === 0) return null;

    const reviews   = Array.isArray(data?.reviews) ? data.reviews : [];
    const hasHistory = Array.isArray(data?.price_history) && data.price_history.length > 0;
    const specs     = data?.specifications || {};

    return (
        <div className="fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '5rem' }}>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }} className="lg-grid-12">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

                    {/* 03 — Review Analytics */}
                    <section>
                        <SectionTag n={3} label="Review Analytics" />
                        {reviews.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                <div style={{
                                    height: '300px', borderRadius: '1rem', padding: '1rem',
                                    background: 'var(--bg-card)', border: '1px solid var(--border)'
                                }}>
                                    <RatingDistChart distribution={data?.rating_distribution || {5:0,4:0,3:0,2:0,1:0}} />
                                </div>
                                <div style={{
                                    height: '300px', borderRadius: '1rem', padding: '1rem',
                                    background: 'var(--bg-card)', border: '1px solid var(--border)'
                                }}>
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
                            <div style={{
                                borderRadius: '1rem', overflow: 'hidden',
                                border: '1px solid var(--border)', background: 'var(--bg-card)'
                            }}>
                                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {Object.entries(specs).map(([key, val], idx) => (
                                            <tr key={key}
                                                style={{ background: idx % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-card)' }}>
                                                <td style={{
                                                    padding: '0.75rem 1.25rem', fontSize: '0.75rem',
                                                    fontWeight: 900, textTransform: 'uppercase',
                                                    letterSpacing: '0.08em', width: '33%',
                                                    color: 'var(--text-lt)'
                                                }}>{key}</td>
                                                <td style={{
                                                    padding: '0.75rem 1.25rem', fontSize: '0.875rem',
                                                    fontWeight: 500, color: 'var(--text)'
                                                }}>{val}</td>
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
                            <div style={{
                                height: '360px', borderRadius: '1rem', padding: '1rem',
                                background: 'var(--bg-card)', border: '1px solid var(--border)'
                            }}>
                                <PriceHistoryChart history={data?.price_history || []} />
                            </div>
                        ) : <EmptyState text="No price history yet — check back after more searches" />}
                    </section>
                </div>

                {/* RIGHT — Live Reviews */}
                <div style={{ height: '900px' }}>
                    <LivePulseFeed reviews={reviews} />
                </div>
            </div>

            {/* Footer */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
                gap: '1rem', paddingTop: '2.5rem',
                fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                color: 'var(--text-lt)', borderTop: '1px solid var(--border)'
            }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulseGlow 2s infinite' }} />
                Sentix-Prime · AI Commerce Intelligence · Gemini 2.0 Flash
            </div>
        </div>
    );
};

export default InsightDashboard;
