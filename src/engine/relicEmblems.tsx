import type { ReactNode } from "react";
import type { IconType } from "react-icons";

/** Original Dominix drawings. Fixed geometry, no fonts, images or SVG IDs. */
function emblem(id: string, drawing: ReactNode): IconType {
  return function DominixEmblem({ size = "1em", title, ...props }) {
    return <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" data-dominix-emblem={id} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}{drawing}
    </svg>;
  };
}

export const MasterHourglass = emblem("ampolleta_maestra", <>
  <path d="M8 3h16M8 29h16M10 4v5c0 4 6 5 6 7s-6 3-6 7v5M22 4v5c0 4-6 5-6 7s6 3 6 7v5" />
  <path d="m12 9 4 4 4-4M12 26l4-5 4 5Z" fill="currentColor" stroke="none" /><circle cx="16" cy="18" r=".8" fill="currentColor" />
</>);
export const TacticalBracelet = emblem("brazalete_tactico", <>
  <path d="m8 10 5-5 12 4 3 6-8 12-8-2-7-9Z" fill="currentColor" fillOpacity=".12" />
  <path d="m8 10 12 4 8 1M20 14l-8 11M13 5l-1 8M24 10l-4 4M8 19l6 2" /><path d="m15 12 5-1 2 3-5 2Z" fill="currentColor" />
</>);
export const InfiniteBag = emblem("bolsa_infinita", <>
  <path d="m11 4 5 2 5-2-2 7c7 5 9 10 6 15-2 4-16 4-18 0-3-5-1-10 6-15ZM12 11h8" fill="currentColor" fillOpacity=".1" />
  <path d="M16 21c-6-8-12 5-5 3 5-2 6-8 10-6 7 4-2 13-5 3Z" />
</>);
export const FourCardinals = emblem("cuatro_cardinal", <>
  <path d="m16 2 4 10 10 4-10 4-4 10-4-10L2 16l10-4Z" fill="currentColor" fillOpacity=".12" />
  <path d="m16 5 0 8M27 16h-8M16 27v-8M5 16h8" /><rect x="13" y="13" width="6" height="6" transform="rotate(45 16 16)" fill="currentColor" />
</>);
export const FiveVertices = emblem("cinco_vertice", <>
  <path d="m16 4 12 9-5 14H9L4 13Z" /><path d="m16 4 0 12 12-3M16 16l7 11M16 16 9 27M16 16 4 13" strokeOpacity=".45" />
  {[[16,4],[28,13],[23,27],[9,27],[4,13]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="2.2" fill="currentColor" />)}
</>);
export const CrescendoSpiral = emblem("espiral_crescendo", <>
  <path d="M15 18c-5 2-7-5-3-8 6-5 14 1 12 9-3 11-19 10-21-1" /><path d="M14 16h5v-5h5V5h5M24 5h5v5" />
</>);
export const OuroborosKnot = emblem("nudo_ouroboros", <>
  <path d="M8 5h13l6 6v12l-5 5H10l-6-6V10l4-5Zm1 6v9l5 4h6l3-4v-6l-5-5h-5l-4 5" /><path d="m8 5 1 8 6-4ZM13 14l6 5M19 14l-6 5" fill="currentColor" fillOpacity=".2" /><circle cx="10" cy="8" r=".8" fill="currentColor" />
</>);
export const FastMetronome = emblem("ritmo_acelerado", <>
  <path d="m13 4-7 24h19L18 4Z" fill="currentColor" fillOpacity=".1" /><path d="M10 23h11M16 23 25 7M23 5l5 4M3 9l4 1M2 15h4" /><circle cx="20" cy="16" r="2" fill="currentColor" />
</>);
export const LightHand = emblem("mano_ligera", <>
  <path d="M4 23h5l4 5h9l6-9c1-3-2-4-3-2l-3 4h-7l-4-4H5M18 18l6-13c-7-2-13 5-11 10l5 3ZM14 15l7-8" /><path d="m4 7 3-2M3 12h4" />
</>);
export const TacticalPurity = emblem("pureza_tactica", <>
  <rect x="7" y="8" width="15" height="21" rx="3" /><path d="M8 18h13m4-17 1.5 4.5L31 7l-4.5 1.5L25 13l-1.5-4.5L19 7l4.5-1.5Z" fill="currentColor" fillOpacity=".2" /><circle cx="12" cy="13" r="1.2" fill="currentColor" /><path d="m11 23 2 2 5-4" />
</>);
export const TripleFang = emblem("colmillo_triple", <>
  <path d="M3 7c8-4 18-4 26 0l-2 5H5Z" fill="currentColor" fillOpacity=".2" /><path d="m5 12 3 14 4-14M12 12l4 18 4-18M20 12l4 14 3-14" fill="currentColor" fillOpacity=".1" />
</>);
export const OddEcho = emblem("eco_impar", <>
  {[8,16,24].map(y=><circle key={y} cx="8" cy={y} r="1.6" fill="currentColor" />)}<path d="M14 11c4 2 4 8 0 10M19 6c8 5 8 15 0 20M24 3c9 7 9 19 0 26" />
</>);
export const PerfectSymmetry = emblem("simetria_perfecta", <>
  <rect x="3" y="7" width="9" height="19" rx="2" transform="rotate(-10 7 16)" /><rect x="20" y="7" width="9" height="19" rx="2" transform="rotate(10 25 16)" /><path d="M16 3v26M4 16h7m10 0h7" strokeOpacity=".6" /><circle cx="7" cy="12" r="1" fill="currentColor" /><circle cx="25" cy="12" r="1" fill="currentColor" />
</>);
export const GoldenCascade = emblem("cascada_dorada", <>
  <path d="M3 28h7v-7h7v-7h7V7h5" /><path d="M4 7h7v6h6v6h5" strokeOpacity=".45" /><circle cx="7" cy="7" r="3" fill="currentColor" fillOpacity=".2" /><circle cx="17" cy="13" r="3" fill="currentColor" fillOpacity=".2" /><circle cx="25" cy="20" r="3" fill="currentColor" fillOpacity=".2" /><path d="m23 23 2 5 2-5" />
</>);
export const ZeroCore = emblem("nucleo_cero", <>
  <path d="m16 2 12 7v14l-12 7-12-7V9Z" /><ellipse cx="16" cy="16" rx="5" ry="8" /><path d="m4 9 6 3m12 8 6 3M16 2v4m0 20v4M28 9l-6 3M10 20l-6 3" strokeOpacity=".5" />
</>);
export const FinalFury = emblem("furia_final", <>
  <path d="M6 16C2 8 11 8 9 2c6 4 4 8 7 9 3-2 3-5 3-8 8 7 12 11 7 19" fill="currentColor" fillOpacity=".15" /><path d="M5 18h6v11H5Zm8-3h6v14h-6Zm8 5h6v9h-6Z" fill="currentColor" fillOpacity=".2" /><path d="M7 23h2m6-3h2m6 5h2" />
</>);
export const AncestralBlessing = emblem("bendicion_ancestral", <>
  <path d="m10 3 6 3 6-3-2 8h-8ZM9 13l7-3 7 3v11l-7 6-7-6Z" fill="currentColor" fillOpacity=".15" /><path d="m12 16 4 3 4-3M12 23l4-4 4 4M4 11v11l5 4M28 11v11l-5 4" /><circle cx="16" cy="25" r="1" fill="currentColor" />
</>);
export const PerfectPairs = emblem("parejas_perfectas", <>
  {[4,19].map(x=><g key={x}><rect x={x} y="5" width="9" height="22" rx="2" /><path d={`M${x} 16h9`} /><circle cx={x+4.5} cy="10.5" r="1.3" fill="currentColor" /><circle cx={x+4.5} cy="21.5" r="1.3" fill="currentColor" /></g>)}<path d="M14 13h3m-3 6h3" />
</>);
export const ThreeLines = emblem("tres_lineas", <>
  <path d="M4 5h24L23 27H9Z" fill="currentColor" fillOpacity=".1" /><path d="M9 11h14M10 16h12M11 21h10" strokeWidth="3" />
</>);
export const EternitySeal = emblem("eternidad", <>
  <path d="M12 5c-6 2-9 8-7 14s8 10 14 8 10-8 8-14-8-10-14-8" /><path d="m12 5 1 5M27 13l-5 1M19 27l-1-5M5 19l5-1" /><path d="m16 10 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill="currentColor" fillOpacity=".35" />
</>);

// Relic silhouettes stay distinct from the scoring patterns they can enhance.
export const EvenResonator = emblem("eco_par", <>
  <path d="M10 4v11c0 8 12 8 12 0V4M16 21v8M12 29h8" />
  <circle cx="10" cy="5" r="3" fill="currentColor" fillOpacity=".2" /><circle cx="22" cy="5" r="3" fill="currentColor" fillOpacity=".2" /><path d="M3 10v8m26-8v8" />
</>);
export const TensionClasp = emblem("cadena_tensa", <>
  <path d="M2 11h8v10H2m28-10h-8v10h8M10 13h12v6H10Z" fill="currentColor" fillOpacity=".15" />
  <path d="M16 7v18M13 7h6m-6 18h6M5 14v4m22-4v4" />
</>);
export const PrecisionCaliper = emblem("precision", <>
  <path d="M7 4h18M11 4v16L5 26m16-22v16l6 6M11 11h10M16 8v6M4 27h6m12 0h6" />
  <path d="m16 18 4 5-4 5-4-5Z" fill="currentColor" fillOpacity=".25" />
</>);
export const DominionStandard = emblem("dominio_total", <>
  <path d="M7 29V3m0 1h20l-5 7 5 7H7M3 29h10" fill="currentColor" fillOpacity=".1" />
  <rect x="12" y="6" width="7" height="10" rx="1" /><path d="M12 11h7" /><circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
</>);
export const ThreeCharm = emblem("tres_magico", <>
  <path d="m7 29 12-16M5 25l4 3M10 21l3 2M19 12l-3-5 6 1 4-5 1 7 4 4-7 1-3 5Z" fill="currentColor" fillOpacity=".15" />
  {[5,10,15].map(cx=><circle key={cx} cx={cx} cy="8" r="1.5" fill="currentColor" />)}
</>);
export const ChainKey = emblem("cadena_maestra", <>
  <circle cx="10" cy="10" r="6" /><circle cx="10" cy="10" r="2" />
  <path d="m14 15 13 13M22 22l4-4m-7 1 4-4M3 22h8v7H3Z" /><path d="M7 22v-4" />
</>);
export const StreakEngine = emblem("racha_imparable", <>
  <path d="m17 3 12 13-12 13V20H7v-8h10Z" fill="currentColor" fillOpacity=".2" />
  <path d="M3 6h9M1 16h3M3 26h9M18 11l5 5-5 5" />
</>);
export const QuietStone = emblem("minimalista", <>
  <path d="M8 26V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v18ZM5 29h22" />
  <circle cx="16" cy="15" r="2.8" fill="currentColor" /><path d="M12 24h8" strokeOpacity=".5" />
</>);
export const ChainMasterSeal = emblem("maestro_cadenas", <>
  <path d="M4 22C0 3 31-1 29 19M2 22l4 5 5-4M26 26l3-3" />
  {[8,17].map(x=><g key={x}><rect x={x} y="10" width="7" height="15" rx="2" /><path d={`M${x} 17.5h7`} /><circle cx={x+3.5} cy="14" r="1" fill="currentColor" /></g>)}
</>);
export const ReflectionLens = emblem("reflejo", <>
  <ellipse cx="16" cy="12" rx="10" ry="9" fill="currentColor" fillOpacity=".1" /><path d="M13 21v8h6v-8M10 14l9-8m-5 10 7-6" />
</>);
export const DoublePurity = emblem("pureza_doble", <>
  <path d="M6 9h9v19H6ZM18 9h9v19h-9Z" fill="currentColor" fillOpacity=".15" />
  <path d="M6 18h9m3 0h9M16 2v5m-4-3 4 3 4-3" /><circle cx="10.5" cy="13" r="1.3" fill="currentColor" /><circle cx="10.5" cy="23" r="1.3" fill="currentColor" /><circle cx="22.5" cy="13" r="1.3" fill="currentColor" /><circle cx="22.5" cy="23" r="1.3" fill="currentColor" />
</>);
export const AvalancheBoulder = emblem("avalancha_total", <>
  <path d="m5 4 7-2 6 6-2 8-8 2-5-6Zm13 13 7-3 5 7-4 8-8-2-3-5Z" fill="currentColor" fillOpacity=".15" />
  <path d="M3 21v8h8M5 26l8-8M24 3v5m4-3v5M10 8l3 3m9 9 3 3" />
</>);
export const LongFallWeight = emblem("caida_prolongada", <>
  <path d="M10 2v9m6-7v7m6-9v9M5 19l5-5h12l5 5-4 9H9Z" fill="currentColor" fillOpacity=".15" />
  <path d="M13 20h6m-3-3v6M3 29h26" /><circle cx="16" cy="8" r="1" fill="currentColor" />
</>);
export const CoronationDiadem = emblem("coronacion", <>
  <path d="m3 12 5 13h16l5-13-8 5-5-9-5 9ZM8 29h16" fill="currentColor" fillOpacity=".15" />
  <rect x="12" y="2" width="8" height="10" rx="1" /><path d="M12 7h8" /><circle cx="16" cy="5" r="1" fill="currentColor" /><path d="M11 21h10" />
</>);
export const HexagramTalisman = emblem("hexagrama_sagrado", <>
  <path d="M16 2v5M8 5l8 3 8-3-2 19-6 6-6-6Z" fill="currentColor" fillOpacity=".15" />
  <path d="m16 10 5 9H11Zm0 12-5-9h10Z" /><circle cx="16" cy="26" r="1" fill="currentColor" />
</>);
export const BrokenEcho = emblem("eco_roto", <>
  <path d="M9 10C1 12 1 22 9 25M14 6C0 8-3 25 13 29M24 4c9 3 9 15 1 18M20 8c5 2 5 8 0 10M18 2l-4 11 6 3-7 14" />
  <circle cx="10" cy="18" r="2" fill="currentColor" />
</>);
export const HarmonyChimes = emblem("armonia_divina", <>
  <path d="m4 7 12-4 12 4M5 9v11m7-11v17m8-17v17m7-17v11" />
  <rect x="3" y="18" width="4" height="7" rx="1" fill="currentColor" fillOpacity=".2" /><rect x="10" y="23" width="4" height="7" rx="1" fill="currentColor" fillOpacity=".2" /><rect x="18" y="23" width="4" height="7" rx="1" fill="currentColor" fillOpacity=".2" /><rect x="25" y="18" width="4" height="7" rx="1" fill="currentColor" fillOpacity=".2" />
</>);
