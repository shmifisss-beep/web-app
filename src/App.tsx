import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import type { TabType } from './components/Navbar/Navbar';
import PositionsPage from './pages/Positions/PositionsPage';
import BacktestsPage from './pages/Backtests/BacktestsPage';
import { HAS_API, getToken, setToken } from './lib/api';
import { inputCls } from './components/ui';

const Login: React.FC = () => {
  const [v, setV] = useState('');
  return (
    <form
      className="max-w-sm mx-auto mt-32 px-4 space-y-3"
      onSubmit={(e) => { e.preventDefault(); if (v.trim()) { setToken(v); location.reload(); } }}
    >
      <h1 className="text-2xl font-semibold">TradeVault</h1>
      <p className="text-sm text-slate-400">Введите токен доступа — тот, что вы задали командой <code>wrangler secret put AUTH_TOKEN</code>.</p>
      <input type="password" autoFocus value={v} onChange={(e) => setV(e.target.value)} className={inputCls} placeholder="Токен" />
      <button className="bg-accent text-white px-5 py-2 text-sm font-medium">Войти</button>
    </form>
  );
};

const App: React.FC = () => {
  const [tab, setTab] = useState<TabType>('positions');
  if (HAS_API && !getToken()) return <Login />;
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeTab={tab} onTabChange={setTab} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {tab === 'positions' ? <PositionsPage /> : <BacktestsPage />}
      </main>
    </div>
  );
};

export default App;
