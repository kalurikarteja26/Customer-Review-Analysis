import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Triangle } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-surface border-b border-white/10 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo element mapped to Home */}
          <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center border border-primary/50 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-primary/20 blur-sm"></div>
                <Triangle className="h-5 w-5 text-primary fill-primary/50 rotate-180" />
            </div>
            <span className="font-bold text-xl tracking-widest uppercase text-white font-mono">
                Universal<span className="text-primary font-black">Sentinel</span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
