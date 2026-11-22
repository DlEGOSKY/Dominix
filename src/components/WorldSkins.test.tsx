import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { WORLD_SKIN_IDS, WorldSkinFace } from "@/engine/worldSkinArt";
import { getTileSkin } from "@/engine/tileSkins";
import { getProgressionBonuses, LEVEL_REWARDS } from "@/engine/progression";
import { setLanguage } from "@/engine/i18n";
import TileView from "./TileView";
import SkinTablePreview from "./SkinTablePreview";
import SkinShowcase from "./SkinShowcase";

vi.mock("@/hooks/useSettings", () => ({ useReduceMotion: () => true }));
beforeEach(() => { localStorage.clear(); setLanguage("es"); });
describe.each(WORLD_SKIN_IDS)("%s is a counted cosmetic world", world => {
  it.each([0,1,2,3,4,5,6])("contains exactly %i counted inlays and an unambiguous empty face", value => {
    const html = renderToStaticMarkup(<WorldSkinFace world={world} value={value}/>);
    expect((html.match(/data-counted-inlay=/g) ?? []).length).toBe(value);
    expect(html.includes("data-empty-cavity")).toBe(value === 0);
    expect(html).not.toContain("<text");
    expect(html).not.toContain("<image");
  });
  it("retains both values, type, pact and edition at both sizes", () => {
    for (const type of ["normal","wild","golden","mirror","bomb","locked"] as const) {
      for (const size of ["sm","md"] as const) {
        for (const edition of [undefined,"foil","holo","polychrome","negative"] as const) {
          const html = renderToStaticMarkup(<TileView staticView skin={world} size={size} tile={{id:"counted",top:0,bottom:6,type,pact:true,edition}}/>);
          expect(html).toContain(`data-skin="${world}"`);
          expect(html).toContain('data-world-value="0"');
          expect(html).toContain('data-world-value="6"');
          expect((html.match(/data-counted-inlay=/g) ?? []).length).toBe(6);
          expect(html).toContain("Pacto Sagrado");
          if (edition) expect(html).toContain(`edicion ${edition}`);
          if (type !== "normal" && type !== "locked") expect(html).toContain(`data-tile-badge="${type}"`);
        }
      }
    }
  });
});
it("adds worlds without changing progression, active skin or gameplay bonuses", () => {
  localStorage.setItem("dominix_active_skin", "among_us");
  const progression = {xp:0,level:1,unlockedRewards:[]};
  const bonuses = getProgressionBonuses(progression);
  expect(bonuses.unlockedSkins).toEqual(expect.arrayContaining([...WORLD_SKIN_IDS]));
  expect(bonuses.startingGold).toBe(0);
  expect(bonuses.handSizeBonus).toBe(0);
  expect(bonuses.startingRelics).toEqual([]);
  expect(progression).toEqual({xp:0,level:1,unlockedRewards:[]});
  expect(localStorage.getItem("dominix_active_skin")).toBe("among_us");
  for (const id of WORLD_SKIN_IDS) expect(getTileSkin(id).unlockLevel).toBe(0);
});
it("announces the same unlock level that actually grants each existing skin", () => {
  for (const reward of LEVEL_REWARDS.filter(reward => reward.type === "tile_skin")) {
    const skin = getTileSkin(String(reward.value));
    expect(skin.unlockLevel, skin.id).toBe(reward.level);
    expect(getProgressionBonuses({xp:0,level:1,unlockedRewards:[]}).unlockedSkins).not.toContain(skin.id);
    expect(getProgressionBonuses({xp:0,level:reward.level,unlockedRewards:[reward.id]}).unlockedSkins).toContain(skin.id);
  }
});
it.each(["es","en"] as const)("shows all values in a valid sample chain and never equips in %s", lang => {
  setLanguage(lang);
  localStorage.setItem("dominix_active_skin", "roma_eterna");
  const equip = vi.fn();
  const html = renderToStaticMarkup(<SkinShowcase activeSkin="roma_eterna" previewSkin="eclipse_glass" showNavigation={false} unlockedSkins={new Set(WORLD_SKIN_IDS)} onEquip={equip}/>);
  expect(html).toContain(lang === "es" ? "Vitrales del eclipse" : "Eclipse Stained Glass");
  expect(html).not.toContain("collection.reading.");
  expect(html).toContain("data-trial-chain");
  expect(html).toContain("data-trial-hand");
  expect(equip).not.toHaveBeenCalled();
  expect(localStorage.getItem("dominix_active_skin")).toBe("roma_eterna");
  const table = renderToStaticMarkup(<SkinTablePreview skin="eclipse_glass"/>);
  for (let n=0;n<6;n++) expect(table).toContain(`Tile ${n} ${n+1}`.replace("Tile", lang === "es" ? "Ficha" : "Tile"));
  expect((table.match(/role="img"/g) ?? [])).toHaveLength(13);
});
