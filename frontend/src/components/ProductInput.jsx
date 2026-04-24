import React, { useState } from 'react';

const ProductInput = ({ onAnalyze, isLoading }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url.trim()) {
            onAnalyze(url.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-10 group">
            <div className="relative flex items-center bg-white dark:bg-zinc-800 rounded-2xl shadow-xl shadow-indigo-100/50 dark:shadow-black/20 border border-gray-100 dark:border-zinc-700/50 focus-within:ring-4 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all duration-300">
                <div className="pl-6 text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
                <input 
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste product URL from Amazon, Flipkart, Meesho, etc..."
                    className="w-full pl-4 pr-32 py-5 bg-transparent border-none focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-lg"
                    required
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !url.trim()}
                    className="absolute right-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors duration-200"
                >
                    Analyze Product
                </button>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm font-medium text-gray-500 dark:text-zinc-500">
                <span>Supported:</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md">Amazon</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md">Flipkart</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md">Meesho</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md">Myntra</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md">Ajio</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md">Snapdeal</span>
            </div>
        </form>
    );
};

export default ProductInput;
