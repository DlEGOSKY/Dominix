import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TileView from "./TileView";
import SkinShowcase from "./SkinShowcase";
import { romanValue, materialWearVariant } from "@/engine/materialArt";
import { getGlobalRNG, setGlobalRNG } from "@/engine/rng";
import { getTileSkin } from "@/engine/tileSkins";
import { getProgressionBonuses, loadActiveSkin, saveActiveSkin } from "@/engine/progression";
import { setLanguage } from "@/engine/i18n";

vi.mock("@/hooks/useSettings", () => ({ useReduceMotion: () => true }));
beforeEach(() => { localStorage.clear(); setLanguage("es"); });

describe("material and Roman skins", () => {
  it.each([[0,""],[1,"I"],[2,"II"],[3,"III"],[4,"IV"],[5,"V"],[6,"VI"]] as const)("keeps game value %i and its Roman face %s equivalent", (value, numeral) => {
    expect(romanValue(value)).toBe(numeral);
    const html = renderToStaticMarkup(<TileView skin="imperium" tile={{id:"roman",top:value,bottom:value}} animate={false} />);
    expect(html).toContain(`aria-label="Doble, Ficha ${value} ${value}"`);
    expect((html.match(new RegExp(`data-value-label="${value}"`,"g")) ?? [])).toHaveLength(2);
    if (value === 0) expect((html.match(/data-roman-empty/g) ?? [])).toHaveLength(2);
    else expect((html.match(new RegExp(`>${numeral}</span>`,"g")) ?? [])).toHaveLength(2);
  });

  it.each(["normal","wild","golden","mirror","bomb","locked"] as const)("preserves Roman identity and tactical type %s in both sizes", type => {
    for (const size of ["sm","md"] as const) {
      const html = renderToStaticMarkup(<TileView skin="imperium" size={size} tile={{id:"state",top:4,bottom:6,type,pact:true,edition:"foil"}} animate={false} />);
      expect(html).toContain('data-skin="imperium"');
      expect(html).toContain('data-material="roman"');
      expect(html).toContain(">IV</span>"); expect(html).toContain(">VI</span>");
      expect(html).toContain("con Pacto Sagrado, edicion foil");
      if (type === "golden") expect(html).toContain("x2");
      if (type === "locked") expect(html).toMatch(/<button[^>]*disabled/);
    }
  });

  it("retains Roman values with every edition", () => {
    for (const edition of ["foil","holo","polychrome","negative"] as const) {
      const html = renderToStaticMarkup(<TileView skin="imperium" tile={{id:"edition",top:0,bottom:5,edition}} />);
      expect(html).toContain("data-roman-empty"); expect(html).toContain(">V</span>");
      expect(html).toContain(`edicion ${edition}`);
    }
    expect(romanValue(7)).toBe("?"); expect(romanValue(-1)).toBe("?");
  });

  it.each(["ivory","emerald","ruby","diamond","obsidian"] as const)("keeps %s as a material without altering tile values or mutating inventory", skin => {
    const tile = Object.freeze({id:"material",top:2,bottom:6});
    const html = renderToStaticMarkup(<TileView skin={skin} tile={tile} staticView />);
    expect(html).toContain('aria-label="Ficha 2 6"');
    expect(html).toContain(`data-material="${skin}"`);
    expect(html).not.toContain("data-crew-value");
    expect(tile).toEqual({id:"material",top:2,bottom:6});
  });

  it("preserves old unlocks and choices while adding two cosmetic-only options", () => {
    saveActiveSkin("emerald");
    const bonuses = getProgressionBonuses({xp:0,level:1,unlockedRewards:[]});
    expect(bonuses.unlockedSkins).toEqual(expect.arrayContaining(["diamond","imperium"]));
    expect(bonuses.unlockedSkins).not.toContain("emerald");
    expect(bonuses.startingGold).toBe(0); expect(bonuses.handSizeBonus).toBe(0);
    expect(loadActiveSkin()).toBe("emerald");
    expect(getTileSkin("ivory").unlockLevel).toBe(12);
    expect(getTileSkin("emerald").unlockLevel).toBe(6);
    expect(getTileSkin("ruby").unlockLevel).toBe(10);
  });

  it("lets players inspect a locked material without equipping or unlocking it", () => {
    saveActiveSkin("default");
    const equip = vi.fn();
    const html = renderToStaticMarkup(<SkinShowcase activeSkin="default" unlockedSkins={new Set(["default","imperium","diamond"])} onEquip={equip} />);
    expect(html).toContain("Marfil"); expect(html).toContain("Se desbloquea al nivel 12");
    expect(html).not.toContain("El Ausente");
    expect(equip).not.toHaveBeenCalled(); expect(loadActiveSkin()).toBe("default");
  });
});


describe("crafted material surfaces", () => {
  it.each(["imperium", "ivory", "emerald", "diamond", "ruby", "obsidian"] as const)("adds cosmetic tooling to %s without changing values or availability", skin => {
    const tile = Object.freeze({id:"crafted",top:4,bottom:6});
    const html = renderToStaticMarkup(<TileView skin={skin} tile={tile} staticView />);
    expect(html).toContain(`data-material-detail="${skin === "imperium" ? "roman" : skin}"`);
    expect(html).toContain('aria-label="Ficha 4 6"');
    expect(html).not.toContain("disabled");
    expect(tile).toEqual({id:"crafted",top:4,bottom:6});
  });
  it("keeps wear stable across rerenders, without changing run randomness or saved selection", () => {
    setGlobalRNG(89341); const rng = getGlobalRNG().snapshot();
    saveActiveSkin("roma_eterna");
    for (const id of ["tile-a", "tile-b", "copy-2", "saved-52"]) {
      const tile = Object.freeze({ id, top: 2, bottom: 6 });
      const first = renderToStaticMarkup(<TileView staticView skin="ivory" tile={tile}/>);
      expect(renderToStaticMarkup(<TileView staticView skin="ivory" tile={tile}/>)).toBe(first);
      expect(first).toContain(`data-material-wear="${materialWearVariant(id)}"`);
      expect(tile).toEqual({ id, top: 2, bottom: 6 });
    }
    expect(getGlobalRNG().snapshot()).toEqual(rng); expect(loadActiveSkin()).toBe("roma_eterna");
  });
});
