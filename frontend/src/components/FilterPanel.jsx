import React, { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const PLATFORMS = ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Snapdeal', 'Meesho'];
const PLATFORM_COLORS = {
    amazon: '#e8650a', flipkart: '#1855d4', myntra: '#c21b6e',
    ajio: '#6340cc', snapdeal: '#cc3300', meesho: '#aa1faa',
};

const inputStyle = {
    width: '100%',
    padding: '0.6rem 1rem',
    borderRadius: '0.75rem',
    border: '1.5px solid var(--beige-2)',
    background: 'rgba(255,255,255,0.8)',
    color: 'var(--text)',
    fontSize: '0.85rem',
    outline: 'none',
};

const FilterPanel = ({ filters, onChange, availablePlatforms = [] }) => {
    const [open, setOpen] = useState(false);
    const { platforms, minPrice, maxPrice, minDiscount, brand } = filters;
    const hasActive = platforms.length > 0 || minPrice || maxPrice || minDiscount || brand;

    const togglePlatform = (p) => {
        const key = p.toLowerCase();
        const next = platforms.includes(key) ? platforms.filter(x => x !== key) : [...platforms, key];
        onChange({ ...filters, platforms: next });
    };

    return (
        <div style={{ maxWidth: '40rem' }}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: '1.5px solid var(--beige-2)',
                    color: 'var(--text-md)',
                    boxShadow: '0 2px 8px var(--shadow)',
                }}
            >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {hasActive && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--olive)' }} />}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="mt-3 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
                     style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid var(--beige-2)', boxShadow: '0 4px 20px var(--shadow)' }}>

                    {/* Platform */}
                    <div className="lg:col-span-4">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-lt)' }}>Platform</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => onChange({ ...filters, platforms: [] })}
                                className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all"
                                style={{
                                    background: platforms.length === 0 ? 'var(--olive)' : 'var(--beige)',
                                    color: platforms.length === 0 ? 'white' : 'var(--text-md)',
                                    border: '1px solid',
                                    borderColor: platforms.length === 0 ? 'var(--olive)' : 'var(--beige-2)',
                                }}
                            >All</button>
                            {PLATFORMS.filter(p => availablePlatforms.includes(p.toLowerCase())).map(p => {
                                const isActive = platforms.includes(p.toLowerCase());
                                const color = PLATFORM_COLORS[p.toLowerCase()];
                                return (
                                    <button key={p} onClick={() => togglePlatform(p)}
                                        className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all"
                                        style={{
                                            background: isActive ? color : 'var(--beige)',
                                            color: isActive ? 'white' : 'var(--text-md)',
                                            border: `1px solid ${isActive ? color : 'var(--beige-2)'}`,
                                            boxShadow: isActive ? `0 4px 12px ${color}44` : 'none',
                                        }}
                                    >{p}</button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Min Price */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-lt)' }}>Min Price (₹)</p>
                        <input type="number" placeholder="0" value={minPrice}
                            onChange={e => onChange({ ...filters, minPrice: e.target.value })}
                            style={inputStyle} />
                    </div>

                    {/* Max Price */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-lt)' }}>Max Price (₹)</p>
                        <input type="number" placeholder="Any" value={maxPrice}
                            onChange={e => onChange({ ...filters, maxPrice: e.target.value })}
                            style={inputStyle} />
                    </div>

                    {/* Brand */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-lt)' }}>Brand</p>
                        <input type="text" placeholder="e.g. Samsung, boAt" value={brand}
                            onChange={e => onChange({ ...filters, brand: e.target.value })}
                            style={inputStyle} />
                    </div>

                    {/* Min Discount */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-lt)' }}>
                            Min Discount: <span style={{ color: 'var(--olive)' }}>{minDiscount || 0}%</span>
                        </p>
                        <input type="range" min="0" max="90" step="5" value={minDiscount || 0}
                            onChange={e => onChange({ ...filters, minDiscount: e.target.value })}
                            style={{ width: '100%', accentColor: 'var(--olive)' }} />
                        <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-lt)' }}>
                            <span>0%</span><span>90%</span>
                        </div>
                    </div>

                    {/* Clear */}
                    {hasActive && (
                        <div className="lg:col-span-4 flex justify-end">
                            <button
                                onClick={() => onChange({ platforms: [], minPrice: '', maxPrice: '', minDiscount: 0, brand: '' })}
                                className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest transition-all"
                                style={{ color: '#cc3300' }}
                            >
                                <X className="w-3.5 h-3.5" /> Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
