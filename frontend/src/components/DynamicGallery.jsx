import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff, ZoomIn } from 'lucide-react';

const VIEW_FALLBACK_LABELS = ['Profile View', 'Top View', 'Heel View', 'Sole View'];

const DynamicGallery = ({ images, name, viewLabels }) => {
    // Default to 4th slot (Sole View, index 3) per the Master UI spec
    const defaultActive = images && images.length >= 4 ? 3 : 0;
    const [activeIndex, setActiveIndex] = useState(defaultActive);

    // Sync-State: reset when a new product's images arrive
    useEffect(() => {
        const newDefault = images && images.length >= 4 ? 3 : 0;
        setActiveIndex(newDefault);
    }, [images]);

    const labels = viewLabels || VIEW_FALLBACK_LABELS;

    // ── Empty state ──
    if (!images || images.length === 0) {
        return (
            <div className="w-full flex items-center justify-center bg-black/40 rounded-xl border border-white/5 border-dashed min-h-[340px]">
                <div className="flex flex-col items-center gap-3 text-textMuted">
                    <ImageOff className="w-10 h-10 opacity-30" />
                    <p className="font-mono text-xs uppercase tracking-widest">Image Gallery Unavailable</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row gap-3 w-full h-full min-h-[340px]">

            {/* ── LEFT: Vertical Thumbnail Strip ── */}
            <div className="flex flex-col gap-2 flex-shrink-0 w-[80px]">
                {images.map((img, idx) => {
                    const isActive = activeIndex === idx;
                    const label = labels[idx] || `View ${idx + 1}`;
                    return (
                        <button
                            key={`thumb-${idx}`}
                            onClick={() => setActiveIndex(idx)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            title={label}
                            className={`
                                relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200
                                flex flex-col items-center
                                ${isActive
                                    ? 'border-primary shadow-[0_0_14px_rgba(99,102,241,0.55)] opacity-100 scale-[1.04]'
                                    : 'border-white/10 opacity-45 hover:opacity-80 hover:border-white/30 hover:scale-[1.02]'}
                            `}
                            style={{ height: '72px' }}
                        >
                            <img
                                src={img}
                                alt={label}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200';
                                }}
                            />
                            {/* Active glow overlay */}
                            {isActive && (
                                <div className="absolute inset-0 bg-primary/15 pointer-events-none" />
                            )}
                            {/* View label strip at bottom */}
                            <div className={`
                                absolute bottom-0 left-0 right-0 text-[7px] font-mono uppercase tracking-wider text-center py-[2px] truncate
                                ${isActive ? 'bg-primary/80 text-white' : 'bg-black/60 text-textMuted'}
                            `}>
                                {label.split(' ')[0]}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ── RIGHT: Hero Stage ── */}
            <div className="flex-1 relative rounded-xl border border-white/10 overflow-hidden group bg-black/40 cursor-zoom-in">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={`hero-${activeIndex}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.01 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        src={images[activeIndex]}
                        alt={`${name} — ${labels[activeIndex] || 'View'}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=900';
                        }}
                    />
                </AnimatePresence>

                {/* Top-left: Active view label badge */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border border-primary/40 text-primary text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded z-10">
                    {labels[activeIndex] || `View ${activeIndex + 1}`}
                </div>

                {/* Top-right: Slot counter */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-[9px] text-textMuted font-mono px-2 py-1 rounded border border-white/10 z-10">
                    {activeIndex + 1} / {images.length}
                </div>

                {/* Hover zoom indicator */}
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-black/75 backdrop-blur-sm border border-white/15 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ZoomIn className="w-3 h-3 text-amber-400" />
                    <span className="text-[9px] text-white font-mono uppercase tracking-widest">Zoom Active</span>
                </div>

                {/* Sentix-Prime technical overlay — bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 z-10 pointer-events-none">
                    <p className="text-[8px] font-mono text-white/40 uppercase tracking-[0.15em]">
                        Sentix-Prime · Hero-Mapped · Asset {activeIndex + 1}/{images.length}
                    </p>
                </div>
            </div>

        </div>
    );
};

export default DynamicGallery;
