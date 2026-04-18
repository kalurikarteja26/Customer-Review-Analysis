import React, { useState } from 'react';
import { Search, Globe, FastForward, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const SUPPORTED_CATEGORIES = [
    { icon: '👟', label: 'Shoes / Footwear' },
    { icon: '📱', label: 'Electronics' },
    { icon: '👕', label: 'Apparel' },
];

const ProductIngestor = () => {
    const navigate = useNavigate();
    const { fetchProductData, isLoading } = useStore();
    const errorMsg = useStore(state => state.error);

    // Default to the ASIAN Powerplay demo URL
    const [url, setUrl] = useState('https://www.amazon.in/ASIAN-POWERPLAY-01-Running-Casual-Walking/dp/B0DGXDWWH2/');

    const handleIngest = async (e) => {
        e.preventDefault();
        if (!url.trim()) return;

        // Fetch first — backend auto-detects category from URL
        const success = await fetchProductData(url);

        if (success) {
            const product = useStore.getState().currentProductData;
            if (product) {
                navigate(`/product/${product.product_id}`);
            }
        }
        // If failed: errorMsg will be set in store, shown below
    };

    return (
        <div className="bloomberg-panel p-6 lg:p-8 border-l-4 border-l-primary flex flex-col justify-center w-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 text-textMuted">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="uppercase tracking-[0.2em] text-xs font-bold text-primary/80">
                    Sentix Prime — Universal Ingestor
                </h2>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1 font-mono">Mount Product Stream</h1>
            <p className="text-sm text-textMuted mb-2 max-w-lg">
                Paste any Amazon product URL. The Sentinel engine will automatically detect the category and build a dynamic intelligence dashboard.
            </p>

            {/* Supported category hints */}
            <div className="flex gap-3 mb-5 flex-wrap">
                {SUPPORTED_CATEGORIES.map(c => (
                    <span key={c.label} className="text-[10px] font-mono uppercase tracking-widest text-textMuted border border-white/10 rounded px-2 py-1 bg-white/5">
                        {c.icon} {c.label}
                    </span>
                ))}
            </div>

            {/* Error toast */}
            {errorMsg && (
                <div className="mb-4 bg-negative/20 border border-negative/40 text-negative font-mono text-xs px-4 py-3 rounded-lg flex items-start gap-2 animate-fade-in-up">
                    <span className="text-negative mt-0.5">⚠</span>
                    <div>
                        <p className="font-bold uppercase tracking-widest mb-0.5">Agent Rejection</p>
                        <p>{errorMsg}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleIngest} className="flex flex-col sm:flex-row gap-3">
                {/* URL Input */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-textMuted" />
                    </div>
                    <input
                        id="product-url-input"
                        type="url"
                        required
                        className="bloomberg-input pl-10 font-mono text-sm w-full"
                        placeholder="https://www.amazon.in/product..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                {/* Submit */}
                <button
                    id="mount-stream-btn"
                    type="submit"
                    disabled={isLoading || !url}
                    className="neon-button flex items-center justify-center gap-2 whitespace-nowrap min-w-[180px] group disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
                >
                    {isLoading ? (
                        <>
                            <Cpu className="animate-pulse w-4 h-4" />
                            DETECTING...
                        </>
                    ) : (
                        <>
                            <FastForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            MOUNT STREAM
                        </>
                    )}
                </button>
            </form>

            {/* Hint text */}
            <p className="text-[10px] text-textMuted font-mono mt-3 opacity-60">
                ✦ Backend auto-detects category. No manual selection needed.
            </p>
        </div>
    );
};

export default ProductIngestor;
