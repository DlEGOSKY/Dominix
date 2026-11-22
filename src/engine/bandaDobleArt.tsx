import portraits from "@/assets/skins/banda-doble-portraits-v1.webp";

/** Seven 96px frames in one cached, lossless WebP; the value stays in HTML. */
export function BandaPortrait({ value }: { value: number }) {
  const frame = Number.isInteger(value) && value >= 0 && value <= 6 ? value : 0;
  return <span aria-hidden="true" data-crew-value={frame} style={{
    display: "block", width: "100%", height: "100%", backgroundImage: `url(${portraits})`,
    backgroundSize: "700% 100%", backgroundPosition: `${frame / 6 * 100}% 0`,
    backgroundRepeat: "no-repeat", imageRendering: "pixelated",
  }} />;
}
