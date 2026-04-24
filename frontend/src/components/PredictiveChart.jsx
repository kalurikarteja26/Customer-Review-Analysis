import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PredictiveChart = ({ data = [] }) => {
    const safeData = Array.isArray(data) ? data : [];

    if (safeData.length === 0) {
        return (
            <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-zinc-800/50 shadow-2xl overflow-hidden h-[300px] flex flex-col items-center justify-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No forecast data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-zinc-800/50 shadow-2xl overflow-hidden h-[300px] flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 dark:border-zinc-800/50">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Predictive Demand Forecast</h3>
            </div>
            <div className="flex-1 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={safeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#88888822" vertical={false} />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#888', fontWeight: 'bold' }} 
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
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
                        <Bar 
                            dataKey="demand_index" 
                            radius={[6, 6, 0, 0]}
                            animationDuration={2000}
                        >
                            {safeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`rgba(99, 102, 241, ${0.4 + (index / Math.max(1, safeData.length)) * 0.6})`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PredictiveChart;
