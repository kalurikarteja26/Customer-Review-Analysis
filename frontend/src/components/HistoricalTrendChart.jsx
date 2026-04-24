import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HistoricalTrendChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-zinc-800/50 shadow-2xl overflow-hidden h-[300px] flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 dark:border-zinc-800/50">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Historical Sentiment Matrix</h3>
            </div>
            <div className="flex-1 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#88888822" vertical={false} />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} 
                        />
                        <YAxis 
                            domain={[0, 5]} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} 
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(0,0,0,0.8)', 
                                border: 'none', 
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#fff',
                                fontWeight: 'bold'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#6366f1" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistoricalTrendChart;
