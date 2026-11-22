import { useState } from "react";
import { ALL_TILE_SKINS, getTileSkin } from "@/engine/tileSkins";
import { getSkinCharacters, getCollectionCast } from "@/engine/skinCharacters";
import { localizeSkin } from "@/engine/i18nContent";
import { useTranslation } from "@/engine/i18n";
import TileView, { type TileSkin } from "./TileView";
import SkinTilePreview, { type SampleFinish } from "./SkinTilePreview";
import { romanValue } from "@/engine/materialArt";
import SkinTablePreview from "./SkinTablePreview";
import "./SkinWardrobe.css";

interface Props {
  activeSkin: string;
  unlockedSkins: ReadonlySet<string>;
  onEquip: (skin: TileSkin) => void;
  previewSkin?: TileSkin;
  showNavigation?: boolean;
}

/** Browsing is local UI state: only the explicit equip action changes selection. */
export default function SkinShowcase({ activeSkin, unlockedSkins, onEquip, previewSkin, showNavigation = true }: Props) {
  const { t, lang } = useTranslation();
  const [preview, setPreview] = useState(() => {
    if (previewSkin) return previewSkin;
    const selected = getTileSkin(activeSkin);
    return selected.material || selected.valueArtStyle === "portrait" ? selected.id : "ivory";
  });
  const [value, setValue] = useState(0);
  const [sample, setSample] = useState<SampleFinish>({type:"normal",pact:false});
  const skin = getTileSkin(preview);
  const cast = getSkinCharacters(preview, lang);
  const guests = getCollectionCast(preview, lang);
  const face = skin.valueFace ?? skin.valueIcon;
  const character = cast[value] ?? cast[0];
  const isCharacter = !!character;
  const packs = ALL_TILE_SKINS.filter(pack => isCharacter ? pack.valueArtStyle === "portrait" : !!pack.material);
  const copy = localizeSkin(skin);
  const active = activeSkin === skin.id;
  const owned = unlockedSkins.has(skin.id);

  return <section aria-labelledby="skin-showcase-title" className="w-full rounded-xl border border-violet-400/20 bg-surface-800/70 p-4 sm:p-5">
    <h2 id="skin-showcase-title" className="text-sm font-bold text-white mb-3">{t("collection.skinExplorer")}</h2>
    {showNavigation && <div className="flex gap-2 mb-4" aria-label={t("collection.skinFamilies")}>
      {(["materials", "characters"] as const).map(family => <button key={family} type="button"
        aria-pressed={isCharacter === (family === "characters")}
        onClick={() => { setPreview(family === "materials" ? "ivory" : "banda_doble"); setValue(0); }}
        className={`flex-1 min-h-11 rounded-lg border text-xs font-bold ${isCharacter === (family === "characters") ? "border-accent-gold/40 text-accent-gold bg-accent-gold/10" : "border-surface-600 text-accent-silver/80"}`}>
        {t(`collection.family.${family}`)}
      </button>)}
    </div>}
    {showNavigation && <div className="flex flex-wrap gap-2 mb-5" aria-label={t(isCharacter ? "collection.portraitPacks" : "collection.materialSkins")}>
      {packs.map(pack => <button key={pack.id} type="button" aria-pressed={preview === pack.id}
        onClick={() => { setPreview(pack.id); setValue(0); }}
        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${preview === pack.id ? "text-violet-200 border-violet-400/50 bg-violet-400/10" : "text-accent-silver/80 border-surface-600 hover:border-accent-silver/50"}`}>
        {localizeSkin(pack).name}
      </button>)}
    </div>}
    <div className="flex gap-4 items-start mb-5">
      {character ? <div role="img" aria-label={`${character.value} · ${character.name}`} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border-2" style={{borderColor:skin.accent}}>
        {face?.(character.value)}
      </div> : <div className="flex items-end gap-2 shrink-0">
        <TileView staticView skin={skin.id as TileSkin} tile={{id:"material-main",top:value,bottom:6-value}} animate={false} />
        <TileView staticView skin={skin.id as TileSkin} tile={{id:"material-small",top:value,bottom:6-value}} size="sm" animate={false} />
      </div>}
      <div className="min-w-0 flex-1" aria-live="polite" aria-atomic="true">
        <p className="text-[10px] uppercase tracking-widest text-accent-silver/70 mb-1">{t("collection.faceValue", { n: value })}</p>
        <h3 className="text-lg font-bold text-white leading-tight">{character?.name ?? copy.name}</h3>
        <p className="text-xs text-accent-silver/80 mt-2 leading-relaxed min-h-12">{character?.detail ?? copy.flavor}</p>
      </div>
    </div>
    {character ? <div className="grid grid-cols-4 sm:grid-cols-7 gap-2" aria-label={t("collection.sevenFaces")}>
      {cast.map(member => <button key={member.value} type="button" aria-label={`${member.value} · ${member.name}`}
        aria-pressed={value === member.value} onClick={() => setValue(member.value)}
        className={`${skin.valueFace ? "flex flex-col" : "relative aspect-square"} min-h-14 max-w-20 justify-self-center w-full rounded-lg overflow-hidden border-2 transition-colors ${value === member.value ? "border-accent-gold" : "border-surface-600 hover:border-accent-silver/60"}`}>
        {skin.valueFace ? <span className="block w-full aspect-square">{face?.(member.value)}</span> : face?.(member.value)}
        <span data-face-selector-label aria-hidden="true" className={`${skin.valueFace ? "block w-full h-4 shrink-0" : "absolute bottom-0 right-0 min-w-4 px-1 rounded-tl"} bg-surface-900 text-white text-xs font-mono font-bold`}>{skin.portraitNumerals === "roman" && member.value > 0 ? romanValue(member.value) : member.value}</span>
      </button>)}
    </div> : <div className="grid grid-cols-7 gap-2" aria-label={t("collection.sevenValues")}>
      {Array.from({length:7},(_,n)=><button key={n} type="button" aria-label={t("collection.faceValue",{n})} aria-pressed={value===n}
        onClick={()=>setValue(n)} className={`min-h-11 rounded-lg border font-bold ${value===n ? "text-accent-gold border-accent-gold/50 bg-accent-gold/10" : "text-accent-silver border-surface-600"}`}>
        {skin.valueArtStyle === "roman" && n > 0 ? romanValue(n) : n}
      </button>)}
    </div>}
    {skin.valueFace && <p className="mt-3 text-xs text-accent-silver leading-relaxed">{t(`collection.reading.${skin.id}`)}</p>}
    {guests.length > 0 && <div className="mt-5 pt-4 border-t border-surface-600/50">
      <h4 className="text-xs font-bold text-accent-silver mb-3">{t("collection.castArt")}</h4>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {guests.map(guest => <figure key={guest.frame} className="flex flex-col items-center gap-1 min-w-0" title={guest.detail}>
          <div role="img" aria-label={guest.name} className="w-12 h-12 rounded-md overflow-hidden border border-surface-600">{skin.valueIcon?.(guest.frame)}</div>
          <figcaption className="text-[10px] text-accent-silver/85 text-center">{guest.name}</figcaption>
        </figure>)}
      </div>
    </div>}
    {skin.valueArtStyle === "roman" && <p className="mt-3 text-[10px] text-accent-silver/75 leading-relaxed">{t("collection.romanZero")}</p>}
    {skin.portraitNumerals === "roman" && <p className="mt-3 text-[10px] text-accent-silver/75 leading-relaxed">{t("collection.romanPortraits")}</p>}
    <SkinTablePreview skin={skin.id as TileSkin} {...sample}/>
    <SkinTilePreview skin={skin.id as TileSkin} value={value} sample={sample} onSampleChange={setSample} />
    <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-surface-600/50">
      <div className="flex items-center gap-2" role="group" aria-label={t("collection.tablePreview")}>
        <TileView staticView tile={{id:"portrait-normal",top:value,bottom:(value+1)%7}} skin={skin.id as TileSkin} size="sm" animate={false} />
        <TileView staticView tile={{id:"portrait-golden",top:value,bottom:value,type:"golden"}} skin={skin.id as TileSkin} size="sm" animate={false} />
        <p className="text-[10px] leading-relaxed text-accent-silver/70 max-w-24">{t("collection.cosmeticOnly")}</p>
      </div>
      <button type="button" disabled={active || !owned} onClick={() => onEquip(skin.id as TileSkin)}
        className="px-4 py-3 rounded-lg text-xs font-bold border border-accent-gold/50 text-accent-gold bg-accent-gold/10 enabled:hover:bg-accent-gold/20 disabled:opacity-60">
        {active ? t("collection.skinActive") : owned ? t("collection.equipPack", { name: copy.name }) : t("collection.skinLockHint", { n: skin.unlockLevel })}
      </button>
    </div>
  </section>;
}
