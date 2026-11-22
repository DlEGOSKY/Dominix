import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../../public/sw.js", import.meta.url), "utf8");
const scope = "https://example.test/Dominix/";
const current = "dominix-/Dominix/-static-v5-source";
function harness() {
  const listeners = {}, store = new Map(), removed = [], messages = [], fetched = [];
  let offline = false, skipCount = 0, failWrites = false;
  const responses = new Map();
  const address = input => typeof input === "string" ? input : input.url || input.href;
  const fetchMock = async input => {
    const url = address(input); fetched.push(url);
    if (offline) throw new Error("offline");
    if (responses.has(url)) return responses.get(url).clone();
    if (url.endsWith("offline-assets.json")) return Response.json(["index.html", "assets/app-1.js", "assets/Collection-2.js", "assets/game.css", "assets/inter.woff2"]);
    return new Response("resource: " + url, { headers: { "Content-Type": url.endsWith(".js") ? "application/javascript" : "text/plain" } });
  };
  const caches = {
    keys: async () => [...store.keys()],
    delete: async key => { removed.push(key); return store.delete(key); },
    open: async name => {
      if (!store.has(name)) store.set(name, new Map());
      const entries = store.get(name);
      return {
        match: async (request, options) => {
          const response=entries.get(address(request));
          if(request.mode==="cors" && response?.headers.get("Vary")==="Origin" && !options?.ignoreVary)return undefined;
          return response?.clone();
        },
        put: async (request, response) => { if (failWrites) throw new Error("quota"); entries.set(address(request), response.clone()); },
        addAll: async urls => {
          const entriesToWrite = [];
          for (const url of urls) { const response = await fetchMock(url); if (!response.ok) throw new Error("precache failed"); entriesToWrite.push([url, response]); }
          for (const [url, response] of entriesToWrite) entries.set(url, response.clone());
        },
      };
    },
  };
  runInNewContext(source, {
    URL, Response, fetch: fetchMock, caches,
    self: {
      registration: { scope }, location: { origin: "https://example.test" },
      addEventListener: (name, fn) => { listeners[name] = fn; },
      skipWaiting: async () => { skipCount++; },
      clients: {
        claim: async () => {},
        matchAll: async () => [
          { url: scope, postMessage: message => messages.push(message) },
          { url: "https://example.test/other-game/", postMessage: () => { throw new Error("wrong scope"); } },
        ],
      },
    },
  });
  return {
    store, caches, removed, messages, fetched, responses,
    get skips() { return skipCount; },
    set offline(value) { offline = value; },
    set failWrites(value) { failWrites = value; },
    async fire(name) { let task; listeners[name]({ waitUntil: promise => { task = promise; } }); await task; },
    async request(path, mode = "cors", method = "GET") {
      let task;
      listeners.fetch({ request: { url: new URL(path, scope).href, mode, method }, respondWith: promise => { task = promise; } });
      return task ? await task : undefined;
    },
    async seed(cache, path, body) { await (await caches.open(cache)).put(new URL(path, scope).href, new Response(body)); },
  };
}

describe("offline app integrity", () => {
  it("precaches unvisited lazy screens, fonts and real installation icons at the deployment subpath", async () => {
    const h = harness(); await h.fire("install");
    const cache = await h.caches.open(current);
    for (const file of ["assets/Collection-2.js", "assets/inter.woff2", "icon-192.png", "icon-512.png"]) expect(await cache.match(new URL(file, scope).href)).toBeTruthy();
    expect(h.fetched.every(url => url.startsWith(scope))).toBe(true);
    expect(h.skips).toBe(1);
  });
  it("does not activate an incomplete build or delete the previous playable build", async () => {
    const h = harness(); await h.seed("dominix-/Dominix/-static-old", "./", "old app");
    h.responses.set(new URL("assets/Collection-2.js", scope).href, new Response("missing", { status: 404 }));
    await expect(h.fire("install")).rejects.toThrow();
    expect(h.skips).toBe(0); expect(h.store.has(current)).toBe(false);
    expect(await (await (await h.caches.open("dominix-/Dominix/-static-old")).match(scope)).text()).toBe("old app");
  });
  it("ignores unrelated caches and avoids an update notice on first install", async () => {
    const h = harness(); await h.caches.open("other-game-cache"); await h.caches.open("dominix-/-static-old"); await h.caches.open(current);
    await h.fire("activate");
    expect(h.removed).toEqual([]); expect(h.messages).toEqual([]);
  });
  it("keeps one previous generation for open tabs and only notifies clients in its scope", async () => {
    const h = harness();
    for (const name of ["dominix-/Dominix/-static-older", "dominix-/Dominix/-runtime-older", "dominix-/Dominix/-static-old", "dominix-/Dominix/-runtime-old", current, "other-game-save"]) await h.caches.open(name);
    await h.fire("activate");
    expect(h.removed).toEqual(["dominix-/Dominix/-static-older", "dominix-/Dominix/-runtime-older"]);
    expect(h.store.has("dominix-/Dominix/-static-old")).toBe(true); expect(h.store.has("other-game-save")).toBe(true);
    expect(h.messages).toHaveLength(1);
  });
  it("uses the current complete shell offline even when legacy caches contain an older shell", async () => {
    const h = harness(); await h.seed("dominix-static-v4", "./", "legacy"); await h.seed(current, "./", "complete current");
    h.offline = true;
    expect(await (await h.request("./", "navigate")).text()).toBe("complete current");
  });
  it("serves an unvisited precached screen without network", async () => {
    const h = harness(); await h.fire("install"); h.offline = true;
    const response = await h.request("assets/Collection-2.js");
    expect(response.status).toBe(200); expect(response.headers.get("Content-Type")).toBe("application/javascript");
  });
  it("matches a precached module across Origin request variations on static hosts", async () => {
    const h=harness();h.responses.set(new URL("assets/Collection-2.js",scope).href,new Response("module",{headers:{"Content-Type":"application/javascript","Vary":"Origin"}}));
    await h.fire("install");h.offline=true;
    expect(await (await h.request("assets/Collection-2.js")).text()).toBe("module");
  });
  it("does not return HTML as a missing script or data response offline", async () => {
    const h = harness(); await h.seed(current, "./", "<html>app</html>"); h.offline = true;
    for (const path of ["assets/missing.js", "missing.json"]) {
      const response = await h.request(path); expect(response.status).toBe(503); expect(await response.text()).not.toContain("<html>");
    }
  });
  it("does not poison caches with HTTP errors", async () => {
    for (const status of [404, 500]) {
      const h = harness(); h.responses.set(new URL("assets/broken.js", scope).href, new Response("bad", { status }));
      expect((await h.request("assets/broken.js")).status).toBe(status);
      h.offline = true; expect((await h.request("assets/broken.js")).status).toBe(503);
    }
  });
  it("rejects a host's HTML fallback for a missing asset", async () => {
    const h = harness(); h.responses.set(new URL("assets/not-a-script.js", scope).href, new Response("<html>app</html>", { headers: { "Content-Type": "text/html" } }));
    expect((await h.request("assets/not-a-script.js")).status).toBe(404);
    h.offline = true; expect((await h.request("assets/not-a-script.js")).status).toBe(503);
  });
  it("keeps successful network responses usable when cache storage is full", async () => {
    const h = harness(); h.failWrites = true;
    expect((await h.request("assets/new.js")).status).toBe(200);
  });
  it("can still serve the previous build's hashed chunk to an open tab", async () => {
    const h = harness(); await h.seed("dominix-/Dominix/-static-old", "assets/old-hash.js", "old chunk"); await h.fire("activate"); h.offline = true;
    expect(await (await h.request("assets/old-hash.js")).text()).toBe("old chunk");
  });
  it("can read older unscoped caches without deleting another deployment's data", async () => {
    const h=harness();await h.seed("dominix-runtime-v3","assets/legacy-hash.js","legacy chunk");await h.fire("activate");h.offline=true;
    expect(await (await h.request("assets/legacy-hash.js")).text()).toBe("legacy chunk");expect(h.store.has("dominix-runtime-v3")).toBe(true);
  });
  it("does not intercept other origins, deployments or non-GET requests", async () => {
    const h = harness();
    expect(await h.request("https://external.test/file.js")).toBeUndefined();
    expect(await h.request("https://example.test/another-game/assets/file.js")).toBeUndefined();
    expect(await h.request("save", "cors", "POST")).toBeUndefined();
  });
});
