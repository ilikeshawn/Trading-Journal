
import React, { useState, useEffect, useMemo } from 'react';
import { TradeEntry, TradingAccount } from '../types';

interface CalendarProps {
  entries: TradeEntry[];
  accounts: TradingAccount[];
  targetDate?: string | null;
  onDayClick: (date: string) => void;
  currency?: string;
}

const Calendar: React.FC<CalendarProps> = ({ entries, accounts, targetDate, onDayClick, currency = 'USD' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const getSymbol = (c: string) => {
    switch(c) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  };
  
  const sym = getSymbol(currency);

  useEffect(() => {
    if (targetDate) {
      const parsed = new Date(targetDate);
      if (!isNaN(parsed.getTime())) setCurrentDate(parsed);
    }
  }, [targetDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));
  const goToday = () => setCurrentDate(new Date());

  const getEntriesForDate = (y: number, m: number, d: number) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return entries.filter(e => e.date === dateStr);
  };

  const formatPnL = (val: number) => {
    const absVal = Math.abs(val);
    const s = val >= 0 ? '+' : '-';
    if (absVal >= 1000000) return `${s}${sym}${(absVal / 1000000).toFixed(2)}M`;
    if (absVal >= 1000) return `${s}${sym}${(absVal / 1000).toFixed(1)}K`;
    return `${s}${sym}${absVal.toLocaleString()}`;
  };

  const monthlyStats = useMemo(() => {
    const monthEntries = entries.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });
    const totalPnL = monthEntries.reduce((sum, e) => sum + e.netProfit, 0);
    const totalTrades = monthEntries.reduce((sum, e) => sum + e.tradesCount, 0);
    const totalWins = monthEntries.reduce((sum, e) => sum + e.winCount, 0);
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    const daySet = new Set(monthEntries.map(e => e.date));
    
    return { totalPnL, days: daySet.size, winRate, totalTrades };
  }, [entries, year, month]);

  const renderCalendar = () => {
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const rows = [];
    let currentDay = 1;

    for (let r = 0; r < 6; r++) {
      const rowDays = [];
      let rowPnL = 0;
      let rowTrades = 0;
      let rowActiveDays = 0;

      for (let c = 0; c < 7; c++) {
        const dayIdx = r * 7 + c;
        if (dayIdx < startOffset || currentDay > totalDays) {
          rowDays.push(<div key={`empty-${dayIdx}`} className="aspect-square md:aspect-auto md:h-32 bg-white/[0.01] border border-white/5 rounded-2xl"></div>);
        } else {
          const dayEntries = getEntriesForDate(year, month, currentDay);
          const dayPnL = dayEntries.reduce((sum, e) => sum + e.netProfit, 0);
          const dayTrades = dayEntries.reduce((sum, e) => sum + e.tradesCount, 0);
          const hasData = dayEntries.length > 0;
          const isProfit = dayPnL > 0;
          const isLoss = dayPnL < 0;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
          
          rowPnL += dayPnL;
          rowTrades += dayTrades;
          if (hasData) rowActiveDays++;

          rowDays.push(
            <div 
              key={currentDay}
              onClick={() => hasData && setSelectedDay(selectedDay === dateStr ? null : dateStr)}
              className={`aspect-square md:aspect-auto md:h-32 p-3 border transition-all cursor-pointer relative flex flex-col items-center justify-center rounded-2xl group ${
                hasData 
                  ? isProfit 
                    ? 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' 
                    : isLoss 
                      ? 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]' 
                      : 'bg-slate-800/40 border-slate-700/50 hover:border-blue-500/50'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              } ${selectedDay === dateStr ? 'ring-2 ring-blue-500 scale-[0.97] bg-blue-500/10' : 'hover:scale-[0.99]'}`}
            >
              <span className={`absolute top-3 right-4 text-[10px] font-black ${hasData ? 'text-white' : 'text-slate-700'} tracking-tighter`}>{currentDay}</span>
              
              {hasData && (
                <div className="text-center animate-in fade-in zoom-in duration-500">
                  <p className={`text-sm md:text-xl font-black tracking-tighter font-mono ${isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'}`}>
                    {formatPnL(dayPnL)}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <span className="w-1 h-1 rounded-full bg-blue-400/50"></span>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {dayTrades} EXEC
                    </p>
                  </div>
                </div>
              )}
              {!hasData && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">No Data</p>
                </div>
              )}
            </div>
          );
          currentDay++;
        }
      }

      rows.push(
        <React.Fragment key={`row-${r}`}>
          <div className="grid grid-cols-7 gap-3 flex-1">
            {rowDays}
          </div>
          <div className="w-24 md:w-36 bg-slate-900/40 border border-white/5 rounded-3xl p-5 flex flex-col justify-center gap-2 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-12 h-12 bg-white/[0.02] blur-xl rounded-full"></div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Matrix Row {r + 1}</span>
            <p className={`text-sm md:text-lg font-black tracking-tighter font-mono ${rowPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatPnL(rowPnL)}
            </p>
            <div className="flex items-center gap-2">
               <div className={`w-1 h-1 rounded-full ${rowPnL >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
               <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{rowActiveDays} Active Sessions</p>
            </div>
          </div>
        </React.Fragment>
      );
    }
    return rows;
  };

  return (
    <div className="space-y-8">
      {/* High-Tech Calendar Card */}
      <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        {/* Calendar Header with Live Stats */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><i className="fa-solid fa-chevron-left text-xs"></i></button>
              <div className="px-6 py-2 bg-white/[0.03] border border-white/10 rounded-xl">
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter whitespace-nowrap">{monthName} <span className="text-blue-500">{year}</span></h3>
              </div>
              <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><i className="fa-solid fa-chevron-right text-xs"></i></button>
            </div>
            <button onClick={goToday} className="px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-[10px] font-black rounded-xl transition-all border border-blue-500/20 uppercase tracking-widest">Return to Today</button>
          </div>

          <div className="flex flex-wrap items-center gap-6 md:gap-10">
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Monthly Delta</span>
                <span className={`text-xl font-black tracking-tighter font-mono ${monthlyStats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatPnL(monthlyStats.totalPnL)}
                </span>
            </div>
            <div className="w-[1px] h-10 bg-white/5 hidden md:block"></div>
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Win Probability</span>
                <span className="text-xl font-black text-white tracking-tighter font-mono">
                    {monthlyStats.winRate.toFixed(1)}%
                </span>
            </div>
            <div className="w-[1px] h-10 bg-white/5 hidden md:block"></div>
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Total Volume</span>
                <span className="text-xl font-black text-blue-400 tracking-tighter font-mono">
                    {monthlyStats.totalTrades} <span className="text-[10px] text-slate-500">EXEC</span>
                </span>
            </div>
          </div>
        </div>

        {/* Weekdays Labels */}
        <div className="flex gap-3 mb-4">
          <div className="grid grid-cols-7 gap-3 flex-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] py-3 bg-white/[0.01] rounded-xl border border-white/5">
                {day}
              </div>
            ))}
          </div>
          <div className="w-24 md:w-36"></div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-[1fr_auto] gap-3">
          {renderCalendar()}
        </div>
      </div>

      {/* Selected Day High-Resolution Breakdown */}
      {selectedDay && (
        <div className="bg-slate-900 border border-blue-500/30 p-10 rounded-[2.5rem] animate-in slide-in-from-top-6 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
          <div className="flex justify-between items-start mb-10">
            <div>
              <h4 className="text-white font-black flex items-center gap-3 uppercase tracking-[0.2em] text-sm">
                  <i className="fa-solid fa-microchip text-blue-500 text-lg"></i>
                  Session Analytics: {selectedDay}
              </h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Deep-level extraction of multi-account performance</p>
            </div>
            <button onClick={() => setSelectedDay(null)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 transition-all flex items-center justify-center">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.filter(e => e.date === selectedDay).map(e => {
                const acc = accounts.find(a => a.accountNumber === e.accountNumber);
                return (
                    <div key={e.id} className="bg-slate-950/60 border border-white/10 p-6 rounded-3xl hover:border-blue-500/40 transition-all group/card shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                                  {acc?.accountName.charAt(0) || '?'}
                               </div>
                               <div>
                                  <span className="text-xs font-black text-white uppercase tracking-widest block">{acc?.accountName || 'Unknown Vault'}</span>
                                  <span className="text-[9px] text-slate-500 font-mono tracking-tighter uppercase">{e.accountNumber}</span>
                               </div>
                            </div>
                            <span className={`text-xl font-black tracking-tighter font-mono ${e.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatPnL(e.netProfit)}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                           <div>
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Win Rate</p>
                              <p className="text-sm font-black text-white">
                                {e.tradesCount > 0 ? ((e.winCount / e.tradesCount) * 100).toFixed(0) : '0'}%
                              </p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Executions</p>
                              <p className="text-sm font-black text-white">{e.tradesCount}</p>
                           </div>
                        </div>

                        {e.notes && (
                           <div className="mt-6 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Neural Context</p>
                              <p className="text-xs text-slate-400 leading-relaxed font-medium">{e.notes}</p>
                           </div>
                        )}
                    </div>
                )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
