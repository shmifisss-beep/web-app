import React, { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import MarkdownPreview from '@uiw/react-markdown-preview';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import type { Timeframe } from '../types';

export const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
export const inputCls =
  'w-full bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent';

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-sm text-slate-400 mb-1">{label}</span>
    {children}
  </label>
);

export const PageHead: React.FC<{ title: string; count: number; onAdd: () => void }> = ({ title, count, onAdd }) => (
  <div className="flex items-baseline justify-between border-b border-slate-700 pb-3 mb-1">
    <h2 className="text-2xl font-semibold">
      {title} <span className="num text-base font-sans font-normal text-slate-500 ml-1">{count}</span>
    </h2>
    <button onClick={onAdd} className="text-sm font-medium text-accent hover:underline">Добавить запись</button>
  </div>
);

export const State: React.FC<{ loading: boolean; error: Error | null; empty: boolean }> = ({ loading, error, empty }) => {
  if (loading) return <p className="py-12 text-slate-500">Загрузка…</p>;
  if (error) return <p className="py-12 text-down">Не удалось загрузить записи: {error.message}</p>;
  if (empty) return <p className="py-12 text-slate-500">Записей пока нет. Нажмите «Добавить запись», чтобы создать первую.</p>;
  return null;
};

export const Drawer: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="w-full max-w-2xl h-full overflow-y-auto bg-slate-950 border-l border-slate-700">
        <div className="sticky top-0 z-10 bg-slate-950 border-b border-slate-700 px-6 h-14 flex items-center justify-between">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-100">Закрыть</button>
        </div>
        <div className="p-6">{children}</div>
      </aside>
    </div>
  );
};

export const Md: React.FC<{ value: string }> = ({ value }) => (
  <div data-color-mode="light"><MarkdownPreview source={value} style={{ fontSize: 15 }} /></div>
);

export const MdField: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div data-color-mode="light">
    <MDEditor value={value} onChange={(v) => onChange(v ?? '')} height={280} preview="edit" />
  </div>
);

export const FormShell: React.FC<{ onSubmit: () => Promise<void>; onCancel: () => void; children: React.ReactNode }> = ({ onSubmit, onCancel, children }) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setErr('');
        try { await onSubmit(); } catch (x) { setErr(x instanceof Error ? x.message : 'Не удалось сохранить'); setBusy(false); }
      }}
    >
      {children}
      {err && <p className="text-sm text-down">{err}</p>}
      <div className="flex items-center gap-4 pt-2">
        <button disabled={busy} className="bg-accent text-white px-5 py-2 text-sm font-medium disabled:opacity-50">
          {busy ? 'Сохраняю…' : 'Сохранить запись'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-slate-400 hover:text-slate-100">Отмена</button>
      </div>
    </form>
  );
};
