import { useState } from "react";
import type { Tile, TileEdition, TileType } from "@/types/domino";
import { useTranslation } from "@/engine/i18n";
import TileView, { type TileSkin } from "./TileView";

// Fixed, valid sequence. No RNG, inventory access, discoveries or game actions.
const CHAIN: Tile[] = Array.from({ length: 6 }, (_, n) => ({ id: `try-chain-${n}`, top: n, bottom: n + 1 }));
const HAND: Tile[] = [
  { id: "try-hand-0", top: 0, bottom: 0 }, { id: "try-hand-1", top: 1, bottom: 2 },
  { id: "try-hand-2", top: 2, bottom: 3 }, { id: "try-hand-3", top: 3, bottom: 4 },
  { id: "try-hand-4", top: 4, bottom: 5 }, { id: "try-hand-5", top: 5, bottom: 6 },
  { id: "try-hand-6", top: 6, bottom: 6 },
];

export default function SkinTablePreview({ skin, type = "normal", edition, pact = false }: { skin: TileSkin; type?: TileType; edition?: TileEdition; pact?: boolean }) {
  const { t } = useTranslation();
  const [size, setSize] = useState<"sm" | "md">("sm");
  const [specials, setSpecials] = useState(false);
  const decorate = (tile: Tile, index: number): Tile => ({ ...tile, type: specials ? (["normal", "wild", "golden", "mirror", "bomb", "locked", "normal"] as const)[index % 7] : type, edition, pact });
  return <section className="skin-table" data-size={size} aria-label={t("wardrobe.table")}>
    <div className="skin-table-heading">
      <h3>{t("wardrobe.table")}</h3>
      <div role="group" aria-label={t("wardrobe.size")} className="skin-size-controls">
        {(["sm", "md"] as const).map(s => <button type="button" key={s} aria-pressed={s === size} onClick={() => setSize(s)}>{t(`wardrobe.size.${s}`)}</button>)}
      </div>
    </div>
    <p className="skin-table-note">{t("wardrobe.sampleNote")}</p>
    <div role="group" aria-label={t("wardrobe.chain")} className="skin-trial-chain" data-trial-chain>
      <p className="skin-trial-caption">{t("wardrobe.chain")} <span>0 → 6</span></p>
      <div className="skin-trial-pieces">{CHAIN.map(tile => <TileView key={tile.id} staticView skin={skin} tile={{ ...tile, edition, pact }} size={size} animate={false}/>)}</div>
    </div>
    <div role="group" aria-label={t("wardrobe.hand")} className="skin-trial-hand" data-trial-hand>
      <p className="skin-trial-caption">{t("wardrobe.hand")}</p>
      <div className="skin-trial-pieces">{HAND.map((tile, i) => <TileView key={tile.id} staticView skin={skin} tile={decorate(tile, i)} size={size} animate={false}/>)}</div>
    </div>
    <label className="skin-trial-toggle"><input type="checkbox" checked={specials} onChange={e => setSpecials(e.target.checked)}/>{t("wardrobe.mixSpecials")}</label>
  </section>;
}
