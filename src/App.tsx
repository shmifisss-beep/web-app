import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import type { TabType } from './components/Navbar/Navbar';
import PositionsPage from './pages/Positions/PositionsPage';
import BacktestsPage from './pages/Backtests/BacktestsPage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('positions');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {activeTab === 'positions' ? <PositionsPage /> : <BacktestsPage />}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        TradeVault &bull; Медиа-хранилище торговых разборов и бэктестов
      </footer>
    </div>
  );
};

export default App;
