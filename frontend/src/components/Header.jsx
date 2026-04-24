import React from 'react';

const Header = () => {
    return (
        <header className="fixed top-0 w-full glassmorphism z-50 border-b border-gray-200/20 shadow-sm backdrop-blur-md bg-white/70 shadow-black/5 dark:bg-zinc-900/70 dark:border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 text-white p-2 rounded-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Universal Product Analyzer
                    </h1>
                </div>
            </div>
        </header>
    );
};

export default Header;
