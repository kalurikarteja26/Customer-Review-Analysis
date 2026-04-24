import React from 'react';
import { motion } from 'framer-motion';

const AIConsensusPanel = ({ recommendation = {}, featureScores = {} }) => {
    const { verdict, score, badges, insights } = recommendation;
    
    const verdictColors = {
        'BUY': 'from-emerald-500 to-teal-500 text-white shadow-emerald-500/50',
        'CONSIDER': 'from-amber-500 to-orange-500 text-white shadow-amber-500/50',
        'NOT RECOMMENDED': 'from-rose-500 to-pink-500 text-white shadow-rose-500/50'
    };

    const colorClass = verdictColors[verdict] || 'from-gray-500 to-zinc-500 text-white';

    return (
        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-zinc-800/50 shadow-2xl overflow-hidden p-10">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Verdict Circle */}
                <div className="flex flex-col items-center justify-center">
                    <motion.div 
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        className={`w-48 h-48 rounded-full bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center shadow-[0_20px_50px_-10px] relative`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">AI Verdict</span>
                        <span className="text-4xl font-black tracking-tighter mb-1">{verdict}</span>
                        <span className="text-xl font-bold opacity-90">{score}%</span>
                        
                        <div className="absolute inset-2 border-2 border-white/20 rounded-full border-t-white/80 animate-spin-slow"></div>
                    </motion.div>
                    
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {badges?.map((badge, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase rounded-full border border-indigo-500/20">
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-8">
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Feature Match Integrity</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(featureScores).map(([feature, score]) => (
                                <div key={feature} className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black uppercase text-gray-600 dark:text-zinc-400">{feature}</span>
                                        <span className="text-[10px] font-black text-indigo-500">{score}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            className="h-full bg-indigo-500 rounded-full"
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
                        <div>
                            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Key Strengths</h5>
                            <ul className="space-y-2">
                                {insights?.pros?.map((pro, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-gray-600 dark:text-zinc-400">
                                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        {pro}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">Potential Risks</h5>
                            <ul className="space-y-2">
                                {insights?.cons?.map((con, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-gray-600 dark:text-zinc-400">
                                        <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                        {con}
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
