import { ACTIVE_RUN_KEY, ACTIVE_RUN_BACKUP_KEY, decodeCheckpoint, clearRunCheckpoint, journalCurrentRun } from "./runCheckpoint";
import { SKIN_FAVORITES_KEY, validSkinFavorites } from "./skinPreferences";
import { PROFILE_TRANSACTION_KEY, recoverProfileTransaction, withProfileTransaction } from "./profileTransaction";
/**
 * saveSync — export and import the player's full local progression as a
 * single JSON blob. Useful as a manual cross-device sync (copy-paste the
 * blob into another browser) and as a backup before risky operations.
 *
 * What we serialize:
 *   - main save (best round/score/runs played)
 *   - run history
 *   - leaderboard
 *   - progression (XP, level, unlocked rewards)
 *   - achievements
 *   - active skin & character
 *   - daily/weekly progress
 *   - codex discoveries (patterns, bosses, celestials, chaos, editions)
 *   - talents
 *   - settings
 *   - language
 *   - mastery / character challenges
 *   - ascension
 *
 * Storage keys we touch are listed in TRACKED_KEYS — to add a new key just
 * append it here. Anything in localStorage NOT listed is intentionally
 * ignored (e.g. one-shot toasts, timers).
 */

export const TRACKED_KEYS = [
  SKIN_FAVORITES_KEY,
  ACTIVE_RUN_KEY, ACTIVE_RUN_BACKUP_KEY,
  "dominix_save", "dominix_run_history", "dominix_leaderboard", "dominix_progression",
  "dominix_achievements", "dominix_active_skin", "dominix_selected_character_v1",
  "dominix_characters_unlocked_v1", "dominix_daily", "dominix_weekly_v1",
  "dominix_codex_patterns_v1", "dominix_codex_bosses_v1", "dominix_codex_celestial_v1",
  "dominix_codex_chaos_v1", "dominix_editions_discovered_v1", "dominix_talents_v1",
  "dominix_settings_v1", "dominix_lang", "dominix_character_mastery_v1",
  "dominix_character_challenges_v1", "dominix_ascension_v1", "dominix_muted",
  "dominix_music_volume_v2", "dominix_music_muted", "dominix_tutorial_done",
  "dominix_legacy_v1", "dominix_milestones_v1",
] as const;

// Accept older backups; canonical keys win when both names are present.
const LEGACY_KEYS: Record<string, string> = {
  dominix_selected_character: "dominix_selected_character_v1",
  dominix_unlocked_characters: "dominix_characters_unlocked_v1",
  dominix_daily_progress: "dominix_daily",
  dominix_weekly_results: "dominix_weekly_v1",
  dominix_codex_patterns: "dominix_codex_patterns_v1",
  dominix_codex_bosses: "dominix_codex_bosses_v1",
  dominix_codex_celestials: "dominix_codex_celestial_v1",
  dominix_codex_chaos: "dominix_codex_chaos_v1",
  dominix_talents: "dominix_talents_v1",
  dominix_settings: "dominix_settings_v1",
  dominix_mastery: "dominix_character_mastery_v1",
  dominix_character_challenges: "dominix_character_challenges_v1",
  dominix_ascension: "dominix_ascension_v1",
  dominix_audio_muted: "dominix_muted",
};
const SAVE_VERSION = 3;
const MAGIC = "dominix-save";

interface SavePayload {
  magic: typeof MAGIC;
  version: number;
  exportedAt: number;
  data: Record<string, string>;
}

/** Read all tracked keys from localStorage and return a portable string. */
export function exportSave(): string {
  const data: Record<string, string> = {};
  for (const key of TRACKED_KEYS) {
    try {
      const v = localStorage.getItem(key);
      if (v != null) data[key] = v;
    } catch {
      /* ignore */
    }
  }
  const payload: SavePayload = {
    magic: MAGIC,
    version: SAVE_VERSION,
    exportedAt: Date.now(),
    data,
  };
  // Base64-wrap so users don't accidentally mangle the JSON (newlines, quotes)
  const json = JSON.stringify(payload);
  try {
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return json;
  }
}

export interface ImportResult {
  ok: boolean;
  error?: string;
  keysImported?: number;
}

/** Keep terminal run accounting retryable if a profile write fails midway. */
export function withSaveRollback(action: () => void): boolean {
  return withProfileTransaction(TRACKED_KEYS, action);
}

export function recoverPendingSave() { return recoverProfileTransaction(TRACKED_KEYS); }

/** Parse a previously-exported save blob and write its keys back. */
export function importSave(blob: string): ImportResult {
  let json = blob.trim();
  if (!json) return { ok: false, error: "Codigo vacio" };

  // Try base64 first, fall back to raw JSON for forward-compat
  if (!json.startsWith("{")) {
    try {
      json = decodeURIComponent(escape(atob(json)));
    } catch {
      return { ok: false, error: "Codigo invalido o corrupto" };
    }
  }

  let payload: SavePayload;
  try {
    payload = JSON.parse(json);
  } catch {
    return { ok: false, error: "Codigo invalido o corrupto" };
  }

  if (payload?.magic !== MAGIC) {
    return { ok: false, error: "No parece una partida de Dominix" };
  }
  if (!Number.isInteger(payload.version) || payload.version < 1 || payload.version > SAVE_VERSION) {
    return { ok: false, error: `Version no soportada (${payload.version})` };
  }
  if (!payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) {
    return { ok: false, error: "Datos faltantes" };
  }

  const entries = new Map<string, string>();
  for (const [sourceKey, value] of Object.entries(payload.data)) {
    const key = Object.prototype.hasOwnProperty.call(LEGACY_KEYS, sourceKey) ? LEGACY_KEYS[sourceKey]! : sourceKey;
    if (!(TRACKED_KEYS as readonly string[]).includes(key)) continue;
    if (typeof value !== "string" || !validStoredValue(key, value)) {
      return { ok: false, error: `Datos invalidos: ${key}` };
    }
    if (key !== sourceKey && Object.prototype.hasOwnProperty.call(payload.data, key)) continue;
    entries.set(key, value);
  }
  if (entries.size === 0) return { ok: false, error: "El archivo no contiene progreso compatible" };

  // Validate everything before touching storage. Roll back a partial write on quota failure.
  const previous = new Map<string, string | null>();
  try {
    for (const key of entries.keys()) previous.set(key, localStorage.getItem(key));
    for (const [key, value] of entries) localStorage.setItem(key, value);
  } catch {
    for (const [key, value] of previous) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch { /* best effort if the browser also refuses restoration */ }
    }
    return { ok: false, error: "No se pudo guardar. Comprueba el espacio disponible y conserva tu copia de seguridad." };
  }
  if (entries.has(ACTIVE_RUN_KEY) || entries.has(ACTIVE_RUN_BACKUP_KEY)) journalCurrentRun();
  return { ok: true, keysImported: entries.size };
}

function validStoredValue(key: string, value: string): boolean {
  if (key === ACTIVE_RUN_KEY || key === ACTIVE_RUN_BACKUP_KEY) return decodeCheckpoint(value) !== null;
  if (key === "dominix_lang") return value === "es" || value === "en";
  if (["dominix_muted", "dominix_music_muted", "dominix_tutorial_done"].includes(key)) return value === "0" || value === "1";
  if (key === "dominix_music_volume_v2") return value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1;
  if (["dominix_active_skin", "dominix_selected_character_v1"].includes(key)) return /^[a-z0-9_-]{1,64}$/i.test(value);
  try {
    const data = JSON.parse(value);
    if (key === SKIN_FAVORITES_KEY) return validSkinFavorites(data);
    const arrays = ["dominix_run_history", "dominix_leaderboard", "dominix_achievements", "dominix_characters_unlocked_v1", "dominix_editions_discovered_v1", "dominix_milestones_v1"];
    if (key.startsWith("dominix_codex_") || arrays.includes(key)) return Array.isArray(data);
    if (!data || typeof data !== "object" || Array.isArray(data)) return false;
    if (key === "dominix_progression") return Number.isFinite(data.xp) && data.xp >= 0 && Number.isInteger(data.level) && data.level >= 1 && Array.isArray(data.unlockedRewards);
    if (key === "dominix_talents_v1") return data.ranks && typeof data.ranks === "object" && !Array.isArray(data.ranks) && Number.isFinite(data.spent) && data.spent >= 0;
    if (key === "dominix_save") return Object.values(data).every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0);
    return true;
  } catch { return false; }
}

/** Wipe everything. Returns the count of keys removed. */
export function resetAllSaveData(): number {
  let count = 0;
  // Internal recovery metadata is not part of the public removed-key count.
  try { localStorage.removeItem(PROFILE_TRANSACTION_KEY); } catch { /* Storage may be blocked. */ }
  // Queue the clear after pending writes and retain fingerprints against crash
  // restoration. Keep the public removed-key count unchanged.
  const activeKeys = [ACTIVE_RUN_KEY, ACTIVE_RUN_BACKUP_KEY];
  try { count += activeKeys.filter(key => localStorage.getItem(key) !== null).length; } catch { /* blocked */ }
  clearRunCheckpoint();
  for (const key of [...TRACKED_KEYS, ...Object.keys(LEGACY_KEYS)]) {
    if (activeKeys.includes(key)) continue;
    try {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        count++;
      }
    } catch {
      /* ignore */
    }
  }
  return count;
}
