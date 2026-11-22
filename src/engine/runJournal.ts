/** Optional durable fallback. Existing localStorage saves remain authoritative. */
export interface RunJournalEntry { raw: string | null; cleared: string[] }
const DATABASE = "dominix-run-recovery-v1";
const STORE = "checkpoint";
let opening: Promise<IDBDatabase | null> | null = null;
let pending: Promise<boolean> = Promise.resolve(true);

function openJournal(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (opening) return opening;
  opening = new Promise(resolve => {
    let settled = false;
    const finish = (db: IDBDatabase | null) => {
      if (settled) { db?.close(); return; }
      settled = true;
      clearTimeout(timer);
      if (!db) opening = null;
      resolve(db);
    };
    const timer = setTimeout(() => finish(null), 2000);
    try {
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onerror = () => finish(null);
      request.onblocked = () => finish(null);
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); opening = null; };
        finish(db);
      };
    } catch { finish(null); }
  });
  return opening;
}

/** Queue ordering prevents an older write overtaking a clear/import/new run. */
export function queueRunJournal(raw: string | null, cleared: string[] = []): Promise<boolean> {
  pending = pending.then(async () => {
    const db = await openJournal();
    if (!db) return false;
    return new Promise<boolean>(resolve => {
      try {
        const tx = db.transaction(STORE, "readwrite", { durability: "strict" });
        tx.objectStore(STORE).put({ raw, cleared } satisfies RunJournalEntry, "active");
        tx.oncomplete = () => resolve(true);
        tx.onabort = tx.onerror = () => resolve(false);
      } catch { resolve(false); }
    });
  }).catch(() => false);
  return pending;
}

export async function readRunJournal(): Promise<RunJournalEntry | null> {
  await pending;
  const db = await openJournal();
  if (!db) return null;
  return new Promise(resolve => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get("active");
      request.onsuccess = () => {
        const entry: unknown = request.result;
        if (!entry || typeof entry !== "object") { resolve(null); return; }
        const value = entry as Partial<RunJournalEntry>;
        resolve((value.raw === null || typeof value.raw === "string") && Array.isArray(value.cleared) && value.cleared.every(raw => typeof raw === "string") ? value as RunJournalEntry : null);
      };
      tx.onabort = tx.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}
