import React, { useState } from 'react';
import { MOCK_POSITIONS } from '../../lib/mock-data';
import type { PositionAnalysis } from '../../types';
import MediaGallery from '../../components/MediaGallery/MediaGallery';
import MediaDropzone from '../../components/MediaDropzone/MediaDropzone';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { cn, formatDate } from '../../lib/utils';
import { Plus, ArrowLeft, X, TrendingUp, TrendingDown, Save, Loader2, CheckCircle2 } from 'lucide-react';

// ─── Card ─────────────────────────────────────────────────────────────────────
const PositionCard: React.FC<{ pos: PositionAnalysis; onClick: () => void }> = ({ pos, onClick }) => {
  const thumb = pos.media.find(m => m.type === 'image')?.url;
  return (
    <div
      onClick={onClick}
      className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 hover:shadow-xl hover:shadow-black/40 transition-all duration-200 cursor-pointer"
    >
      <div className="relative h-44 bg-slate-800">
        {thumb
          ? <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-slate-700 text-sm">Нет скриншота</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="font-bold text-white text-base">{pos.ticker}</span>
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            pos.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          )}>
            {pos.direction === 'LONG' ? '↑' : '↓'} {pos.direction}
          </span>
          <span className="text-xs bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-full">{pos.timeframe}</span>
        </div>
      </div>
      <div className="p-4 space-y-1.5">
        <p className="text-white font-medium text-sm leading-snug line-clamp-2">{pos.title}</p>
        <p className="text-slate-500 text-xs">{formatDate(pos.date)}</p>
        {pos.media.length > 0 && (
          <p className="text-slate-600 text-xs">{pos.media.length} медиафайл{pos.media.length > 1 ? 'а' : ''}</p>
        )}
      </div>
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const PositionDetail: React.FC<{ pos: PositionAnalysis; onClose: () => void }> = ({ pos, onClose }) => (
  <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4">
    <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-xl">{pos.ticker}</span>
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-semibold',
            pos.direction === 'LONG' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
          )}>
            {pos.direction === 'LONG' ? <TrendingUp className="inline w-3.5 h-3.5 mr-1" /> : <TrendingDown className="inline w-3.5 h-3.5 mr-1" />}
            {pos.direction}
          </span>
          <span className="text-sm text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">{pos.timeframe}</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-white font-semibold text-lg">{pos.title}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{formatDate(pos.date)}</p>
        </div>

        {/* Media */}
        {pos.media.length > 0 && (
          <div>
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Скриншоты / Видео</h3>
            <MediaGallery media={pos.media} />
          </div>
        )}

        {/* Analysis */}
        <div>
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Разбор</h3>
          <div
            className="text-slate-300 text-sm leading-relaxed space-y-2 whitespace-pre-wrap"
            style={{ fontFamily: 'inherit' }}
          >
            {pos.description.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h2 key={i} className="text-white font-bold text-base mt-4 mb-1">{line.slice(3)}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-slate-200 font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h3>;
              if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 text-slate-300">{line.slice(2)}</li>;
              if (line.trim() === '') return <div key={i} className="h-1" />;
              return <p key={i} className="text-slate-300">{line.replace(/\*\*(.+?)\*\*/g, '$1')}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Add Form ────────────────────────────────────────────────────────────────
const TIMEFRAMES = ['1m','5m','15m','30m','1h','4h','1d','1w'] as const;
const inp = 'w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors';

const AddPositionForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { uploads, addFiles, uploadAll, removeFile } = useMediaUpload();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ ticker: '', direction: 'LONG' as 'LONG'|'SHORT', timeframe: '4h' as typeof TIMEFRAMES[number], date: new Date().toISOString().slice(0,10), title: '', description: '' });

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
        <p className="text-white font-semibold">Разбор сохранён!</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4">
      <form onSubmit={handleSave} className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg">Новый разбор позиции</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Тикер *</label>
              <input className={inp} placeholder="BTC/USDT" value={form.ticker} onChange={e => set('ticker', e.target.value.toUpperCase())} required />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Направление</label>
              <div className="flex gap-2">
                {(['LONG','SHORT'] as const).map(d => (
                  <button key={d} type="button" onClick={() => set('direction', d)}
                    className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors',
                      form.direction === d
                        ? d === 'LONG' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    )}>
                    {d === 'LONG' ? '↑ LONG' : '↓ SHORT'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Таймфрейм</label>
              <div className="flex flex-wrap gap-1">
                {TIMEFRAMES.map(tf => (
                  <button key={tf} type="button" onClick={() => set('timeframe', tf)}
                    className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      form.timeframe === tf ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    )}>{tf}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Дата</label>
              <input type="date" className={inp} value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5">Заголовок *</label>
            <input className={inp} placeholder="Пробой ключевого уровня..." value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5">Скриншоты / Видео</label>
            <MediaDropzone uploads={uploads} onAddFiles={addFiles} onRemove={removeFile} />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5">Разбор</label>
            <textarea rows={8} className={cn(inp, 'resize-y font-mono text-xs leading-relaxed')} placeholder="## Идея&#10;...&#10;&#10;### Вход&#10;...&#10;&#10;### Выводы&#10;✅ Что сработало&#10;❌ Ошибки" value={form.description} onChange={e => set('description', e.target.value)} />
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
const PositionsPage: React.FC = () => {
  const [selected, setSelected] = useState<PositionAnalysis | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Разборы позиций</h2>
          <p className="text-slate-500 text-sm mt-0.5">{MOCK_POSITIONS.length} разбора</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить разбор
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MOCK_POSITIONS.map(pos => (
          <PositionCard key={pos.id} pos={pos} onClick={() => setSelected(pos)} />
        ))}
      </div>

      {selected && <PositionDetail pos={selected} onClose={() => setSelected(null)} />}
      {adding && <AddPositionForm onClose={() => setAdding(false)} />}
    </div>
  );
};

export default PositionsPage;
