import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Target, TrendingUp } from 'lucide-react';

const PredictiveChart = ({ forecast }) => {
    if (!forecast || forecast.length === 0) return null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface/90 backdrop-blur border border-white/10 p-3 rounded shadow-xl">
                    <p className="text-xs text-textMuted uppercase font-mono tracking-widest mb-1">{label} FORECAST</p>
                    <p className="text-lg font-bold font-mono text-primary flex items-center gap-2">
                        Demand Idx: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bloomberg-panel p-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-white font-mono font-bold tracking-widest uppercase text-sm">Prediction Agent</h3>
                    <p className="text-[10px] text-textMuted uppercase tracking-widest">6-Month Demand Velocity Trajectory</p>
                </div>
            </div>

            <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickMargin={10} fontFamily="monospace" />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} fontFamily="monospace" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="demand_index" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                 <p className="text-[10px] text-textMuted font-mono">Algorithm: Stochastic Walk vs Sentiment Weight</p>
                 <TrendingUp className="w-4 h-4 text-indigo-400 opacity-50" />
            </div>
        </div>
    );
};

export default PredictiveChart;
