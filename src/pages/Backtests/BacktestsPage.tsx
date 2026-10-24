import React, { useState } from 'react';
import { MOCK_BACKTESTS } from '../../lib/mock-data';
import type { Backtest } from '../../types';
import MediaGallery from '../../components/MediaGallery/MediaGallery';
import MediaDropzone from '../../components/MediaDropzone/MediaDropzone';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { cn, formatDateShort } from '../../lib/utils';
import { Plus, X, Save, Loader2, CheckCircle2, TrendingUp, TrendingDown, Activity, Target, BarChart2, AlertTriangle } from 'lucide-react';

// ─── Stat Pill ────────────────────────────────────────────────────────────────
const Stat: React.FC<{ label: string; value: string; good?: boolean; warn?: boolean }> = ({ label, value, good, warn }) => (
  <div className="bg-slate-800/60 rounded-xl p-3 text-center">
    <div className={cn('text-lg font-bold', good ? 'text-emerald-400' : warn ? 'text-amber-400' : 'text-white')}>{value}</div>
    <div className="text-slate-500 text-xs mt-0.5">{label}</div>
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
const BacktestCard: React.FC<{ bt: Backtest; onClick: () => void }> = ({ bt, onClick }) => {
  const thumb = bt.media.find(m => m.type === 'image')?.url;
  const isGood = bt.totalPnlPercent > 0;

  return (
    <div
      onClick={onClick}
      className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 hover:shadow-xl hover:shadow-black/40 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-slate-800">
        {thumb
          ? <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><BarChart2 className="w-10 h-10 text-slate-700" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="text-white font-bold text-sm">{bt.ticker}</span>
          <span className="ml-2 text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">{bt.timeframe}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-white font-semibold text-sm leading-snug line-clamp-1">{bt.strategyName}</p>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          <div className="bg-slate-800 rounded-lg py-1.5">
            <div className={cn('font-bold', bt.winRate >= 60 ? 'text-emerald-400' : bt.winRate >= 50 ? 'text-amber-400' : 'text-rose-400')}>
              {bt.winRate}%
            </div>
            <div className="text-slate-600">Win</div>
          </div>
          <div className="bg-slate-800 rounded-lg py-1.5">
            <div className={cn('font-bold', isGood ? 'text-emerald-400' : 'text-rose-400')}>
              {isGood ? '+' : ''}{bt.totalPnlPercent}%
            </div>
            <div className="text-slate-600">PnL</div>
          </div>
          <div className="bg-slate-800 rounded-lg py-1.5">
            <div className="font-bold text-slate-200">{bt.profitFactor}x</div>
            <div className="text-slate-600">PF</div>
          </div>
        </div>

        <p className="text-slate-600 text-xs">{formatDateShort(bt.dateFrom)} — {formatDateShort(bt.dateTo)} · {bt.totalTrades} сделок</p>
      </div>
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const BacktestDetail: React.FC<{ bt: Backtest; onClose: () => void }> = ({ bt, onClose }) => (
  <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4">
    <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl">
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div>
          <h2 className="text-white font-bold text-xl">{bt.strategyName}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{bt.ticker} · {bt.timeframe} · {formatDateShort(bt.dateFrom)} — {formatDateShort(bt.dateTo)}</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white p-1"><X className="w-5 h-5" /></button>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Win Rate" value={`${bt.winRate}%`} good={bt.winRate >= 60} warn={bt.winRate >= 50 && bt.winRate < 60} />
          <Stat label="Total PnL" value={`${bt.totalPnlPercent > 0 ? '+' : ''}${bt.totalPnlPercent}%`} good={bt.totalPnlPercent > 0} />
          <Stat label="Profit Factor" value={`${bt.profitFactor}x`} good={bt.profitFactor >= 2} warn={bt.profitFactor >= 1.5} />
          <Stat label="Max Drawdown" value={`-${bt.maxDrawdownPercent}%`} warn={bt.maxDrawdownPercent > 15} />
        </div>
        <div className="flex gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" />{bt.totalTrades} сделок</span>
        </div>

        {/* Media */}
        {bt.media.length > 0 && (
          <div>
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Скриншоты</h3>
            <MediaGallery media={bt.media} />
          </div>
        )}

        {/* Analysis */}
        <div>
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Описание и выводы</h3>
          <div className="text-slate-300 text-sm leading-relaxed">
            {bt.description.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h2 key={i} className="text-white font-bold text-base mt-4 mb-1">{line.slice(3)}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-slate-200 font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h3>;
              if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 text-slate-300">{line.slice(2)}</li>;
              if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-white">{line.slice(2, -2)}</p>;
              if (line.trim() === '') return <div key={i} className="h-1" />;
              return <p key={i} className="text-slate-300">{line}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Add Form ─────────────────────────────────────────────────────────────────
const TIMEFRAMES = ['1m','5m','15m','30m','1h','4h','1d','1w'] as const;
const inp = 'w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors';

const AddBacktestForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { uploads, addFiles, uploadAll, removeFile } = useMediaUpload();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    strategyName: '', ticker: '', timeframe: '4h' as typeof TIMEFRAMES[number],
    dateFrom: '', dateTo: '', totalTrades: '', winRate: '',
    profitFactor: '', totalPnlPercent: '', maxDrawdownPercent: '', description: '',
  });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await uploadAll();
    await new Promise(r => setTimeout(r, 600));
    setDone(true);
    setTimeout(onClose, 1200);
  };

  if (done) return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center gap-3">
        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        <p className="text-white font-semibold">Бэктест сохранён!</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4">
      <form onSubmit={handleSave} className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg">Новый бэктест</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Название стратегии *</label>
              <input className={inp} placeholder="EMA 50/200 Trend Follow" value={form.strategyName} onChange={e => set('strategyName', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Тикер</label>
              <input className={inp} placeholder="BTC/USDT" value={form.ticker} onChange={e => set('ticker', e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Таймфрейм</label>
              <div className="flex flex-wrap gap-1">
                {TIMEFRAMES.map(tf => (
                  <button key={tf} type="button" onClick={() => set('timeframe', tf)}
                    className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      form.timeframe === tf ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                    )}>{tf}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Период от</label>
              <input type="date" className={inp} value={form.dateFrom} onChange={e => set('dateFrom', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Период до</label>
              <input type="date" className={inp} value={form.dateTo} onChange={e => set('dateTo', e.target.value)} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'totalTrades', label: 'Кол-во сделок', placeholder: '47' },
              { key: 'winRate', label: 'Win Rate %', placeholder: '68.1' },
              { key: 'profitFactor', label: 'Profit Factor', placeholder: '2.4' },
              { key: 'totalPnlPercent', label: 'Total PnL %', placeholder: '184.3' },
              { key: 'maxDrawdownPercent', label: 'Max DD %', placeholder: '12.7' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">{label}</label>
                <input type="number" step="any" className={inp} placeholder={placeholder} value={(form as any)[key]} onChange={e => set(key as any, e.target.value)} />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5">Скриншоты / Графики</label>
            <MediaDropzone uploads={uploads} onAddFiles={addFiles} onRemove={removeFile} />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5">Описание и выводы</label>
            <textarea rows={7} className={cn(inp, 'resize-y font-mono text-xs leading-relaxed')}
              placeholder="## Правила стратегии&#10;1. ...&#10;&#10;### Выводы&#10;✅ ...&#10;❌ ..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors">Отмена</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const BacktestsPage: React.FC = () => {
  const [selected, setSelected] = useState<Backtest | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Бэктесты</h2>
          <p className="text-slate-500 text-sm mt-0.5">{MOCK_BACKTESTS.length} бэктеста</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить бэктест
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MOCK_BACKTESTS.map(bt => (
          <BacktestCard key={bt.id} bt={bt} onClick={() => setSelected(bt)} />
        ))}
      </div>

      {selected && <BacktestDetail bt={selected} onClose={() => setSelected(null)} />}
      {adding && <AddBacktestForm onClose={() => setAdding(false)} />}
    </div>
  );
};

export default BacktestsPage;
