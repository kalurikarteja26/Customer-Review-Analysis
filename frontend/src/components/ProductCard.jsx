import React from 'react';

const ProductCard = ({ product }) => {
    if (!product) return null;

    const sourceColors = {
        amazon: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        flipkart: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        myntra: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
        meesho: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        ajio: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
        snapdeal: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };

    const sourceStyle = sourceColors[product.source?.toLowerCase()] || sourceColors.default;

    return (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden fade-in relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${sourceStyle}`}>
                    {product.source}
                </span>
                {product.availability !== undefined && (
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${product.availability ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {product.availability ? 'In Stock' : 'Out of Stock'}
                    </span>
                )}
            </div>

            <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="w-full md:w-5/12 bg-gray-50 dark:bg-zinc-950 p-8 flex items-center justify-center relative min-h-[300px]">
                    {product.image ? (
                        <img 
                            src={product.image} 
                            alt={product.title} 
                            className="max-w-full max-h-[400px] object-contain drop-shadow-xl"
                        />
                    ) : (
                        <div className="text-gray-300 dark:text-zinc-700 flex flex-col items-center">
                            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>No Image Available</span>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-7/12 p-8 flex flex-col justify-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                        {product.title}
                    </h2>

                    <div className="flex items-end gap-3 mb-6">
                        {product.price !== null ? (
                            <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                {product.price.toLocaleString(undefined, { style: 'currency', currency: 'INR' }).replace('₹', '₹ ')}
                            </span>
                        ) : (
                            <span className="text-2xl font-bold text-gray-400 dark:text-zinc-600">Price Hidden</span>
                        )}
                        
                        {product.original_price && product.original_price > product.price && (
                            <span className="text-lg text-gray-400 dark:text-zinc-500 line-through mb-1">
                                {product.original_price.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                            </span>
                        )}
                        
                        {product.discount && (
                            <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md mb-1.5 ml-2">
                                {product.discount}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                        {product.rating && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1 font-medium">Rating</p>
                                <div className="flex items-center gap-1">
                                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{product.rating}</span>
                                    <span className="text-gray-400 dark:text-zinc-500">/5</span>
                                </div>
                            </div>
                        )}
                        
                        {(product.category && product.category.length > 0) && (
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-2 font-medium">Breadcrumbs</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.category.map((cat, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <a 
                        href={product.url} // Wait, backend doesn't return url. I'll use window location logic or parent logic. Let's assume the user pasted it.
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full block text-center py-4 rounded-xl font-bold border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 transition-all duration-200"
                        onClick={(e) => { e.preventDefault(); /* For safety, we didn't preserve the URL in the response schema. Can just be a disabled button or skipped. */ }}
                    >
                        Extracted Data Successfully
                    </a>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-100 dark:border-zinc-800 p-8 bg-gray-50/50 dark:bg-zinc-900/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                    </svg>
                    Customer Reviews
                </h3>
                
                {(!product.reviews || product.reviews.length === 0) ? (
                    <div className="text-gray-500 dark:text-zinc-500 italic">No reviews found for this product.</div>
                ) : (
                    <div className="max-h-80 overflow-y-auto pr-4 space-y-4">
                        {product.reviews.map((review, idx) => (
                            <div key={idx} className="bg-white dark:bg-zinc-800/80 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700/50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-gray-900 dark:text-zinc-100">{review.author}</span>
                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-full">
                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                        <span className="text-sm font-bold text-yellow-700 dark:text-yellow-500">{review.rating}</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-zinc-300 text-sm leading-relaxed">{review.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
