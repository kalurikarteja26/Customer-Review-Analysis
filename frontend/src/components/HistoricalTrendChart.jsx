import React from 'react';
import { Database, TrendingUp } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const HistoricalTrendChart = ({ historicalTrend, historicalAvg }) => {
    
    if (!historicalTrend || historicalTrend.length === 0) return null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const val = payload[0].value;
            const isVolatility = val < historicalAvg - 0.5;
            return (
                <div className="bg-black/90 border border-white/10 p-3 rounded-lg shadow-xl font-mono text-xs">
                    <p className="text-textMuted mb-1">{`Period: ${label}`}</p>
                    <p className="font-bold text-white text-sm mb-1">{`Avg Rating: ${val} / 5.0`}</p>
                    {isVolatility && (
                         <p className="text-negative font-bold flex items-center gap-1 mt-2 bg-negative/10 px-2 py-1 border border-negative/30 rounded">
                             Volatility Alert Flagged
                         </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bloomberg-panel p-5 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6 pt-1">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    <h3 className="font-mono text-sm tracking-widest text-textMuted uppercase">Zone B: Historical DB</h3>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-textMuted" />
                    <span className="text-xs text-textMuted font-mono">Avg Base: {historicalAvg}</span>
                </div>
            </div>
            
            <div className="flex-1 w-full ml-[-20px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis 
                            dataKey="month" 
                            stroke="#a1a1aa" 
                            tick={{fill: '#a1a1aa', fontSize: 11, fontFamily: 'monospace'}}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis 
                            domain={[1, 5]} 
                            stroke="#a1a1aa" 
                            tick={{fill: '#a1a1aa', fontSize: 11, fontFamily: 'monospace'}}
                            axisLine={false}
                            tickLine={false}
                            tickCount={5}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff30', strokeWidth: 1 }} />
                        
                        <ReferenceLine y={historicalAvg} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.5} />
                        
                        <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#09090b', stroke: '#3b82f6', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff' }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistoricalTrendChart;
