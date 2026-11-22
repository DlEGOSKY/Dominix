export const SKIN_FAVORITES_KEY = "dominix_skin_favorites_v1";

/** Keep unknown well-formed IDs for forward-compatible backups. */
export function validSkinFavorites(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 128 && value.every(id => typeof id === "string" && /^[a-z0-9_-]{1,64}$/.test(id));
}

export function loadSkinFavorites(): Set<string> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(SKIN_FAVORITES_KEY) ?? "[]");
    return new Set(validSkinFavorites(stored) ? stored : []);
  } catch { return new Set(); }
}

/** Return false on quota/privacy errors; callers retain the previous selection. */
export function saveSkinFavorites(favorites: ReadonlySet<string>): boolean {
  try {
    const ids = [...favorites];
    if (!validSkinFavorites(ids)) return false;
    localStorage.setItem(SKIN_FAVORITES_KEY, JSON.stringify(ids));
    return true;
  } catch { return false; }
}
