// Service worker: dopo la prima apertura la app funziona senza internet.
const CACHE = 'kopfatlas-2026-11-16-98b90a8';
const DATEIEN = ["./","index.html","app.js","app.css","daten.js","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
// cache: 'reload' = prende i file dal server e non dalla memoria del browser (GitHub Pages li tiene 10 minuti):
// senza, una versione nuova potrebbe salvare file vecchi.
let kannBanner = false;
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(DATEIEN.map(u => new Request(u, { cache: 'reload' })));
    // Le pagine aperte sanno mostrare la scritta "Neue Version"? Quelle vecchie (prima del 16.11.2026) no:
    // se nessuna risponde, la versione nuova parte da sola, come prima.
    const seiten = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    seiten.forEach(s => s.postMessage('neue_version'));
    await new Promise(r => setTimeout(r, 1500));
    if (!kannBanner) self.skipWaiting();
  })());
});
// la versione nuova resta in attesa: parte quando lo studente tocca "Neue Version verfügbar - jetzt laden"
self.addEventListener('message', e => { if (e.data === 'kann_banner') kannBanner = true; if (e.data === 'weiter') self.skipWaiting(); });
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
