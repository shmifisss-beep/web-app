# TradeVault

Журнал сделок: разборы позиций и бэктесты со скриншотами и видео.
React 19 + Vite + Tailwind 4, хранилище — Cloudflare Worker + R2.

## Запуск
    npm install && npm run dev

Без `VITE_CF_UPLOAD_URL` приложение работает локально: записи в localStorage, файлы до 3 МБ как data-URL.

## Cloudflare
    cd cloudflare-worker
    wrangler r2 bucket create media-storage
    wrangler secret put AUTH_TOKEN
    wrangler deploy

В `.env` (по образцу `.env.example`) укажите адрес воркера. При первом входе приложение спросит токен.
Записи хранятся в R2 как `_data/positions.json` и `_data/backtests.json`.
