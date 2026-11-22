import { describe, it, expect, beforeEach, vi } from "vitest";
import { exportSave, importSave, resetAllSaveData, withSaveRollback } from "./saveSync";
import { saveTalents, loadTalents } from "./talents";
import { saveSelectedCharacter, loadSelectedCharacter, unlockCharacter, loadUnlockedCharacters } from "./characters";
import { saveDailyProgress, getDailyProgress } from "./daily";
import { saveAscension, loadAscension } from "./ascension";
import { discoverPattern, discoverBoss, discoverCelestial, discoverChaos } from "./codex";
import { discoverEdition } from "./editions";
import { saveProgression, loadProgression } from "./progression";

describe("saveSync round-trip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("restores partial terminal accounting and preserves unrelated data after a failed write", () => {
    localStorage.setItem("dominix_save", '{"totalRuns":2}');
    localStorage.setItem("dominix_progression", '{"xp":100}');
    localStorage.setItem("dominix_active_run_v1", "previous-run");
    localStorage.setItem("unrelated", "keep");
    const write = localStorage.setItem.bind(localStorage);
    const mock = vi.spyOn(localStorage, "setItem").mockImplementation((key, value) => {
      if (key === "dominix_progression" && value === '{"xp":125}') throw new Error("quota");
      write(key, value);
    });
    try {
      expect(withSaveRollback(() => {
        localStorage.setItem("dominix_save", '{"totalRuns":3}');
        localStorage.setItem("dominix_run_history", '[{"id":"partial"}]');
        localStorage.setItem("dominix_progression", '{"xp":125}');
        localStorage.removeItem("dominix_active_run_v1");
      })).toBe(false);
    } finally { mock.mockRestore(); }
    expect(localStorage.getItem("dominix_save")).toBe('{"totalRuns":2}');
    expect(localStorage.getItem("dominix_progression")).toBe('{"xp":100}');
    expect(localStorage.getItem("dominix_run_history")).toBeNull();
    expect(localStorage.getItem("dominix_active_run_v1")).toBe("previous-run");
    expect(localStorage.getItem("unrelated")).toBe("keep");
    expect(withSaveRollback(() => {
      const saved = JSON.parse(localStorage.getItem("dominix_save")!);
      localStorage.setItem("dominix_save", JSON.stringify({ totalRuns: saved.totalRuns + 1 }));
    })).toBe(true);
    expect(localStorage.getItem("dominix_save")).toBe('{"totalRuns":3}');
  });

  it("does not attempt terminal accounting when the original profile cannot be read", () => {
    const mock = vi.spyOn(localStorage, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    const action = vi.fn();
    try { expect(withSaveRollback(action)).toBe(false); expect(action).not.toHaveBeenCalled(); }
    finally { mock.mockRestore(); }
  });

  it("export -> import preserves all known keys", () => {
    localStorage.setItem("dominix_save", JSON.stringify({ bestRound: 7, bestScore: 1234 }));
    localStorage.setItem("dominix_progression", JSON.stringify({ xp: 500, level: 3, unlockedRewards: [] }));
    localStorage.setItem("dominix_lang", "en");

    const blob = exportSave();
    expect(blob.length).toBeGreaterThan(20);

    localStorage.clear();

    const result = importSave(blob);
    expect(result.ok).toBe(true);
    expect(result.keysImported).toBeGreaterThanOrEqual(3);

    expect(JSON.parse(localStorage.getItem("dominix_save") || "{}").bestRound).toBe(7);
    expect(JSON.parse(localStorage.getItem("dominix_progression") || "{}").level).toBe(3);
    expect(localStorage.getItem("dominix_lang")).toBe("en");
  });

  it("rejects malformed input gracefully", () => {
    expect(importSave("not a save").ok).toBe(false);
    expect(importSave("").ok).toBe(false);
    expect(importSave('{"random":"json"}').ok).toBe(false);
  });

  it("backs up actual keys written by the progression modules, including UTF-8", () => {
    saveTalents({ ranks: { cadena_base: 2 }, spent: 2 });
    saveSelectedCharacter("oracle");
    unlockCharacter("oracle");
    saveDailyProgress(7, true);
    saveAscension({ highestCleared: 3, selected: 4 });
    discoverPattern("cadena_simple");
    discoverBoss("guardian");
    discoverCelestial("cielo_simple");
    discoverChaos("luna_roja");
    discoverEdition("foil");
    saveProgression({ xp: 500, level: 4, unlockedRewards: ["lv2_gold"] });
    localStorage.setItem("dominix_run_history", JSON.stringify([{ name: "Ritual del Oráculo" }]));
    const before = Object.fromEntries(Array.from({ length: localStorage.length }, (_, i) => {
      const key = localStorage.key(i)!;
      return [key, localStorage.getItem(key)];
    }));
    const backup = exportSave();
    localStorage.clear();
    expect(importSave(backup)).toEqual({ ok: true, keysImported: Object.keys(before).length });
    for (const [key, value] of Object.entries(before)) expect(localStorage.getItem(key)).toBe(value);
    expect(loadTalents().spent).toBe(2);
    expect(loadSelectedCharacter()).toBe("oracle");
    expect(loadUnlockedCharacters().has("oracle")).toBe(true);
    expect(getDailyProgress()?.bestRound).toBe(7);
    expect(loadAscension().selected).toBe(4);
    expect(loadProgression().xp).toBe(500);
  });

  it("migrates old backup aliases without overwriting canonical data", () => {
    const result = importSave(JSON.stringify({ magic: "dominix-save", version: 1, data: {
      dominix_selected_character: "oracle", dominix_selected_character_v1: "architect",
      dominix_talents: JSON.stringify({ ranks: {}, spent: 0 }),
    } }));
    expect(result.ok).toBe(true);
    expect(loadSelectedCharacter()).toBe("architect");
    expect(localStorage.getItem("dominix_talents_v1")).toBe('{"ranks":{},"spent":0}');
  });

  it("validates the whole backup before overwriting any saved data", () => {
    localStorage.setItem("dominix_save", '{"bestRound":7}');
    expect(importSave(JSON.stringify({ magic: "dominix-save", version: 2, data: {
      dominix_save: '{"bestRound":1}', dominix_talents_v1: "corrupt",
    } })).ok).toBe(false);
    expect(localStorage.getItem("dominix_save")).toBe('{"bestRound":7}');
    expect(importSave('{"magic":"dominix-save","version":2,"data":[]}').ok).toBe(false);
    expect(importSave('{"magic":"dominix-save","version":-1,"data":{}}').ok).toBe(false);
  });

  it("reports quota failure and rolls earlier writes back", () => {
    localStorage.setItem("dominix_save", '{"bestRound":7}');
    const original = localStorage.setItem.bind(localStorage);
    const write = vi.spyOn(localStorage, "setItem").mockImplementation((key, value) => {
      if (key === "dominix_lang") throw new Error("quota");
      original(key, value);
    });
    try {
      expect(importSave(JSON.stringify({ magic: "dominix-save", version: 2, data: {
        dominix_save: '{"bestRound":1}', dominix_lang: "es",
      } })).ok).toBe(false);
      expect(localStorage.getItem("dominix_save")).toBe('{"bestRound":7}');
    } finally { write.mockRestore(); }
  });

  it("ignores unknown keys silently (no crash)", () => {
    // Manually craft a payload with an unknown key
    const payload = JSON.stringify({
      magic: "dominix-save",
      version: 1,
      exportedAt: Date.now(),
      data: {
        dominix_save: '{"bestRound":1}',
        unknown_key_should_be_ignored: "garbage",
      },
    });
    const blob = btoa(unescape(encodeURIComponent(payload)));
    const result = importSave(blob);
    expect(result.ok).toBe(true);
    expect(localStorage.getItem("unknown_key_should_be_ignored")).toBeNull();
  });

  it("resetAllSaveData wipes every tracked key", () => {
    localStorage.setItem("dominix_save", "{}");
    localStorage.setItem("dominix_progression", "{}");
    localStorage.setItem("dominix_lang", "es");
    localStorage.setItem("unrelated_key", "kept"); // should NOT be touched

    const removed = resetAllSaveData();
    expect(removed).toBeGreaterThanOrEqual(3);
    expect(localStorage.getItem("dominix_save")).toBeNull();
    expect(localStorage.getItem("unrelated_key")).toBe("kept");
  });
});
