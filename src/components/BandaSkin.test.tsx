import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TileView, { type TileSkin } from "./TileView";
import { ALL_TILE_SKINS, getTileSkin } from "@/engine/tileSkins";
import { getProgressionBonuses, loadActiveSkin, saveActiveSkin } from "@/engine/progression";
import { setLanguage } from "@/engine/i18n";
import type { Tile } from "@/types/domino";

vi.mock("@/hooks/useSettings", () => ({ useReduceMotion: () => true }));
beforeEach(() => { localStorage.clear(); setLanguage("es"); });
const base: Tile = { id: "portrait", top: 6, bottom: 0, type: "normal" };
const render = (tile: Tile, size: "sm" | "md" = "md") => renderToStaticMarkup(<TileView tile={tile} skin="banda_doble" size={size} animate={false} />);

describe("La Banda del Doble", () => {
  it("is available to a new player without a gameplay bonus or a save migration", () => {
    const progression = { xp: 0, level: 1, unlockedRewards: [] };
    const bonuses = getProgressionBonuses(progression);
    expect(bonuses.unlockedSkins).toContain("banda_doble");
    expect(bonuses.startingGold).toBe(0);
    expect(bonuses.startingRelics).toEqual([]);
    expect(bonuses.handSizeBonus).toBe(0);
    expect(bonuses.startingGoldenTiles).toBe(0);
    expect(progression).toEqual({ xp: 0, level: 1, unlockedRewards: [] });
    expect(getTileSkin("banda_doble").unlockLevel).toBe(0);
  });

  it("preserves an old selection and retains the new selection across reads", () => {
    saveActiveSkin("obsidian");
    getProgressionBonuses({ xp: 0, level: 1, unlockedRewards: [] });
    expect(loadActiveSkin()).toBe("obsidian");
    expect(getTileSkin(loadActiveSkin()).id).toBe("obsidian");
    saveActiveSkin("banda_doble");
    expect(getTileSkin(loadActiveSkin()).id).toBe("banda_doble");
    expect(new Set(ALL_TILE_SKINS.map(s => s.id)).size).toBe(ALL_TILE_SKINS.length);
  });

  it.each([0, 1, 2, 3, 4, 5, 6])("keeps value %i explicit instead of requiring recognition of the portrait", value => {
    const html = render({ ...base, top: value, bottom: value });
    expect(html).toContain(`aria-label="Doble, Ficha ${value} ${value}"`);
    expect((html.match(new RegExp(`data-crew-value="${value}"`, "g")) ?? [])).toHaveLength(2);
    expect((html.match(new RegExp(`data-value-label="${value}"`, "g")) ?? [])).toHaveLength(2);
  });

  it.each(["normal", "wild", "golden", "mirror", "bomb", "locked"] as const)("retains the identity and rules signal for %s tiles in both sizes", type => {
    for (const size of ["sm", "md"] as const) {
      const html = render({ ...base, type }, size);
      expect(html).toContain('data-skin="banda_doble"');
      expect((html.match(/data-crew-value=/g) ?? [])).toHaveLength(2);
      expect(html).toContain('data-value-label="6"');
      expect(html).toContain('data-value-label="0"');
      if (type === "locked") expect(html).toMatch(/<button[^>]*disabled/);
      else expect(html).not.toMatch(/<button[^>]*disabled/);
      if (type === "golden") expect(html).toContain("x2");
      if (type === "wild") expect(html).toContain(size === "sm" ? ">Com.</div>" : ">Comodin</div>");
      if (type === "mirror") expect(html).toContain(size === "sm" ? ">Esp.</span>" : ">Espejo</span>");
      if (type === "bomb") expect(html).toContain(size === "sm" ? ">Bom.</span>" : ">Bomba</span>");
    }
  });

  it("keeps values, edition and pact information together", () => {
    for (const edition of ["foil", "holo", "polychrome", "negative"] as const) {
      const html = render({ ...base, edition, pact: true });
      expect(html).toContain(`edicion ${edition}`);
      expect(html).toContain("con Pacto Sagrado");
      expect(html).toContain('data-value-label="6"');
      expect(html).toContain('data-value-label="0"');
    }
  });

  it("supports a non-interactive preview without nesting buttons", () => {
    const html = renderToStaticMarkup(<TileView tile={base} skin="banda_doble" staticView animate={false} />);
    expect(html).toContain('role="img"');
    expect(html).not.toContain("<button");
  });

  it("preserves the old special-type presentation for legacy skins", () => {
    const html = renderToStaticMarkup(<TileView tile={{ ...base, type: "wild" }} skin="bestiario" animate={false} />);
    expect(html).toContain(">Comodin</div>");
    expect(html).not.toContain("data-crew-value");
    expect(html).toContain('data-skin="default"');
  });

  it("keeps the pips readable if a saved skin id is unknown to this version", () => {
    const html = renderToStaticMarkup(<TileView tile={base} skin={"retired-pack" as TileSkin} animate={false} />);
    expect(html).toContain('data-skin="default"');
    expect(html).toContain("dot-normal");
    expect(html).toContain('aria-label="Ficha 6 0"');
  });
});
