// ─── Разбор позиций ───────────────────────────────────────────────────────────

export type Direction = 'LONG' | 'SHORT';
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
export type MediaType = 'image' | 'video';

export interface MediaFile {
  id: string;
  type: MediaType;
  url: string;
  label?: string;
}

export interface PositionAnalysis {
  id: string;
  ticker: string;
  direction: Direction;
  timeframe: Timeframe;
  date: string;
  title: string;          // Краткий заголовок
  description: string;    // Markdown разбор
  media: MediaFile[];
  createdAt: string;
}

// ─── Бектесты ────────────────────────────────────────────────────────────────

export interface Backtest {
  id: string;
  strategyName: string;   // Название стратегии
  ticker: string;
  timeframe: Timeframe;
  dateFrom: string;
  dateTo: string;
  totalTrades: number;
  winRate: number;        // %
  profitFactor: number;
  totalPnlPercent: number;
  maxDrawdownPercent: number;
  description: string;    // Markdown с выводами
  media: MediaFile[];     // Скриншоты эквити, сделок
  createdAt: string;
}
