import React from 'react';

const sentimentStyle = (s) => {
    switch ((s || '').toLowerCase()) {
        case 'positive': return { bg: 'rgba(112,130,56,0.10)', color: 'var(--olive)', border: 'rgba(112,130,56,0.2)' };
        case 'negative': return { bg: 'rgba(204,51,0,0.08)',  color: '#cc3300',       border: 'rgba(204,51,0,0.15)' };
        default:         return { bg: 'rgba(196,122,0,0.08)', color: '#c47a00',        border: 'rgba(196,122,0,0.15)' };
    }
};

const avatarColor = (name = 'C') => {
    const colors = ['var(--olive)', 'var(--brown)', '#c47a00', '#6340cc', '#1855d4'];
    return colors[name.charCodeAt(0) % colors.length];
};

const LivePulseFeed = ({ reviews = [] }) => {
    const safe = Array.isArray(reviews) ? reviews : [];

    if (safe.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full rounded-3xl p-10 text-center"
                 style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid var(--beige-2)' }}>
                <svg className="w-12 h-12 mb-4" style={{ color: 'var(--brown)', opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="font-bold text-sm" style={{ color: 'var(--text-md)' }}>No Live Feedback</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-lt)' }}>Real-time signals appear here once extracted.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full rounded-3xl overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.80)', border: '1.5px solid var(--beige-2)', boxShadow: '0 4px 24px rgba(120,90,60,0.08)' }}>

            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between"
                 style={{ borderBottom: '1px solid var(--beige-2)' }}>
                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text)' }}>
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--olive)' }} />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: 'var(--olive)' }} />
                    </span>
                    Live Pulse Feed
                </h3>
                <span className="text-[10px] font-black px-3 py-1 rounded-full"
                      style={{ background: 'var(--beige)', color: 'var(--text-lt)' }}>
                    {safe.length} Signals
                </span>
            </div>

            {/* Review cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {safe.map((r, idx) => {
                    const ss = sentimentStyle(r?.sentiment_label);
                    const initial = (r?.author || 'C')[0].toUpperCase();
                    const ac = avatarColor(r?.author || '');
                    const starCount = Math.round(parseFloat(r?.rating || 0));

                    return (
                        <div key={r?.id || idx}
                             className="p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                             style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid var(--beige-2)' }}>

                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                                         style={{ background: ac }}>
                                        {initial}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black leading-none" style={{ color: 'var(--text)' }}>
                                            {r?.author || 'Verified Customer'}
                                        </p>
                                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-lt)' }}>
                                            {r?.date || 'Recently'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black px-2 py-1 rounded-full border"
                                      style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}>
                                    {r?.sentiment_label || 'Neutral'}
                                </span>
                            </div>

                            <p className="text-xs leading-relaxed mb-3 italic"
                               style={{ color: 'var(--text-md)' }}>
                                "{r?.text || 'No feedback provided.'}"
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-3 h-3" viewBox="0 0 20 20"
                                             style={{ fill: i < starCount ? '#e8a020' : 'var(--beige-2)' }}>
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-[9px] font-mono" style={{ color: 'var(--text-lt)' }}>
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
