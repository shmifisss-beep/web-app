const BASE = ((import.meta.env.VITE_CF_UPLOAD_URL as string) || '').replace(/\/$/, '');
export const HAS_API = !!BASE;
const TOKEN_KEY = 'tv_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t.trim());
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const authHeader = (): Record<string, string> => ({ Authorization: `Bearer ${getToken()}` });

async function call(path: string, init?: RequestInit) {
  const r = await fetch(`${BASE}/${path}`, init);
  if (r.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Неверный токен');
  }
  if (!r.ok) throw new Error(`Сервер ответил ${r.status}`);
  return r;
}

// Без воркера записи лежат в localStorage этого браузера.
export async function loadEntries<T>(kind: string): Promise<T[]> {
  if (!HAS_API) return JSON.parse(localStorage.getItem(`tv_${kind}`) || '[]');
  return (await call(`api/${kind}`, { headers: authHeader() })).json();
}

export async function saveEntries<T>(kind: string, list: T[]): Promise<void> {
  if (!HAS_API) return localStorage.setItem(`tv_${kind}`, JSON.stringify(list));
  await call(`api/${kind}`, {
    method: 'PUT',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  });
}
