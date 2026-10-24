import React, { useState } from 'react';
import type { Backtest, Timeframe } from '../../types';
import MediaGallery from '../../components/MediaGallery/MediaGallery';
import MediaDropzone from '../../components/MediaDropzone/MediaDropzone';
import { Drawer, Field, FormShell, Md, MdField, PageHead, State, TIMEFRAMES, inputCls } from '../../components/ui';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { useEntries } from '../../hooks/useEntries';
import { cn, formatDateShort } from '../../lib/utils';

const signed = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
const METRICS = [
  ['totalTrades', 'Сделок'], ['winRate', 'Win rate, %'], ['profitFactor', 'Profit factor'],
  ['totalPnlPercent', 'PnL, %'], ['maxDrawdownPercent', 'Макс. просадка, %'],
] as const;

const BacktestForm: React.FC<{ onSave: (b: Backtest) => Promise<unknown>; onClose: () => void }> = ({ onSave, onClose }) => {
  const { uploads, addFiles, uploadAll, removeFile } = useMediaUpload();
  const [f, setF] = useState({
    strategyName: '', ticker: '', timeframe: '1h' as Timeframe, dateFrom: '', dateTo: '', description: '',
    totalTrades: '', winRate: '', profitFactor: '', totalPnlPercent: '', maxDrawdownPercent: '',
  });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  return (
    <FormShell
      onCancel={onClose}
      onSubmit={async () => {
        const media = await uploadAll();
        await onSave({
          id: crypto.randomUUID(), strategyName: f.strategyName.trim(), ticker: f.ticker.trim().toUpperCase(),
          timeframe: f.timeframe, dateFrom: f.dateFrom, dateTo: f.dateTo, description: f.description, media,
          totalTrades: Number(f.totalTrades), winRate: Number(f.winRate), profitFactor: Number(f.profitFactor),
          totalPnlPercent: Number(f.totalPnlPercent), maxDrawdownPercent: Math.abs(Number(f.maxDrawdownPercent)),
          createdAt: new Date().toISOString(),
        });
        onClose();
      }}
    >
      <Field label="Стратегия"><input required value={f.strategyName} onChange={(e) => set('strategyName', e.target.value)} className={inputCls} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Тикер"><input required value={f.ticker} onChange={(e) => set('ticker', e.target.value)} className={inputCls} placeholder="BTC/USDT" /></Field>
        <Field label="Таймфрейм">
          <select value={f.timeframe} onChange={(e) => set('timeframe', e.target.value)} className={inputCls}>{TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}</select>
        </Field>
        <Field label="Период с"><input type="date" required value={f.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} className={inputCls} /></Field>
        <Field label="Период по"><input type="date" required value={f.dateTo} onChange={(e) => set('dateTo', e.target.value)} className={inputCls} /></Field>
        {METRICS.map(([k, label]) => (
          <Field key={k} label={label}><input type="number" step="any" required value={f[k]} onChange={(e) => set(k, e.target.value)} className={inputCls} /></Field>
        ))}
      </div>
      <Field label="Выводы (Markdown)"><MdField value={f.description} onChange={(v) => set('description', v)} /></Field>
      <Field label="Скриншоты (эквити, сделки)"><MediaDropzone uploads={uploads} onAddFiles={addFiles} onRemove={removeFile} /></Field>
    </FormShell>
  );
};

const BacktestsPage: React.FC = () => {
  const { list, loading, error, add, remove } = useEntries<Backtest>('backtests');
  const [sel, setSel] = useState<Backtest | null>(null);
  const [adding, setAdding] = useState(false);
  const R = 'text-right pr-4 num';

  return (
    <>
      <PageHead title="Бэктесты" count={list.length} onAdd={() => setAdding(true)} />
      <State loading={loading} error={error} empty={!list.length} />
      {list.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700">
                <th className="py-2 pr-4 text-left font-normal">Стратегия</th><th className="pr-4 text-left font-normal">Инструмент</th>
                <th className="pr-4 text-left font-normal">Период</th>
                {['Сделок', 'Win rate', 'PF', 'PnL', 'Просадка'].map((h, i) => <th key={h} className={cn('font-normal text-right', i < 4 && 'pr-4')}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id} onClick={() => setSel(b)} className="border-b border-slate-800 hover:bg-slate-900 cursor-pointer">
                  <td className="py-3 pr-4 font-medium">{b.strategyName}</td>
                  <td className="pr-4 whitespace-nowrap">{b.ticker} <span className="num text-slate-500">{b.timeframe}</span></td>
                  <td className="pr-4 num text-slate-400 whitespace-nowrap">{formatDateShort(b.dateFrom)} – {formatDateShort(b.dateTo)}</td>
                  <td className={R}>{b.totalTrades}</td><td className={R}>{b.winRate.toFixed(1)}%</td><td className={R}>{b.profitFactor.toFixed(2)}</td>
                  <td className={cn(R, 'font-medium', b.totalPnlPercent >= 0 ? 'text-up' : 'text-down')}>{signed(b.totalPnlPercent)}</td>
                  <td className="text-right num text-down">−{b.maxDrawdownPercent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sel && (
        <Drawer title={sel.strategyName} onClose={() => setSel(null)}>
          <p className="text-slate-400 mb-4">{sel.ticker}, {sel.timeframe}, {formatDateShort(sel.dateFrom)} – {formatDateShort(sel.dateTo)}</p>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-4 mb-6 border-y border-slate-700 py-4">
            {[
              ['Сделок', String(sel.totalTrades)], ['Win rate', `${sel.winRate.toFixed(1)}%`], ['Profit factor', sel.profitFactor.toFixed(2)],
              ['PnL', signed(sel.totalPnlPercent)], ['Просадка', `−${sel.maxDrawdownPercent.toFixed(1)}%`],
            ].map(([k, v]) => (
              <div key={k}><dt className="text-sm text-slate-500">{k}</dt><dd className="num text-xl font-semibold">{v}</dd></div>
            ))}
          </dl>
          {sel.media.length > 0 && <div className="mb-6"><MediaGallery media={sel.media} /></div>}
          <Md value={sel.description} />
          <button
            className="mt-8 text-sm text-down hover:underline"
            onClick={async () => { if (confirm('Удалить запись? Файлы в хранилище останутся.')) { await remove(sel.id); setSel(null); } }}
          >
            Удалить запись
          </button>
        </Drawer>
      )}
      {adding && <Drawer title="Новый бэктест" onClose={() => setAdding(false)}><BacktestForm onSave={add} onClose={() => setAdding(false)} /></Drawer>}
    </>
  );
};

export default BacktestsPage;
