import type { ReactNode } from "react";
import type { Tile } from "@/types/domino";
import { t } from "@/engine/i18n";

const TYPE_COLORS: Record<string, string> = {
  wild: "text-purple-300", golden: "text-amber-300", mirror: "text-cyan-300",
  bomb: "text-red-300", locked: "text-slate-400", double: "text-accent-gold",
  normal: "text-accent-silver/80",
};
const EDITION_COLORS = { foil: "text-blue-300", holo: "text-purple-300", polychrome: "text-pink-300", negative: "text-slate-200" };

/** Presentation only: the engine remains the source of scoring and placement rules. */
export function tileDetails(tile: Tile) {
  const type = tile.type && tile.type !== "normal" ? tile.type : tile.top === tile.bottom ? "double" : "normal";
  return {
    label: t(`tile.details.${type}.name`), color: TYPE_COLORS[type], description: t(`tile.details.${type}.desc`),
    edition: tile.edition ? { label: t(`tile.edition.${tile.edition}.name`), color: EDITION_COLORS[tile.edition], description: t(`tile.details.${tile.edition}`) } : null,
  };
}

export function tileDetailsLabel(tile: Tile): string {
  const info = tileDetails(tile);
  return [t("tile.aria.values", { top: tile.top, bottom: tile.bottom }), info.label, info.description,
    tile.pact ? `${t("tile.details.pact.name")}: ${t("tile.details.pact.desc")}` : null,
    info.edition ? `${info.edition.label}: ${info.edition.description}` : null].filter(Boolean).join(". ");
}

export default function TileDetails({ tile, children }: { tile: Tile; children?: ReactNode }) {
  const info = tileDetails(tile);
  return <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between gap-2">
      <span className={`text-[10px] font-bold uppercase tracking-wider ${info.color}`}>{info.label}</span>
      <span className="text-[10px] font-mono text-accent-silver/75">{tile.top}|{tile.bottom} · {tile.top + tile.bottom}</span>
    </div>
    <p className="text-[10px] text-accent-silver/80 leading-relaxed">{info.description}</p>
    {tile.pact && <div className="mt-0.5 pt-1 border-t border-surface-600/40">
      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">{t("tile.details.pact.name")}</span>
      <p className="text-[10px] text-accent-silver/80 mt-0.5 leading-relaxed">{t("tile.details.pact.desc")}</p>
    </div>}
    {info.edition && <div className="mt-0.5 pt-1 border-t border-surface-600/40">
      <span className={`text-[9px] font-bold uppercase tracking-wider ${info.edition.color}`}>{info.edition.label}</span>
      <p className="text-[10px] text-accent-silver/80 mt-0.5 leading-relaxed">{info.edition.description}</p>
    </div>}
    {children}
  </div>;
}
