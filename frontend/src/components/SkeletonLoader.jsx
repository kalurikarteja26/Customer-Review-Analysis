import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Product Hero Skeleton */}
      <div className="bg-gray-200 dark:bg-zinc-800 h-64 rounded-3xl w-full"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 dark:bg-zinc-800 h-48 rounded-2xl w-full"></div>
            <div className="bg-gray-200 dark:bg-zinc-800 h-48 rounded-2xl w-full"></div>
          </div>
          <div className="bg-gray-200 dark:bg-zinc-800 h-64 rounded-2xl w-full"></div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-4 bg-gray-200 dark:bg-zinc-800 h-[750px] rounded-2xl w-full"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
