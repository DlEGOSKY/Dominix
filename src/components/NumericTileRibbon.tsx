import type { Tile } from "@/types/domino";
import { t } from "@/engine/i18n";
import EditionBadge from "./EditionBadge";

/** Own the separator, leaving counted art unobstructed in both halves. */
export default function NumericTileRibbon({ tile, cellSize }: { tile: Tile; cellSize: number }) {
  const type = tile.type ?? "normal";
  const typeClass = type === "wild" ? "bg-purple-900 text-purple-100" : type === "golden" ? "bg-amber-300 text-amber-950" : type === "mirror" ? "bg-cyan-900 text-cyan-100" : "bg-red-900 text-red-100";
  return <span data-numeric-ribbon aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-between z-30" style={{ width: cellSize + 10, height: 14 }}>
    <span className="w-3.5 h-3.5 flex items-center justify-center">
      {tile.pact && <span data-pact-badge title={t("tile.details.pact.name")} className="w-3.5 h-3.5 rounded-full bg-amber-300 text-amber-950 border border-amber-100 flex items-center justify-center">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6 7 2-5 5 1 7-6-3-6 3 1-7-5-5 7-2Z"/></svg>
      </span>}
    </span>
    {tile.edition ? <span className="relative"><EditionBadge edition={tile.edition} compact/>
      <span className="sr-only" data-value-label={tile.top}>{tile.top}</span><span className="sr-only" data-value-label={tile.bottom}>{tile.bottom}</span>
    </span> : <span data-numeric-helper className="bg-surface-900/95 text-accent-silver font-mono font-bold leading-none px-0.5 rounded text-[8px] flex items-center gap-px">
      <span data-value-label={tile.top}>{tile.top}</span><span>·</span><span data-value-label={tile.bottom}>{tile.bottom}</span>
    </span>}
    <span className="w-3.5 h-3.5 flex items-center justify-center">
      {type !== "normal" && type !== "locked" && <span data-tile-badge={type} title={t(`tile.details.${type}.name`)} className={`w-3.5 h-3.5 border border-white/30 rounded flex items-center justify-center text-[8px] font-bold leading-none ${typeClass}`}>
        {type === "golden" ? "x2" : <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          {type === "wild" ? <path d="m8 1 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/>
            : type === "mirror" ? <><path d="M2 3h5v10H2zm7 0h5v10H9Z"/><path d="m3 10 3-4m4 4 3-4"/></>
            : <><circle cx="7" cy="10" r="4.5"/><path d="m9 6 2-3m-1-1 3 3m0-4v2m1 0h2"/></>}
        </svg>}
      </span>}
    </span>
  </span>;
}
