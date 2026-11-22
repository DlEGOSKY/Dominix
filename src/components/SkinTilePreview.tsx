import { useId, useState } from "react";
import type { Tile, TileEdition, TileType } from "@/types/domino";
import { useTranslation } from "@/engine/i18n";
import TileView, { type TileSkin } from "./TileView";

/** Local sample controls never modify inventory, discoveries or progression. */
export interface SampleFinish { type: TileType; edition?: TileEdition; pact: boolean }
export default function SkinTilePreview({ skin, value, sample: controlledSample, onSampleChange }: { skin: TileSkin; value: number; sample?: SampleFinish; onSampleChange?: (sample: SampleFinish) => void }) {
  const { t } = useTranslation();
  const prefix = useId();
  const [localSample, setLocalSample] = useState<SampleFinish>({type:"normal",pact:false});
  const { type, edition, pact } = controlledSample ?? localSample;
  const updateSample = (patch: Partial<SampleFinish>) => {
    const next = {...(controlledSample ?? localSample),...patch};
    if (!controlledSample) setLocalSample(next);
    onSampleChange?.(next);
  };
  const tile: Tile = { id: "skin-sample", top: value, bottom: 6 - value, type, edition, pact };
  const inputClass = "w-full min-h-11 rounded-lg border border-surface-600 bg-surface-900 px-2 text-xs text-white focus-visible:border-accent-gold";

  return <details className="mt-5 border-t border-surface-600/50 pt-3">
    <summary className="cursor-pointer py-2 text-xs font-bold text-accent-silver hover:text-white">{t("collection.tryFinishes")}</summary>
    <div className="grid grid-cols-2 gap-3 mt-3">
      <label htmlFor={`${prefix}-type`} className="text-xs text-accent-silver/80 flex flex-col gap-2">
        {t("collection.sampleType")}
        <select id={`${prefix}-type`} className={inputClass} value={type} onChange={e => updateSample({type:e.target.value as TileType})}>
          {(["normal", "wild", "golden", "mirror", "bomb", "locked"] as const).map(kind => <option key={kind} value={kind}>{t(`collection.sampleType.${kind}`)}</option>)}
        </select>
      </label>
      <label htmlFor={`${prefix}-edition`} className="text-xs text-accent-silver/80 flex flex-col gap-2">
        {t("collection.sampleEdition")}
        <select id={`${prefix}-edition`} className={inputClass} value={edition ?? ""} onChange={e => updateSample({edition:(e.target.value || undefined) as TileEdition | undefined})}>
          {(["", "foil", "holo", "polychrome", "negative"] as const).map(finish => <option key={finish} value={finish}>{t(`collection.sampleEdition.${finish || "none"}`)}</option>)}
        </select>
      </label>
      <label htmlFor={`${prefix}-pact`} className="col-span-2 flex items-center gap-2 min-h-11 text-xs text-accent-silver cursor-pointer">
        <input id={`${prefix}-pact`} type="checkbox" checked={pact} onChange={e => updateSample({pact:e.target.checked})} className="w-4 h-4 accent-amber-400" />
        {t("collection.samplePact")}
      </label>
    </div>
    <div role="group" aria-label={t("collection.sampleSizes")} className="flex items-end justify-center gap-5 my-4">
      <TileView staticView tile={tile} skin={skin} animate={false} />
      <TileView staticView tile={{...tile,id:"skin-sample-small"}} skin={skin} size="sm" animate={false} />
    </div>
    <p className="text-[10px] leading-relaxed text-accent-silver/70">{t("collection.sampleOnly")}</p>
  </details>;
}
