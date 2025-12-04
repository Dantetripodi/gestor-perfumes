import React from 'react';
import { useStore } from '../context/StoreContext';
import { LayoutDashboard, ShoppingBag, ArrowRightLeft, Settings, Package, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { exchangeRate } = useStore();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'inventory', label: 'Stock', icon: Package },
    { id: 'sales', label: 'POS', icon: ShoppingBag },
    { id: 'transactions', label: 'History', icon: ArrowRightLeft },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900 pb-20 md:pb-0 flex md:flex-row flex-col">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-950 text-white h-screen sticky top-0 shadow-2xl z-50">
        <div className="p-8 pb-4">
           <h1 className="text-3xl font-bold tracking-tight text-white">
             PARFUMIER<span className="text-amber-500">.</span>
           </h1>
           <p className="text-xs text-slate-400 mt-2 tracking-[0.2em] uppercase">Luxury Resale System</p>
        </div>

        <div className="px-4 py-2">
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">USD Blue Rate</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold text-emerald-400">${exchangeRate.sell}</span>
                    <span className="text-xs text-slate-500">ARS</span>
                </div>
                <div className="text-[10px] text-slate-600 mt-1 flex justify-between">
                    <span>Buy: ${exchangeRate.buy}</span>
                    <span className={exchangeRate.source === 'API' ? 'text-blue-400' : 'text-amber-500'}>
                        {exchangeRate.source === 'API' ? '● Live' : '● Manual'}
                    </span>
                </div>
            </div>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                activePage === item.id 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <item.icon size={20} className={`mr-3 transition-transform duration-200 ${activePage === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 text-center">
            <p className="text-[10px] text-slate-600">v1.2.0 • Pro Edition</p>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-950 text-white p-4 sticky top-0 z-40 shadow-lg flex justify-between items-center">
        <div>
            <h1 className="text-lg font-bold tracking-wider">PARFUMIER<span className="text-amber-500">.</span></h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-emerald-400 font-bold">$ {exchangeRate.sell}</span>
                <span className="opacity-50">|</span>
                <span className={exchangeRate.source === 'API' ? 'text-blue-400' : 'text-amber-500'}>
                    {exchangeRate.source}
                </span>
            </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <span className="font-bold text-xs text-amber-500">P</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)] md:min-h-screen animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 pb-safe">
        {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activePage === item.id ? 'text-amber-600' : 'text-slate-400'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${activePage === item.id ? 'bg-amber-100' : 'bg-transparent'}`}>
                <item.icon size={24} strokeWidth={activePage === item.id ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
        ))}
      </nav>
      
      {/* Safe area spacer for mobile bottom nav */}
      <div className="h-safe-bottom md:hidden"></div>
    </div>
  );
};