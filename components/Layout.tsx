
import React from 'react';
import { ViewMode, TradingAccount, User } from '../types';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewMode;
  setView: (view: ViewMode) => void;
  onUploadClick: () => void;
  onReset: () => void;
  accounts: TradingAccount[];
  selectedAccountNum: string;
  onAccountFilter: (accountNum: string) => void;
  user: User | null;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, activeView, setView, onUploadClick, accounts,
  selectedAccountNum, onAccountFilter, user, onLogout, onOpenSettings
}) => {
  const isLight = false; // Forced dark for Deep Tech style

  const navItems = [
    { id: ViewMode.DASHBOARD, label: 'Dashboard', icon: 'fa-cube' },
    { id: ViewMode.CALENDAR, label: 'Calendar', icon: 'fa-clock' },
    { id: ViewMode.JOURNAL, label: 'Journal', icon: 'fa-database' },
    { id: ViewMode.ANALYTICS, label: 'Analytics', icon: 'fa-bolt' },
    { id: ViewMode.ACCOUNTS, label: 'Accounts', icon: 'fa-key' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100 transition-colors duration-300">
      
      {/* Horizontal Streaks Background */}
      <div className="neon-streak neon-streak-horizontal top-[15%] opacity-5"></div>
      <div className="neon-streak neon-streak-horizontal top-[75%] opacity-5" style={{ animationDelay: '5s' }}></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-white/5 bg-slate-950/30 backdrop-blur-3xl flex-col z-20">
        <div className="p-12 flex items-center justify-center">
          <Logo size={40} className="!bg-slate-900/40 !border-white/10" />
        </div>

        <nav className="flex-1 px-8 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-300 group ${
                activeView === item.id
                  ? 'bg-blue-600/20 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] border border-blue-600/30'
                  : `text-slate-500 hover:bg-white/[0.03] hover:text-blue-400`
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg transition-all ${activeView === item.id ? 'text-blue-400 scale-110' : 'group-hover:scale-110'}`}></i>
              <span className="font-black text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-6">
          <button
            onClick={onUploadClick}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(37,99,235,0.25)] border border-blue-400/20 uppercase tracking-[0.2em] text-[10px]"
          >
            <i className="fa-solid fa-sync text-lg animate-pulse"></i>
            Sync Data
          </button>
          
          <div 
            onClick={onOpenSettings}
            className="flex items-center gap-4 p-4 cursor-pointer rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
          >
             <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 border-transparent group-hover:border-blue-500 transition-all">
               <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="User" className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-black truncate leading-none mb-1 text-white">{user?.name || "Trader"}</p>
               <p className="text-[8px] text-blue-400 font-bold uppercase tracking-[0.3em]">Operational</p>
             </div>
             <i className="fa-solid fa-chevron-right text-[10px] text-slate-600 group-hover:text-blue-400 transition-colors pr-1"></i>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 border-b border-white/5 bg-slate-950/20 backdrop-blur-3xl flex items-center justify-between px-12 sticky top-0 z-10">
          <div className="flex items-center gap-12">
            <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">
              {navItems.find(n => n.id === activeView)?.label || 'Dashboard'}
            </h2>
            
            <div className="hidden sm:flex items-center gap-4 bg-white/[0.02] border border-white/5 px-6 py-2.5 rounded-2xl">
              <i className="fa-solid fa-terminal text-blue-500 text-[10px]"></i>
              <select 
                value={selectedAccountNum} 
                onChange={(e) => onAccountFilter(e.target.value)}
                className="bg-transparent text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All Accounts</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.accountNumber} className="bg-slate-900 text-white">{acc.accountName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-3 bg-blue-600/10 px-6 py-2.5 rounded-2xl border border-blue-600/20">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,112,255,0.8)]"></div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Live Connection</span>
            </div>
            <button onClick={onOpenSettings} className="relative group flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">{user?.name}</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Settings</p>
               </div>
               <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" className="w-12 h-12 rounded-2xl border-2 border-white/10 group-hover:border-blue-500 transition-all object-cover shadow-2xl" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 relative">
          {/* Internal Glows */}
          <div className="absolute top-40 right-40 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/60 border-t border-white/5 px-8 py-6 z-40 flex items-center justify-between backdrop-blur-3xl pb-10">
        {navItems.slice(0, 2).map((item) => (
          <button key={item.id} onClick={() => setView(item.id)} className={`flex flex-col items-center gap-2 ${activeView === item.id ? 'text-blue-400' : 'text-slate-600'}`}>
            <i className={`fa-solid ${item.icon} text-xl`}></i>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button onClick={onUploadClick} className="bg-blue-600 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_30px_rgba(0,112,255,0.4)] -mt-12 border-4 border-slate-950 active:scale-90 transition-all">
          <i className="fa-solid fa-plus text-2xl"></i>
        </button>
        {navItems.slice(2, 4).map((item) => (
          <button key={item.id} onClick={() => setView(item.id)} className={`flex flex-col items-center gap-2 ${activeView === item.id ? 'text-blue-400' : 'text-slate-600'}`}>
            <i className={`fa-solid ${item.icon} text-xl`}></i>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
