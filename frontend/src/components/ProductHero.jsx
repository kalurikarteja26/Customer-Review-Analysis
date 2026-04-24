import React from 'react';
import { motion } from 'framer-motion';
import DynamicGallery from './DynamicGallery';

const ProductHero = ({ product = {} }) => {
    const safeProduct = product || {};
    if (Object.keys(safeProduct).length === 0) return null;

    const sourceColors = {
        amazon: 'from-orange-500 to-amber-500',
        flipkart: 'from-blue-600 to-indigo-500',
        myntra: 'from-pink-500 to-rose-400',
        meesho: 'from-purple-600 to-indigo-500',
        ajio: 'from-teal-500 to-cyan-400',
        snapdeal: 'from-red-600 to-rose-500',
        default: 'from-gray-600 to-zinc-500'
    };

    const platform = safeProduct?.platform?.toLowerCase() || 'default';
    const sourceGradient = sourceColors[platform] || sourceColors.default;
    const productImage = safeProduct?.image || "/placeholder-product.png";

    return (
        <div className="w-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-zinc-800/50 shadow-2xl overflow-hidden mb-8">
            <div className="flex flex-col lg:flex-row">
                {/* Visual Section */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col relative bg-gradient-to-br from-indigo-50/30 to-white/30 dark:from-zinc-950/30 dark:to-zinc-900/30">
                    <div className="absolute top-8 left-8 flex flex-col gap-3 z-20">
                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg bg-gradient-to-r ${sourceGradient}`}>
                            {safeProduct?.platform || 'Verified Source'}
                        </span>
                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md border ${
                            safeProduct?.stock === 'In Stock' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                            safeProduct?.stock === 'Limited Stock' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}>
                            {safeProduct?.stock || 'STOCK UNKNOWN'}
                        </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center pt-16">
                        <DynamicGallery images={safeProduct?.images?.length > 0 ? safeProduct.images : [productImage]} />
                    </div>

                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]"></div>
                </div>

                {/* Intel Section */}
                <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center border-l border-white/10 dark:border-zinc-800/50">
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                            {safeProduct?.title || 'Unknown Product Information'}
                        </h1>

                        <div className="flex items-center gap-8 mb-10">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Exchange Value</span>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                        {safeProduct?.price ? `₹${safeProduct.price.toLocaleString()}` : 'N/A'}
                                    </span>
                                    {safeProduct?.original_price && (
                                        <span className="text-lg text-zinc-400 line-through font-bold">
                                            ₹{safeProduct.original_price.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {safeProduct?.discount && (
                                <div className="px-4 py-2 bg-rose-500 text-white text-xs font-black rounded-xl animate-pulse shadow-lg shadow-rose-500/40">
                                    {safeProduct.discount}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Category Intel</span>
                                <p className="text-lg font-bold text-gray-800 dark:text-zinc-200">
                                    {Array.isArray(safeProduct?.category) ? safeProduct.category[safeProduct.category.length - 1] : (safeProduct?.category || 'General Intelligence')}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Market Sentiment</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-black text-gray-900 dark:text-white">{safeProduct?.rating || '0.0'}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <svg 
                                                key={i} 
                                                className={`w-5 h-5 ${i < Math.floor(parseFloat(safeProduct?.rating || 0)) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-200 dark:text-zinc-800'}`} 
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-12">
                            {Object.entries(safeProduct?.specifications || {}).slice(0, 4).map(([key, val]) => (
                                <div key={key} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 flex flex-col">
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">{key}</span>
                                    <span className="text-xs font-black text-gray-800 dark:text-zinc-100 truncate max-w-[150px]">{val}</span>
                                </div>
                            ))}
                        </div>

                        <a 
                            href={safeProduct?.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full group relative inline-flex items-center justify-center px-8 py-6 font-black text-white transition-all duration-300 bg-indigo-600 rounded-[2rem] hover:bg-indigo-700 focus:outline-none shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] active:scale-95"
                        >
                            <span>VIEW ON {platform.toUpperCase()} PLATFORM</span>
                            <svg className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                        </a>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductHero;
