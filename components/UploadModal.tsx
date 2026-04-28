
import React, { useState, useRef, useEffect } from 'react';
import { extractTradeData, extractAccountData, parseBulkText } from '../geminiService';
import { TradeEntry, TradingAccount } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (data: any, type: 'account' | 'trade') => void;
  mode: 'account' | 'trade';
  existingAccounts: TradingAccount[];
}

interface FileStatus {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'success' | 'error' | 'account_missing';
  error?: string;
  count?: number;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess, mode, existingAccounts }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'bulk'>('upload');
  const [queue, setQueue] = useState<FileStatus[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk Entry State
  const [bulkText, setBulkText] = useState('');
  const [isBulkAnalysing, setIsBulkAnalysing] = useState(false);

  // Manual Trade Form State
  const [manualTrade, setManualTrade] = useState({
    accountNumber: existingAccounts.length > 0 ? existingAccounts[0].accountNumber : '',
    date: new Date().toISOString().split('T')[0],
    netProfit: '',
    tradesCount: '',
    winCount: '',
    lossCount: '',
    notes: ''
  });

  // Manual Account Form State
  const [manualAccount, setManualAccount] = useState({
    accountNumber: '',
    accountName: '',
    broker: '',
    currency: 'USD'
  });

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (activeTab !== 'upload') return;
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleImageSource(blob);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  const handleImageSource = (source: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newStatus: FileStatus = {
        id: crypto.randomUUID(),
        file: source,
        preview: reader.result as string,
        status: 'pending'
      };
      setQueue(prev => [...prev, newStatus]);
    };
    reader.readAsDataURL(source);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      (Array.from(selectedFiles) as File[]).forEach(file => handleImageSource(file));
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'trade') {
      const newEntry: TradeEntry = {
        id: crypto.randomUUID(),
        accountNumber: manualTrade.accountNumber,
        date: manualTrade.date,
        netProfit: parseFloat(manualTrade.netProfit) || 0,
        tradesCount: parseInt(manualTrade.tradesCount) || 0,
        winCount: parseInt(manualTrade.winCount) || 0,
        lossCount: parseInt(manualTrade.lossCount) || 0,
        notes: manualTrade.notes,
      };
      onSuccess(newEntry, 'trade');
    } else {
      const newAccount: TradingAccount = {
        id: crypto.randomUUID(),
        accountNumber: manualAccount.accountNumber || `ACC-${Math.floor(Math.random() * 10000)}`,
        accountName: manualAccount.accountName || 'Manual Account',
        broker: manualAccount.broker,
        currency: manualAccount.currency,
      };
      onSuccess(newAccount, 'account');
    }
    onClose();
  };

  const handleBulkAnalyse = async () => {
    if (!bulkText.trim() || isBulkAnalysing) return;
    setIsBulkAnalysing(true);
    try {
      const result = await parseBulkText(bulkText);
      
      // Process extracted accounts
      if (result.accounts && result.accounts.length > 0) {
        result.accounts.forEach(acc => {
          onSuccess({
            ...acc,
            id: crypto.randomUUID(),
            accountName: acc.accountName || acc.accountNumber || 'Imported Account',
            broker: acc.broker || 'Manual Import',
            currency: acc.currency || 'USD'
          }, 'account');
        });
      }

      // Process extracted entries
      if (result.entries && result.entries.length > 0) {
        result.entries.forEach(entry => {
          onSuccess({
            ...entry,
            id: crypto.randomUUID(),
            date: entry.date || new Date().toISOString().split('T')[0],
            netProfit: entry.netProfit || 0,
            tradesCount: entry.tradesCount || 0,
            winCount: entry.winCount || 0,
            lossCount: entry.lossCount || 0
          }, 'trade');
        });
      }
      
      onClose();
    } catch (error) {
      alert("Neural analysis of bulk text failed. Please check the format.");
    } finally {
      setIsBulkAnalysing(false);
    }
  };

  const processQueue = async () => {
    if (isProcessingAll || queue.length === 0) return;
    setIsProcessingAll(true);

    const updatedQueue = [...queue];
    
    for (let i = 0; i < updatedQueue.length; i++) {
      if (updatedQueue[i].status !== 'pending') continue;

      updatedQueue[i].status = 'processing';
      setQueue([...updatedQueue]);

      try {
        if (mode === 'trade') {
          const results = await extractTradeData(updatedQueue[i].preview);
          let successCount = 0;
          let missingCount = 0;

          for (const extracted of results) {
            const accNum = extracted.accountNumber?.trim().toUpperCase();
            const match = existingAccounts.find(a => a.accountNumber?.trim().toUpperCase() === accNum);

            if (!match) {
              missingCount++;
            } else {
              let finalDate = new Date().toISOString().split('T')[0];
              if (extracted.date) {
                  const d = new Date(extracted.date);
                  if (!isNaN(d.getTime())) finalDate = d.toISOString().split('T')[0];
              }

              const newEntry: TradeEntry = {
                id: crypto.randomUUID(),
                accountNumber: extracted.accountNumber || '',
                date: finalDate,
                netProfit: extracted.netProfit || 0,
                tradesCount: extracted.tradesCount || 0,
                winCount: extracted.winCount || 0,
                lossCount: extracted.lossCount || 0,
                avgTradeDuration: extracted.avgTradeDuration,
                screenshotUrl: updatedQueue[i].preview,
              };
              onSuccess(newEntry, 'trade');
              successCount++;
            }
          }

          if (successCount > 0) {
            updatedQueue[i].status = 'success';
            updatedQueue[i].count = successCount;
            if (missingCount > 0) updatedQueue[i].error = `${missingCount} accounts not matched.`;
          } else {
            updatedQueue[i].status = 'account_missing';
            updatedQueue[i].error = "No matched accounts found.";
          }
        } else {
          const results = await extractAccountData(updatedQueue[i].preview);
          for (const extracted of results) {
            const newAccount: TradingAccount = {
              id: crypto.randomUUID(),
              accountNumber: extracted.accountNumber || 'Unknown',
              accountName: extracted.accountName || extracted.accountNumber || 'New Account',
              broker: extracted.broker || '',
              currency: extracted.currency || 'USD',
            };
            onSuccess(newAccount, 'account');
          }
          updatedQueue[i].status = 'success';
          updatedQueue[i].count = results.length;
        }
      } catch (err) {
        updatedQueue[i].status = 'error';
        updatedQueue[i].error = "Extraction failed.";
      }
      setQueue([...updatedQueue]);
      await new Promise(r => setTimeout(r, 600)); 
    }

    setIsProcessingAll(false);
  };

  const removeFromFile = (id: string) => {
    setQueue(prev => prev.filter(f => f.id !== id));
  };

  const allProcessed = queue.length > 0 && queue.every(f => f.status === 'success' || f.status === 'error' || f.status === 'account_missing');

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="bg-slate-900 border-t md:border border-white/10 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300 relative">
        
        {/* Deep Tech Header */}
        <div className="p-8 border-b border-white/5 flex flex-col gap-6 bg-slate-900/40 backdrop-blur-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase">
                {mode === 'trade' ? 'Sync Performance' : 'Account Registry'}
              </h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                {activeTab === 'upload' ? `${queue.length} items in sync queue` : activeTab === 'manual' ? 'Manual entry terminal active' : 'Bulk data parsing active'}
              </p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-500 hover:text-white transition-all">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              AI Extraction
            </button>
            <button 
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Manual Entry
            </button>
            <button 
              onClick={() => setActiveTab('bulk')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'bulk' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Bulk Paste
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950/20">
          
          {activeTab === 'upload' ? (
            queue.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) (Array.from(e.dataTransfer.files) as File[]).forEach(f => handleImageSource(f));
                }}
                className="border-2 border-dashed border-white/5 rounded-[2rem] h-64 md:h-80 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(0,112,255,0.2)] border border-blue-500/20">
                  <i className={`fa-solid ${mode === 'trade' ? 'fa-images' : 'fa-id-card'} text-3xl`}></i>
                </div>
                <div className="text-center px-6 relative z-10">
                  <p className="text-white font-black text-xl tracking-tight uppercase">Upload Screenshots</p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Paste images or click to browse</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {queue.map((item) => (
                  <div key={item.id} className="flex items-center gap-6 bg-white/[0.02] border border-white/5 p-4 rounded-3xl animate-in fade-in slide-in-from-left-2 duration-200 group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                      <img src={item.preview} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-black truncate uppercase tracking-widest">{item.file.name}</p>
                      <div className="mt-2 flex items-center gap-2">
                         {item.status === 'pending' && <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Awaiting Uplink</span>}
                         {item.status === 'processing' && <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-sync animate-spin"></i> Neural Parsing...</span>}
                         {item.status === 'success' && <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-circle-check"></i> {item.count} Extracted</span>}
                         {item.status === 'error' && <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i> Sync Error</span>}
                         {item.status === 'account_missing' && <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-user-xmark"></i> Missing Vault</span>}
                      </div>
                    </div>
                    {!isProcessingAll && item.status !== 'processing' && (
                      <button onClick={() => removeFromFile(item.id)} className="text-slate-600 hover:text-rose-500 p-3 transition-colors opacity-0 group-hover:opacity-100">
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'bulk' ? (
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Paste Raw Ledger / Account Text</label>
                <textarea 
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Paste account numbers, trade history, or P&L tables here. Our neural engine will reconstruct the data matrix automatically."
                  className="flex-1 w-full bg-white/[0.03] border border-white/10 px-8 py-6 rounded-[2rem] text-white outline-none font-medium focus:border-blue-500/50 resize-none custom-scrollbar leading-relaxed"
                ></textarea>
              </div>
              <div className="p-5 bg-blue-600/5 border border-blue-600/20 rounded-2xl flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed flex-1">
                   Neural analysis will identify multiple accounts and trade entries from unstructured text.
                 </p>
              </div>
            </div>
          ) : (
            /* Manual Entry Forms */
            mode === 'trade' ? (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Account</label>
                    <select 
                      value={manualTrade.accountNumber}
                      onChange={(e) => setManualTrade({...manualTrade, accountNumber: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                    >
                      {existingAccounts.map(acc => (
                        <option key={acc.id} value={acc.accountNumber} className="bg-slate-900 text-white">{acc.accountName} ({acc.accountNumber})</option>
                      ))}
                      {existingAccounts.length === 0 && <option value="">No accounts found</option>}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Execution Date</label>
                      <input 
                        type="date" required
                        value={manualTrade.date}
                        onChange={(e) => setManualTrade({...manualTrade, date: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Net P&L ($)</label>
                      <input 
                        type="number" step="0.01" required placeholder="0.00"
                        value={manualTrade.netProfit}
                        onChange={(e) => setManualTrade({...manualTrade, netProfit: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                      />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Trades</label>
                      <input 
                        type="number" required placeholder="0"
                        value={manualTrade.tradesCount}
                        onChange={(e) => setManualTrade({...manualTrade, tradesCount: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Wins</label>
                      <input 
                        type="number" required placeholder="0"
                        value={manualTrade.winCount}
                        onChange={(e) => setManualTrade({...manualTrade, winCount: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Losses</label>
                      <input 
                        type="number" required placeholder="0"
                        value={manualTrade.lossCount}
                        onChange={(e) => setManualTrade({...manualTrade, lossCount: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                      />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notes / Context</label>
                    <textarea 
                      placeholder="Describe market conditions..."
                      value={manualTrade.notes}
                      onChange={(e) => setManualTrade({...manualTrade, notes: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50 h-24 resize-none"
                    ></textarea>
                </div>
              </form>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Number / ID</label>
                  <input 
                    type="text" required placeholder="APEX-123456"
                    value={manualAccount.accountNumber}
                    onChange={(e) => setManualAccount({...manualAccount, accountNumber: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Display Name</label>
                  <input 
                    type="text" required placeholder="Primary Funded Account"
                    value={manualAccount.accountName}
                    onChange={(e) => setManualAccount({...manualAccount, accountName: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Platform / Broker</label>
                    <input 
                      type="text" required placeholder="Tradovate"
                      value={manualAccount.broker}
                      onChange={(e) => setManualAccount({...manualAccount, broker: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Currency</label>
                    <select 
                      value={manualAccount.currency}
                      onChange={(e) => setManualAccount({...manualAccount, currency: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-white outline-none font-bold focus:border-blue-500/50"
                    >
                      <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
                      <option value="EUR" className="bg-slate-900 text-white">EUR (€)</option>
                      <option value="GBP" className="bg-slate-900 text-white">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </form>
            )
          )}
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-white/5 bg-slate-900/40 backdrop-blur-2xl flex flex-col gap-4">
          {activeTab === 'upload' ? (
            <>
              {queue.length > 0 && !allProcessed && (
                <button 
                  onClick={processQueue} 
                  disabled={isProcessingAll}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] shadow-[0_15px_40px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs border border-blue-400/20"
                >
                  {isProcessingAll ? <><i className="fa-solid fa-sync animate-spin"></i> Analyzing Delta...</> : <><i className="fa-solid fa-bolt-lightning"></i> Initialize Sync</>}
                </button>
              )}

              {allProcessed && (
                <button 
                  onClick={onClose}
                  className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white font-black py-5 rounded-[1.5rem] transition-all uppercase tracking-[0.2em] text-xs border border-white/10"
                >
                  Complete Sync
                </button>
              )}

              {queue.length > 0 && !isProcessingAll && !allProcessed && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 font-black text-[10px] hover:text-blue-400 transition-colors uppercase tracking-[0.3em] text-center"
                >
                  <i className="fa-solid fa-plus mr-2"></i> Append Files
                </button>
              )}
            </>
          ) : activeTab === 'bulk' ? (
            <button 
              onClick={handleBulkAnalyse}
              disabled={!bulkText.trim() || isBulkAnalysing}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] shadow-[0_15px_40px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs border border-blue-400/20"
            >
              {isBulkAnalysing ? <><i className="fa-solid fa-sync animate-spin"></i> Analyzing Matrix...</> : <><i className="fa-solid fa-bolt-lightning"></i> Analyse Bulk Entries</>}
            </button>
          ) : (
            <button 
              onClick={handleManualSubmit}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-[0_15px_40px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs border border-blue-400/20"
            >
              <i className="fa-solid fa-paper-plane"></i> {mode === 'trade' ? 'Deploy Entry' : 'Register Account'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
