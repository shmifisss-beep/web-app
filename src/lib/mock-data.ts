import type { PositionAnalysis, Backtest } from '../types';

// ─── Разборы позиций ──────────────────────────────────────────────────────────
export const MOCK_POSITIONS: PositionAnalysis[] = [
  {
    id: 'pa1',
    ticker: 'BTC/USDT',
    direction: 'LONG',
    timeframe: '4h',
    date: '2024-11-10',
    title: 'Пробой ключевого уровня сопротивления',
    description: `## BTC/USDT Long — Разбор

### Контекст
Цена 3 дня консолидировалась под уровнем **67,400**, формируя флаг на 4H таймфрейме.

### Что смотрел
- Зона сопротивления 67,200–67,500 (тестировалась 3 раза)
- Объём на пробое вырос в 2.3× относительно среднего
- HTF (1D) в восходящем тренде

### Вход
Лимитный ордер на ретест уровня **67,450** после пробоя свечой с закрытием выше.

### Разбор
✅ Чистый пробой с высоким объёмом
✅ 4H свеча закрылась выше уровня
✅ Структура HTF поддерживает движение
⚠️ Ретест был быстрым, мог пропустить

### Выводы
Сетап отработал. Нужно запомнить важность объёма на пробое — без него такие зоны часто дают ложный пробой.`,
    media: [
      { id: 'm1', type: 'image', url: 'https://placehold.co/1200x675/0f172a/00d4aa?text=BTC+4H+Breakout', label: '4H — Зона пробоя' },
      { id: 'm2', type: 'image', url: 'https://placehold.co/1200x675/0f172a/6366f1?text=BTC+1H+Entry', label: '1H — Точка входа' },
    ],
    createdAt: '2024-11-10T10:00:00Z',
  },
  {
    id: 'pa2',
    ticker: 'ETH/USDT',
    direction: 'SHORT',
    timeframe: '1h',
    date: '2024-11-14',
    title: 'Разворот от Premium зоны',
    description: `## ETH/USDT Short — Разбор

### Контекст
Цена дошла до Premium зоны на 4H. На 1H видна слабость покупателей: свечи с длинными верхними тенями.

### Что смотрел
- Supply зона 3,820–3,850 (ранее был сильный импульс вниз)
- RSI divergence на 1H (цена выше, RSI ниже)
- Объём на росте падает

### Разбор
✅ Supply зона подтверждена ранее
✅ Bearish divergence на RSI
✅ Структура — LH (Lower High) на 1H
❌ Вошёл чуть раньше подтверждения

### Выводы
Нужно дожидаться bearish confirmation свечи (закрытие ниже последнего LH) перед входом.`,
    media: [
      { id: 'm3', type: 'image', url: 'https://placehold.co/1200x675/0f172a/f43f5e?text=ETH+Supply+Zone', label: '4H — Supply Zone' },
    ],
    createdAt: '2024-11-14T08:00:00Z',
  },
  {
    id: 'pa3',
    ticker: 'SOL/USDT',
    direction: 'LONG',
    timeframe: '4h',
    date: '2024-11-18',
    title: 'Ложный пробой поддержки — ловушка',
    description: `## SOL/USDT — Разбор неудачного входа

### Что произошло
Цена пробила поддержку снизу, я вошёл на ретест как на откуп. Но пробой оказался истинным.

### Ошибки
❌ Объём на пробое был выше среднего (сигнал истинного пробоя)
❌ Не дождался закрытия 4H свечи ниже уровня
❌ HTF (1D) был уже в медвежьей структуре

### Урок
**Правило:** перед входом на откуп от поддержки — всегда проверять HTF структуру. Если 1D уже медвежий, откупы — ловушки.`,
    media: [
      { id: 'm4', type: 'image', url: 'https://placehold.co/1200x675/0f172a/f59e0b?text=SOL+Failed+Setup', label: '4H — Ложный пробой' },
    ],
    createdAt: '2024-11-18T11:00:00Z',
  },
];

// ─── Бектесты ─────────────────────────────────────────────────────────────────
export const MOCK_BACKTESTS: Backtest[] = [
  {
    id: 'bt1',
    strategyName: 'Breakout + Volume Confirmation',
    ticker: 'BTC/USDT',
    timeframe: '4h',
    dateFrom: '2024-01-01',
    dateTo: '2024-10-31',
    totalTrades: 47,
    winRate: 68.1,
    profitFactor: 2.4,
    totalPnlPercent: 184.3,
    maxDrawdownPercent: 12.7,
    description: `## Breakout + Volume — Бэктест

### Правила стратегии
1. Цена тестирует уровень 3+ раза
2. Объём на пробое ≥ 1.8× от 20-периодного среднего
3. Закрытие 4H свечи выше уровня
4. Вход на ретест, стоп ниже уровня

### Результаты
- **47 сделок** за 10 месяцев (~4.7/мес)
- Win Rate: **68.1%** ✅
- Profit Factor: **2.4** ✅
- Max Drawdown: **12.7%** ✅

### Выводы
Стратегия показывает стабильные результаты на BTC 4H. Лучшие результаты в периоды трендового рынка (Q1, Q4). В боковике win rate падает до ~55%.

### Что улучшить
- Добавить фильтр по HTF тренду (только в направлении 1D)
- Избегать входов в зонах важных экономических событий`,
    media: [
      { id: 'bm1', type: 'image', url: 'https://placehold.co/1200x675/0f172a/22c55e?text=Equity+Curve', label: 'Кривая доходности' },
      { id: 'bm2', type: 'image', url: 'https://placehold.co/1200x675/0f172a/6366f1?text=Trade+Distribution', label: 'Распределение сделок' },
    ],
    createdAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'bt2',
    strategyName: 'EMA 50/200 Trend Follow',
    ticker: 'ETH/USDT',
    timeframe: '1d',
    dateFrom: '2023-01-01',
    dateTo: '2024-10-31',
    totalTrades: 28,
    winRate: 57.1,
    profitFactor: 1.9,
    totalPnlPercent: 97.6,
    maxDrawdownPercent: 21.3,
    description: `## EMA 50/200 Cross — Бэктест

### Правила
1. EMA 50 пересекает EMA 200 снизу вверх → Long
2. EMA 50 пересекает EMA 200 сверху вниз → Short
3. Выход по противоположному пересечению

### Результаты
- 28 сделок за 22 месяца (~1.3/мес)
- Win Rate: **57.1%**
- Profit Factor: **1.9**
- Max Drawdown: **21.3%** ⚠️

### Выводы
Стратегия работает, но drawdown высокий. В боковых рынках (6 месяцев в 2023) дала -8 убыточных сигналов подряд. Нужен дополнительный фильтр волатильности.`,
    media: [
      { id: 'bm3', type: 'image', url: 'https://placehold.co/1200x675/0f172a/f59e0b?text=EMA+Equity', label: 'EMA Strategy Equity' },
    ],
    createdAt: '2024-11-05T00:00:00Z',
  },
];
