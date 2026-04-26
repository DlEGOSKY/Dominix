import { describe, it, expect, beforeEach } from "vitest";
import { setLanguage } from "./i18n";
import { localizeRelic, localizeRelicById, localizePattern, localizePatternById, localizeBoss } from "./i18nContent";
import { ALL_RELICS } from "./relics";
import { ALL_PATTERNS } from "./patterns";
import { ALL_BOSSES } from "./boss";

describe("i18nContent — relics", () => {
  beforeEach(() => {
    setLanguage("es");
  });

  it("returns Spanish strings unchanged when language is es", () => {
    const precision = ALL_RELICS.find((r) => r.id === "precision")!;
    setLanguage("es");
    const loc = localizeRelic(precision);
    expect(loc.name).toBe(precision.name);
    expect(loc.description).toBe(precision.description);
  });

  it("returns English translation when language is en and relic is translated", () => {
    const precision = ALL_RELICS.find((r) => r.id === "precision")!;
    setLanguage("en");
    const loc = localizeRelic(precision);
    expect(loc.name).toBe("Precision");
    expect(loc.description).toBe("x1.15 global multiplier");
    // confirm we do not echo the Spanish copy
    expect(loc.description).not.toBe(precision.description);
  });

  it("falls back to Spanish when a relic has no English translation", () => {
    setLanguage("en");
    const loc = localizeRelicById(
      "non-existent-id",
      "Nombre Original",
      "Descripcion Original"
    );
    expect(loc.name).toBe("Nombre Original");
    expect(loc.description).toBe("Descripcion Original");
  });

  it("covers every relic id with an English translation (no orphans)", () => {
    setLanguage("en");
    // Identify any relic where localizeRelic returns the Spanish string. That
    // means the EN map is missing an entry. We fail loudly so future relic
    // additions cannot silently regress translation coverage.
    const orphans: string[] = [];
    for (const relic of ALL_RELICS) {
      const loc = localizeRelic(relic);
      // If both name and description are byte-equal to the Spanish source,
      // the map didn't have this id.
      if (loc.name === relic.name && loc.description === relic.description) {
        orphans.push(relic.id);
      }
    }
    expect(orphans, `Missing EN translations for: ${orphans.join(", ")}`).toEqual([]);
  });

  it("switches dynamically between es and en", () => {
    const precision = ALL_RELICS.find((r) => r.id === "precision")!;
    setLanguage("es");
    expect(localizeRelic(precision).name).toBe("Precision");
    setLanguage("en");
    expect(localizeRelic(precision).name).toBe("Precision");
    setLanguage("es");
    expect(localizeRelic(precision).description).toBe("x1.15 multiplicador global");
    setLanguage("en");
    expect(localizeRelic(precision).description).toBe("x1.15 global multiplier");
  });
});

describe("i18nContent — patterns", () => {
  beforeEach(() => {
    setLanguage("es");
  });

  it("returns Spanish pattern strings unchanged when language is es", () => {
    const fractal = ALL_PATTERNS.find((p) => p.id === "fractal")!;
    setLanguage("es");
    const loc = localizePattern(fractal);
    expect(loc.name).toBe(fractal.name);
    expect(loc.description).toBe(fractal.description);
  });

  it("returns English translation when language is en", () => {
    const fractal = ALL_PATTERNS.find((p) => p.id === "fractal")!;
    setLanguage("en");
    const loc = localizePattern(fractal);
    expect(loc.name).toBe("Fractal");
    expect(loc.description).toBe("Every sum is a power of 2 (1, 2, 4, 8)");
  });

  it("falls back to Spanish when a pattern id is unknown", () => {
    setLanguage("en");
    const loc = localizePatternById("not-a-pattern", "Original", "Original desc");
    expect(loc.name).toBe("Original");
    expect(loc.description).toBe("Original desc");
  });

  it("covers every pattern id with an English translation (no orphans)", () => {
    setLanguage("en");
    const orphans: string[] = [];
    for (const pattern of ALL_PATTERNS) {
      const loc = localizePattern(pattern);
      if (loc.name === pattern.name && loc.description === pattern.description) {
        orphans.push(pattern.id);
      }
    }
    expect(orphans, `Missing EN translations for: ${orphans.join(", ")}`).toEqual([]);
  });
});

describe("i18nContent — bosses", () => {
  beforeEach(() => {
    setLanguage("es");
  });

  it("returns Spanish boss strings unchanged when language is es", () => {
    const guardian = ALL_BOSSES.find((b) => b.id === "guardian")!;
    setLanguage("es");
    const loc = localizeBoss(guardian);
    expect(loc.name).toBe(guardian.name);
    expect(loc.description).toBe(guardian.description);
  });

  it("returns English translation for a boss when language is en", () => {
    const guardian = ALL_BOSSES.find((b) => b.id === "guardian")!;
    setLanguage("en");
    const loc = localizeBoss(guardian);
    expect(loc.name).toBe("Guardian of the Chain");
    expect(loc.description).toBe("Target x1.6. You cannot use doubles.");
  });

  it("translates phase descriptions for multi-phase bosses", () => {
    const verdugo = ALL_BOSSES.find((b) => b.id === "verdugo")!;
    setLanguage("en");
    const loc = localizeBoss(verdugo);
    expect(loc.phases).toBeDefined();
    expect(loc.phases![0]).toBe("Phase 1: Doubles only");
    expect(loc.phases![1]).toBe("Phase 2: 2 patterns");
  });

  it("falls back to Spanish phase descriptions when EN entry has none", () => {
    setLanguage("en");
    // Forge a boss whose id is not in BOSS_EN to confirm the fallback path.
    const fake = { id: "no-such-boss", name: "Fake", description: "Original", phases: [{ description: "Fase 1", restriction: undefined as never, targetMultiplier: 1 }] } as never;
    const loc = localizeBoss(fake);
    expect(loc.phases).toEqual(["Fase 1"]);
  });

  it("covers every boss id with an English translation (no orphans)", () => {
    setLanguage("en");
    const orphans: string[] = [];
    for (const boss of ALL_BOSSES) {
      const loc = localizeBoss(boss);
      if (loc.name === boss.name && loc.description === boss.description) {
        orphans.push(boss.id);
      }
    }
    expect(orphans, `Missing EN translations for: ${orphans.join(", ")}`).toEqual([]);
  });
});
