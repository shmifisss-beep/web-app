import React, { useState } from 'react';
import type { PositionAnalysis, Direction, Timeframe } from '../../types';
import MediaGallery from '../../components/MediaGallery/MediaGallery';
import MediaDropzone from '../../components/MediaDropzone/MediaDropzone';
import { Drawer, Field, FormShell, Md, MdField, PageHead, State, TIMEFRAMES, inputCls } from '../../components/ui';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { useEntries } from '../../hooks/useEntries';
import { cn, formatDateShort } from '../../lib/utils';

const sideCls = (d: Direction) => (d === 'LONG' ? 'text-up' : 'text-down');

const PositionForm: React.FC<{ onSave: (p: PositionAnalysis) => Promise<unknown>; onClose: () => void }> = ({ onSave, onClose }) => {
  const { uploads, addFiles, uploadAll, removeFile } = useMediaUpload();
  const [f, setF] = useState({
    ticker: '', direction: 'LONG' as Direction, timeframe: '4h' as Timeframe,
    date: new Date().toISOString().slice(0, 10), title: '', description: '',
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  return (
    <FormShell
      onCancel={onClose}
      onSubmit={async () => {
        const media = await uploadAll();
        await onSave({ ...f, ticker: f.ticker.trim().toUpperCase(), title: f.title.trim(), id: crypto.randomUUID(), media, createdAt: new Date().toISOString() });
        onClose();
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Тикер"><input required value={f.ticker} onChange={(e) => set('ticker', e.target.value)} className={inputCls} placeholder="BTC/USDT" /></Field>
        <Field label="Дата"><input type="date" required value={f.date} onChange={(e) => set('date', e.target.value)} className={inputCls} /></Field>
        <Field label="Направление">
          <div className="flex border border-slate-700">
            {(['LONG', 'SHORT'] as const).map((d) => (
              <button type="button" key={d} onClick={() => set('direction', d)}
                className={cn('flex-1 py-2 text-sm', f.direction === d ? (d === 'LONG' ? 'bg-up text-white' : 'bg-down text-white') : 'text-slate-400')}>
                {d}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Таймфрейм">
          <select value={f.timeframe} onChange={(e) => set('timeframe', e.target.value as Timeframe)} className={inputCls}>
            {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Заголовок"><input required value={f.title} onChange={(e) => set('title', e.target.value)} className={inputCls} placeholder="Что за сетап" /></Field>
      <Field label="Разбор (Markdown)"><MdField value={f.description} onChange={(v) => set('description', v)} /></Field>
      <Field label="Скриншоты и видео"><MediaDropzone uploads={uploads} onAddFiles={addFiles} onRemove={removeFile} /></Field>
    </FormShell>
  );
};

const PositionsPage: React.FC = () => {
  const { list, loading, error, add, remove } = useEntries<PositionAnalysis>('positions');
  const [sel, setSel] = useState<PositionAnalysis | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHead title="Разборы позиций" count={list.length} onAdd={() => setAdding(true)} />
      <State loading={loading} error={error} empty={!list.length} />
      {list.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-700">
                <th className="py-2 pr-4 font-normal">Дата</th><th className="pr-4 font-normal">Тикер</th>
                <th className="pr-4 font-normal">Сторона</th><th className="pr-4 font-normal">ТФ</th>
                <th className="pr-4 font-normal">Заголовок</th><th className="text-right font-normal">Файлов</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} onClick={() => setSel(p)} className="border-b border-slate-800 hover:bg-slate-900 cursor-pointer">
                  <td className="py-3 pr-4 num text-slate-400 whitespace-nowrap">{formatDateShort(p.date)}</td>
                  <td className="pr-4 font-medium">{p.ticker}</td>
                  <td className={cn('pr-4 font-medium', sideCls(p.direction))}>{p.direction}</td>
                  <td className="pr-4 num text-slate-400">{p.timeframe}</td>
                  <td className="pr-4">{p.title}</td>
                  <td className="num text-right text-slate-500">{p.media.length || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sel && (
        <Drawer title={`${sel.ticker} · ${sel.title}`} onClose={() => setSel(null)}>
          <p className="text-slate-400 mb-6">
            <span className={cn('font-medium', sideCls(sel.direction))}>{sel.direction}</span>, таймфрейм {sel.timeframe}, {formatDateShort(sel.date)}
          </p>
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
      {adding && <Drawer title="Новый разбор" onClose={() => setAdding(false)}><PositionForm onSave={add} onClose={() => setAdding(false)} /></Drawer>}
    </>
  );
};

export default PositionsPage;
