import React, { useState } from 'react';

const PLATFORMS = ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Snapdeal', 'Meesho'];

const ProductIngestor = ({ onSearch, isLoading }) => {
    const [input, setInput] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

    const togglePlatform = (site) => {
        const platform = site.toLowerCase();
        setSelectedPlatforms(prev => 
            prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) onSearch({ query: input.trim(), platforms: selectedPlatforms });
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="search-wrap flex items-center gap-3 px-5 py-3">
                    {/* Search icon */}
                    <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--brown)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    <input
                        type="text"
                        id="main-search-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Search any product, brand, or category…"
                        className="flex-1 bg-transparent border-none outline-none text-base font-medium"
                        style={{ color: 'var(--text)', caretColor: 'var(--olive)' }}
                        disabled={isLoading}
                        autoComplete="off"
                        autoFocus
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="btn-primary flex items-center gap-2 flex-shrink-0"
                        style={{ padding: '0.6rem 1.4rem', fontSize: '0.72rem' }}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Searching
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Discover
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Platform tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {PLATFORMS.map(site => {
                    const platform = site.toLowerCase();
                    const isSelected = selectedPlatforms.includes(platform);
                    return (
                        <button
                            key={site}
                            type="button"
                            onClick={() => togglePlatform(site)}
                            className={`platform-pill pill-${platform} transition-all duration-200 flex items-center gap-1.5 px-3 py-1`}
                            style={{ 
                                opacity: isSelected ? 1 : 0.7,
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                cursor: 'pointer',
                                border: isSelected ? '1.5px solid currentColor' : '1.5px solid transparent'
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor', opacity: 1 }} />
                            {site}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductIngestor;
