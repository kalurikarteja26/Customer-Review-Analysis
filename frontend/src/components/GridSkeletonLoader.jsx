import React from 'react';

const GridSkeletonLoader = () => {
    // Generate 8 skeleton cards to mimic a full grid of results
    const cards = Array.from({ length: 8 });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start fade-in">
            {cards.map((_, idx) => (
                <div 
                    key={idx} 
                    className="product-card flex flex-col relative animate-pulse"
                    style={{ animationDelay: `${idx * 0.1}s`, cursor: 'default' }}
                >
                    {/* Image Skeleton */}
                    <div className="relative overflow-hidden w-full" style={{ height: '230px', background: 'var(--beige-2)' }}>
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 1.5s infinite' }} />
                    </div>

                    {/* Body Skeleton */}
                    <div className="p-5 flex flex-col flex-1 bg-white">
                        {/* Tags & Stars */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex gap-2">
                                <div className="h-4 w-8 rounded-full" style={{ background: 'var(--beige)' }} />
                                <div className="h-4 w-8 rounded-full" style={{ background: 'var(--beige)' }} />
                            </div>
                            <div className="h-4 w-16 rounded" style={{ background: 'var(--beige)' }} />
                        </div>

                        {/* Title Lines */}
                        <div className="h-4 w-full rounded mb-2 mt-1" style={{ background: 'var(--beige)' }} />
                        <div className="h-4 w-2/3 rounded mb-6" style={{ background: 'var(--beige)' }} />

                        {/* Footer (Price & Button) */}
                        <div className="flex flex-col gap-3 pt-4 mt-auto" style={{ borderTop: '1px solid var(--beige-2)' }}>
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <div className="h-2 w-10 rounded" style={{ background: 'var(--beige-2)' }} />
                                    <div className="h-6 w-20 rounded" style={{ background: 'var(--beige)' }} />
                                </div>
                                <div className="h-5 w-14 rounded-md" style={{ background: 'var(--beige)' }} />
                            </div>
                            
                            {/* Check Deals Button Skeleton */}
                            <div className="w-full h-9 mt-2 rounded-xl" style={{ background: 'var(--beige-2)' }} />
                        </div>
                    </div>
                </div>
            ))}
            
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default GridSkeletonLoader;
