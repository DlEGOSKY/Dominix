import { memo, useId } from "react";

// A window is one value mark. The frame has no rivet dots or unlit spare
// windows that could be mistaken for additional pips at table size.
const WINDOWS = [
  [], [[32,32]], [[18,18],[46,46]], [[18,18],[32,32],[46,46]],
  [[18,18],[46,18],[18,46],[46,46]],
  [[18,18],[46,18],[32,32],[18,46],[46,46]],
  [[18,18],[46,18],[18,32],[46,32],[18,46],[46,46]],
] as const;

export const ExpressHalf = memo(function ExpressHalf({ value }: { value: number }) {
  const id = useId().replace(/:/g, "");
  return <svg data-world-face="midnight_express" data-world-value={value} viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none">
    <defs>
      <linearGradient id={`${id}-wood`} x2="1" y2=".8"><stop stopColor="#47372c"/><stop offset=".46" stopColor="#231f20"/><stop offset="1" stopColor="#352820"/></linearGradient>
      <linearGradient id={`${id}-glass`} x2=".2" y2="1"><stop stopColor="#fff4ce"/><stop offset=".5" stopColor="#f5ce82"/><stop offset="1" stopColor="#c68b43"/></linearGradient>
      {value > 0 && <g id={`${id}-window`}>
        <rect x="-7" y="-7.5" width="14" height="15" rx="3.5" fill="#131b21" stroke="#bfa16d" strokeWidth="1.1"/>
        <rect x="-4.7" y="-5.2" width="9.4" height="10.4" rx="2" fill={`url(#${id}-glass)`}/>
        <path d="M-3-3.3v4m0-4h3" stroke="#fffbe9" strokeOpacity=".8" strokeWidth=".8" strokeLinecap="round"/>
      </g>}
    </defs>
    <rect x="1" y="1" width="62" height="62" rx="7" fill={`url(#${id}-wood)`} stroke="#bda16e" strokeWidth="1.2"/>
    <path d="M5 12V5h10m34 0h10v7M5 52v7h10m34 0h10v-7" stroke="#d0b67d" strokeWidth="1.2"/>
    <path d="M4 17v30m56-30v30M17 4h30M17 60h30" stroke="#a88151" strokeOpacity=".45"/>
    <path d="M7 13v38m50-38v38M11 3q10 3 18 0m6 58q10-3 18 0" stroke="#e2bc83" strokeOpacity=".12"/>
    {value === 0 && <g data-empty-cavity>
      <rect x="21" y="23" width="22" height="18" rx="5" fill="#111b21" stroke="#7f7055"/>
      <path d="M26 28h12m-12 8h12" stroke="#635b48" strokeWidth=".7"/>
    </g>}
    {(WINDOWS[value] ?? []).map(([x,y],index)=><use key={index} data-counted-inlay data-express-window href={`#${id}-window`} x={x} y={y}/>)}
  </svg>;
});

export const ExpressSurface = memo(function ExpressSurface() {
  return <div aria-hidden="true" data-world-surface="midnight_express" className="tile-express-surface">
    <svg viewBox="0 0 40 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="none">
      <rect x="1" y="1" width="38" height="78" rx="6" stroke="#b29a69" strokeWidth=".7"/>
      <path d="M2 13V4h7m22 0h7v9M2 67v9h7m22 0h7v-9" stroke="#e1c48b" strokeWidth=".8"/>
      <path d="M3 18v18m34-18v18M3 44v18m34-18v18M13 3h14M13 77h14" stroke="#c19b60" strokeOpacity=".5"/>
      <path d="M2 38h36v4H2Z" fill="#171d21" stroke="#b5985e" strokeWidth=".45"/>
    </svg>
    <span data-material-reflection className="tile-material-reflection"/>
  </div>;
});
