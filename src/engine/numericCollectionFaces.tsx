import type { CSSProperties } from "react";
import { CollectionPortrait, type PortraitCollection } from "./collectionPortraits";
import { romanValue } from "./materialArt";
import { HallownestMark } from "./collectionValueMarks";
import { CrewBadgeFace } from "./crewBadgeFace";

// Familiar domino formations. Quantity is independent of character identity.
const POSITIONS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [], [[50, 50]], [[25, 25], [75, 75]], [[19, 19], [50, 50], [81, 81]],
  [[22, 20], [78, 20], [22, 80], [78, 80]],
  [[22, 20], [78, 20], [50, 50], [22, 80], [78, 80]],
  [[22, 20], [78, 20], [22, 50], [78, 50], [22, 80], [78, 80]],
];
const PALETTES = {
  among_us: { ink: "#91edf0", background: "#101b25" },
  hollow_knight: { ink: "#eeeede", background: "#111722" },
  one_piece: { ink: "#f5cf71", background: "#181820" },
  roma_eterna: { ink: "#f2dba1", background: "#211b19" },
};
const fill: CSSProperties = { position: "absolute", inset: 0 };

function Coin() {
  return <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#9c6528" stroke="#15131a" strokeWidth="1.5"/>
    <circle cx="11.5" cy="11" r="8" fill="#f3ca62" stroke="#ffe8a0" strokeWidth="1.6"/>
    <circle cx="11.5" cy="11" r="5" fill="none" stroke="#98632d" strokeWidth="1.6"/>
    <path d="m10 7 3 8m-5-4h7" stroke="#98632d" strokeWidth="1.5"/>
  </svg>;
}

/** Numeric art for the playing surface; gallery portraits are a separate layer. */
export function NumericCollectionFace({ collection, value }: { collection: PortraitCollection; value: number }) {
  const n = Number.isInteger(value) && value >= 0 && value <= 6 ? value : 0;
  const colors = PALETTES[collection];
  const roman = collection === "roma_eterna";
  if (collection === "among_us") return <CrewBadgeFace value={n}/>;
  const size = n === 1 ? 63 : n === 2 ? 43 : 28;
  return <span aria-hidden="true" data-numeric-face={collection} data-face-value={n} style={{ display: "block", width: "100%", height: "100%", position: "relative", overflow: "hidden", background: colors.background }}>
    <span data-collection-cameo style={{ ...fill, opacity: roman ? .25 : .15 }}>
      <CollectionPortrait collection={collection} value={roman ? 6 : n}/>
    </span>
    {roman ? <svg viewBox="0 0 100 100" width="100%" height="100%" style={fill} aria-hidden="true">
      {n === 0 ? <g data-empty-value><circle cx="50" cy="50" r="29" fill="#15121c99" stroke={colors.ink} strokeWidth="2"/><circle cx="50" cy="50" r="22" fill="none" stroke={colors.ink} strokeOpacity=".28"/></g>
        : <text data-roman-value={n} x="50" y="52" dominantBaseline="central" textAnchor="middle" fill={colors.ink} stroke="#100f16" strokeWidth="4" paintOrder="stroke" fontFamily='Georgia, "Times New Roman", serif' fontWeight="bold" fontSize="64">{romanValue(n)}</text>}
    </svg> : n === 0 ? <span data-empty-value style={fill}>
      {collection === "hollow_knight" ? <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><circle cx="50" cy="50" r="27" fill="#101622cc" stroke="#7792a4" strokeWidth="2"/><circle cx="50" cy="50" r="18" fill="none" stroke="#526575" strokeWidth="1.5"/></svg>
        : <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><path d="m37 24 26 0-6 14c19 17 19 39 4 43H39c-15-4-15-26 4-43Z" fill="#171721dd" stroke="#c6a96d" strokeWidth="2"/><path d="M39 39h22M44 27l6 9 6-9" stroke="#c6a96d" strokeWidth="2"/></svg>}
    </span> : POSITIONS[n]!.map(([x, y], index) => <span key={index} data-value-mark={collection === "hollow_knight" ? "mask" : "coin"} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: `${size}%`, height: `${size}%`, transform: "translate(-50%, -50%)" }}>
      {collection === "hollow_knight" ? <HallownestMark value={n}/> : <Coin/>}
    </span>)}
  </span>;
}
