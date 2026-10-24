import React from 'react';
import { Layers, TestTube2, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

export type TabType = 'positions' | 'backtests';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm sm:text-base leading-tight">TradeVault</h1>
            <p className="text-slate-500 text-xs hidden sm:block">Медиа & Разборы трейдинга</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => onTabChange('positions')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === 'positions'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Layers className="w-4 h-4" />
            <span>Разбор позиций</span>
          </button>

          <button
            onClick={() => onTabChange('backtests')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === 'backtests'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <TestTube2 className="w-4 h-4" />
            <span>Бектесты</span>
          </button>
        </div>

        {/* Channel info badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>TG Channel Ready</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
