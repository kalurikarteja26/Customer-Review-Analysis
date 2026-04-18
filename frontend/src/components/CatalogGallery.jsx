import React from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, ArrowRight } from 'lucide-react';

const CatalogGallery = () => {
    const { catalog } = useStore();
    const navigate = useNavigate();

    if (!catalog || catalog.length === 0) {
        return null; // Don't show if empty
    }

    return (
        <div className="bloomberg-panel p-6 mt-8 border-l-4 border-l-secondary w-full animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4 text-textMuted">
                <FolderKanban className="w-5 h-5 text-secondary" />
                <h2 className="uppercase tracking-[0.2em] text-xs font-bold text-secondary/80">Previously Analyzed</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {catalog.map(item => (
                    <div 
                        key={item.product_id}
                        className="bg-surface border border-white/5 p-4 rounded hover:border-secondary/30 transition-all cursor-pointer group flex items-center gap-4"
                        onClick={() => navigate(`/product/${item.product_id}`)}
                    >
                        <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded shadow ring-1 ring-white/10"
                        />
                        <div className="flex flex-col flex-1 truncate">
                             <span className="text-secondary text-[10px] tracking-widest font-mono uppercase mb-1">{item.category}</span>
                             <span className="text-sm text-white font-bold truncate">{item.name}</span>
                             <div className="flex items-center gap-1 mt-2 text-textMuted text-xs group-hover:text-secondary transition-colors">
                                  View Intelligence <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CatalogGallery;
