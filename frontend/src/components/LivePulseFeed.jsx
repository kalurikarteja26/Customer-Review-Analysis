import React from 'react';

const sentimentStyle = (s) => {
    switch ((s || '').toLowerCase()) {
        case 'positive': return { bg: 'var(--accent-bg)', color: 'var(--positive)', border: 'var(--accent-glow)' };
        case 'negative': return { bg: 'rgba(239,68,68,0.08)', color: 'var(--negative)', border: 'rgba(239,68,68,0.15)' };
        default:         return { bg: 'rgba(245,158,11,0.08)', color: 'var(--neutral)', border: 'rgba(245,158,11,0.15)' };
    }
};

const avatarColors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

const getRelativeDate = (dateStr) => {
    if (!dateStr || dateStr === 'Recently') return 'Recently';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
        return dateStr;
    } catch {
        return dateStr;
    }
};

const LivePulseFeed = ({ reviews = [] }) => {
    const safe = Array.isArray(reviews) ? reviews : [];

    if (safe.length === 0) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', borderRadius: '1.5rem', padding: '3rem 2rem', textAlign: 'center',
                background: 'var(--bg-card)', border: '1.5px dashed var(--border)'
            }}>
                <svg width="48" height="48" style={{ color: 'var(--text-lt)', opacity: 0.3, marginBottom: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-md)' }}>No Live Feedback</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-lt)' }}>Real-time signals appear here once extracted.</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100%',
            borderRadius: '1.5rem', overflow: 'hidden',
            background: 'var(--bg-card)', border: '1.5px solid var(--border)',
            boxShadow: '0 4px 24px var(--shadow)',
            transition: 'all 0.4s ease'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)'
            }}>
                <h3 style={{
                    fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--text)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0
                }}>
                    <span style={{ position: 'relative', display: 'inline-flex', width: '10px', height: '10px' }}>
                        <span style={{
                            position: 'absolute', display: 'inline-flex', width: '100%', height: '100%',
                            borderRadius: '50%', opacity: 0.75, background: 'var(--accent)',
                            animation: 'pulseGlow 2s infinite'
                        }} />
                        <span style={{
                            position: 'relative', display: 'inline-flex', borderRadius: '50%',
                            width: '10px', height: '10px', background: 'var(--accent)'
                        }} />
                    </span>
                    Live Pulse Feed
                </h3>
                <span style={{
                    fontSize: '0.65rem', fontWeight: 800,
                    padding: '0.25rem 0.75rem', borderRadius: '100px',
                    background: 'var(--bg-secondary)', color: 'var(--text-lt)'
                }}>
                    {safe.length} Reviews
                </span>
            </div>

            {/* Review cards */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '0.75rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem'
            }}>
                {safe.map((r, idx) => {
                    const ss = sentimentStyle(r?.sentiment_label);
                    const initial = (r?.author || 'C')[0].toUpperCase();
                    const acColor = avatarColors[(r?.author || '').charCodeAt(0) % avatarColors.length];
                    const starCount = Math.round(parseFloat(r?.rating || 0));
                    const relDate = getRelativeDate(r?.date);

                    return (
                        <div
                            key={r?.id || idx}
                            className="review-card review-card-enter"
                            style={{ animationDelay: `${idx * 0.08}s` }}
                        >
                            {/* Author row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '0.8rem', fontWeight: 900,
                                        background: acColor, flexShrink: 0
                                    }}>
                                        {initial}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1 }}>
                                            {r?.author || 'Verified Customer'}
                                        </p>
                                        <p style={{ fontSize: '0.65rem', marginTop: '0.2rem', color: 'var(--text-lt)', margin: '2px 0 0 0' }}>
                                            {r?.verified !== false && (
                                                <span style={{ color: 'var(--positive)', marginRight: '0.4rem' }}>✓ Verified</span>
                                            )}
                                            {relDate}
                                        </p>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: '0.6rem', fontWeight: 800,
                                    padding: '0.2rem 0.5rem', borderRadius: '100px',
                                    border: '1px solid',
                                    background: ss.bg, color: ss.color, borderColor: ss.border
                                }}>
                                    {r?.sentiment_label || 'Neutral'}
                                </span>
                            </div>

                            {/* Review text */}
                            <p style={{
                                fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '0.75rem',
                                fontStyle: 'italic', color: 'var(--text-md)', margin: '0 0 0.75rem 0'
                            }}>
                                "{r?.text || 'No feedback provided.'}"
                            </p>

                            {/* Stars + confidence */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '1px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} width="14" height="14" viewBox="0 0 20 20"
                                             style={{ fill: i < starCount ? '#f59e0b' : 'var(--border)' }}>
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-lt)' }}>
                                    AI: {Math.round((1 - (r?.fake_probability || 0)) * 100)}% confidence
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LivePulseFeed;
