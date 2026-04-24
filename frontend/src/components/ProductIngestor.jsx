import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductIngestor = ({ onSearch, isLoading }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input && !isLoading) {
            onSearch(input);
        }
    };

    return (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-4xl mx-auto mb-16 px-4"
        >
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.2rem] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col md:flex-row items-center bg-white dark:bg-zinc-900 rounded-[2rem] p-3 shadow-2xl border border-white/20 dark:border-zinc-800/50">
                    <div className="pl-6 text-indigo-500 hidden md:block">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Search any product across platforms (e.g. best noise cancelling headphones)"
                        className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-lg text-gray-800 dark:text-zinc-100 font-medium placeholder-gray-400 dark:placeholder-zinc-600"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        disabled={isLoading || !input}
                        className={`w-full md:w-auto px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 ${
                            isLoading || !input 
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white shadow-[0_10px_30px_-5px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:scale-[1.02] active:scale-95'
                        }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                DISCOVERING
                            </span>
                        ) : 'DISCOVER PRODUCTS'}
                    </button>
                </div>
            </form>
            
            <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-10">
                {['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Snapdeal', 'Meesho', 'Nykaa', 'Croma'].map((site) => (
                    <div key={site} className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-all duration-500 group cursor-default">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400">{site}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default ProductIngestor;
