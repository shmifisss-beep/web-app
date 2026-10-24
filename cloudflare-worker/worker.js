// Медиа (R2) + JSON-хранилище записей. Запись и API — только с токеном AUTH_TOKEN.
const KINDS = ['positions', 'backtests'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = decodeURIComponent(url.pathname.slice(1));
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    };
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (!path || path.startsWith('_data/') || path.includes('..')) return json({ error: 'not found' }, 404);

    const authed = !!env.AUTH_TOKEN && request.headers.get('Authorization') === `Bearer ${env.AUTH_TOKEN}`;

    if (path.startsWith('api/')) {
      if (!authed) return json({ error: 'unauthorized' }, 401);
      const kind = path.slice(4);
      if (!KINDS.includes(kind)) return json({ error: 'not found' }, 404);
      const key = `_data/${kind}.json`;
      if (request.method === 'GET') {
        const obj = await env.BUCKET.get(key);
        return json(obj ? await obj.json() : []);
      }
      if (request.method === 'PUT') {
        const body = await request.json().catch(() => null);
        if (!Array.isArray(body)) return json({ error: 'expected array' }, 400);
        await env.BUCKET.put(key, JSON.stringify(body), { httpMetadata: { contentType: 'application/json' } });
        return json({ ok: true });
      }
    }

    if (request.method === 'PUT') {
      if (!authed) return json({ error: 'unauthorized' }, 401);
      const type = request.headers.get('content-type') || '';
      if (!/^(image|video)\//.test(type)) return json({ error: 'only image/video' }, 415);
      await env.BUCKET.put(path, request.body, { httpMetadata: { contentType: type } });
      return json({ success: true, key: path, url: `${url.origin}/${path}` });
    }

    if (request.method === 'GET') {
      const obj = await env.BUCKET.get(path);
      if (!obj) return new Response('Not Found', { status: 404, headers: cors });
      const headers = new Headers(cors);
      obj.writeHttpMetadata(headers);
      headers.set('etag', obj.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(obj.body, { headers });
    }
    return json({ error: 'method not allowed' }, 405);
  },
};
