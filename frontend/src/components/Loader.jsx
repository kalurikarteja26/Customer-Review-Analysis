import React from 'react';

const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center p-12">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-gray-100 dark:border-zinc-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">
                Analyzing Product Data...
            </p>
        </div>
    );
};

export default Loader;
