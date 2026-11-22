import type { TileEdition } from "@/types/domino";
import { t } from "@/engine/i18n";

const COLORS: Record<TileEdition, string> = {
  foil: "bg-blue-950 text-blue-100 border-blue-300/60",
  holo: "bg-purple-950 text-purple-100 border-purple-300/60",
  polychrome: "bg-fuchsia-950 text-pink-100 border-pink-300/60",
  negative: "bg-slate-800 text-slate-100 border-slate-300/60",
};

export default function EditionBadge({ edition, compact = false }: { edition: TileEdition; compact?: boolean }) {
  return <span data-edition-badge={edition} title={t(`tile.edition.${edition}.name`)}
    className={`${compact ? "relative flex items-center justify-center w-3.5 h-3.5 rounded border" : "absolute z-20 bottom-0 left-0 right-0 flex items-center justify-center gap-0.5 border-t py-0.5 text-[8px] leading-none font-bold uppercase tracking-wide"} ${COLORS[edition]}`}>
    <svg aria-hidden="true" focusable="false" width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="shrink-0">
      {edition === "foil" && <><path d="M6 1 11 6 6 11 1 6Z" /><path d="m6 1-2 5 2 5 2-5Z" /></>}
      {edition === "holo" && <><circle cx="6" cy="6" r="4.5" /><circle cx="6" cy="6" r="2" /></>}
      {edition === "polychrome" && <><path d="M6 1 11 10H1Z" /><path d="M6 1v9M1 10l7.5-4.5M11 10 3.5 5.5" /></>}
      {edition === "negative" && <><rect x="1.5" y="1.5" width="9" height="9" rx="2" /><path d="M3.5 6h5" /></>}
    </svg>
    {!compact && t(`tile.edition.${edition}.short`)}
  </span>;
}
