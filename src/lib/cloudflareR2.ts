import { HAS_API, authHeader } from './api';

const BASE = ((import.meta.env.VITE_CF_UPLOAD_URL as string) || '').replace(/\/$/, '');
const PUBLIC = ((import.meta.env.VITE_CF_PUBLIC_DOMAIN as string) || '').replace(/\/$/, '');

const toDataUrl = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error('Не удалось прочитать файл'));
    r.readAsDataURL(file);
  });

export async function uploadToCloudflareR2(file: File): Promise<string> {
  if (!HAS_API) {
    if (file.size > 3 * 1024 * 1024) throw new Error('Без воркера можно сохранять файлы до 3 МБ');
    return toDataUrl(file);
  }
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const r = await fetch(`${BASE}/${name}`, {
    method: 'PUT',
    headers: { ...authHeader(), 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!r.ok) throw new Error(`Загрузка «${file.name}» не удалась: ${r.status}`);
  return PUBLIC ? `${PUBLIC}/${name}` : `${BASE}/${name}`;
}
