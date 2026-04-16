import React from 'react';
import { Search, Bell, UserCircle, Hexagon } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo element */}
          <div className="flex items-center gap-2">
            <Hexagon className="h-8 w-8 text-blue-600 fill-blue-600/20" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Sentix<span className="text-blue-600">Prime</span></span>
          </div>

          {/* Global search simulating ElasticSearch */}
          <div className="flex-1 max-w-2xl px-8 hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                placeholder="Search products by SKU, category, or keyword..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">⌘K</span>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 text-slate-500">
            <button className="hover:text-slate-900 transition-colors relative p-1">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 border-2 border-white"></span>
            </button>
            <button className="hover:text-slate-900 transition-colors p-1">
              <UserCircle className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
