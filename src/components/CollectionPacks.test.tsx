import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TileView, { type TileSkin } from "./TileView";
import SkinShowcase from "./SkinShowcase";
import { getTileSkin } from "@/engine/tileSkins";
import { getSkinCharacters, getCollectionCast } from "@/engine/skinCharacters";
import { getProgressionBonuses, loadActiveSkin, saveActiveSkin } from "@/engine/progression";
import { setLanguage } from "@/engine/i18n";
import type { Tile } from "@/types/domino";

vi.mock("@/hooks/useSettings", () => ({ useReduceMotion: () => true }));
const packs: TileSkin[] = ["among_us", "hollow_knight", "one_piece", "roma_eterna"];
beforeEach(() => { localStorage.clear(); setLanguage("es"); });

describe("complete portrait collections", () => {
  it("makes all four collections usable without granting gameplay advantages or replacing an old selection", () => {
    saveActiveSkin("emerald");
    const profile = { xp: 0, level: 1, unlockedRewards: [] };
    const bonuses = getProgressionBonuses(profile);
    for (const id of packs) { expect(bonuses.unlockedSkins).toContain(id); expect(getTileSkin(id).id).toBe(id); }
    expect(bonuses).toMatchObject({ startingGold: 0, startingRelics: [], startingGoldenTiles: 0, handSizeBonus: 0 });
    expect(profile).toEqual({ xp: 0, level: 1, unlockedRewards: [] });
    expect(loadActiveSkin()).toBe("emerald");
  });
  it.each(packs)("keeps every face value explicit independently of gallery portraits for %s", id => {
    for (let n = 0; n <= 6; n++) {
      const html = renderToStaticMarkup(<TileView staticView skin={id} tile={{ id: "sample", top: n, bottom: 6 - n }} animate={false} />);
      expect(html).toContain(`Ficha ${n} ${6 - n}`);
      expect(html).toContain(`data-value-label="${n}"`);
      expect(html).toContain(`data-value-label="${6 - n}"`);
      expect(html).toContain(`data-face-value="${n}"`);
      expect((html.match(/data-numeric-face=/g) ?? [])).toHaveLength(2);
    }
  });
  it.each(packs)("retains portraits and tactical information through special tiles, editions and pact for %s", id => {
    for (const type of ["normal", "golden", "wild", "mirror", "bomb", "locked"] as const) {
      for (const size of ["md", "sm"] as const) {
        const tile: Tile = { id: "special", top: 2, bottom: 6, type, edition: "polychrome", pact: true };
        const html = renderToStaticMarkup(<TileView skin={id} tile={tile} size={size} animate={false} />);
        expect((html.match(/data-numeric-face=/g) ?? [])).toHaveLength(2);
        expect(html).toContain(`data-skin="${id}"`);
        expect(html).toContain("con Pacto Sagrado"); expect(html).toContain("edicion polychrome");
        if (type === "locked") expect(html).toMatch(/<button[^>]*disabled/);
        if (type === "golden") expect(html).toContain("x2");
        if (type === "mirror" || type === "bomb") expect(html).toContain(`data-tile-badge="${type}"`);
      }
    }
  });
  it("prints Roman numerals while keeping accessible numeric values and zero", () => {
    const html = renderToStaticMarkup(<TileView staticView skin="roma_eterna" tile={{id:"rome",top:4,bottom:6}} />);
    expect(html).toContain(">IV</text>"); expect(html).toContain(">VI</text>"); expect(html).toContain("Ficha 4 6");
    const zero = renderToStaticMarkup(<TileView staticView skin="roma_eterna" tile={{id:"zero",top:0,bottom:1}} />);
    expect(zero).toContain('data-value-label="0"'); expect(zero).toContain(">0</span>"); expect(zero).toContain(">I</text>");
  });
  it.each(packs)("provides seven named faces in both languages and browsing does not equip %s", id => {
    for (const lang of ["es", "en"] as const) {
      const cast = getSkinCharacters(id, lang); expect(cast.map(c => c.value)).toEqual([0,1,2,3,4,5,6]);
      const guests = getCollectionCast(id, lang); expect(guests).toHaveLength(7);
      expect(guests.every(guest => !("value" in guest))).toBe(true);
      expect(new Set(cast.map(c => c.name)).size).toBe(7);
      setLanguage(lang); const equip = vi.fn();
      const html = renderToStaticMarkup(<SkinShowcase activeSkin={id} unlockedSkins={new Set(packs)} onEquip={equip} />);
      for (const member of cast) expect(html.replace(/&#x27;/g, "'")).toContain(`${member.value} · ${member.name}`);
      for (const guest of guests) expect(html).toContain(`aria-label="${guest.name}"`);
      expect(html).not.toContain("<button type=\"button\"><button");
      expect(equip).not.toHaveBeenCalled();
    }
  });
});
