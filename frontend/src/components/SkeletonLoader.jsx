import React from 'react';

const SkeletonLoader = () => {
    // Reusable shimmer block
    const ShimmerBlock = ({ className }) => (
        <div className={`relative overflow-hidden bg-white/5 ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
        </div>
    );

    return (
        <div className="w-full flex flex-col gap-6">
            
            <div className="bloomberg-panel p-6 border-t-4 border-t-white/10 flex justify-between items-center gap-4">
                 <div>
                     <ShimmerBlock className="w-24 h-4 mb-2 rounded" />
                     <ShimmerBlock className="w-64 h-8 rounded" />
                     <ShimmerBlock className="w-48 h-4 mt-2 rounded" />
                 </div>
                 <div className="flex flex-col items-end">
                      <ShimmerBlock className="w-20 h-3 mb-2 rounded" />
                      <ShimmerBlock className="w-32 h-10 rounded border border-white/10" />
                 </div>
            </div>

            <div className="glass-panel p-6 lg:p-8 bg-white/5 border border-white/10 rounded-xl mb-4">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3">
                         <ShimmerBlock className="aspect-square rounded-xl" />
                    </div>
                    <div className="w-full md:w-2/3 flex flex-col justify-between py-2">
                        <div>
                             <ShimmerBlock className="w-32 h-4 mb-2 rounded" />
                             <ShimmerBlock className="w-3/4 h-10 mb-6 rounded" />
                             <ShimmerBlock className="w-48 h-6 mb-6 rounded" />
                             <ShimmerBlock className="w-full h-24 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1 bg-surface border border-white/5 rounded-xl p-5 h-[400px] flex flex-col gap-4">
                     <ShimmerBlock className="h-6 w-1/3 mb-2 rounded" />
                     <ShimmerBlock className="flex-1 rounded-lg" />
                 </div>
                 <div className="lg:col-span-2 bg-surface border border-white/5 rounded-xl p-5 h-[400px] flex flex-col gap-4">
                     <ShimmerBlock className="h-6 w-1/4 rounded" />
                     <ShimmerBlock className="flex-1 rounded-lg" />
                 </div>
            </div>

        </div>
    );
};

export default SkeletonLoader;
