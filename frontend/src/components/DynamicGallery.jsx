import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DynamicGallery = ({ images = [] }) => {
    const [selected, setSelected] = useState(0);
    const safeImages = images && images.length > 0 ? images : ["/placeholder-product.png"];

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-white/20 dark:border-zinc-800/50 shadow-xl">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selected}
                        src={safeImages[selected]}
                        alt={`Product ${selected}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full object-contain p-8 drop-shadow-2xl"
                    />
                </AnimatePresence>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {safeImages.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setSelected(i)}
                        className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                            selected === i ? 'border-indigo-500 scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                        }`}
                    >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DynamicGallery;
