// Service worker: dopo la prima apertura la app funziona senza internet.
const CACHE = 'kopfatlas-2026-11-16-a987403';
const DATEIEN = ["./","index.html","app.js","app.css","daten.js","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","modelli/haut.glb","modelli/muskeln.glb","modelli/knochen.glb","modelli/zaehne.glb","modelli/kiefergelenk.glb"];
// cache: 'reload' = prende i file dal server e non dalla memoria del browser (GitHub Pages li tiene 10 minuti):
// senza, una versione nuova potrebbe salvare file vecchi.
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('kopfatlas-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true }) || (e.request.mode === 'navigate' ? await c.match('index.html') : null);
    if (hit) return hit;
    try { const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r; }
    catch (err) { return (e.request.mode === 'navigate' && await c.match('index.html')) || Response.error(); }
  }));
});
