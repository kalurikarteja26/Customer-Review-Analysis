import React from 'react';
import { ThumbsUp, ThumbsDown, Zap } from 'lucide-react';

const ReviewSummary = ({ summary = {} }) => {
  const safeSummary = summary || {};
  const positiveHighlights = Array.isArray(safeSummary?.positive_highlights) ? safeSummary.positive_highlights : [];
  const negativeHighlights = Array.isArray(safeSummary?.negative_highlights) ? safeSummary.negative_highlights : [];

  if (!safeSummary?.overall_summary && positiveHighlights.length === 0 && negativeHighlights.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm text-center">
        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No AI consensus data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Review Insights</h3>
      </div>

      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
        <p className="text-sm text-indigo-900 dark:text-indigo-200 italic">
          "{safeSummary?.overall_summary || 'No overall summary generated.'}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-3">
            <ThumbsUp className="w-4 h-4" /> Positive Highlights
          </h4>
          <ul className="space-y-2">
            {positiveHighlights.length > 0 ? positiveHighlights.map((h, i) => (
              <li key={i} className="text-xs text-gray-600 dark:text-zinc-400 border-l-2 border-emerald-500 pl-3 py-1">
                {h}
              </li>
            )) : (
              <li className="text-xs text-zinc-400 italic">No specific positive highlights identified.</li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-3">
            <ThumbsDown className="w-4 h-4" /> Negative Highlights
          </h4>
          <ul className="space-y-2">
            {negativeHighlights.length > 0 ? negativeHighlights.map((h, i) => (
              <li key={i} className="text-xs text-gray-600 dark:text-zinc-400 border-l-2 border-rose-500 pl-3 py-1">
                {h}
              </li>
            )) : (
              <li className="text-xs text-zinc-400 italic">No specific negative highlights identified.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;
