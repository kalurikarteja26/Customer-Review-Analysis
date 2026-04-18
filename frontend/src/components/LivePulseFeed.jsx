import React, { useState } from 'react';
import { Activity, Clock, Bot, Send } from 'lucide-react';
import axios from 'axios';

const ReviewItem = ({ item, productName, category, attributes }) => {
    const [draft, setDraft] = useState(null);
    const [isDrafting, setIsDrafting] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const getSentimentStyle = (sentiment) => {
        switch(sentiment) {
            case 'Positive': return 'border-positive/30 bg-positive/5 text-positive font-bold';
            case 'Negative': return 'border-negative/30 bg-negative/5 text-negative font-bold';
            default: return 'border-neutral/30 bg-neutral/5 text-neutral font-bold';
        }
    };

    const handleDraft = async () => {
        if (draft || isDrafting) return;
        setIsDrafting(true);
        try {
            const res = await axios.post('http://127.0.0.1:5000/draft-response', {
                review_text: item.text,
                sentiment: item.sentiment,
                product_name: productName,
                category: category || "",
                attributes: attributes || {}
            });
            setDraft(res.data.draft);
        } catch(e) {
            setDraft("Error connecting to Agent API.");
        } finally {
            setIsDrafting(false);
        }
    };

    const handleSend = () => {
        if (!draft || isSending) return;
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setIsSent(true);
        }, 1500); // simulate sending to real platform
    }

    return (
        <div className="bg-black/20 rounded-md p-3 border border-white/5 hover:border-white/20 transition-colors animate-fade-in-up">
            <div className="flex justify-between items-start mb-2">
                <span className="flex items-center gap-1 text-[10px] text-textMuted font-mono">
                    <Clock className="w-3 h-3" /> {item.time_ago}
                </span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${getSentimentStyle(item.sentiment)}`}>
                    {item.sentiment}
                </span>
            </div>
            <p className="text-sm text-textMain/90 leading-relaxed font-sans line-clamp-3 mb-3">
                "{item.text}"
            </p>
            
            <div className="bg-surface/50 border border-primary/10 rounded p-2 mt-2">
                {!draft && !isSent && (
                     <button 
                         onClick={handleDraft}
                         disabled={isDrafting}
                         className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary hover:text-white transition-colors w-full justify-center p-2 border border-primary/20 rounded hover:bg-primary/10 disabled:opacity-50"
                     >
                         <Bot className={`w-3 h-3 ${isDrafting ? 'animate-bounce' : ''}`} /> 
                         {isDrafting ? 'Drafting Response...' : 'AI Agent Response'}
                     </button>
                )}
                {draft && !isSent && (
                     <div className="flex flex-col gap-2 animate-fade-in-up">
                         <div className="text-xs text-textMuted font-mono tracking-widest uppercase flex items-center gap-1"><Bot className="w-3 h-3"/> Agent Draft</div>
                         <textarea 
                             className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:border-primary/50 resize-none h-20 font-sans"
                             value={draft}
                             onChange={(e) => setDraft(e.target.value)}
                         />
                         <button 
                             onClick={handleSend}
                             disabled={isSending}
                             className={`flex items-center justify-center gap-2 transition-colors text-xs font-mono uppercase tracking-widest p-2 rounded ${isSending ? 'bg-primary/50 text-white cursor-wait' : 'bg-primary/20 hover:bg-primary/40 text-primary hover:text-white'}`}
                         >
                             {isSending ? (
                                  <>
                                      <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg> Sending...
                                  </>
                             ) : (
                                  <><Send className="w-3 h-3" /> Send / Post</>
                             )}
                         </button>
                     </div>
                )}
                {isSent && (
                     <div className="flex items-center justify-center gap-2 text-positive text-xs font-mono uppercase tracking-widest p-2 border border-positive/30 rounded bg-positive/10">
                         Response Sent Successfully
                     </div>
                )}
            </div>
        </div>
    )
}

const LivePulseFeed = ({ liveFeed, productName, category, attributes }) => {
    if (!liveFeed || liveFeed.length === 0) return null;

    return (
        <div className="bloomberg-panel p-5 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary animate-pulse" />
                    <h3 className="font-mono text-sm tracking-widest text-textMuted uppercase">Zone A: Live Pulse & Agent Actions</h3>
                </div>
                <div className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] rounded animate-pulse font-mono border border-primary/30">
                    LIVE SCRAPE
                </div>
            </div>
            
            <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
                {liveFeed.map((item, idx) => (
                    <ReviewItem key={item.id} item={item} productName={productName} category={category} attributes={attributes} />
                ))}
            </div>
        </div>
    );
};

export default LivePulseFeed;
