import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const SentimentAnalyzer = ({ productMeta, category }) => {
    const [reviewText, setReviewText] = useState('');
    const [sentiment, setSentiment] = useState('Positive');
    const [draft, setDraft] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!reviewText) return;
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${API_URL}/draft-response`, {
                review_text: reviewText,
                sentiment: sentiment,
                product_name: productMeta?.name || 'Product',
                category: category || 'General',
                attributes: {}
            });
            setDraft(response.data.draft);
        } catch (error) {
            console.error("Draft generation failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-zinc-800/50 shadow-2xl p-8 mt-12">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="p-2 bg-indigo-500 rounded-lg text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </span>
                Agentic Response Architect
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Inbound Review Text</label>
                    <textarea
                        className="w-full h-40 p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 text-sm text-gray-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Paste a customer review here to generate a high-context response..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Detected Sentiment</label>
                            <select
                                className="w-full p-3 rounded-xl bg-white/50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold outline-none"
                                value={sentiment}
                                onChange={(e) => setSentiment(e.target.value)}
                            >
                                <option value="Positive">Positive</option>
                                <option value="Neutral">Neutral</option>
                                <option value="Negative">Negative</option>
                            </select>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !reviewText}
                            className="flex-1 mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Architecting...' : 'Generate Intel Draft'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">AI Generated Draft Response</label>
                    <div className="w-full h-[228px] p-6 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {draft ? (
                                <motion.p
                                    key="draft"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-gray-800 dark:text-zinc-200 text-sm leading-relaxed"
                                >
                                    {draft}
                                </motion.p>
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 italic text-sm text-center"
                                >
                                    <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                    </svg>
                                    Awaiting input for drafting...
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {draft && (
                            <button
                                onClick={() => navigator.clipboard.writeText(draft)}
                                className="absolute bottom-4 right-4 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform"
                                title="Copy to clipboard"
                            >
                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SentimentAnalyzer;
