import React from 'react';

const VERDICT_STYLE = {
    'BUY':             { bg: 'var(--olive)',    ring: 'rgba(112,130,56,0.25)' },
    'CONSIDER':        { bg: '#c47a00',         ring: 'rgba(196,122,0,0.25)' },
    'NOT RECOMMENDED': { bg: '#cc3300',         ring: 'rgba(204,51,0,0.25)' },
};

const AIConsensusPanel = ({ recommendation = {}, featureScores = {} }) => {
    const { verdict, score, badges, insights } = recommendation;
    const vs = VERDICT_STYLE[verdict] || { bg: 'var(--brown)', ring: 'rgba(161,134,111,0.25)' };

    return (
        <div className="rounded-3xl p-8 md:p-10"
             style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid var(--beige-2)', boxShadow: '0 4px 24px rgba(120,90,60,0.08)' }}>
            <div className="flex flex-col md:flex-row gap-10">

                {/* ── VERDICT CIRCLE ── */}
                <div className="flex flex-col items-center justify-center flex-shrink-0">
                    <div className="w-40 h-40 rounded-full flex flex-col items-center justify-center text-white relative"
                         style={{
                             background: vs.bg,
                             boxShadow: `0 12px 40px ${vs.ring}, 0 0 0 12px ${vs.ring}`,
                         }}>
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] opacity-80 mb-0.5">AI Verdict</span>
                        <span className="text-2xl font-black tracking-tight">{verdict || 'ANALYZING'}</span>
                        <span className="text-lg font-bold opacity-90">{score || 0}%</span>
                    </div>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {badges?.map((b, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                                  style={{ background: 'var(--beige)', color: 'var(--olive)', border: '1px solid rgba(112,130,56,0.2)' }}>
                                {b}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── DETAILS ── */}
                <div className="flex-1 space-y-8">
                    {/* Feature bars */}
                    {Object.keys(featureScores).length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-lt)' }}>
                                Feature Match Score
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(featureScores).map(([feat, s]) => (
                                    <div key={feat} className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-md)' }}>{feat}</span>
                                            <span className="text-[10px] font-black" style={{ color: 'var(--olive)' }}>{s}%</span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--beige-2)' }}>
                                            <div className="h-full rounded-full transition-all duration-700"
                                                 style={{ width: `${s}%`, background: 'var(--olive)' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pros / Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6"
                         style={{ borderTop: '1px solid var(--beige-2)' }}>
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest mb-3"
                                style={{ color: 'var(--olive)' }}>Key Strengths</h5>
                            <ul className="space-y-2">
                                {insights?.pros?.map((p, i) => (
                                    <li key={i} className="flex gap-2 text-xs" style={{ color: 'var(--text-md)' }}>
                                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--olive)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest mb-3"
                                style={{ color: '#cc3300' }}>Potential Risks</h5>
                            <ul className="space-y-2">
                                {insights?.cons?.map((c, i) => (
                                    <li key={i} className="flex gap-2 text-xs" style={{ color: 'var(--text-md)' }}>
                                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#cc3300' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConsensusPanel;
