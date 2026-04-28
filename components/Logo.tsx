
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`flex items-center justify-center bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-2.5 shadow-2xl ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,112,255,0.6)] border border-blue-400/30">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <span className="text-base font-black tracking-tighter text-white uppercase tracking-[0.1em]">Capcomo</span>
      </div>
    </div>
  );
};

export default Logo;
