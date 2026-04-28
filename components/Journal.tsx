
import React from 'react';
import { TradeEntry } from '../types';

interface JournalProps {
  entries: TradeEntry[];
  onDelete: (id: string) => void;
  currency?: string;
}

const Journal: React.FC<JournalProps> = ({ entries, onDelete, currency = 'USD' }) => {
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getSymbol = (c: string) => {
    switch(c) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  };
  
  const sym = getSymbol(currency);

  return (
    <div className="bg-slate-900 border border-slate-800 dark:bg-slate-900 dark:border-slate-800 light:bg-white light:border-slate-200 rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left min-w-[600px] md:min-w-full">
          <thead>
            <tr className="border-b border-slate-800 light:border-slate-100 bg-slate-900/50 light:bg-slate-50">
              <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Net P&L</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Trades</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Win Rate</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 light:divide-slate-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 md:py-20 text-center text-slate-500 italic text-sm">
                  No trade entries yet.
                </td>
              </tr>
            ) : (
              sorted.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/40 light:hover:bg-slate-50 transition-colors group">
                  <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className="font-medium text-slate-200 light:text-slate-900 text-sm">{entry.date}</span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className={`font-bold text-sm ${entry.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.netProfit >= 0 ? '+' : '-'}{sym}{Math.abs(entry.netProfit).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-slate-300 light:text-slate-600 text-sm">
                    {entry.tradesCount}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className="text-indigo-400 font-semibold text-sm">
                      {entry.tradesCount > 0 ? ((entry.winCount / entry.tradesCount) * 100).toFixed(0) : '0'}%
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <button onClick={() => onDelete(entry.id)} className="text-slate-500 hover:text-rose-400 transition-colors p-2">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Journal;
