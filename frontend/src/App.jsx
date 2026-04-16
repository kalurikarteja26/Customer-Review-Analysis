import React, { createContext, useState } from 'react';
import Navigation from './components/Navigation';
import ProductHero from './components/ProductHero';
import SentimentAnalyzer from './components/SentimentAnalyzer';
import InsightDashboard from './components/InsightDashboard';

// Create a global context for product data and analysis state
export const AppContext = createContext();

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <AppContext.Provider value={{ analysisResult, setAnalysisResult, isAnalyzing, setIsAnalyzing }}>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navigation />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header section with product info */}
          <ProductHero />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input and immediate result module */}
            <SentimentAnalyzer />
            
            {/* Extended dashboard data module */}
            <InsightDashboard />
          </div>
        </main>
      </div>
    </AppContext.Provider>
  );
}

export default App;
