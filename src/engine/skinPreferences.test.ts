import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadSkinFavorites, saveSkinFavorites, SKIN_FAVORITES_KEY } from "./skinPreferences";
import { exportSave, importSave, resetAllSaveData } from "./saveSync";

beforeEach(() => localStorage.clear());
describe("cosmetic favorites and backup compatibility", () => {
  it("round-trips favorites without equipping or granting anything", () => {
    localStorage.setItem("dominix_active_skin", "roma_eterna");
    localStorage.setItem("dominix_progression", '{"xp":493,"level":3,"unlockedRewards":[]}');
    expect(saveSkinFavorites(new Set(["eclipse_glass", "future_pack"]))).toBe(true);
    const blob = exportSave();
    localStorage.clear();
    expect(importSave(blob).ok).toBe(true);
    expect([...loadSkinFavorites()]).toEqual(["eclipse_glass", "future_pack"]);
    expect(localStorage.getItem("dominix_active_skin")).toBe("roma_eterna");
    expect(JSON.parse(localStorage.getItem("dominix_progression")!).xp).toBe(493);
    resetAllSaveData();
    expect(localStorage.getItem(SKIN_FAVORITES_KEY)).toBeNull();
  });
  it.each(["invalid", "{}", '[1]', '["bad id"]', 'null'])("recovers from malformed local favorites: %s", value => {
    localStorage.setItem(SKIN_FAVORITES_KEY, value);
    expect(loadSkinFavorites().size).toBe(0);
    expect(localStorage.getItem(SKIN_FAVORITES_KEY)).toBe(value);
  });
  it("rejects malformed imported favorites before overwriting other keys", () => {
    localStorage.setItem("dominix_active_skin", "ivory");
    expect(importSave(JSON.stringify({magic:"dominix-save",version:2,data:{dominix_active_skin:"diamond",[SKIN_FAVORITES_KEY]:'[false]'}})).ok).toBe(false);
    expect(localStorage.getItem("dominix_active_skin")).toBe("ivory");
  });
  it("keeps favorites when importing an older backup with no favorite key", () => {
    saveSkinFavorites(new Set(["orbital_reactor"]));
    expect(importSave(JSON.stringify({magic:"dominix-save",version:1,data:{dominix_active_skin:"emerald"}})).ok).toBe(true);
    expect(loadSkinFavorites().has("orbital_reactor")).toBe(true);
  });
  it("reports storage failure while preserving the previous favorites", () => {
    saveSkinFavorites(new Set(["ivory"]));
    const write = vi.spyOn(localStorage, "setItem").mockImplementationOnce(() => { throw new Error("quota"); });
    expect(saveSkinFavorites(new Set(["diamond"]))).toBe(false);
    write.mockRestore();
    expect([...loadSkinFavorites()]).toEqual(["ivory"]);
  });
});
