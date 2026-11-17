// Olivia service worker. build.mjs fills in the version and the precache list below.
const VERSION = '__VERSION__';
const CACHE = `olivia-${VERSION}`;
const PRECACHE = __PRECACHE__;
// Prices change: an offline copy of a page older than this is not shown.
const MAX_PAGE_AGE = 14 * 24 * 3600 * 1000;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async url => {
      const res = await fetch(url, { cache: 'reload' });
      if (!res.ok) throw new Error(`precache ${url}: ${res.status}`);
      await cache.put(url, await stamp(res));
    }));
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'skip-waiting') self.skipWaiting(); });

const stamp = async res => {
  const headers = new Headers(res.headers);
  headers.set('x-cached-at', Date.now());
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers });
};

async function page(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, await stamp(res.clone()));
    return res;
  } catch {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit && Date.now() - Number(hit.headers.get('x-cached-at') || 0) < MAX_PAGE_AGE) return hit;
    return (await cache.match('/offline/')) || Response.error();
  }
}

async function asset(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const { request: req } = e;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate') return e.respondWith(page(req));
  if (/^\/(assets|fonts|img|icons)\//.test(url.pathname)) return e.respondWith(asset(req));
});
