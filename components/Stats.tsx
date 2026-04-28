
import React from 'react';
import { TradingStats } from '../types';

interface StatsProps {
  stats: TradingStats;
  streak: number;
  currency?: string;
}

const Stats: React.FC<StatsProps> = ({ stats, streak, currency = 'USD' }) => {
  const expectancy = stats.totalTrades > 0 ? stats.totalProfit / stats.totalTrades : 0;
  const sym = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'JPY' ? '¥' : '$';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
      {/* P&L Performance Card */}
      <div className="glass-panel rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between h-48 group relative overflow-hidden transition-all border-white/10 hover:border-blue-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] group-hover:bg-blue-500/20 transition-all"></div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Capital Delta</span>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#0070FF]"></div>
               <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Net Realized</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 text-blue-400">
             <i className="fa-solid fa-wave-square text-lg"></i>
          </div>
        </div>
        <div className="mt-auto relative z-10">
          <p className={`text-4xl font-black tracking-tighter ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            {stats.totalProfit >= 0 ? '+' : ''}{sym}{stats.totalProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Winning Trades Card */}
      <div className="glass-panel rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between h-48 group relative overflow-hidden transition-all border-white/10 hover:border-blue-500/30">
        <div className="flex justify-between items-start">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Winning Trades</span>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center border border-emerald-600/20 text-emerald-400">
             <i className="fa-solid fa-trophy text-lg"></i>
          </div>
        </div>
        <div className="flex items-end justify-between">
           <div className="flex items-baseline gap-2">
             <p className="text-5xl font-black text-white tracking-tighter">{stats.totalWins}</p>
             <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Executions</span>
           </div>
        </div>
      </div>

      {/* Probability Expectancy Card */}
      <div className="glass-panel rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between h-48 group relative overflow-hidden transition-all border-white/10 hover:border-blue-500/30">
        <div className="flex justify-between items-start">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Neural Expectancy</span>
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 text-blue-500">
             <i className="fa-solid fa-radar text-lg"></i>
          </div>
        </div>
        <div className="mt-auto">
          <p className={`text-4xl font-black tracking-tighter ${expectancy >= 0 ? 'text-white' : 'text-rose-500'}`}>
            {sym}{Math.abs(expectancy).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Expected Return / Trade</p>
        </div>
      </div>

      {/* Losing Trades / Trade Outcome Distribution Card */}
      <div className="glass-panel rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between h-48 group relative overflow-hidden transition-all border-white/10 hover:border-rose-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[40px] group-hover:bg-rose-500/10 transition-all"></div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Losing Trades</span>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]"></div>
               <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Winning vs Losing</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-600/10 flex items-center justify-center border border-rose-600/20 text-rose-400">
             <i className="fa-solid fa-chart-pie text-lg"></i>
          </div>
        </div>
        <div className="mt-auto relative z-10">
          <p className="text-4xl font-black tracking-tighter text-rose-500">
            {stats.totalLosses}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
            {stats.totalWins} Wins vs {stats.totalLosses} Losses
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
