import React from 'react';

const ComparisonTable = ({ products = [] }) => {
    if (products.length === 0) return null;

    const fields = [
        { label: 'Price', key: 'price', format: (v) => `₹${v.toLocaleString()}` },
        { label: 'Rating', key: 'rating' },
        { label: 'Sentiment Score', key: 'recommendation', subKey: 'score', format: (v) => `${v}%` },
        { label: 'Verdict', key: 'recommendation', subKey: 'verdict' },
        { label: 'Stock Status', key: 'stock' },
        { label: 'Platform', key: 'platform' },
    ];

    // Collect all unique spec keys
    const allSpecKeys = [...new Set(products.flatMap(p => Object.keys(p.specifications || {})))].slice(0, 10);

    return (
        <div className="w-full mt-20 fade-in">
            <h3 className="text-3xl font-black mb-10 text-gray-900 dark:text-white uppercase tracking-tighter text-center">
                Side-by-Side Comparison
            </h3>
            <div className="overflow-x-auto rounded-[2.5rem] border border-white/20 dark:border-zinc-800/50 shadow-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-zinc-800">
                            <th className="p-8 w-1/4 bg-zinc-50/50 dark:bg-zinc-800/20"></th>
                            {products.map((p, i) => (
                                <th key={i} className="p-8 w-1/4">
                                    <div className="flex flex-col items-center text-center">
                                        <img src={p.image} alt="" className="w-32 h-32 object-contain mb-4 drop-shadow-lg" />
                                        <span className="text-sm font-black line-clamp-2 text-gray-900 dark:text-white">{p.title}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, idx) => (
                            <tr key={field.label} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-white/50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td className="p-6 text-xs font-black uppercase text-zinc-400 tracking-widest bg-zinc-50/30 dark:bg-zinc-800/10">
                                    {field.label}
                                </td>
                                {products.map((p, i) => {
                                    let val = field.subKey ? p[field.key]?.[field.subKey] : p[field.key];
                                    if (field.format && val !== undefined && val !== null) val = field.format(val);
                                    return (
                                        <td key={i} className="p-6 text-sm font-bold text-gray-800 dark:text-zinc-200 text-center">
                                            {val || 'N/A'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        
                        {allSpecKeys.map((specKey) => (
                            <tr key={specKey} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-white/50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td className="p-6 text-xs font-black uppercase text-zinc-400 tracking-widest bg-zinc-50/30 dark:bg-zinc-800/10">
                                    {specKey}
                                </td>
                                {products.map((p, i) => (
                                    <td key={i} className="p-6 text-sm text-gray-600 dark:text-zinc-400 text-center">
                                        {p.specifications?.[specKey] || '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparisonTable;
