import React from 'react';
import { Star, TrendingUp, Box, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductHero = () => {
  return (
    <div className="glass-panel p-6 lg:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group cursor-crosshair"
          >
            <img 
              src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800" 
              alt="High-end Smartwatch" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
            />
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-xs font-medium px-2 py-1 rounded shadow-sm border border-slate-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              3D View
            </div>
          </motion.div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex-1 aspect-square rounded-lg border-2 ${i === 1 ? 'border-blue-500' : 'border-transparent'} overflow-hidden cursor-pointer bg-slate-100`}>
                <img 
                  src={`https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=200&sig=${i}`}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Product Specs */}
        <div className="w-full md:w-2/3 flex flex-col justify-between py-2">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">AuraTech / Wearables</p>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ChronoSync Pro Ultra</h1>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">$399.00</p>
                <p className="text-sm text-emerald-600 font-medium">In Stock (MSRP)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-sm font-medium text-slate-700">4.1 Dynamic Rating</span>
              <span className="text-xs text-slate-400 ml-1">(2,451 reviews)</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Box className="w-4 h-4" />
                <span className="font-medium text-slate-900">SKU:</span> CTX-992-BL
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium text-slate-900">Warranty:</span> 2 Years Active
              </div>
            </div>
            
            <p className="text-slate-600 leading-relaxed text-sm max-w-2xl">
              The flagship biometric tracker featuring advanced ECG monitoring, 14-day battery life, and an ultra-durable titanium case. Evaluated by Sentix-Prime against 4 tier-1 market competitors.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Brand Authority Score</p>
                <p className="text-lg font-bold text-slate-900">94 / 100</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductHero;
