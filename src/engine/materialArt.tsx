import ivory from "@/assets/materials/ivory-v1.webp";
import emerald from "@/assets/materials/emerald-v1.webp";
import ruby from "@/assets/materials/ruby-v1.webp";
import diamond from "@/assets/materials/diamond-v1.webp";
import obsidian from "@/assets/materials/obsidian-v1.webp";
import roman from "@/assets/materials/roman-v1.webp";
import { memo } from "react";

export type TileMaterial = "ivory" | "emerald" | "ruby" | "diamond" | "obsidian" | "roman";
export const MATERIAL_TEXTURES: Record<TileMaterial, string> = { ivory, emerald, ruby, diamond, obsidian, roman };

/** Native tooling stays in the perimeter; values and pips own the quiet center. */
function MaterialTooling({ material }: { material: TileMaterial }) {
  return <svg data-material-detail={material} viewBox="0 0 40 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="none" stroke="currentColor" strokeWidth=".55">
    {material === "roman" && <>
      <path d="M3 10V3h8v3H6v2m31 2V3h-8v3h5v2M3 70v7h8v-3H6v-2m31-2v7h-8v-3h5v-2" strokeWidth=".85" />
      <path d="M3 13v21m34-21v21M3 46v21m34-21v21M13 3h14M13 77h14" strokeOpacity=".65" />
      {[18,25,55,62].map(y=><g key={y} fill="currentColor" fillOpacity=".45" strokeWidth=".4"><path d={`M3 ${y+3}q-2-5 2-6 3 3-2 6m34 0q2-5-2-6-3 3 2 6`} /></g>)}
      <path d="m3 38 2 2-2 2-2-2Zm34 0 2 2-2 2-2-2Z" fill="currentColor" fillOpacity=".55" />
    </>}
    {material === "ivory" && <>
      <path d="M5 11V5h6M29 5h6v6M5 69v6h6m18 0h6v-6M3 15v18m34-18v18M3 47v18m34-18v18" strokeOpacity=".55" />
      <path d="m5 8 3-3m24 0 3 3M5 72l3 3m24 0 3-3" strokeWidth=".9" />
      <path d="M13 4h14M13 76h14" strokeOpacity=".25" />
    </>}
    {(material === "emerald" || material === "diamond") && <>
      <path d="M1 10 7 2h26l6 8-4-3H5Zm0 60 6 8h26l6-8-4 3H5Z" fill="currentColor" fillOpacity={material === "diamond" ? ".3" : ".18"} strokeOpacity=".65" />
      <path d="M1 11 5 8v26l-4 5Zm38 0-4-3v26l4 5ZM1 41l4 5v26l-4-3Zm38 0-4 5v26l4-3Z" fill="currentColor" fillOpacity={material === "diamond" ? ".12" : ".06"} strokeOpacity=".4" />
      {material === "diamond" ? <path d="m5 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1ZM34 72l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" fill="currentColor" fillOpacity=".8" stroke="none" /> : <path d="m2 18 3 4-3 7m36 22-3 4 3 7" strokeOpacity=".6" />}
    </>}
    {material === "obsidian" && <>
      <path d="M1 20Q3 5 14 2L8 9Q3 13 2 28M39 52Q37 72 26 78l7-9q4-5 5-18" fill="#8194aa" fillOpacity=".16" strokeOpacity=".6"/>
      <path d="M2 30Q9 14 5 9M2 50q5 13 12 18M38 26q-6-13-12-14M38 64q-5 3-8 11" strokeOpacity=".3"/>
      <path d="M5 3h18M2 12v9m36 38v10M19 77h15" stroke="#dbe6f2" strokeOpacity=".5" strokeWidth=".7"/>
    </>}
    {material === "ruby" && <>
      <path d="M2 14V6q0-4 4-4h8M26 2h8q4 0 4 4v8M2 66v8q0 4 4 4h8m12 0h8q4 0 4-4v-8" stroke="#e6bd9f" strokeWidth="1"/>
      <path d="m3 17 4-7 1 20-5 6Zm34 27-5 6 1 20 4-7Z" fill="#e17d98" fillOpacity=".2" strokeOpacity=".3"/>
      <path d="M3 11q8-2 8-8m18 74q0-7 8-8M2 38v4m36-4v4" strokeOpacity=".6"/>
    </>}
  </svg>;
}

/** Cosmetic variation is stable by tile id and never consumes run randomness. */
export function materialWearVariant(tileId: string): number {
  let hash = 2166136261;
  for (let i = 0; i < tileId.length; i++) hash = Math.imul(hash ^ tileId.charCodeAt(i), 16777619) >>> 0;
  return hash % 3;
}

const GRAIN = [
  "M2 18q3 7 2 16m32 15q-3 9-1 14M13 2l7 1m6 74 7-1",
  "M3 23q2-8 3-11m31 45q-3 8-3 13M9 77l8-1m10-73 6 1",
  "M4 15q-2 8 0 15m32 15q2 12-1 20M15 3l9-1m-12 74 6 1",
];

/** Surface and tooling only: pips and values remain separate readable layers. */
export const MaterialSurface = memo(function MaterialSurface({ material, tileId = "sample", special = false }: { material: TileMaterial; tileId?: string; special?: boolean }) {
  const wear = materialWearVariant(tileId);
  return <div aria-hidden="true" data-material={material} data-material-wear={wear} className={`tile-material-surface tile-material-${material}`} style={{opacity:special ? 0.2 : 1,backgroundImage:`var(--tile-material-preview, url("${MATERIAL_TEXTURES[material]}"))`}}>
    <MaterialTooling material={material} />
    <svg data-material-grain viewBox="0 0 40 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="none" stroke="currentColor" strokeWidth=".4" strokeOpacity={material === "ivory" ? ".23" : ".32"}><path d={GRAIN[wear]}/></svg>
    <span data-material-reflection className="tile-material-reflection"/>
  </div>;
});

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"] as const;
export function romanValue(value: number): string {
  return Number.isInteger(value) && value >= 0 && value <= 6 ? ROMAN[value]! : "?";
}

export function RomanHalf({ value, cellSize, accent, labelEdge = "bottom" }: {value:number;cellSize:number;accent:string;labelEdge?:"top"|"bottom"}) {
  return <div aria-hidden="true" className="relative z-10 flex items-center justify-center" style={{width:cellSize,height:cellSize,color:accent}}>
    {value === 0 ? <svg data-roman-empty viewBox="0 0 24 24" width={cellSize*.53} height={cellSize*.53} fill="none" stroke="currentColor" strokeWidth="1.1"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="5.5" strokeOpacity=".3" /></svg>
      : <span data-roman-value={value} className="font-bold leading-none tracking-tight" style={{fontFamily:'Georgia, "Times New Roman", serif',fontSize:cellSize>=48?25:19,textShadow:"0 1px 0 #ffffff40"}}>{romanValue(value)}</span>}
    <span data-value-label={value} className={`absolute right-0 ${labelEdge === "top" ? "top-0" : "bottom-0"} font-mono font-bold leading-none opacity-80`} style={{fontSize:cellSize>=48?10:9}}>{value}</span>
  </div>;
}
