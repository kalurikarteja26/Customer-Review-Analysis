import React from 'react';

const LivePulseFeed = ({ reviews = [] }) => {
    const safeReviews = Array.isArray(reviews) ? reviews : [];

    if (safeReviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400 dark:text-zinc-600 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-white/20 dark:border-zinc-800/50 shadow-xl">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                <p className="text-lg font-medium">No Live Feedback Detected</p>
                <p className="text-sm">Real-time signals will appear here once extracted.</p>
            </div>
        );
    }

    const getSentimentStyles = (sentiment) => {
        switch (sentiment?.toLowerCase()) {
            case 'positive':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'negative':
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            default:
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-zinc-800/50 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 dark:border-zinc-800/50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    Live Pulse Feed
                </h3>
                <span className="text-xs font-semibold px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">
                    {safeReviews.length} Recent Signals
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {safeReviews.map((review, idx) => (
                    <div 
                        key={review?.id || idx} 
                        className="group relative bg-white/60 dark:bg-zinc-800/40 p-5 rounded-2xl border border-white/20 dark:border-zinc-700/30 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 fade-in"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {(review?.author || 'C')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100 leading-none mb-1">{review?.author || 'Verified Customer'}</h4>
                                    <span className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase font-bold tracking-widest">{review?.date || 'Recently'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getSentimentStyles(review?.sentiment_label)}`}>
                                    {review?.sentiment_label || 'Neutral'}
                                </div>
                                {(review?.fake_probability || 0) > 0.6 && (
                                    <div className="text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded animate-pulse">
                                        Suspicious
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-zinc-300 text-sm leading-relaxed mb-3">
                            "{review?.text || 'No feedback provided.'}"
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg 
                                        key={i} 
                                        className={`w-3 h-3 ${i < Math.round(parseFloat(review?.rating || 0)) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300 dark:text-zinc-700'}`} 
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                ))}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                                AI Confidence: {Math.round((1 - (review?.fake_probability || 0)) * 100)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LivePulseFeed;
