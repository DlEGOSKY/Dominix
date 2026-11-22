import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ALL_TILE_SKINS, getTileSkin } from "@/engine/tileSkins";
import { getSkinCharacters } from "@/engine/skinCharacters";
import { getProgressionBonuses, loadActiveSkin, saveActiveSkin } from "@/engine/progression";
import { setLanguage } from "@/engine/i18n";
import SkinShowcase from "./SkinShowcase";
import TileView from "./TileView";
import SkinTilePreview from "./SkinTilePreview";

vi.mock("@/hooks/useSettings", () => ({ useReduceMotion: () => true }));
beforeEach(() => { localStorage.clear(); setLanguage("es"); });

describe("character collections", () => {
  it("adds Luxury Scrap without replacing a player's choice or granting gameplay bonuses", () => {
    saveActiveSkin("bestiario");
    const bonuses = getProgressionBonuses({ xp: 0, level: 1, unlockedRewards: [] });
    expect(bonuses.unlockedSkins).toEqual(expect.arrayContaining(["banda_doble", "chatarra_lujo", "invitados_umbral"]));
    expect(bonuses.startingGold).toBe(0);
    expect(bonuses.startingRelics).toEqual([]);
    expect(loadActiveSkin()).toBe("bestiario");
    expect(new Set(ALL_TILE_SKINS.map(skin => skin.id)).size).toBe(ALL_TILE_SKINS.length);
  });

  it.each(["banda_doble", "chatarra_lujo", "invitados_umbral"])("gives %s seven named values in both languages", skin => {
    for (const lang of ["es", "en"] as const) {
      const cast = getSkinCharacters(skin, lang);
      expect(cast.map(member => member.value)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(new Set(cast.map(member => member.name)).size).toBe(7);
      expect(cast.every(member => member.name.length > 0 && member.detail.length > 0)).toBe(true);
    }
    expect(getTileSkin(skin).valueArtStyle).toBe("portrait");
  });

  describe.each(["chatarra_lujo", "invitados_umbral"] as const)("%s", skin => {
  it.each([0, 1, 2, 3, 4, 5, 6])("makes value %i explicit in normal and special tiles", value => {
    for (const type of ["normal", "wild", "golden", "mirror", "bomb", "locked"] as const) {
      for (const size of ["sm", "md"] as const) {
        const html = renderToStaticMarkup(<TileView tile={{ id: "sample", top: value, bottom: 6 - value, type, edition: "foil", pact: true }} skin={skin} size={size} animate={false} />);
        expect(html).toContain(`data-skin="${skin}"`);
        expect(html).toContain(`data-crew-value="${value}"`);
        expect(html).toContain(`data-value-label="${value}"`);
        expect(html).toContain(`data-value-label="${6 - value}"`);
        expect(html).toContain("edicion foil");
        expect(html).toContain("con Pacto Sagrado");
        if (type === "locked") expect(html).toMatch(/<button[^>]*disabled/);
      }
    }
  });
  });

  it.each(["es", "en"] as const)("keeps sample controls separate from saved progress in %s", lang => {
    setLanguage(lang);
    const keys = ["dominix_active_skin", "dominix_progression", "dominix_editions_discovered_v1"];
    localStorage.setItem(keys[0]!, "obsidian");
    localStorage.setItem(keys[1]!, JSON.stringify({xp:493,level:3,unlockedRewards:[]}));
    localStorage.setItem(keys[2]!, JSON.stringify(["foil"]));
    const before = keys.map(key => localStorage.getItem(key));
    const html = renderToStaticMarkup(<SkinTilePreview skin="invitados_umbral" value={4} />);
    expect(keys.map(key => localStorage.getItem(key))).toEqual(before);
    expect(html).toContain("<details");
    expect(html).not.toMatch(/<details[^>]* open/);
    expect(html).not.toContain("<button");
    expect((html.match(/role="img"/g) ?? [])).toHaveLength(2);
    expect(html).toContain(lang === "es" ? "No modifica tus fichas" : "Does not modify your tiles");
    expect(html).toContain(lang === "es" ? "Tipo de muestra" : "Sample type");
  });

  it("opens the active character pack and keeps viewing separate from equipping", () => {
    saveActiveSkin("chatarra_lujo");
    const onEquip = vi.fn();
    const html = renderToStaticMarkup(<SkinShowcase activeSkin="chatarra_lujo" unlockedSkins={new Set(["banda_doble", "chatarra_lujo"])} onEquip={onEquip} />);
    expect(html).toContain("Apagado");
    expect(html).toContain("0 · Apagado");
    expect(html).toContain("6 · Caldero");
    expect(html).toContain("Solo apariencia. Mismas reglas y valores.");
    expect(html).toContain(">Activa</button>");
    expect(onEquip).not.toHaveBeenCalled();
    expect(loadActiveSkin()).toBe("chatarra_lujo");
  });

  it("localizes names, details and equip copy together", () => {
    setLanguage("en");
    const html = renderToStaticMarkup(<SkinShowcase activeSkin="default" unlockedSkins={new Set(["banda_doble"])} onEquip={vi.fn()} />);
    expect(html).toContain("Ivory");
    expect(html).toContain("Materials and symbols");
    expect(html).toContain("Unlocks at level 12");
    expect(html).not.toContain("El Ausente");
    expect(getSkinCharacters("unknown", "en")).toEqual([]);
  });

  it("announces the whole tile identity in English, including its pact and edition", () => {
    setLanguage("en");
    const html = renderToStaticMarkup(<TileView staticView skin="invitados_umbral" tile={{id:"accessible",top:1,bottom:6,type:"mirror",edition:"negative",pact:true}} />);
    expect(html).toContain('aria-label="Mirror, Tile 1 6, with Sacred Pact, negative edition"');
    expect(html).not.toContain("con Pacto Sagrado");
  });
});
