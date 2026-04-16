import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, BarChart2, Hash, AlertTriangle } from 'lucide-react';
import { AppContext } from '../App';

const InsightDashboard = () => {
  const { analysisResult, isAnalyzing } = useContext(AppContext);

  const renderGauge = (confidence) => {
    const percentage = Math.round(confidence * 100);
    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent"
            className="text-slate-100" />
          <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray={226} strokeDashoffset={226 - (226 * percentage) / 100}
            className="text-blue-500 drop-shadow-md transition-all duration-1000 ease-out" />
        </svg>
        <span className="absolute text-xl font-bold text-slate-900">{percentage}%</span>
      </div>
    );
  };

  const statusColors = {
    'Positive': 'text-emerald-500 bg-emerald-50 ring-emerald-200',
    'Neutral': 'text-amber-500 bg-amber-50 ring-amber-200',
    'Negative': 'text-rose-600 bg-rose-50 ring-rose-200',
    'Sarcastic': 'text-indigo-600 bg-indigo-50 ring-indigo-200'
  };

  return (
    <div className="glass-panel p-6 lg:p-8 flex flex-col h-full bg-slate-50/50 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Insight Dashboard</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 text-slate-500 rounded shadow-sm">
          REST API Target
        </span>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        <AnimatePresence mode="wait">
          {!analysisResult && !isAnalyzing && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center"
            >
              <BarChart2 className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-sm">Awaiting input stream...</p>
              <p className="text-xs mt-1">Run an analysis to generate the Bayesian insight matrix.</p>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10"
            >
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {analysisResult && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="p-6 h-full flex flex-col"
            >
              {/* Top Row: KPIs */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-6">
                  {renderGauge(analysisResult.confidence)}
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">AI Confidence</h3>
                    <p className="text-sm text-slate-600">Model certainty</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-2">Overall Emotion</h3>
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ring-1 ring-inset ${statusColors[analysisResult.sentiment] || statusColors['Neutral']}`}>
                    {analysisResult.sentiment}
                  </span>
                </div>
              </div>

              {/* Middle Row: Keyword Extraction */}
              <div className="py-6 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Extracted Entities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.keywords && analysisResult.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Aspect-Based Sentiment */}
              <div className="pt-6 flex-1">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Dimension Breakdown
                </h3>
                <div className="space-y-4 text-sm">
                  {analysisResult.aspects && Object.entries(analysisResult.aspects).map(([aspect, rating], index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1 font-medium">
                        <span className="text-slate-700">{aspect}</span>
                        <span className="text-slate-900">{rating}/5</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(rating / 5) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + (index * 0.1) }}
                          className={`h-2 rounded-full ${rating >= 4 ? 'bg-emerald-500' : rating <= 2 ? 'bg-rose-500' : 'bg-amber-400'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InsightDashboard;
