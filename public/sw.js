// The build replaces this revision with a hash of the worker and app assets.
const CACHE_VERSION = "v5-source";
const SCOPE = self.registration.scope;
const SCOPE_PATH = new URL(SCOPE).pathname;
const PREFIX = "dominix-" + SCOPE_PATH + "-";
const STATIC_CACHE = PREFIX + "static-" + CACHE_VERSION;
const RUNTIME_CACHE = PREFIX + "runtime-" + CACHE_VERSION;
const isLegacy = (key) => /^dominix-(?:static|runtime)-v\d+$/.test(key);

const belongsHere = (key) => key.startsWith(PREFIX);
const isStaticAsset = (url) => /\/(?:assets|fonts)\//.test(url.pathname) || /\.(?:js|css|woff2?|png|svg|jpg|jpeg|webp|ico)$/i.test(url.pathname);
const unavailable = () => new Response("Dominix: resource unavailable offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    try {
      const response = await fetch(new URL("offline-assets.json", SCOPE), { cache: "no-store" });
      if (!response.ok) throw new Error("Offline manifest unavailable");
      const assets = await response.json();
      if (!Array.isArray(assets) || assets.length > 500 || !assets.every(file => typeof file === "string" && /^(?:assets\/[^?#]+|index\.html)$/.test(file) && !file.includes(".."))) throw new Error("Invalid offline manifest");
      const files = [SCOPE, "index.html", "manifest.json", "icon.svg", "icon-192.png", "icon-512.png", "licenses/Inter-OFL.txt", "licenses/JetBrainsMono-OFL.txt", ...assets].map(file => new URL(file, SCOPE).href);
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll([...new Set(files)]);
      // Keep the old worker active if even one required resource failed.
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(STATIC_CACHE);
      throw error;
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const previous = keys.filter(key => belongsHere(key) && key !== STATIC_CACHE && key !== RUNTIME_CACHE);
    // Keep the previous generation for tabs still running its hashed chunks.
    const revisions = [...new Set(previous.map(key => key.replace(/^.*(?:static|runtime)-/, "")))];
    const keepRevision = revisions[revisions.length - 1];
    await Promise.all(previous.filter(key => !key.endsWith("-" + keepRevision)).map(key => caches.delete(key)));
    let isUpdate = previous.length > 0;
    for (const key of keys.filter(isLegacy)) {
      if (await (await caches.open(key)).match(SCOPE)) isUpdate = true;
    }
    // Legacy caches were shared by deployments; do not remove another scope's data.
    await self.clients.claim();
    if (isUpdate) for (const client of await self.clients.matchAll({ type: "window" })) {
      if (client.url?.startsWith(SCOPE)) client.postMessage({ type: "sw-update", version: CACHE_VERSION });
    }
  })());
});

async function cachedAsset(request) {
  // Precache requests have no Origin header; module/font requests may have one.
  // Build assets are identical across these request modes (Vary: Origin hosts).
  const options = { ignoreVary: isStaticAsset(new URL(request.url)) };
  for (const key of [STATIC_CACHE, RUNTIME_CACHE]) {
    const match = await (await caches.open(key)).match(request, options);
    if (match) return match;
  }
  const previous = (await caches.keys()).filter(key => (belongsHere(key) || isLegacy(key)) && key !== STATIC_CACHE && key !== RUNTIME_CACHE).reverse();
  for (const key of previous) {
    const match = await (await caches.open(key)).match(request, options);
    if (match) return match;
  }
}

async function networkResource(request, url) {
  try {
    const response = await fetch(request);
    // Some SPA hosts return index.html with status 200 for missing JS/images.
    if (isStaticAsset(url) && response.headers.get("Content-Type")?.includes("text/html")) {
      return new Response("Dominix: asset not found", { status: 404 });
    }
    if (response.ok && response.status !== 206) {
      try { await (await caches.open(RUNTIME_CACHE)).put(request, response.clone()); } catch { /* Storage full: keep the network response usable. */ }
    }
    return response;
  } catch { return await cachedAsset(request) || unavailable(); }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE_PATH)) return;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try { return await fetch(request); }
      catch {
        // The app shell only changes when a complete new build is precached.
        const cache = await caches.open(STATIC_CACHE);
        return await cache.match(SCOPE) || await cache.match(new URL("index.html", SCOPE).href) || unavailable();
      }
    })());
    return;
  }
  event.respondWith(isStaticAsset(url)
    ? cachedAsset(request).then(cached => cached || networkResource(request, url))
    : networkResource(request, url));
});
