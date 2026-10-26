// Toujours la dernière version du jeu : chaque fichier est revérifié auprès du site
// (le navigateur ne ressert plus une vieille copie gardée en mémoire après une mise à jour).
// Sans Internet, le navigateur se débrouille comme avant.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin || req.headers.has('range')) return;
  e.respondWith(fetch(req, { cache: 'no-cache' }).catch(() => fetch(req)));
});
