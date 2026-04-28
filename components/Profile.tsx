
import React, { useRef, useState } from 'react';
import { User, TradeEntry, TradingAccount } from '../types';

interface ProfileProps {
  user: User;
  onUpdate: (updated: User) => void;
  onLogout: () => void;
  entries: TradeEntry[];
  accounts: TradingAccount[];
  onImport: (data: { entries: TradeEntry[], accounts: TradingAccount[] }) => void;
  onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onLogout, entries, accounts, onImport, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for profile fields to avoid constant global state updates while typing
  const [localFirstName, setLocalFirstName] = useState(user.name);
  const [localLastName, setLocalLastName] = useState(user.lastName || '');
  const [localEmail, setLocalEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);

  const exportData = () => {
    const data = {
      user: user.email,
      exportDate: new Date().toISOString(),
      entries,
      accounts
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capcomo_export_${user.email.split('@')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.entries && data.accounts) {
          if (confirm("This will merge imported data with your current data. Continue?")) {
             onImport({ entries: data.entries, accounts: data.accounts });
          }
        }
      } catch (err) {
        alert("Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate a brief delay for UX
    setTimeout(() => {
      const updatedUser: User = {
        ...user,
        name: localFirstName,
        lastName: localLastName,
        email: localEmail
      };
      
      onUpdate(updatedUser);

      // Sync with mock registered users database
      const storedUsersRaw = localStorage.getItem('capcomo_registered_users');
      if (storedUsersRaw) {
        const registeredUsers = JSON.parse(storedUsersRaw);
        const index = registeredUsers.findIndex((u: any) => u.id === user.id);
        if (index !== -1) {
          // Preserve password and other hidden fields in the mock DB
          registeredUsers[index] = { ...registeredUsers[index], ...updatedUser };
          localStorage.setItem('capcomo_registered_users', JSON.stringify(registeredUsers));
        }
      }
      
      setIsSaving(false);
    }, 400);
  };

  const updatePreference = (key: keyof User['preferences'], value: any) => {
    onUpdate({
      ...user,
      preferences: {
        ...user.preferences,
        [key]: value
      }
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onUpdate({
        ...user,
        avatarUrl: base64
      });
    };
    reader.readAsDataURL(file);
  };

  const isLight = user.preferences.theme === 'light';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-300 animate-in zoom-in-95 duration-300 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border border-slate-800'}`}
      >
        {/* Modal Header */}
        <div className={`p-6 md:p-8 flex justify-between items-center border-b ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800 bg-slate-900/50'}`}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-gear text-white"></i>
             </div>
             <div>
                <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'} uppercase tracking-tighter`}>Settings</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">User Profile & Preferences</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {/* Profile Section */}
          <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
            <div 
              className="relative group cursor-pointer shrink-0" 
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`w-32 h-32 rounded-3xl ${isLight ? 'bg-slate-100' : 'bg-indigo-600'} border-4 ${isLight ? 'border-white' : 'border-slate-950'} shadow-2xl overflow-hidden`}>
                 <img 
                   src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                   className="w-full h-full object-cover" 
                   alt="Profile" 
                 />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <div className="text-center">
                    <i className="fa-solid fa-camera text-white text-xl mb-1 block"></i>
                    <span className="text-[8px] text-white font-black uppercase tracking-widest">Change</span>
                 </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
            </div>
            
            <form onSubmit={handleSaveProfile} className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={localFirstName}
                    onChange={(e) => setLocalFirstName(e.target.value)}
                    className={`w-full px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-800 text-white'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Surname</label>
                  <input 
                    type="text" 
                    required
                    value={localLastName}
                    onChange={(e) => setLocalLastName(e.target.value)}
                    className={`w-full px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-800 text-white'}`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    className={`w-full px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-800 text-white'}`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                   <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Elite Rank</span>
                   <span className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Session Secure</span>
                </div>
                <button 
                  type="submit"
                  disabled={isSaving || (localFirstName === user.name && localLastName === user.lastName && localEmail === user.email)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
                    isSaving || (localFirstName === user.name && localLastName === user.lastName && localEmail === user.email)
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
                  }`}
                >
                  {isSaving ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Update Identity'}
                </button>
              </div>
            </form>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <div className="space-y-8">
               <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Visual Preferences</h4>
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Theme Appearance</p>
                          <p className="text-xs text-slate-500">Current: {user.preferences.theme.toUpperCase()}</p>
                        </div>
                        <button 
                          onClick={() => updatePreference('theme', user.preferences.theme === 'dark' ? 'light' : 'dark')}
                          className={`w-14 h-7 rounded-full relative transition-all duration-300 ${user.preferences.theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${user.preferences.theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}>
                             {user.preferences.theme === 'dark' ? <i className="fa-solid fa-moon text-[10px] text-indigo-600"></i> : <i className="fa-solid fa-sun text-[10px] text-amber-500"></i>}
                          </div>
                        </button>
                     </div>
                     
                     <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Neural Auto-Extraction</p>
                          <p className="text-xs text-slate-500">Analyze images on paste</p>
                        </div>
                        <button 
                          onClick={() => updatePreference('autoExtract', !user.preferences.autoExtract)}
                          className={`w-14 h-7 rounded-full relative transition-all duration-300 ${user.preferences.autoExtract ? 'bg-emerald-600' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${user.preferences.autoExtract ? 'translate-x-7' : 'translate-x-1'}`}></div>
                        </button>
                     </div>
                     
                     <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Account Currency</label>
                       <select 
                          value={user.preferences.currency}
                          onChange={(e) => updatePreference('currency', e.target.value)}
                          className={`w-full px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-slate-950 border border-slate-800 text-white'}`}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                       </select>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Data & Storage</h4>
                  <div className="space-y-4">
                     <button 
                      onClick={exportData}
                      className={`w-full p-5 rounded-2xl border flex items-center justify-between group transition-all ${isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}
                     >
                        <div className="text-left">
                          <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Download Journal</p>
                          <p className="text-xs text-slate-500">Full JSON backup</p>
                        </div>
                        <i className="fa-solid fa-download text-indigo-400 transition-transform group-hover:translate-y-1"></i>
                     </button>

                     <div className="relative group">
                        <input 
                          type="file" 
                          onChange={handleImport}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          accept=".json"
                        />
                        <div className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all ${isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}>
                          <div className="text-left">
                            <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Import History</p>
                            <p className="text-xs text-slate-500">Restore from file</p>
                          </div>
                          <i className="fa-solid fa-upload text-emerald-400 transition-transform group-hover:-translate-y-1"></i>
                        </div>
                     </div>

                     <div className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl mt-4">
                        <p className="text-rose-400 font-black mb-1 text-sm uppercase">Danger Zone</p>
                        <p className="text-[10px] text-rose-500/60 font-bold uppercase tracking-wider mb-4 leading-relaxed">This will erase all cached trading history permanently.</p>
                        <button 
                          onClick={onLogout}
                          className="w-full py-3 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-2"
                        >
                          De-authorize Session
                        </button>
                        <button 
                          onClick={() => { if(confirm("This will clear all local storage. Are you sure?")) { localStorage.clear(); window.location.reload(); }}}
                          className="w-full py-3 bg-slate-800 hover:bg-rose-500 hover:text-white border border-slate-700 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Wipe Core Cache
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
