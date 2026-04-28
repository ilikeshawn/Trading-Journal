
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Logo from './Logo';

interface AuthFormProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
  initialIsLogin?: boolean;
}

type AuthView = 'login' | 'signup' | 'forgot_request' | 'forgot_verify' | 'forgot_reset';

const PreviewCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: "Real-time Delta",
      description: "Neural tracking of capital fluctuations with 99.9% precision.",
      icon: "fa-wave-square",
      color: "text-blue-400",
      content: (
        <div className="w-full h-32 flex flex-col justify-end bg-blue-600/5 border border-blue-500/20 rounded-2xl p-4 overflow-hidden relative">
           <div className="flex justify-between items-start mb-2">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">P&L FLOW</span>
             <span className="text-[10px] font-black text-emerald-400">+$12,420.00</span>
           </div>
           <div className="flex items-end gap-1 h-12">
              {[40, 60, 45, 80, 55, 90, 70, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-500/40 rounded-t-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
           </div>
        </div>
      )
    },
    {
      title: "Portfolio Sync",
      description: "Connect MT4, MT5, and NinjaTrader accounts via one secure link.",
      icon: "fa-key",
      color: "text-indigo-400",
      content: (
        <div className="space-y-3">
           <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20"><i className="fa-solid fa-terminal text-xs"></i></div>
              <div className="flex-1"><div className="h-1.5 w-16 bg-white/20 rounded-full mb-1.5"></div><div className="h-1 w-24 bg-white/5 rounded-full"></div></div>
              <div className="text-[8px] font-black text-emerald-400">SYNCED</div>
           </div>
           <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl opacity-60">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400"><i className="fa-solid fa-terminal text-xs"></i></div>
              <div className="flex-1"><div className="h-1.5 w-12 bg-white/10 rounded-full mb-1.5"></div><div className="h-1 w-20 bg-white/5 rounded-full"></div></div>
              <div className="text-[8px] font-black text-slate-600">IDLE</div>
           </div>
        </div>
      )
    },
    {
      title: "Cycle Analytics",
      description: "Predictive expectancy and win-probability matrix for elite edge.",
      icon: "fa-radar",
      color: "text-cyan-400",
      content: (
        <div className="flex items-center justify-center h-32 relative">
           <div className="w-24 h-24 border-4 border-cyan-500/20 rounded-full border-t-cyan-500 animate-[spin_3s_linear_infinite] flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-white/5 rounded-full flex items-center justify-center">
                 <span className="text-xl font-black text-white">84%</span>
              </div>
           </div>
           <div className="absolute top-0 right-0 p-2 bg-white/5 rounded-lg border border-white/10">
              <p className="text-[8px] font-black text-slate-500 uppercase">Win Rate</p>
           </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full max-w-sm mx-auto relative h-[400px] flex flex-col justify-center">
      {slides.map((slide, idx) => (
        <div 
          key={idx} 
          className={`absolute inset-0 transition-all duration-1000 flex flex-col justify-center ${
            activeIndex === idx ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)] backdrop-blur-3xl overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 blur-[40px] rounded-full group-hover:bg-blue-600/20 transition-all"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 ${slide.color}`}>
                <i className={`fa-solid ${slide.icon} text-2xl`}></i>
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-wider">{slide.title}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Feature Insight</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10 font-medium">
              {slide.description}
            </p>

            <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700">
              {slide.content}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination Indicators */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${activeIndex === idx ? 'w-10 bg-blue-600 shadow-[0_0_10px_#0070FF]' : 'w-2 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
};

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, onBack, initialIsLogin = true }) => {
  const [view, setView] = useState<AuthView>(initialIsLogin ? 'login' : 'signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Forgot Password Flow States
  const [forgotUsername, setForgotUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [targetEmail, setTargetEmail] = useState('');

  const getRegisteredUsers = () => {
    const raw = localStorage.getItem('capcomo_registered_users');
    return raw ? JSON.parse(raw) : [];
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const userMatch = users.find((u: any) => 
        (u.username === username || u.email === username) && u.password === password
      );

      if (userMatch) {
        const { password: _, ...userWithoutPassword } = userMatch;
        setIsLoading(false);
        onSuccess(userWithoutPassword);
      } else {
        setIsLoading(false);
        setError("Account not found or invalid credentials. Ensure username and access key are correct.");
      }
    }, 1200);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const existing = users.find((u: any) => u.username === username || u.email === email);

      if (existing) {
        setIsLoading(false);
        setError("Identity conflict. Username or email already registered.");
        return;
      }

      const newUser = {
        id: crypto.randomUUID(),
        username,
        email,
        password,
        name: firstName || 'Trader',
        lastName: lastName || 'User',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        preferences: { theme: 'dark', currency: 'USD', autoExtract: true }
      };

      users.push(newUser);
      localStorage.setItem('capcomo_registered_users', JSON.stringify(users));
      
      const { password: _, ...userWithoutPassword } = newUser;
      setIsLoading(false);
      onSuccess(userWithoutPassword);
    }, 1500);
  };

  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const user = users.find((u: any) => u.username === forgotUsername || u.email === forgotUsername);

      if (user) {
        setTargetEmail(user.email);
        setIsLoading(false);
        setView('forgot_verify');
      } else {
        setIsLoading(false);
        setError("Identifier not found in registry.");
      }
    }, 1000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === '1234') {
      setView('forgot_reset');
      setError(null);
    } else {
      setError("Verification code mismatch. For demo use '1234'.");
    }
  };

  const handleFinalReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const userIndex = users.findIndex((u: any) => u.email === targetEmail);

      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('capcomo_registered_users', JSON.stringify(users));
        setIsLoading(false);
        setResetSuccess("Neural access key successfully updated.");
        setView('login');
      } else {
        setIsLoading(false);
        setError("Registry integrity failure.");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen deep-tech-bg flex items-center justify-center p-4 md:p-10 relative">
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full"></div>
      
      <div className="w-full max-w-6xl glass-panel rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row min-h-[780px] animate-in zoom-in-95 duration-500 shadow-[0_0_120px_rgba(0,0,0,0.9)] relative border-white/5">
        
        <button 
          onClick={onBack} 
          className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 glass-panel rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all z-50 border border-white/20 shadow-xl"
          title="Go Back"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Left Side: Form Interface */}
        <div className="flex-1 p-10 md:p-20 flex flex-col relative bg-white/[0.01] z-10 border-r border-white/5">
          <div className="mb-14">
            <Logo size={48} className="inline-flex !bg-slate-900/40 !border-white/10" />
          </div>

          <div className="max-w-sm w-full mx-auto flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                {view === 'login' && 'Authorize'}
                {view === 'signup' && 'Register'}
                {view.startsWith('forgot') && 'Override'}
              </h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                {view === 'login' && 'Authenticate your terminal session'}
                {view === 'signup' && 'Initialize trader identity matrix'}
                {view.startsWith('forgot') && 'Emergency access key recovery'}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-in shake duration-300">
                <i className="fa-solid fa-triangle-exclamation text-lg"></i> {error}
              </div>
            )}

            {resetSuccess && (
              <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4">
                <i className="fa-solid fa-circle-check text-lg"></i> {resetSuccess}
              </div>
            )}

            {/* Login View */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Username / Email</label>
                  <input 
                    type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="trader_nexus"
                    className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50 shadow-inner transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Access Key</label>
                    <button type="button" onClick={() => setView('forgot_request')} className="text-[9px] text-blue-500 hover:text-blue-400 font-black uppercase tracking-widest">Forgot Key?</button>
                  </div>
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50 shadow-inner transition-colors"
                  />
                </div>
                
                <button 
                  type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl mt-8 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.25)] active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs border border-blue-400/20"
                >
                  {isLoading ? <i className="fa-solid fa-sync animate-spin"></i> : 'Authorize Interface'}
                </button>
              </form>
            )}

            {/* Signup View */}
            {view === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">First Name</label>
                    <input 
                      type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Joe"
                      className="w-full bg-white/[0.03] border border-white/10 px-6 py-5 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Surname</label>
                    <input 
                      type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                      placeholder="Trader"
                      className="w-full bg-white/[0.03] border border-white/10 px-6 py-5 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Operational Username</label>
                  <input 
                    type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="unique_handle"
                    className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Neural Email</label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@matrix.ai"
                    className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Secure Access Key</label>
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50 transition-colors"
                  />
                </div>
                
                <button 
                  type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl mt-8 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.25)] active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs border border-blue-400/20"
                >
                  {isLoading ? <i className="fa-solid fa-sync animate-spin"></i> : 'Deploy Profile'}
                </button>
              </form>
            )}

            {/* Forgot Request View */}
            {view === 'forgot_request' && (
              <form onSubmit={handleForgotRequest} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Identify Username</label>
                  <input 
                    type="text" required value={forgotUsername} onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="Enter registered handle"
                    className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                  />
                </div>
                <button 
                  type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl mt-8 flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs border border-blue-400/20"
                >
                  {isLoading ? <i className="fa-solid fa-sync animate-spin"></i> : 'Request Override Code'}
                </button>
                <button type="button" onClick={() => setView('login')} className="w-full text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors">Return to login</button>
              </form>
            )}

            {/* Forgot Verify View */}
            {view === 'forgot_verify' && (
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="p-4 bg-blue-600/5 border border-blue-600/20 rounded-2xl">
                   <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest leading-relaxed">Code dispatched to registered link: {targetEmail.substring(0, 3)}••••@{targetEmail.split('@')[1]}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Verification Code</label>
                  <input 
                    type="text" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 4-digit code"
                    className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50 text-center tracking-[1em]"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl mt-8 flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs border border-blue-400/20"
                >
                  Verify Identity
                </button>
              </form>
            )}

            {/* Forgot Reset View */}
            {view === 'forgot_reset' && (
              <form onSubmit={handleFinalReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">New Access Key</label>
                  <input 
                    type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                  />
                </div>
                <button 
                  type="submit" disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 rounded-2xl mt-8 flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs border border-emerald-400/20 shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
                >
                  {isLoading ? <i className="fa-solid fa-sync animate-spin"></i> : 'Confirm Key Override'}
                </button>
              </form>
            )}

            <div className="mt-14 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                {view === 'login' && (
                  <>No access key? <button onClick={() => { setView('signup'); setError(null); }} className="text-blue-500 hover:text-blue-400 transition-colors underline decoration-blue-500/30 underline-offset-8 font-black ml-2">Sign Up</button></>
                )}
                {view === 'signup' && (
                  <>Existing operative? <button onClick={() => { setView('login'); setError(null); }} className="text-blue-500 hover:text-blue-400 transition-colors underline decoration-blue-500/30 underline-offset-8 font-black ml-2">Log In</button></>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Preview Carousel & Cinematic Visual */}
        <div className="hidden md:flex flex-1 relative bg-slate-950 overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1549416878-b9ca35c2d47b?q=80&w=1974&auto=format&fit=crop" 
            className="w-full h-full object-cover brightness-[0.3] grayscale-[0.2] transition-transform duration-[12000ms] scale-105 group-hover:scale-110" 
            alt="Pro Trader Context"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <div className="absolute inset-0 flex flex-col p-16">
            <div className="flex justify-between items-start mb-auto animate-in slide-in-from-top duration-700">
               <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-2xl shadow-2xl">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#0070FF]"></span>
                     <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Global Terminal</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-white tracking-tighter">18,342</p>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">+1.42%</span>
                  </div>
               </div>
               <div className="flex gap-2">
                 <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white"><i className="fa-solid fa-wifi text-xs"></i></div>
                 <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white"><i className="fa-solid fa-shield-halved text-xs"></i></div>
               </div>
            </div>
            <PreviewCarousel />
          </div>
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,4px_100%]"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
