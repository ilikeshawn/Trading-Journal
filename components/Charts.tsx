
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TradeEntry } from '../types';

interface ChartsProps {
  entries: TradeEntry[];
  pnlCurve: { date: string; pnl: number }[];
  lossCurve: { date: string; loss: number }[];
}

const Charts: React.FC<ChartsProps> = ({ entries, pnlCurve, lossCurve }) => {
  const pnlData = [...entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(e => ({
        date: e.date,
        pnl: e.netProfit,
        wins: e.winCount,
        losses: e.lossCount
    }));

  const totalWins = entries.reduce((acc, e) => acc + e.winCount, 0);
  const totalLosses = entries.reduce((acc, e) => acc + e.lossCount, 0);

  const CustomTooltip = ({ active, payload, label, prefix = '$' }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="text-slate-400 text-xs mb-1 font-bold">{label}</p>
          <p className={`text-sm font-black ${payload[0].value >= 0 && payload[0].dataKey !== 'loss' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {payload[0].dataKey === 'loss' ? '-' : payload[0].value >= 0 ? '+' : ''}{prefix}{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-xl">
          <h3 className="text-xs font-black text-white mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
              <i className="fa-solid fa-chart-line text-indigo-400"></i>
              Cumulative Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlCurve}>
                <defs>
                  <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(str) => str.split('-').slice(1).join('/')} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `$${Math.abs(val) >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="pnl" stroke="#6366f1" fillOpacity={1} fill="url(#colorPnL)" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-xl">
          <h3 className="text-xs font-black text-rose-400 mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
              <i className="fa-solid fa-triangle-exclamation"></i>
              Loss Accumulation
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lossCurve}>
                <defs>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(str) => str.split('-').slice(1).join('/')} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `$${Math.abs(val) >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip prefix="-$" />} />
                <Area type="monotone" dataKey="loss" stroke="#f43f5e" fillOpacity={1} fill="url(#colorLoss)" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-xl">
        <h3 className="text-xs font-black text-white mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
            <i className="fa-solid fa-chart-bar text-emerald-400"></i>
            Daily P&L Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pnlData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(str) => str.split('-').slice(1).join('/')} />
              <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `$${Math.abs(val) >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" animationDuration={1000}>
                {pnlData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* red and green trades summary */}
        <div className="mt-6 flex items-center justify-center gap-12 border-t border-white/5 pt-6">
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Winning Trades</p>
                <p className="text-lg font-black text-emerald-400">{totalWins}</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"></div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Losing Trades</p>
                <p className="text-lg font-black text-rose-400">{totalLosses}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
