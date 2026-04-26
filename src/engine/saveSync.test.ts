import { describe, it, expect, beforeEach } from "vitest";
import { exportSave, importSave, resetAllSaveData } from "./saveSync";

describe("saveSync round-trip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("export -> import preserves all known keys", () => {
    localStorage.setItem("dominix_save", JSON.stringify({ bestRound: 7, bestScore: 1234 }));
    localStorage.setItem("dominix_progression", JSON.stringify({ xp: 500, level: 3 }));
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
