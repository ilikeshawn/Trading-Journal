
import React from 'react';
import Logo from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen deep-tech-bg text-slate-100 selection:bg-blue-500/30 selection:text-white flex flex-col relative overflow-hidden">
      
      {/* Horizontal Neon Streaks */}
      <div className="neon-streak neon-streak-horizontal top-[20%] left-0" style={{ animationDelay: '0s', opacity: 0.2 }}></div>
      <div className="neon-streak neon-streak-horizontal top-[50%] left-0" style={{ animationDelay: '2s', opacity: 0.1 }}></div>
      <div className="neon-streak neon-streak-horizontal top-[80%] left-0" style={{ animationDelay: '4s', opacity: 0.15 }}></div>
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-sky-500/5 blur-[180px] rounded-full pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/20 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center group cursor-pointer" onClick={() => window.location.reload()}>
            <Logo size={40} className="!bg-slate-900/40 !border-white/10" />
          </div>
          <div className="flex items-center gap-8">
            <button onClick={onLogin} className="text-slate-400 hover:text-blue-400 font-bold text-xs uppercase tracking-[0.2em] transition-all">Login</button>
            <button 
              onClick={onGetStarted} 
              className="bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-blue-500 active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col md:flex-row items-center max-w-7xl mx-auto px-6 pt-40 pb-20 w-full relative z-10">
        
        {/* Left Content */}
        <div className="flex-1 text-left space-y-10 animate-in fade-in slide-in-from-left duration-700">
          <div className="inline-flex items-center gap-3 bg-blue-500/10 backdrop-blur-md px-5 py-2 rounded-full border border-blue-500/20 mb-4 shadow-[0_0_20px_rgba(0,112,255,0.1)]">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_#38BDF8]"></span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Neural Analytics Engine</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter">
            Elevate <br />
            <span className="text-blue-500 glow-pulse">Performance.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-md font-medium leading-relaxed border-l-2 border-blue-600/30 pl-6">
            Automatic trade extraction from terminal screenshots. No manual logs, just pure edge analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <button 
              onClick={onGetStarted} 
              className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white px-12 py-6 rounded-2xl text-lg font-black transition-all hover:bg-blue-500 shadow-[0_20px_50px_rgba(37,99,235,0.2)] group active:scale-95 border border-blue-400/20"
            >
              Get Started Free
              <i className="fa-solid fa-bolt-lightning text-sm group-hover:scale-125 transition-transform text-blue-200"></i>
            </button>
            <button className="inline-flex items-center justify-center gap-3 bg-white/5 backdrop-blur-3xl border border-white/10 text-white px-12 py-6 rounded-2xl text-lg font-black transition-all hover:bg-white/10 active:scale-95">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Right Content - Visual Mockup */}
        <div className="flex-1 w-full relative mt-24 md:mt-0 flex flex-col items-center">
          <div className="relative w-full max-w-lg">
             <div className="absolute inset-0 bg-blue-600/10 translate-x-12 translate-y-12 rounded-[3rem] blur-[100px]"></div>
             
             <div className="glass-panel p-10 rounded-[3rem] relative animate-in zoom-in duration-1000 border-white/10 overflow-hidden shadow-2xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full"></div>
                
                <div className="space-y-10 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-400/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                        <i className="fa-solid fa-microchip text-xl"></i>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-widest">Core Extraction</p>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Neural Processing Active</p>
                      </div>
                    </div>
                    <div className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-[0_0_20px_rgba(37,99,235,0.4)]">LIVE</div>
                  </div>

                  <div className="h-56 border-2 border-dashed border-white/5 bg-white/[0.02] rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-white/[0.05] transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform border border-blue-400/30">
                      <i className="fa-solid fa-upload text-2xl"></i>
                    </div>
                    <div className="text-center">
                       <p className="text-xs font-black text-white/80 uppercase tracking-widest">Sync Performance Image</p>
                       <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">MT4, MT5, Tradovate, NinjaTrader</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-black uppercase tracking-[0.15em] text-[10px]">Edge Expectancy</span>
                      <span className="text-blue-400 font-black tracking-tighter">+$142.80 / TRADE</span>
                    </div>
                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full w-[88%] rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
                    </div>
                  </div>
                </div>
             </div>

             <div className="absolute -bottom-10 -left-12 glass-panel !bg-slate-900/60 border-white/20 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-5 animate-in slide-in-from-left-20 delay-500 duration-1000 float-animation">
               <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/40">
                 <i className="fa-solid fa-chart-simple text-emerald-400 text-xl"></i>
               </div>
               <div>
                 <p className="text-xl font-black text-white">+84.2%</p>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Win Probability</p>
               </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="py-12 px-6 relative z-10 text-center">
         <div className="w-full max-w-7xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12"></div>
         <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.6em]">2024 CAPCOMO // NEURAL TRADING INTERFACE</p>
      </footer>
    </div>
  );
};

export default LandingPage;
