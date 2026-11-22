import portraits from "@/assets/skins/chatarra-portraits-v1.webp";

/** Seven original workshop automata; numeric values remain accessible HTML. */
export function ChatarraPortrait({ value }: { value: number }) {
  const frame = Number.isInteger(value) && value >= 0 && value <= 6 ? value : 0;
  return <span aria-hidden="true" data-crew-value={frame} style={{
    display: "block", width: "100%", height: "100%", backgroundImage: `url(${portraits})`,
    backgroundSize: "700% 100%", backgroundPosition: `${frame / 6 * 100}% 0`,
    backgroundRepeat: "no-repeat", imageRendering: "pixelated",
  }} />;
}
