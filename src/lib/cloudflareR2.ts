/**
 * Cloudflare R2 Client for Photos & Videos upload
 */

const UPLOAD_URL = import.meta.env.VITE_CF_UPLOAD_URL || '';
const PUBLIC_DOMAIN = import.meta.env.VITE_CF_PUBLIC_DOMAIN || '';

export async function uploadToCloudflareR2(file: File): Promise<string> {
  // If no Cloudflare Worker/endpoint configured, fallback to local object URL with warning
  if (!UPLOAD_URL) {
    console.warn('[Cloudflare R2] VITE_CF_UPLOAD_URL is not set. Using local preview.');
    return URL.createObjectURL(file);
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  // Upload directly to Cloudflare Worker connected to R2
  const response = await fetch(`${UPLOAD_URL.replace(/\/$/, '')}/${filename}`, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  // If endpoint returns JSON with url, use it; otherwise compute with public domain
  try {
    const data = await response.json();
    if (data?.url) return data.url;
  } catch {
    // response was not JSON, fallback to public domain + filename
  }

  return PUBLIC_DOMAIN 
    ? `${PUBLIC_DOMAIN.replace(/\/$/, '')}/${filename}` 
    : `${UPLOAD_URL.replace(/\/$/, '')}/${filename}`;
}
