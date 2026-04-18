import React, { useContext } from 'react';
import { BrainCircuit, Loader2, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';
import LivePulseFeed from './LivePulseFeed';
import HistoricalTrendChart from './HistoricalTrendChart';

const InsightDashboard = () => {
    const { analysisResult, isAnalyzing } = useContext(AppContext);

    const getTrajectoryUI = (trajectory) => {
        if (trajectory === 'Improving') return <span className="text-positive flex items-center gap-1"><ArrowUpRight className="w-5 h-5"/> Improving</span>;
        if (trajectory === 'Declining') return <span className="text-negative flex items-center gap-1"><ArrowDownRight className="w-5 h-5"/> Declining</span>;
        return <span className="text-neutral flex items-center gap-1"><Minus className="w-5 h-5"/> Stable</span>;
    };

    return (
        <div className="w-full relative mt-6">
            <AnimatePresence mode="wait">
                {!analysisResult && !isAnalyzing && (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="bloomberg-panel p-12 text-center text-textMuted border-dashed border-2 flex flex-col items-center justify-center min-h-[400px]"
                    >
                        <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-mono text-sm tracking-widest uppercase">System Standby</p>
                        <p className="text-xs mt-2 opacity-50">Mount a stream via the Universal Ingestor to initialize data lakes.</p>
                    </motion.div>
                )}

                {isAnalyzing && (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="bloomberg-panel p-12 text-center text-primary flex flex-col items-center justify-center min-h-[400px]"
                    >
                        <Loader2 className="w-12 h-12 mb-4 animate-spin opacity-80" />
                        <p className="font-mono text-sm tracking-widest uppercase">Fetching Multi-Stream Intelligence...</p>
                    </motion.div>
                )}

                {analysisResult && (
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Zone A: Live Stream */}
                        <div className="lg:col-span-1">
                            <LivePulseFeed liveFeed={analysisResult.live_feed} />
                        </div>

                        {/* Zone B: Historical Trend */}
                        <div className="lg:col-span-2">
                            <HistoricalTrendChart 
                                historicalTrend={analysisResult.historical_trend} 
                                historicalAvg={analysisResult.historical_average_score} 
                            />
                        </div>

                        {/* Zone C: Aggregate AI Summary */}
                        <div className="lg:col-span-3 bloomberg-panel p-6 mt-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            
                            <div className="flex items-center gap-2 mb-6 text-textMuted border-b border-white/10 pb-4">
                                <BrainCircuit className="w-5 h-5 text-primary" />
                                <h3 className="font-mono text-sm tracking-widest uppercase">Zone C: LLM Consensus Layer</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="col-span-1 border-r border-white/10 pr-6">
                                    <p className="text-xs text-textMuted uppercase tracking-wider mb-2 font-mono">Current Trajectory</p>
                                    <div className="text-2xl font-bold font-sans">
                                        {getTrajectoryUI(analysisResult.sentiment_trajectory)}
                                    </div>
                                    <div className="mt-6">
                                        <p className="text-xs text-textMuted uppercase tracking-wider mb-1 font-mono">Live Sync Score</p>
                                        <p className="text-4xl font-black text-white">{analysisResult.current_sentiment_score} <span className="text-xl text-textMuted font-normal">/ 5.0</span></p>
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-3">
                                    <h4 className="text-xs text-primary font-mono uppercase tracking-widest mb-3">Executive Summary</h4>
                                    <p className="text-lg text-textMain/90 leading-relaxed font-sans border-l-2 border-primary/50 pl-4 py-1 italic bg-white/5 rounded-r">
                                        "{analysisResult.aggregate_summary}"
                                    </p>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InsightDashboard;
