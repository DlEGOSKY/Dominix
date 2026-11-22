import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NumericCollectionFace } from "@/engine/numericCollectionFaces";
import { MASK_REFERENCES } from "@/engine/collectionValueMarks";
import { getSkinCharacters, getCollectionCast } from "@/engine/skinCharacters";
import TileView from "./TileView";

vi.mock("@/hooks/useSettings", () => ({ useReduceMotion: () => true }));
describe("numeric identity in illustrated skins", () => {
  it.each(["among_us", "hollow_knight", "one_piece"] as const)("draws the actual quantity without relying on a number label in %s", collection => {
    for (let value = 0; value <= 6; value++) {
      const html = renderToStaticMarkup(<NumericCollectionFace collection={collection} value={value}/>);
      expect((html.match(/data-value-mark=/g) ?? [])).toHaveLength(value);
      expect(html.includes("data-empty-value")).toBe(value === 0);
      expect(html).not.toContain("data-value-label");
    }
  });
  it("gives Hollow Knight a distinct reference per value, while repeated masks encode the quantity", () => {
    const collection = "hollow_knight", references = MASK_REFERENCES;
    const silhouettes = new Set<string>();
    for (let value = 1; value <= 6; value++) {
      const html = renderToStaticMarkup(<NumericCollectionFace collection={collection} value={value}/>);
      expect((html.match(new RegExp(`data-mark-reference="${references[value]}"`, "g")) ?? [])).toHaveLength(value);
      expect(new Set([...html.matchAll(/data-mark-reference="([^"]+)"/g)].map(match => match[1]))).toEqual(new Set([references[value]]));
      const firstMark = html.match(/<svg data-mark-reference=.*?<\/svg>/)?.[0]?.replace(/data-mark-reference="[^"]+"/, "");
      expect(firstMark).toBeTruthy(); silhouettes.add(firstMark!);
    }
    expect(silhouettes.size).toBe(6);
    const zero = renderToStaticMarkup(<NumericCollectionFace collection={collection} value={0}/>);
    expect(zero).toContain('data-crew-value="0"'); expect(zero).not.toContain("data-value-mark");
  });
  it("keeps a single illustrated crew portrait separate from the countable register", () => {
    for (let value = 0; value <= 6; value++) {
      const html = renderToStaticMarkup(<NumericCollectionFace collection="among_us" value={value}/>);
      expect((html.match(/data-portrait-pack=/g) ?? [])).toHaveLength(1);
      expect(html).toContain(`data-crew-value="${value}"`);
      expect((html.match(/data-value-mark="signal"/g) ?? [])).toHaveLength(value);
      expect(html).not.toContain("data-mark-reference");
    }
  });
  it.each(["hollow_knight", "one_piece", "roma_eterna"] as const)("uses value-specific guests in %s and preserves the approved Roman motif", collection => {
    for (let value = 0; value <= 6; value++) {
      const html = renderToStaticMarkup(<NumericCollectionFace collection={collection} value={value}/>);
      expect((html.match(/data-collection-cameo/g) ?? [])).toHaveLength(1);
      expect(html).toContain(`data-crew-value="${collection === "roma_eterna" ? 6 : value}"`);
    }
  });
  it("renders each Roman value in the primary art, with an empty seal for zero", () => {
    for (const [value, numeral] of ["", "I", "II", "III", "IV", "V", "VI"].entries()) {
      const html = renderToStaticMarkup(<NumericCollectionFace collection="roma_eterna" value={value}/>);
      if (value === 0) { expect(html).toContain("data-empty-value"); expect(html).not.toContain("<text"); }
      else { expect(html).toContain(`>${numeral}</text>`); expect(html).toContain('font-size="64"'); }
    }
  });
  it.each(["among_us", "hollow_knight", "one_piece"] as const)("selects the reference independently for each half of a mixed %s tile", skin => {
    const html = renderToStaticMarkup(<TileView staticView skin={skin} tile={{id:"mixed-references",top:2,bottom:5}}/>);
    if (skin === "one_piece" || skin === "among_us") {
      expect((html.match(/data-crew-value="2"/g) ?? [])).toHaveLength(1);
      expect((html.match(/data-crew-value="5"/g) ?? [])).toHaveLength(1);
      expect(html).not.toContain('data-crew-value="1"');
    } else {
      const references = MASK_REFERENCES;
      expect((html.match(new RegExp(`data-mark-reference="${references[2]}"`, "g")) ?? [])).toHaveLength(2);
      expect((html.match(new RegExp(`data-mark-reference="${references[5]}"`, "g")) ?? [])).toHaveLength(5);
    }
  });
  it("separates collection guests from the numeric meanings in both languages", () => {
    expect(getSkinCharacters("among_us", "es")[2]?.name).toBe("Dos puntos");
    expect(getSkinCharacters("among_us", "es")[2]?.detail).toContain("Científico");
    expect(getSkinCharacters("one_piece", "en")[6]?.name).toBe("Six coins");
    expect(getCollectionCast("one_piece", "es")[6]?.name).toBe("Robin");
    expect(getSkinCharacters("one_piece", "es")[2]?.detail).toContain("Zoro");
    expect(getSkinCharacters("one_piece", "en")[0]?.detail).toContain("Brook");
    expect(getSkinCharacters("hollow_knight", "es")[2]?.name).toContain("Hornet");
    expect(getSkinCharacters("hollow_knight", "es")[2]?.name).not.toBe("Hornet");
    expect(getSkinCharacters("banda_doble", "es")[1]?.name).toBe("Monóculo");
  });
  it.each(["among_us", "hollow_knight", "one_piece"] as const)("retains the count and actual numeric values under special tile markers in %s", skin => {
    for (const type of ["normal", "wild", "golden", "mirror", "bomb", "locked"] as const) {
      const html = renderToStaticMarkup(<TileView staticView skin={skin} tile={{ id: "meaning", top: 2, bottom: 5, type, edition: "negative", pact: true }}/>);
      expect((html.match(/data-value-mark=/g) ?? [])).toHaveLength(7);
      expect(html).toContain('data-value-label="2"'); expect(html).toContain('data-value-label="5"');
      expect(html).toMatch(/2 5/); expect(html).toContain('data-numeric-face');
      expect((html.match(/data-edition-badge=/g) ?? [])).toHaveLength(1);
      expect((html.match(/data-pact-badge=/g) ?? [])).toHaveLength(1);
      expect(html).toContain('data-numeric-ribbon');
      if (type !== "normal" && type !== "locked") expect(html).toContain(`data-tile-badge="${type}"`);
    }
  });
});
