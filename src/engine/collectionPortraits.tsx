import amongUs from "@/assets/skins/among-suit-enamel-v2.webp";
import hollowKnight from "@/assets/skins/hollow-knight-portraits-v1.webp";
import onePiece from "@/assets/skins/one-piece-portraits-v1.webp";
import romaEterna from "@/assets/skins/roma-eterna-portraits-v1.webp";

const ATLASES = { among_us: amongUs, hollow_knight: hollowKnight, one_piece: onePiece, roma_eterna: romaEterna };
export type PortraitCollection = keyof typeof ATLASES;

/** Seven square frames. Printed values and gameplay markers stay in TileView. */
export function CollectionPortrait({ collection, value }: { collection: PortraitCollection; value: number }) {
  const frame = Number.isInteger(value) && value >= 0 && value <= 6 ? value : 0;
  return <span aria-hidden="true" data-crew-value={frame} data-portrait-pack={collection} style={{
    display: "block", width: "100%", height: "100%", backgroundImage: `url(${ATLASES[collection]})`,
    backgroundSize: "700% 100%", backgroundPosition: `${frame / 6 * 100}% 0`,
    backgroundRepeat: "no-repeat", imageRendering: collection === "among_us" ? "auto" : "pixelated",
  }} />;
}
