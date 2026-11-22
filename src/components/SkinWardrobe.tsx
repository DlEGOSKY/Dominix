import { useId, useState } from "react";
import { ALL_TILE_SKINS, getTileSkin, type TileSkinDef } from "@/engine/tileSkins";
import { WORLD_SKIN_IDS } from "@/engine/worldSkinArt";
import { localizeSkin } from "@/engine/i18nContent";
import { useTranslation } from "@/engine/i18n";
import { loadSkinFavorites, saveSkinFavorites } from "@/engine/skinPreferences";
import SkinShowcase from "./SkinShowcase";
import TileView, { type TileSkin } from "./TileView";
import ResourceSheet from "./ResourceSheet";
import "./SkinWardrobe.css";

type Family = "all" | "materials" | "worlds" | "characters" | "symbols";
function familyOf(skin: TileSkinDef): Family {
  if ((WORLD_SKIN_IDS as readonly string[]).includes(skin.id)) return "worlds";
  if (skin.material || skin.id === "default") return "materials";
  return skin.valueArtStyle === "portrait" ? "characters" : "symbols";
}
function Star({ filled }: { filled: boolean }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/></svg>;
}

export default function SkinWardrobe({ activeSkin, unlockedSkins, onEquip }: { activeSkin: TileSkin; unlockedSkins: ReadonlySet<string>; onEquip: (skin: TileSkin) => void }) {
  const { t } = useTranslation();
  const prefix = useId();
  const [family, setFamily] = useState<Family>("all");
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [favorites, setFavorites] = useState(loadSkinFavorites);
  const [saveError, setSaveError] = useState(false);
  const [preview, setPreview] = useState<TileSkin | null>(null);
  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const filtered = ALL_TILE_SKINS.filter(skin => (family === "all" || familyOf(skin) === family)
    && (!favoritesOnly || favorites.has(skin.id)) && (!ownedOnly || unlockedSkins.has(skin.id))
    && normalize(localizeSkin(skin).name).includes(normalize(query)));
  const active = localizeSkin(getTileSkin(activeSkin));
  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id); else next.add(id);
    if (saveSkinFavorites(next)) { setFavorites(next); setSaveError(false); } else setSaveError(true);
  };
  const clearFilters = () => { setFamily("all"); setQuery(""); setFavoritesOnly(false); setOwnedOnly(false); };

  return <section className="skin-wardrobe" aria-label={t("wardrobe.title")}>
    <div className="skin-current">
      <TileView staticView skin={activeSkin} size="sm" animate={false} tile={{id:"wardrobe-active",top:3,bottom:5}}/>
      <div className="skin-current-copy"><p>{t("collection.activeSkin")}</p><h2>{active.name}</h2><span>{t("wardrobe.browseNote")}</span></div>
      <button type="button" className="skin-control" onClick={() => setPreview(activeSkin)}>{t("wardrobe.tryActive")}</button>
    </div>
    <div className="skin-filters">
      <div className="skin-filter-field"><label htmlFor={`${prefix}-search`}>{t("wardrobe.search")}</label><input id={`${prefix}-search`} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t("wardrobe.searchHint")}/></div>
      <div className="skin-filter-field"><label htmlFor={`${prefix}-family`}>{t("collection.skinFamilies")}</label><select id={`${prefix}-family`} value={family} onChange={e => setFamily(e.target.value as Family)}>
        {(["all", "materials", "worlds", "characters", "symbols"] as const).map(f => <option key={f} value={f}>{t(`wardrobe.family.${f}`)}</option>)}
      </select></div>
    </div>
    <div className="skin-filter-options">
      <label><input type="checkbox" checked={favoritesOnly} onChange={e => setFavoritesOnly(e.target.checked)}/>{t("wardrobe.favorites")}</label>
      <label><input type="checkbox" checked={ownedOnly} onChange={e => setOwnedOnly(e.target.checked)}/>{t("wardrobe.available")}</label>
      <span role="status">{t("wardrobe.count", {n:filtered.length, total:ALL_TILE_SKINS.length})}</span>
    </div>
    {saveError && <p role="alert" className="text-sm text-red-300">{t("wardrobe.saveError")}</p>}
    {filtered.length ? <div className="skin-catalog">
      {filtered.map(skin => {
        const copy = localizeSkin(skin), owned = unlockedSkins.has(skin.id), equipped = skin.id === activeSkin;
        return <article key={skin.id} className="skin-catalog-card" data-equipped={equipped || undefined} data-catalog-skin={skin.id}>
          <button type="button" className="skin-favorite" aria-label={t("wardrobe.favorite", {name:copy.name})} aria-pressed={favorites.has(skin.id)} onClick={() => toggleFavorite(skin.id)}><Star filled={favorites.has(skin.id)}/></button>
          <button type="button" className="skin-catalog-preview" aria-label={t("wardrobe.try", {name:copy.name})} onClick={() => setPreview(skin.id as TileSkin)}>
            <div className="skin-catalog-art" style={{background:`radial-gradient(ellipse, ${skin.accent}16, transparent 72%)`}}><TileView staticView tile={{id:`catalog-${skin.id}`,top:3,bottom:5}} skin={skin.id as TileSkin} size="sm" animate={false}/></div>
            <h3>{copy.name}</h3><span>{equipped ? t("collection.skinActive") : owned ? t("wardrobe.tryLabel") : t("collection.skinLockHint", {n:skin.unlockLevel})}</span>
          </button>
        </article>;
      })}
    </div> : <div className="skin-empty"><p>{t("wardrobe.empty")}</p><button type="button" className="skin-control" onClick={clearFilters}>{t("wardrobe.clear")}</button></div>}
    {preview && <ResourceSheet title={t("wardrobe.try", {name:localizeSkin(getTileSkin(preview)).name})} mobileOnly={false} onClose={() => setPreview(null)}>
      <SkinShowcase key={preview} activeSkin={activeSkin} unlockedSkins={unlockedSkins} onEquip={onEquip} previewSkin={preview} showNavigation={false}/>
    </ResourceSheet>}
  </section>;
}
