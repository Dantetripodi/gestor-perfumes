import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { RefreshCw, Save, DollarSign, Database, AlertCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { exchangeRate, toggleRateSource, setManualExchangeRate, refreshExchangeRate } = useStore();
  const [manualRate, setManualRate] = useState(exchangeRate.sell);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualSave = () => {
    setManualExchangeRate(manualRate);
    alert('Manual rate saved successfully.');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshExchangeRate();
    setIsRefreshing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-0">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">System configuration and preferences.</p>
      </div>

      {/* Currency Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <DollarSign size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Currency Strategy</h3>
                <p className="text-xs text-slate-500">Manage how the system handles USD to ARS conversion.</p>
            </div>
        </div>
        
        <div className="p-6 space-y-8">
            <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-xl">
                <button 
                    onClick={() => toggleRateSource('API')}
                    className={`py-3 px-4 rounded-lg font-bold text-sm transition-all shadow-sm ${
                        exchangeRate.source === 'API' 
                        ? 'bg-white text-slate-900 shadow' 
                        : 'bg-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Auto (API)
                </button>
                <button 
                    onClick={() => toggleRateSource('MANUAL')}
                    className={`py-3 px-4 rounded-lg font-bold text-sm transition-all shadow-sm ${
                        exchangeRate.source === 'MANUAL' 
                        ? 'bg-white text-slate-900 shadow' 
                        : 'bg-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Manual Fixed
                </button>
            </div>

            {exchangeRate.source === 'API' ? (
                <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Live Rate Active</p>
                        </div>
                        <p className="text-4xl font-mono font-bold text-slate-900 tracking-tight">${exchangeRate.sell}</p>
                        <p className="text-xs text-slate-400 mt-2">Last Updated: {new Date(exchangeRate.lastUpdated).toLocaleString()}</p>
                    </div>
                    <button 
                        onClick={handleRefresh} 
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all active:scale-95 text-slate-700 font-medium disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={`text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
                    <label className="block text-sm font-bold text-amber-900 mb-3">Manual USD Sell Rate</label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-4 text-amber-300 font-bold">$</span>
                            <input 
                                type="number" 
                                value={manualRate}
                                onChange={(e) => setManualRate(Number(e.target.value))}
                                className="w-full p-3 pl-8 border border-amber-200 rounded-xl text-xl font-mono font-bold text-amber-900 bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                            />
                        </div>
                        <button 
                            onClick={handleManualSave}
                            className="bg-amber-500 text-white px-6 rounded-xl hover:bg-amber-600 flex items-center gap-2 font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
                        >
                            <Save size={20} /> Save
                        </button>
                    </div>
                    <div className="flex items-start gap-2 mt-4 text-amber-700 bg-amber-100/50 p-3 rounded-lg">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>
                        <p className="text-xs leading-relaxed">
                            This static rate will be used for all future calculations until changed. Useful when the market is volatile or offline.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <Database size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Data Zone</h3>
                <p className="text-xs text-slate-500">Manage application local storage.</p>
            </div>
        </div>
        <div className="p-6">
             <button 
                onClick={() => {
                    if(window.confirm('Are you absolutely sure? This will permanently delete all sales and inventory data from this device.')) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}
                className="w-full md:w-auto text-red-600 border border-red-200 px-6 py-3 rounded-xl hover:bg-red-50 text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 size={18} className="mb-0.5" />
                Factory Reset App
            </button>
        </div>
      </div>
      
      <div className="text-center text-xs text-slate-300 pt-8 pb-4">
        Parfumier Pro &copy; 2025
      </div>
    </div>
  );
// Helper for the icon in the Reset button
function Trash2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}
};