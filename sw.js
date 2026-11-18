// Service worker del VECCHIO indirizzo (a3-tech-2026.github.io/kopf-atlas), PROMPT 11, G3.
// Chi ha la app vecchia installata (o in memoria per l'uso senza rete) riceve questo file al primo controllo di versione:
// cancella la memoria vecchia, prende subito il controllo e porta ogni finestra aperta alla pagina "Neue Adresse", che manda al nuovo indirizzo.
const NEU = 'https://a3-dental-tech.github.io/kopf-atlas/';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) await caches.delete(k);
  await self.clients.claim();
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(new URL('index.html?umzug=1', self.registration.scope).href).catch(() => {});
})()));
// ogni pagina chiesta a questo indirizzo: dalla rete (la pagina "Neue Adresse"); senza rete, rimando diretto al nuovo indirizzo
self.addEventListener('fetch', e => { if (e.request.mode === 'navigate') e.respondWith(fetch(e.request, { cache: 'reload' }).catch(() => Response.redirect(NEU, 302))); });
