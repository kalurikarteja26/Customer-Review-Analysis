import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="w-full space-y-8 animate-pulse fade-in" style={{ cursor: 'default' }}>
      {/* Product Hero Skeleton */}
      <div className="rounded-3xl w-full relative overflow-hidden" style={{ height: '340px', background: 'var(--beige-2)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 1.5s infinite' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-48 rounded-2xl w-full relative overflow-hidden" style={{ background: 'var(--beige-2)' }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 1.5s infinite' }} />
            </div>
            <div className="h-48 rounded-2xl w-full relative overflow-hidden" style={{ background: 'var(--beige-2)' }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 1.5s infinite' }} />
            </div>
          </div>
          <div className="h-64 rounded-2xl w-full relative overflow-hidden" style={{ background: 'var(--beige-2)' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 1.5s infinite' }} />
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-4 h-[750px] rounded-2xl w-full relative overflow-hidden" style={{ background: 'var(--beige-2)' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </div>
      
      <style>{`
          @keyframes shimmer {
              100% { transform: translateX(100%); }
          }
      `}</style>
    </div>
  );
};

export default SkeletonLoader;
