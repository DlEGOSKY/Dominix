import { useId } from "react";
import { ExpressHalf, ExpressSurface } from "./expressSkinArt";

export const WORLD_SKIN_IDS = ["eclipse_glass", "orbital_reactor", "sunken_temple", "dragon_forge", "alchemist_cabinet", "midnight_express"] as const;
export type WorldSkinId = typeof WORLD_SKIN_IDS[number];

// Familiar domino positions remain fixed across every material. Only lit/inlaid
// objects count: seams, frames and engraving never introduce extra dots.
const POSITIONS: readonly (readonly [number, number])[][] = [
  [], [[32, 32]], [[18, 18], [46, 46]], [[18, 18], [32, 32], [46, 46]],
  [[18, 18], [46, 18], [18, 46], [46, 46]],
  [[18, 18], [46, 18], [32, 32], [18, 46], [46, 46]],
  [[18, 18], [46, 18], [18, 32], [46, 32], [18, 46], [46, 46]],
];

const PALETTES: Record<WorldSkinId, { base: string; inset: string; edge: string; light: string; shade: string }> = {
  eclipse_glass: { base: "#17172d", inset: "#25233e", edge: "#82728c", light: "#fff0bd", shade: "#dba759" },
  orbital_reactor: { base: "#142531", inset: "#0a171f", edge: "#536c77", light: "#c5fff3", shade: "#35baa7" },
  sunken_temple: { base: "#153333", inset: "#163d3e", edge: "#68887c", light: "#fff3cd", shade: "#baac77" },
  dragon_forge: { base: "#271c22", inset: "#1c141a", edge: "#80665b", light: "#ffe1a0", shade: "#e17e42" },
  alchemist_cabinet: { base: "#242b20", inset: "#17211c", edge: "#93805c", light: "#e7ffab", shade: "#8ab557" },
  midnight_express: { base: "#231f20", inset: "#352820", edge: "#bda16e", light: "#fff4ce", shade: "#c68b43" },
};

/** Original vector art: a complete object/material, not a character assigned a rank. */
export function WorldSkinFace({ world, value }: { world: WorldSkinId; value: number }) {
  const id = useId().replace(/:/g, "");
  if (world === "midnight_express") return <ExpressHalf value={value}/>;
  const p = PALETTES[world];
  const positions = POSITIONS[value] ?? [];
  return <svg data-world-face={world} data-world-value={value} viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none">
    <defs>
      <linearGradient id={`${id}-surface`} x2="1" y2="1"><stop stopColor={p.inset}/><stop offset="1" stopColor={p.base}/></linearGradient>
      <linearGradient id={`${id}-inlay`} x2=".6" y2="1"><stop stopColor="#fffce8"/><stop offset=".45" stopColor={p.light}/><stop offset="1" stopColor={p.shade}/></linearGradient>
    </defs>
    <rect x="1" y="1" width="62" height="62" rx="7" fill={`url(#${id}-surface)`} stroke={p.edge} strokeOpacity=".6"/>
    {world === "eclipse_glass" && <>
      <path d="M3 3h29L18 18 3 26Z" fill="#64528a"/><path d="m32 3 29 0v23L46 18Z" fill="#305b7b"/>
      <path d="M3 38 18 46 32 61H3Z" fill="#304960"/><path d="m46 46 15-8v23H32Z" fill="#664268"/>
      <path d="M3 3 18 18 32 3 46 18 61 3M3 26l15-8m43 8-15-8M3 38l15 8-15 15m15-15 14 15 14-15 15 15m-15-15 15-8" stroke="#111320" strokeWidth="2"/>
      <rect x="5" y="5" width="54" height="54" rx="3" stroke="#d7b878" strokeOpacity=".32"/>
    </>}
    {world === "orbital_reactor" && <>
      <path d="M8 5h48l3 3v48l-3 3H8l-3-3V8Z" stroke={p.edge} strokeWidth="1.4"/>
      <path d="M9 24v16m46-16v16M24 9h16m-16 46h16" stroke="#7f9aa0" strokeWidth="1.5"/>
      <path d="M7 9h9m-9 3h6m35 40h9m-6 3h6" stroke="#829597" strokeOpacity=".4"/>
    </>}
    {world === "sunken_temple" && <>
      <path d="M8 8h48v48H8Z" stroke="#9d9574" strokeWidth="1.2"/>
      <path d="M3 19h5V8h11M45 8h11v11m0 26v11H45M19 56H8V45" stroke="#b1a17a" strokeOpacity=".5"/>
      <path d="m4 31 5-7m47 13 5-7M22 3l4 5m12 48 4 5" stroke="#60857a" strokeWidth="2"/>
      <path d="M11 57q-5-10-7-11m4 8-5-1m5 1 2-7m45-37q1 9 5 13m-3-6 5-2" stroke="#a77269" strokeOpacity=".65"/>
    </>}
    {world === "dragon_forge" && <>
      <path d="m8 3 48 0 5 5v48l-5 5H8l-5-5V8Z" stroke="#9b7d65" strokeWidth="1.4"/>
      <path d="m10 6 6 4-6 4 6 4-6 4m44 20-6 4 6 4-6 4 6 4" stroke="#7f5d54"/>
      <path d="m23 4 4 6-3 4m16 46-5-9 4-6" stroke="#b66f44" strokeOpacity=".5"/>
      <path d="M22 59h20M22 5h20" stroke="#f5bd74" strokeOpacity=".3"/>
    </>}
    {world === "alchemist_cabinet" && <>
      <rect x="6" y="6" width="52" height="52" rx="11" stroke="#b59a65" strokeWidth="1.3"/>
      <path d="M10 5h44M10 59h44M4 24v16m56-16v16" stroke="#89764c" strokeWidth="2"/>
      <path d="m12 10 4 2m32 40 4 2M12 54l4-2m32-40 4-2" stroke="#dbc793"/>
    </>}
    {value === 0 && <g data-empty-cavity stroke={p.edge} fill={p.base} strokeWidth="1.3">
      {world === "eclipse_glass" ? <><circle cx="32" cy="32" r="12"/><path d="M37 21a12 12 0 0 0 0 22" stroke="#b6a087" strokeOpacity=".5"/></>
        : world === "orbital_reactor" ? <><path d="m24 20 16 0 5 7v13l-5 4H24l-5-4V27Z"/><path d="M22 32h20m-10-9v18" strokeOpacity=".4"/></>
        : world === "sunken_temple" ? <><path d="M21 44V28q11-16 22 0v16Z"/><path d="M25 40h14m-14-4h14" strokeOpacity=".4"/></>
        : world === "dragon_forge" ? <><path d="m32 18 12 7v14l-12 7-12-7V25Z"/><path d="m25 29 14 6m-14-1 14 6" strokeOpacity=".4"/></>
        : <><path d="M27 20h10m-8 0v8l-7 13q-1 4 10 4t10-4l-7-13v-8"/><path d="M27 38h10" strokeOpacity=".4"/></>}
    </g>}
    {positions.map(([x, y], index) => <g key={index} data-counted-inlay transform={`translate(${x} ${y})`}>
      {world === "eclipse_glass" ? <>
        <path d="m0-7 2.5 4.5L7 0 2.5 2.5 0 7-2.5 2.5-7 0-2.5-2.5Z" fill="#0d101c" stroke="#0d101c" strokeWidth="2"/>
        <path d="m0-6 2 4L6 0 2 2 0 6-2-4-4-2 4-2Z" fill={`url(#${id}-inlay)`}/>
        <path d="M0-4v8M-4 0h8" stroke="#fffbe4" strokeOpacity=".65" strokeWidth=".6"/>
      </> : world === "orbital_reactor" ? <>
        <rect x="-7" y="-6" width="14" height="12" rx="2" fill="#06131b" stroke="#78908d"/>
        <rect x="-5" y="-4" width="10" height="8" rx="1" fill={`url(#${id}-inlay)`}/>
        <path d="M-3-2h6" stroke="#f3fff6" strokeWidth="1.2"/>
      </> : world === "sunken_temple" ? <>
        <circle r="7" fill="#102829" stroke="#a29267" strokeWidth="1.2"/>
        <circle r="5.5" fill={`url(#${id}-inlay)`}/><path d="M-3-2q3-3 6 0" stroke="#ffffed" strokeWidth="1.1"/>
      </> : world === "dragon_forge" ? <>
        <path d="m0-7 6 3.5v7L0 7-6 3.5v-7Z" fill={`url(#${id}-inlay)`} stroke="#1a0d11" strokeWidth="1.2"/>
        <path d="M-3-2 0-4 3-2M-2 2h4" stroke="#fff3cf" strokeWidth="1.2"/>
      </> : <>
        <path d="M0-8C-3-3-6 0-6 3a6 6 0 0 0 12 0c0-3-3-6-6-11Z" fill={`url(#${id}-inlay)`} stroke="#0c1612" strokeWidth="1.2"/>
        <path d="M-3 1q-2 4 1 5" stroke="#f5ffdb" strokeWidth="1.2"/>
      </>}
    </g>)}
    <path d="M8 2h45M2 8v43" stroke="#ffffe0" strokeOpacity=".12"/>
  </svg>;
}

export function WorldSkinSurface({ world }: { world: WorldSkinId }) {
  if (world === "midnight_express") return <ExpressSurface/>;
  const p = PALETTES[world];
  return <svg data-world-surface={world} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 64 132" preserveAspectRatio="none" aria-hidden="true" fill="none">
    <rect x="2" y="2" width="60" height="128" rx="9" stroke={p.edge} strokeWidth="1.2"/>
    <path d="M7 59v14m50-14v14M23 4h18M23 128h18" stroke={p.light} strokeOpacity=".35" strokeWidth="1.2"/>
    <path d="M3 10v42m58 28v42" stroke={p.light} strokeOpacity=".12"/>
  </svg>;
}
