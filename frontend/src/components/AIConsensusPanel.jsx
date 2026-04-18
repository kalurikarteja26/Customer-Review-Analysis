import React from 'react';
import { CheckCircle2, AlertTriangle, Fingerprint, Box } from 'lucide-react';

const AIConsensusPanel = ({ consensus }) => {
    if (!consensus) return null;
    const { map, extraction } = consensus;
    
    return (
        <div className="bloomberg-panel p-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Fingerprint className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-white font-mono font-bold tracking-widest uppercase text-sm">Auditor Agent</h3>
                    <p className="text-[10px] text-textMuted uppercase tracking-widest">Strength vs Weakness Consensus</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Map */}
                <div className="space-y-4">
                    {Object.entries(map).map(([key, value]) => (
                        <div key={key}>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs text-textMuted font-mono uppercase">{key}</span>
                                <span className={`text-xs font-bold font-mono ${value >= 80 ? 'text-positive' : value <= 60 ? 'text-negative' : 'text-neutral'}`}>{value}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                                <div 
                                   className={`h-full rounded-full transition-all duration-1000 ${value >= 80 ? 'bg-positive shadow-[0_0_8px_rgba(16,185,129,0.5)]' : value <= 60 ? 'bg-negative shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-neutral'}`}
                                   style={{ width: `${value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Extraction */}
                <div className="bg-black/30 rounded-lg p-5 border border-white/5 relative overflow-hidden flex flex-col justify-center group hover:bg-black/20 transition-colors">
                    <Box className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:text-primary/10 transition-colors" />
                    <h4 className="text-xs text-white/80 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-positive" />
                         NLP Extraction
                    </h4>
                    <p className="text-sm text-textMuted leading-relaxed font-sans relative z-10 border-l-2 border-primary/50 pl-3">
                        "{extraction}"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIConsensusPanel;
