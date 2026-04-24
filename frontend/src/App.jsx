import React from 'react';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  return (
    <div className="font-sans min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-zinc-900 dark:via-black dark:to-black opacity-70"></div>
      
      <Header />
      <Home />
      
    </div>
  );
}

export default App;
