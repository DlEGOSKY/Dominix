import { describe, expect, it } from "vitest";
import { createEmptyChain, placeTile } from "./chain";
import { ALL_PATTERNS, analyzePatterns } from "./patterns";
import { getLanguage, setLanguage } from "./i18n";
import { localizePattern } from "./i18nContent";

// Vertices describe connected dominoes, not synthetic disconnected PlacedTiles.
// Expected rewards are frozen from the playable rules before catalog repair.
const cases: [string, number[], number[], number, number][] = [
  ["cadena_simple", [1,2,3,4], [1,2,3], 20, 1],
  ["cadena_larga", [0,1,2,3,4,5], [0,1,2,3,4], 0, 1.5],
  ["cadena_maxima", [0,1,2,3,4,5,6,0], [0,1,2,3,4,5,6], 60, 1.8],
  ["doble_doble", [1,1,2,2], [1,1,2,3], 30, 1],
  ["triple_doble", [1,1,2,2,3,3], [1,1,2,2,3], 50, 1.2],
  ["todo_dobles", [2,2,2,2], [2,2,2,3], 0, 2],
  ["dominio", [2,2,2,3], [0,1,2,3], 25, 1],
  ["cierre_exacto", [1,2,3,1], [1,2,3,4], 0, 2],
  ["escalera", [0,1,2,3,4], [0,1,0,1,0], 35, 1],
  ["simetria", [1,2,2,1], [1,2,3,1], 40, 1.3],
  ["parejas", [1,2,1,2,1], [0,1,2,3,4], 30, 1.15],
  ["racha_alta", [4,5,6,4], [4,4,5,4], 40, 1],
  ["racha_baja", [0,1,2,1,0], [0,1,2,1,5], 0, 1.4],
  ["alternancia", [1,1,2,2,3], [1,1,2,3,4], 35, 1.1],
  ["suma_exacta", [3,4,4,2], [0,4,4,4], 0, 1.5],
  ["puente", [0,1,2,3,4,6], [1,2,3,4,5,6], 45, 1],
  ["espejo", [1,2,1,2,3], [1,2,1,3,4], 35, 1.2],
  ["zigzag", [1,4,2,5,1,3], [0,1,2,3,4,5], 40, 1.15],
  ["suma_impar", [0,1,2,3,4], [0,1,2,3,3], 30, 1.3],
  ["avalancha", [0,1,2,3,4], [0,1,2,1,2], 45, 1.25],
  ["trinidad", [1,2,1,3], [1,2,3,4], 45, 1.15],
  ["fractal", [0,1,1,3,1], [0,1,1,3,2], 60, 1.2],
  ["armonia", [4,5,4,1], [0,2,2,5], 40, 1.35],
  ["constelacion", [0,1,2,3,4,5], [0,1,2,3,4], 55, 1.25],
  ["diminuendo", [6,5,4,3,2], [6,5,4,5,4], 35, 1.3],
  ["corona", [1,1,2,2,3,3], [1,1,2,2,4,4], 50, 1.2],
  ["hexagrama", [0,1,2,3,4,5,6], [0,1,2,3,4,5,6,0], 80, 1.5],
  ["triple_filo", [0,0,1,1,2,2,3], [0,0,1,1,2,2,2], 45, 1.2],
  ["crescendo", [0,1,2,3,4], [0,1,2,1,2], 50, 1.35],
  ["cuna", [1,2,1,2], [1,2,3,4], 40, 1.3],
  ["ouroboros", [0,1,2,3,4,5,6,0], [0,1,2,3,4,5,0], 100, 1.6],
];
const chainOf = (values: number[]) => values.slice(1).reduce((chain, value, i) =>
  placeTile(chain, { id: `contract-${i}`, top: values[i]!, bottom: value }, "right"), createEmptyChain());
const detected = (values: number[]) => analyzePatterns(chainOf(values)).patterns;

describe("all 31 playable pattern contracts", () => {
  it("covers every catalog entry once, without duplicate ids", () => {
    expect(cases.map(c => c[0]).sort()).toEqual(ALL_PATTERNS.map(p => p.id).sort());
    expect(new Set(ALL_PATTERNS.map(p => p.id)).size).toBe(31);
  });
  it.each(cases)("%s rewards the valid chain and rejects its near miss", (id, positive, negative, bonus, multiplier) => {
    expect(detected(positive).find(p => p.id === id)).toMatchObject({ bonus, multiplier });
    expect(detected(negative).some(p => p.id === id)).toBe(false);
    expect(ALL_PATTERNS.find(p => p.id === id)).toMatchObject({ bonus, multiplier });
  });
  it("does not reinterpret increasing-sum overlap or change combo stacking", () => {
    const a = analyzePatterns(chainOf([0,1,2,3,4]));
    expect(a.patterns.map(p => p.id)).toEqual(["cadena_simple", "escalera", "suma_impar", "avalancha", "crescendo"]);
    expect(a.combo).toEqual({ name: "Ultra Combo", bonus: 100, multiplier: 1.8 });
    expect(a.totalBonus).toBe(280);
    expect(a.totalMultiplier).toBeCloseTo(3.94875);
  });
  it("keeps effective mirror faces distinct from printed pip sums", () => {
    let chain = chainOf([1,2,3]);
    chain = placeTile(chain, { id: "mirror", top: 6, bottom: 6, type: "mirror" }, "right");
    expect(chain.rightEnd).toBe(3);
    expect(analyzePatterns(chain).patterns.some(p => p.id === "cierre_exacto")).toBe(false);
  });
  it("has independent ES/EN descriptions for every rule", () => {
    const before = getLanguage();
    try {
      setLanguage("en");
      for (const pattern of ALL_PATTERNS) {
        const translated = localizePattern(pattern);
        expect(translated.description).not.toBe(pattern.description);
        expect(translated.description.length).toBeGreaterThan(15);
      }
      expect(localizePattern(ALL_PATTERNS.find(p => p.id === "suma_exacta")!).description).toContain("21, 42 or 63");
      expect(localizePattern(ALL_PATTERNS.find(p => p.id === "alternancia")!).description).toContain("doubles and non-doubles");
    } finally { setLanguage(before); }
  });
});
