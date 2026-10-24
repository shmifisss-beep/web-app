import React from 'react';
import { cn } from '../../lib/utils';
import { HAS_API, clearToken } from '../../lib/api';

export type TabType = 'positions' | 'backtests';
const TABS: { id: TabType; label: string }[] = [
  { id: 'positions', label: 'Разборы позиций' },
  { id: 'backtests', label: 'Бэктесты' },
];

const Navbar: React.FC<{ activeTab: TabType; onTabChange: (t: TabType) => void }> = ({ activeTab, onTabChange }) => (
  <header className="border-b border-slate-700">
    <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-8">
      <h1 className="text-xl font-semibold">TradeVault</h1>
      <nav className="flex gap-6 h-full">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={cn(
              'text-sm h-full border-b-2 -mb-px',
              activeTab === t.id ? 'border-accent text-slate-100 font-medium' : 'border-transparent text-slate-400 hover:text-slate-100',
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {HAS_API && (
        <button onClick={() => { clearToken(); location.reload(); }} className="ml-auto text-sm text-slate-500 hover:text-slate-100">
          Выйти
        </button>
      )}
    </div>
  </header>
);

export default Navbar;
