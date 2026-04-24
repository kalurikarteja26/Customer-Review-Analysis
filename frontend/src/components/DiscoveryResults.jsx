import React from 'react';
import { motion } from 'framer-motion';

const DiscoveryResults = ({ results = [], onSelect }) => {
    if (!results || results.length === 0) {
        return (
            <div className="w-full mt-12 p-12 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No products found matching your search</p>
            </div>
        );
    }

    return (
        <div className="w-full mt-12 fade-in px-4">
            <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white uppercase tracking-tighter flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-indigo-500"></span>
                    Top AI Discoveries
                </div>
                <span className="text-xs font-black text-indigo-500 bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/20">
                    {results.length} Market Matches Found
                </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {(results || []).map((product, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -12 }}
                        className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-zinc-800/50 flex flex-col group cursor-pointer relative"
                        onClick={() => onSelect && onSelect(product)}
                    >
                        <div className="relative h-72 overflow-hidden bg-gray-100 dark:bg-zinc-800">
                            <img 
                                src={product?.image || "/placeholder-product.png"} 
                                alt={product?.title || "Product"}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => { e.target.src = "/placeholder-product.png"; }}
                            />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-indigo-600/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
                                <div className="bg-white text-indigo-600 font-black text-xs px-6 py-3 rounded-full uppercase tracking-widest shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    View AI Intel
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                {product?.recommendation?.badges?.map((badge, i) => (
                                    <span key={i} className="bg-white/90 backdrop-blur-md text-gray-900 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 flex flex-col flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
                                    {product?.platform || 'Store'}
                                </span>
                                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                                    <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-xs font-black text-gray-700 dark:text-zinc-300">{product?.rating || '0.0'}</span>
                                </div>
                            </div>
                            
                            <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100 line-clamp-2 mb-6 group-hover:text-indigo-500 transition-colors">
                                {product?.title || 'Discovering Details...'}
                            </h4>
                            
                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex flex-col">
                                    {product?.original_price && product.original_price !== 'N/A' && product.original_price !== product.price && (
                                        <span className="text-[10px] text-zinc-500 line-through mb-0.5">
                                            ₹{product.original_price}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-gray-900 dark:text-white">
                                            {product?.price && !product.price.includes('N/A') ? `₹${product.price}` : 'TBD'}
                                        </span>
                                        {product?.discount_percentage > 0 && (
                                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                                {product.discount_percentage}% OFF
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {product?.recommendation?.verdict && (
                                    <div className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter ${
                                        product.recommendation.verdict === 'BUY' ? 'bg-green-500/10 text-green-500' :
                                        product.recommendation.verdict === 'CONSIDER' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-red-500/10 text-red-500'
                                    }`}>
                                        {product.recommendation.verdict}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DiscoveryResults;
