import { describe, it, expect, beforeEach } from "vitest";
import { setLanguage } from "./i18n";
import { localizeRelic, localizeRelicById } from "./i18nContent";
import { ALL_RELICS } from "./relics";

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
