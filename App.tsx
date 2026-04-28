
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Stats from './components/Stats';
import Charts from './components/Charts';
import Calendar from './components/Calendar';
import Journal from './components/Journal';
import Accounts from './components/Accounts';
import UploadModal from './components/UploadModal';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import Profile from './components/Profile';
import { TradeEntry, TradingStats, TradingAccount, ViewMode, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>(ViewMode.LANDING);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccountNum, setSelectedAccountNum] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'trade' | 'account'>('trade');
  const [calendarTargetDate, setCalendarTargetDate] = useState<string | null>(null);

  // Persistence Helpers
  const getUserKey = (suffix: string) => user ? `capcomo_${user.id}_${suffix}` : null;

  // Load User from Session
  useEffect(() => {
    const session = localStorage.getItem('capcomo_current_user');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
        setActiveView(ViewMode.DASHBOARD);
      } catch (e) {
        localStorage.removeItem('capcomo_current_user');
      }
    }
  }, []);

  // Theme synchronization
  useEffect(() => {
    if (user?.preferences.theme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    } else {
      document.documentElement.classList.remove('light-mode');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#f8fafc';
    }
  }, [user?.preferences.theme]);

  // Load User Data when logged in
  useEffect(() => {
    if (!user) return;
    const entriesKey = getUserKey('trades');
    const accountsKey = getUserKey('accounts');
    
    if (entriesKey) {
      const saved = localStorage.getItem(entriesKey);
      if (saved) setEntries(JSON.parse(saved));
      else setEntries([]);
    }
    if (accountsKey) {
      const saved = localStorage.getItem(accountsKey);
      if (saved) setAccounts(JSON.parse(saved));
      else setAccounts([]);
    }
  }, [user?.id]);

  // Sync Data to User-Specific Keys
  useEffect(() => {
    if (!user) return;
    const entriesKey = getUserKey('trades');
    const accountsKey = getUserKey('accounts');
    
    if (entriesKey) localStorage.setItem(entriesKey, JSON.stringify(entries));
    if (accountsKey) localStorage.setItem(accountsKey, JSON.stringify(accounts));
  }, [entries, accounts, user?.id]);

  const handleLoginSuccess = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('capcomo_current_user', JSON.stringify(newUser));
    setActiveView(ViewMode.DASHBOARD);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('capcomo_current_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem('capcomo_current_user');
      setUser(null);
      setEntries([]);
      setAccounts([]);
      setSelectedAccountNum('all');
      setCalendarTargetDate(null);
      setIsSettingsOpen(false);
      setIsUploadModalOpen(false);
      setActiveView(ViewMode.LANDING);
    }
  };

  const handleImport = (data: { entries: TradeEntry[], accounts: TradingAccount[] }) => {
    setEntries(prev => [...data.entries, ...prev]);
    setAccounts(prev => {
      const merged = [...prev];
      data.accounts.forEach(acc => {
        if (!merged.find(m => m.accountNumber === acc.accountNumber)) {
          merged.push(acc);
        }
      });
      return merged;
    });
  };

  const filteredEntries = useMemo(() => {
    if (selectedAccountNum === 'all') return entries;
    const normalizedSelected = selectedAccountNum.trim().toUpperCase();
    return entries.filter(e => e.accountNumber?.trim().toUpperCase() === normalizedSelected);
  }, [entries, selectedAccountNum]);

  const currentStreak = useMemo(() => {
    if (filteredEntries.length === 0) return 0;
    const dailyPnL: Record<string, number> = {};
    filteredEntries.forEach(e => {
      dailyPnL[e.date] = (dailyPnL[e.date] || 0) + e.netProfit;
    });
    const sortedDates = Object.keys(dailyPnL).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    for (const date of sortedDates) {
      if (dailyPnL[date] > 0) streak++;
      else break;
    }
    return streak;
  }, [filteredEntries]);

  const stats: TradingStats = useMemo(() => {
    const totalProfit = filteredEntries.reduce((sum, e) => sum + e.netProfit, 0);
    const totalTrades = filteredEntries.reduce((sum, e) => sum + e.tradesCount, 0);
    const totalWins = filteredEntries.reduce((sum, e) => sum + e.winCount, 0);
    const totalLosses = filteredEntries.reduce((sum, e) => sum + e.lossCount, 0);
    const totalLossAmount = filteredEntries.reduce((sum, e) => e.netProfit < 0 ? sum + Math.abs(e.netProfit) : sum, 0);
    
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    const entriesByDate = filteredEntries.reduce((acc, e) => {
      acc[e.date] = (acc[e.date] || 0) + e.netProfit;
      return acc;
    }, {} as Record<string, number>);
    const uniqueDays = Object.keys(entriesByDate).length;
    const avgDailyPnL = uniqueDays > 0 ? totalProfit / uniqueDays : 0;
    const avgTradeDuration = filteredEntries.length > 0 && filteredEntries[0].avgTradeDuration ? filteredEntries[0].avgTradeDuration : 'N/A';
    
    const sorted = [...filteredEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningPnL = 0;
    let runningLoss = 0;
    const pnlCurve = sorted.map(e => {
        runningPnL += e.netProfit;
        return { date: e.date, pnl: runningPnL };
    });
    const lossCurve = sorted.map(e => {
        if (e.netProfit < 0) runningLoss += Math.abs(e.netProfit);
        return { date: e.date, loss: runningLoss };
    });

    return { totalProfit, winRate, avgDailyPnL, totalTrades, totalWins, totalLosses, totalLossAmount, avgTradeDuration, pnlCurve, lossCurve };
  }, [filteredEntries]);

  const handleUploadSuccess = (data: any, type: 'account' | 'trade') => {
    if (type === 'account') {
      setAccounts(prev => {
        const normalizedDataNum = data.accountNumber?.trim().toUpperCase();
        const existing = prev.find(a => a.accountNumber?.trim().toUpperCase() === normalizedDataNum);
        if (existing) return prev.map(a => a.accountNumber?.trim().toUpperCase() === normalizedDataNum ? { ...data, id: a.id } : a);
        return [...prev, data];
      });
    } else {
      setEntries(prev => {
        const extractedAccNum = data.accountNumber?.trim().toUpperCase() || '';
        const existingIndex = prev.findIndex(e => e.date === data.date && e.accountNumber?.trim().toUpperCase() === extractedAccNum);
        if (existingIndex !== -1) {
          const newEntries = [...prev];
          newEntries[existingIndex] = { ...data, id: prev[existingIndex].id };
          return newEntries;
        }
        return [data, ...prev];
      });
      setCalendarTargetDate(data.date);
    }
  };

  const renderView = () => {
    if (activeView === ViewMode.LANDING) return (
      <LandingPage 
        onGetStarted={() => { setAuthMode('signup'); setActiveView(ViewMode.AUTH); }} 
        onLogin={() => { setAuthMode('login'); setActiveView(ViewMode.AUTH); }} 
      />
    );
    if (activeView === ViewMode.AUTH) return (
      <AuthForm 
        onBack={() => setActiveView(ViewMode.LANDING)} 
        onSuccess={handleLoginSuccess} 
        initialIsLogin={authMode === 'login'} 
      />
    );
    
    switch (activeView) {
      case ViewMode.DASHBOARD:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Stats stats={stats} streak={currentStreak} currency={user?.preferences.currency || 'USD'} />
            {filteredEntries.length > 0 ? (
              <div className="space-y-8">
                <Charts entries={filteredEntries} pnlCurve={stats.pnlCurve} lossCurve={stats.lossCurve} />
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-900 rounded-[2.5rem] p-20 text-center">
                <i className="fa-solid fa-chart-line text-5xl text-slate-800 mb-6 block"></i>
                <p className="text-white font-black text-2xl mb-2">Ready to trade?</p>
                <p className="text-slate-500 max-w-sm mx-auto">Start by registering an account or uploading your first P&L screenshot.</p>
              </div>
            )}
            <div className="bg-slate-900/50 border border-slate-900 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Recent History</h3>
              <Journal entries={filteredEntries.slice(0, 5)} onDelete={(id) => setEntries(entries.filter(e => e.id !== id))} currency={user?.preferences.currency || 'USD'} />
            </div>
          </div>
        );
      case ViewMode.CALENDAR:
        return <div className="space-y-8 animate-in fade-in duration-500"><Stats stats={stats} streak={currentStreak} currency={user?.preferences.currency || 'USD'} /><Calendar entries={filteredEntries} accounts={accounts} targetDate={calendarTargetDate} onDayClick={() => {}} currency={user?.preferences.currency || 'USD'} /></div>;
      case ViewMode.JOURNAL:
        return <div className="space-y-8 animate-in fade-in duration-500"><Stats stats={stats} streak={currentStreak} currency={user?.preferences.currency || 'USD'} /><Journal entries={filteredEntries} onDelete={(id) => setEntries(entries.filter(e => e.id !== id))} currency={user?.preferences.currency || 'USD'} /></div>;
      case ViewMode.ANALYTICS:
        return <div className="space-y-8 animate-in fade-in duration-500"><Stats stats={stats} streak={currentStreak} currency={user?.preferences.currency || 'USD'} /><Charts entries={filteredEntries} pnlCurve={stats.pnlCurve} lossCurve={stats.lossCurve} /></div>;
      case ViewMode.ACCOUNTS:
        return <div className="animate-in fade-in duration-500"><Accounts accounts={accounts} onUploadClick={() => { setUploadMode('account'); setIsUploadModalOpen(true); }} onDeleteAccount={(id) => setAccounts(accounts.filter(a => a.id !== id))} /></div>;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen ${user?.preferences.theme === 'light' ? 'bg-slate-50' : 'bg-slate-950'}`}>
      {user ? (
        <Layout 
          activeView={activeView} 
          setView={setActiveView} 
          onUploadClick={() => { setUploadMode('trade'); setIsUploadModalOpen(true); }}
          onReset={() => setEntries([])}
          accounts={accounts}
          selectedAccountNum={selectedAccountNum}
          onAccountFilter={setSelectedAccountNum}
          user={user}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
        >
          {renderView()}
        </Layout>
      ) : renderView()}
      
      {isUploadModalOpen && (
        <UploadModal 
          mode={uploadMode}
          onClose={() => setIsUploadModalOpen(false)} 
          onSuccess={handleUploadSuccess}
          existingAccounts={accounts}
        />
      )}

      {isSettingsOpen && user && (
        <Profile 
          user={user} 
          entries={entries} 
          accounts={accounts} 
          onUpdate={handleUpdateUser} 
          onLogout={handleLogout} 
          onImport={handleImport} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
