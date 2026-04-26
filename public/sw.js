/**
 * Dominix Service Worker
 *
 * Strategy:
 *  - HTML / navigation: network-first, fallback to cache (so users get the
 *    latest app shell when online).
 *  - Static assets (/assets/*): stale-while-revalidate (instant from cache,
 *    refreshed in background — perfect for hashed-named bundles).
 *  - Other GETs: network-first, fallback to cache, fallback to "/".
 *
 * Versioning:
 *  - Bump CACHE_VERSION on each release. Old caches are deleted on activate.
 *  - When a new SW is detected, the active SW posts a {type:"sw-update"}
 *    message to all clients so the UI can show a "reload" prompt.
 */

const CACHE_VERSION = "v3";
const STATIC_CACHE = `dominix-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `dominix-runtime-${CACHE_VERSION}`;

// Build precache URLs relative to the SW scope so this works on root deploys
// (Vercel) AND subpath deploys (GitHub Pages /Dominix/).
function precacheUrls() {
  const base = self.registration?.scope || "/";
  return [base, `${base}index.html`, `${base}manifest.json`];
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(precacheUrls()))
      .catch(() => undefined)
  );
  // New SW takes over immediately so updates aren't stuck waiting.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
      // Notify all open tabs that a new version is now active.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.postMessage({ type: "sw-update", version: CACHE_VERSION });
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isNavigation(req) {
  return req.mode === "navigate" || (req.method === "GET" && req.headers.get("accept")?.includes("text/html"));
}

function isStaticAsset(url) {
  // assets folder is always nested under whatever base path Vite emits
  return /\/assets\//.test(url.pathname) || /\.(?:js|css|woff2?|png|svg|jpg|jpeg|webp|ico)$/i.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Navigation: network-first
  if (isNavigation(req)) {
    const scope = self.registration?.scope || "/";
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(scope, clone)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match(scope).then((r) => r || caches.match(`${scope}index.html`)))
    );
    return;
  }

  // Static assets: stale-while-revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, clone)).catch(() => undefined);
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Default: network-first, fallback to cache
  const scope = self.registration?.scope || "/";
  event.respondWith(
    fetch(req)
      .then((res) => {
        const clone = res.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, clone)).catch(() => undefined);
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match(scope)))
  );
});
