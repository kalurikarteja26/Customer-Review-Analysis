import React from 'react';

const ReviewSummary = ({ summary = {} }) => {
    const s = summary || {};
    const pos = Array.isArray(s?.positive_highlights) ? s.positive_highlights : [];
    const neg = Array.isArray(s?.negative_highlights) ? s.negative_highlights : [];

    if (!s?.overall_summary && pos.length === 0 && neg.length === 0) {
        return (
            <div className="p-8 text-center rounded-2xl"
                 style={{ background: 'var(--beige)', border: '1.5px dashed var(--beige-2)' }}>
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-lt)' }}>
                    No review insights available
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl p-6 space-y-6"
             style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid var(--beige-2)' }}>
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: 'var(--olive)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="font-black text-base uppercase tracking-wider" style={{ color: 'var(--text)' }}>AI Review Insights</h3>
            </div>

            {s?.overall_summary && (
                <div className="p-4 rounded-xl italic text-sm"
                     style={{ background: 'rgba(112,130,56,0.07)', border: '1px solid rgba(112,130,56,0.15)', color: 'var(--text-md)' }}>
                    "{s.overall_summary}"
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--olive)' }}>
                        ✓ Positive Highlights
                    </h4>
                    <ul className="space-y-2">
                        {pos.length > 0 ? pos.map((h, i) => (
                            <li key={i} className="text-xs pl-3 py-1"
                                style={{ color: 'var(--text-md)', borderLeft: '2px solid var(--olive)' }}>
                                {h}
                            </li>
                        )) : (
                            <li className="text-xs italic" style={{ color: 'var(--text-lt)' }}>No highlights identified.</li>
                        )}
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#cc3300' }}>
                        ✗ Negative Highlights
                    </h4>
                    <ul className="space-y-2">
                        {neg.length > 0 ? neg.map((h, i) => (
                            <li key={i} className="text-xs pl-3 py-1"
                                style={{ color: 'var(--text-md)', borderLeft: '2px solid #cc3300' }}>
                                {h}
                            </li>
                        )) : (
                            <li className="text-xs italic" style={{ color: 'var(--text-lt)' }}>No highlights identified.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReviewSummary;
