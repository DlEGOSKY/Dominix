import { describe, it, expect, beforeEach } from "vitest";
import { setLanguage } from "./i18n";
import { localizeRelic, localizeRelicById, localizePattern, localizePatternById } from "./i18nContent";
import { ALL_RELICS } from "./relics";
import { ALL_PATTERNS } from "./patterns";

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
