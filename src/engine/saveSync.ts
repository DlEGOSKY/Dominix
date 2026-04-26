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

const TRACKED_KEYS = [
  "dominix_save",
  "dominix_run_history",
  "dominix_leaderboard",
  "dominix_progression",
  "dominix_achievements",
  "dominix_active_skin",
  "dominix_selected_character",
  "dominix_unlocked_characters",
  "dominix_daily_progress",
  "dominix_weekly_results",
  "dominix_codex_patterns",
  "dominix_codex_bosses",
  "dominix_codex_celestials",
  "dominix_codex_chaos",
  "dominix_editions_discovered_v1",
  "dominix_talents",
  "dominix_settings",
  "dominix_lang",
  "dominix_mastery",
  "dominix_character_challenges",
  "dominix_ascension",
  "dominix_audio_muted",
  "dominix_ambient_state",
] as const;

const SAVE_VERSION = 1;
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
  if (typeof payload.version !== "number" || payload.version > SAVE_VERSION) {
    return { ok: false, error: `Version no soportada (${payload.version})` };
  }
  if (!payload.data || typeof payload.data !== "object") {
    return { ok: false, error: "Datos faltantes" };
  }

  let count = 0;
  for (const [key, value] of Object.entries(payload.data)) {
    if (!TRACKED_KEYS.includes(key as (typeof TRACKED_KEYS)[number])) continue;
    if (typeof value !== "string") continue;
    try {
      localStorage.setItem(key, value);
      count++;
    } catch {
      /* skip on quota issues */
    }
  }

  return { ok: true, keysImported: count };
}

/** Wipe everything. Returns the count of keys removed. */
export function resetAllSaveData(): number {
  let count = 0;
  for (const key of TRACKED_KEYS) {
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
