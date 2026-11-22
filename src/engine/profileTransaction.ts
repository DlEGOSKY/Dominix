import { journalCurrentRun } from "./runCheckpoint";

export const PROFILE_TRANSACTION_KEY = "dominix_profile_settlement_v1";
export const PROFILE_RECOVERY_EVENT = "dominix-profile-recovery-required";
type Entry = [string, string | null];
type RecordData = { version: 1; id: string; phase: "prepared"; entries: Entry[] }
  | { version: 1; id: string; phase: "settled" };
export interface ProfileRecovery { ok: boolean; skipRunJournal: boolean }
let sequence = 0;

function decode(raw: string, keys: readonly string[]): RecordData | null {
  try {
    if (raw.length > 12000000) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const value = data as Partial<RecordData>;
    if (value.version !== 1 || typeof value.id !== "string" || !value.id || value.id.length > 100) return null;
    if (value.phase === "settled") return value as RecordData;
    if (value.phase !== "prepared" || !Array.isArray(value.entries) || !value.entries.length || value.entries.length > keys.length) return null;
    const seen = new Set<string>();
    for (const entry of value.entries) {
      if (!Array.isArray(entry) || entry.length !== 2 || !keys.includes(entry[0]) || seen.has(entry[0]) || (entry[1] !== null && typeof entry[1] !== "string")) return null;
      seen.add(entry[0]);
    }
    return value as RecordData;
  } catch { return null; }
}

/** Restore only the enumerated game keys; free newly created values first. */
function restore(entries: Entry[]): boolean {
  for (const [key, value] of entries) if (value === null) {
    try { localStorage.removeItem(key); } catch { /* Verify the final state below. */ }
  }
  for (const [key, value] of entries) if (value !== null) {
    try { if (localStorage.getItem(key) !== value) localStorage.setItem(key, value); } catch { /* Keep the durable record for retry. */ }
  }
  try { return entries.every(([key, value]) => localStorage.getItem(key) === value); }
  catch { return false; }
}

function requireRecovery() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PROFILE_RECOVERY_EVENT));
}

function markSettled(id: string): string {
  const raw = JSON.stringify({ version: 1, id, phase: "settled" } satisfies RecordData);
  localStorage.setItem(PROFILE_TRANSACTION_KEY, raw);
  return raw;
}

/** Keep a receipt until IndexedDB agrees with the authoritative local state.
 * Without it, a stale run journal could resurrect a successfully finished run.
 */
async function synchronize(raw: string): Promise<void> {
  try {
    if (await journalCurrentRun() && localStorage.getItem(PROFILE_TRANSACTION_KEY) === raw) localStorage.removeItem(PROFILE_TRANSACTION_KEY);
  } catch { /* A settled receipt is safe to retry at the next startup. */ }
}

/** Synchronous profile writes with a durable before-image and commit receipt.
 * UI changes must be applied by the caller only after this returns true.
 */
export function withProfileTransaction(keys: readonly string[], action: () => void): boolean {
  let entries: Entry[], id: string;
  try {
    const previous = localStorage.getItem(PROFILE_TRANSACTION_KEY);
    if (previous) {
      const pending = decode(previous, keys);
      if (!pending || pending.phase === "prepared") { requireRecovery(); return false; }
    }
    entries = keys.map(key => [key, localStorage.getItem(key)]);
    id = `${Date.now()}-${++sequence}`;
    localStorage.setItem(PROFILE_TRANSACTION_KEY, JSON.stringify({ version: 1, id, phase: "prepared", entries } satisfies RecordData));
  } catch { return false; } // No gameplay/profile writes have started.
  try {
    action();
    const receipt = markSettled(id);
    void synchronize(receipt);
    return true;
  } catch {
    if (!restore(entries)) { requireRecovery(); return false; }
    try { void synchronize(markSettled(id)); }
    catch { requireRecovery(); }
    return false;
  }
}

/** Under the exclusive app lock, before importing App or reading player state. */
export async function recoverProfileTransaction(keys: readonly string[]): Promise<ProfileRecovery> {
  try {
    const raw = localStorage.getItem(PROFILE_TRANSACTION_KEY);
    if (!raw) return { ok: true, skipRunJournal: false };
    const pending = decode(raw, keys);
    if (!pending || (pending.phase === "prepared" && !restore(pending.entries))) return { ok: false, skipRunJournal: true };
    const receipt = pending.phase === "prepared" ? markSettled(pending.id) : raw;
    await synchronize(receipt);
    // The profile is authoritative, even if optional IndexedDB is unavailable.
    // Never apply an older journal to a restored/committed profile on this boot.
    return { ok: true, skipRunJournal: true };
  } catch { return { ok: false, skipRunJournal: true }; }
}
