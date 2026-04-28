
import React from 'react';
import { TradingAccount } from '../types';

interface AccountsProps {
  accounts: TradingAccount[];
  onUploadClick: () => void;
  onDeleteAccount: (id: string) => void;
}

const Accounts: React.FC<AccountsProps> = ({ accounts, onUploadClick, onDeleteAccount }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Registered Accounts</h3>
          <p className="text-slate-500 text-sm">Upload account screenshots to add them to the registry.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onUploadClick}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-white/5"
          >
            <i className="fa-solid fa-layer-group text-blue-400"></i>
            Bulk Entry
          </button>
          <button 
            onClick={onUploadClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 border border-indigo-400/20"
          >
            <i className="fa-solid fa-plus"></i>
            Register Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 italic">
            <i className="fa-solid fa-wallet text-4xl mb-4 opacity-20"></i>
            No accounts registered yet.
          </div>
        ) : (
          accounts.map(acc => (
            <div key={acc.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl hover:border-slate-700 transition-colors relative group">
              <button 
                onClick={() => onDeleteAccount(acc.id)}
                className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-600/20 font-bold">
                  {acc.accountName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{acc.accountName}</h4>
                  <p className="text-slate-500 text-xs font-mono uppercase">{acc.broker}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter text-[10px]">Account #</span>
                  <span className="text-slate-300 font-mono">{acc.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter text-[10px]">Currency</span>
                  <span className="text-slate-300 font-bold">{acc.currency}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800/50">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                  <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest mb-1">Status</p>
                  <p className="text-emerald-400 font-black">CONNECTED</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Accounts;
