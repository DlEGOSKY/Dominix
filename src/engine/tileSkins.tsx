/**
 * Tile Skins Registry — defines the cosmetic identity of every tile skin.
 *
 * Skins are intentionally cosmetic-only. They do not affect any gameplay
 * number. Each skin has:
 *  - a base palette (bg, border, dot, separator)
 *  - an optional dot shape (round / square / diamond)
 *  - an optional surface pattern rendered behind the pips
 *  - an optional corner glyph that gives the skin a strong visual identity
 *  - a flavor line displayed in the collection screen
 *
 * Adding a new skin: append to ALL_TILE_SKINS, register its id in
 * `TileSkin` in `@/src/components/TileView.tsx`, and (optionally) hook its
 * unlockLevel into `LEVEL_REWARDS` in `@/src/engine/progression.ts`.
 */

import type { ReactNode } from "react";
import type { TileMaterial } from "./materialArt";
import { BandaPortrait } from "./bandaDobleArt";
import { ChatarraPortrait } from "./chatarraArt";
import { InvitadosPortrait } from "./invitadosArt";
import { CollectionPortrait } from "./collectionPortraits";
import { NumericCollectionFace } from "./numericCollectionFaces";
import { WorldSkinFace, WorldSkinSurface, type WorldSkinId } from "./worldSkinArt";
import {
  GiGhost, GiEyeball, GiCobra, GiWizardFace, GiDragonHead, GiDevilMask, GiCrownedSkull,
  GiAcorn, GiMushroom, GiOakLeaf, GiButterfly, GiTreeBranch, GiWolfHead, GiFlowerHat,
  GiCog, GiAtom, GiCircuitry, GiGearStickPattern, GiMechanicalArm, GiPowerLightning, GiRobotGolem,
  GiMagicSwirl, GiWizardStaff, GiMoon, GiSun, GiCrown, GiAnkh, GiStarSwirl,
  GiVortex, GiOrbital, GiAsteroid, GiEarthAmerica, GiPlanetCore, GiJupiter, GiRingedPlanet,
} from "react-icons/gi";

export type DotShape = "round" | "square" | "diamond";

export interface TileSkinDef {
  id: string;
  name: string;
  /** Short, evocative description shown in collection. */
  flavor: string;
  /** Tailwind classes for the tile face. */
  bg: string;
  /** Tailwind classes for the border ring. */
  border: string;
  /** Tailwind classes for the pips. */
  dot: string;
  /** Tailwind classes for the gradient separator stripe. */
  separator: string;
  dotShape: DotShape;
  /** Hex / rgba color used as accent for highlights, glyphs, etc. */
  accent: string;
  /** Optional SVG texture rendered behind the pips. */
  pattern: ReactNode | null;
  /** Optional small SVG glyph in the top-left corner. */
  glyph: ReactNode | null;
  /** Player level required to unlock. 0 = unlocked from start. */
  unlockLevel: number;
  /**
   * When defined, replaces the dot-grid with illustrated art per value (0-6).
   * Receives the pip value and must return a ReactNode (SVG recommended).
   */
  valueIcon?: (value: number) => ReactNode;
  /** Countable playing-face art, separate from gallery character portraits. */
  valueFace?: (value: number) => ReactNode;
  /** Full-face art with numeric labels near the separator; survives special types. */
  valueArtStyle?: "portrait" | "roman";
  /** Cosmetic numerals; accessible values always remain ordinary numbers. */
  portraitNumerals?: "roman";
  /** Crafted surface independent of tactical tile type. */
  material?: TileMaterial;
}

// ---------------------------------------------------------------------------
//  SVG building blocks (kept tiny on purpose — the tile is small)
// ---------------------------------------------------------------------------

function PatternStrokes({ stroke, opacity = 0.18 }: { stroke: string; opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 40 80"
      preserveAspectRatio="none"
      style={{ opacity }}
      aria-hidden
    >
      <line x1="0" y1="10" x2="40" y2="6" stroke={stroke} strokeWidth="0.5" />
      <line x1="0" y1="36" x2="40" y2="34" stroke={stroke} strokeWidth="0.5" />
      <line x1="0" y1="60" x2="40" y2="64" stroke={stroke} strokeWidth="0.5" />
    </svg>
  );
}

function PatternRunes({ stroke, opacity = 0.22 }: { stroke: string; opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 40 80"
      preserveAspectRatio="none"
      style={{ opacity }}
      aria-hidden
    >
      {/* Faint runic chevrons - left side */}
      <path d="M3 14 L7 18 L3 22" stroke={stroke} strokeWidth="0.6" fill="none" />
      <path d="M3 56 L7 60 L3 64" stroke={stroke} strokeWidth="0.6" fill="none" />
      {/* Faint runic chevrons - right side */}
      <path d="M37 14 L33 18 L37 22" stroke={stroke} strokeWidth="0.6" fill="none" />
      <path d="M37 56 L33 60 L37 64" stroke={stroke} strokeWidth="0.6" fill="none" />
    </svg>
  );
}

function PatternStars({ fill, opacity = 0.45 }: { fill: string; opacity?: number }) {
  // Sparse stars - placed manually so they never sit over a pip.
  const stars: { cx: number; cy: number; r: number }[] = [
    { cx: 6, cy: 5, r: 0.5 },
    { cx: 33, cy: 8, r: 0.35 },
    { cx: 4, cy: 30, r: 0.3 },
    { cx: 35, cy: 45, r: 0.45 },
    { cx: 7, cy: 70, r: 0.4 },
    { cx: 32, cy: 75, r: 0.35 },
  ];
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 40 80"
      preserveAspectRatio="none"
      style={{ opacity }}
      aria-hidden
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={fill} />
      ))}
    </svg>
  );
}

function PatternMarble({ stroke, opacity = 0.2 }: { stroke: string; opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 40 80"
      preserveAspectRatio="none"
      style={{ opacity }}
      aria-hidden
    >
      <path d="M0 12 Q10 20 20 14 T40 18" stroke={stroke} strokeWidth="0.4" fill="none" />
      <path d="M0 50 Q12 56 22 48 T40 54" stroke={stroke} strokeWidth="0.4" fill="none" />
    </svg>
  );
}

// Faceted gem crystals scattered across the surface.
function PatternCrystal({ stroke, opacity = 0.28 }: { stroke: string; opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 40 80"
      preserveAspectRatio="none"
      style={{ opacity }}
      aria-hidden
    >
      <polygon points="6,14 9,18 6,22 3,18" stroke={stroke} strokeWidth="0.4" fill="none" />
      <line x1="6" y1="14" x2="6" y2="22" stroke={stroke} strokeWidth="0.25" />
      <polygon points="34,28 37,32 34,36 31,32" stroke={stroke} strokeWidth="0.4" fill="none" />
      <line x1="34" y1="28" x2="34" y2="36" stroke={stroke} strokeWidth="0.25" />
      <polygon points="20,52 23,57 20,62 17,57" stroke={stroke} strokeWidth="0.4" fill="none" />
      <line x1="20" y1="52" x2="20" y2="62" stroke={stroke} strokeWidth="0.25" />
      <polygon points="6,68 9,72 6,76 3,72" stroke={stroke} strokeWidth="0.35" fill="none" />
      <line x1="6" y1="68" x2="6" y2="76" stroke={stroke} strokeWidth="0.25" />
    </svg>
  );
}

// Etheric void — sparse stars + faint vortex curves.
function PatternVoid({ stroke, fill, opacity = 0.5 }: { stroke: string; fill: string; opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 40 80"
      preserveAspectRatio="none"
      style={{ opacity }}
      aria-hidden
    >
      <circle cx="6" cy="8" r="0.5" fill={fill} />
      <circle cx="34" cy="14" r="0.4" fill={fill} />
      <circle cx="18" cy="38" r="0.55" fill={fill} />
      <circle cx="32" cy="48" r="0.45" fill={fill} />
      <circle cx="8" cy="62" r="0.55" fill={fill} />
      <circle cx="22" cy="72" r="0.4" fill={fill} />
      <path d="M3 30 Q20 35 37 28" stroke={stroke} strokeWidth="0.3" fill="none" opacity="0.55" />
      <path d="M3 50 Q20 45 37 52" stroke={stroke} strokeWidth="0.3" fill="none" opacity="0.55" />
    </svg>
  );
}

// Cyber circuit traces with solder dots.
function PatternCircuit({ stroke, opacity = 0.35 }: { stroke: string; opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 40 80"
      preserveAspectRatio="none"
      style={{ opacity }}
      aria-hidden
    >
      <path d="M0 18 L10 18 L10 24 L20 24" stroke={stroke} strokeWidth="0.45" fill="none" />
      <circle cx="20" cy="24" r="0.7" fill={stroke} />
      <path d="M40 38 L30 38 L30 44 L20 44" stroke={stroke} strokeWidth="0.45" fill="none" />
      <circle cx="20" cy="44" r="0.7" fill={stroke} />
      <path d="M0 60 L8 60 L8 68 L20 68" stroke={stroke} strokeWidth="0.45" fill="none" />
      <circle cx="20" cy="68" r="0.7" fill={stroke} />
      <path d="M40 12 L34 12 L34 8" stroke={stroke} strokeWidth="0.4" fill="none" />
      <circle cx="34" cy="8" r="0.5" fill={stroke} />
      <path d="M0 74 L6 74" stroke={stroke} strokeWidth="0.4" fill="none" />
    </svg>
  );
}

// Ornate Art Nouveau filigree swirls.
function PatternFiligree({ stroke, opacity = 0.28 }: { stroke: string; opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 40 80"
      preserveAspectRatio="none"
      style={{ opacity }}
      aria-hidden
    >
      <path d="M5 8 Q10 12 5 16 Q0 12 5 8 Z" stroke={stroke} strokeWidth="0.35" fill="none" />
      <path d="M35 22 Q40 26 35 30 Q30 26 35 22 Z" stroke={stroke} strokeWidth="0.35" fill="none" />
      <path d="M20 42 Q25 46 20 50 Q15 46 20 42 Z" stroke={stroke} strokeWidth="0.35" fill="none" />
      <path d="M5 60 Q10 64 5 68 Q0 64 5 60 Z" stroke={stroke} strokeWidth="0.35" fill="none" />
      <path d="M35 70 Q40 74 35 78 Q30 74 35 70 Z" stroke={stroke} strokeWidth="0.35" fill="none" />
      <line x1="5" y1="16" x2="35" y2="22" stroke={stroke} strokeWidth="0.22" opacity="0.6" />
      <line x1="20" y1="42" x2="35" y2="30" stroke={stroke} strokeWidth="0.22" opacity="0.6" />
      <line x1="5" y1="60" x2="20" y2="50" stroke={stroke} strokeWidth="0.22" opacity="0.6" />
    </svg>
  );
}

// Heritage marquetry — horizontal divisions with ornamental diamonds.
function PatternHeritage({ stroke, opacity = 0.32 }: { stroke: string; opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 40 80"
      preserveAspectRatio="none"
      style={{ opacity }}
      aria-hidden
    >
      <line x1="0" y1="14" x2="16" y2="14" stroke={stroke} strokeWidth="0.35" />
      <line x1="24" y1="14" x2="40" y2="14" stroke={stroke} strokeWidth="0.35" />
      <line x1="0" y1="40" x2="16" y2="40" stroke={stroke} strokeWidth="0.35" />
      <line x1="24" y1="40" x2="40" y2="40" stroke={stroke} strokeWidth="0.35" />
      <line x1="0" y1="66" x2="16" y2="66" stroke={stroke} strokeWidth="0.35" />
      <line x1="24" y1="66" x2="40" y2="66" stroke={stroke} strokeWidth="0.35" />
      <polygon points="20,11 23,14 20,17 17,14" fill="none" stroke={stroke} strokeWidth="0.3" />
      <polygon points="20,37 23,40 20,43 17,40" fill="none" stroke={stroke} strokeWidth="0.3" />
      <polygon points="20,63 23,66 20,69 17,66" fill="none" stroke={stroke} strokeWidth="0.3" />
      <circle cx="4" cy="4" r="0.6" fill="none" stroke={stroke} strokeWidth="0.25" />
      <circle cx="36" cy="4" r="0.6" fill="none" stroke={stroke} strokeWidth="0.25" />
      <circle cx="4" cy="76" r="0.6" fill="none" stroke={stroke} strokeWidth="0.25" />
      <circle cx="36" cy="76" r="0.6" fill="none" stroke={stroke} strokeWidth="0.25" />
    </svg>
  );
}

// Orbital rings + tiny planet dots dispersed.
function PatternOrbits({ stroke, fill, opacity = 0.55 }: { stroke: string; fill: string; opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 40 80"
      preserveAspectRatio="none"
      style={{ opacity }}
      aria-hidden
    >
      <ellipse cx="20" cy="20" rx="16" ry="6" stroke={stroke} strokeWidth="0.32" fill="none" opacity="0.5" />
      <ellipse cx="20" cy="40" rx="18" ry="8" stroke={stroke} strokeWidth="0.32" fill="none" opacity="0.5" transform="rotate(15 20 40)" />
      <ellipse cx="20" cy="62" rx="14" ry="5" stroke={stroke} strokeWidth="0.32" fill="none" opacity="0.5" />
      <circle cx="32" cy="22" r="0.7" fill={fill} />
      <circle cx="6" cy="42" r="0.8" fill={fill} />
      <circle cx="30" cy="60" r="0.6" fill={fill} />
      <circle cx="4" cy="10" r="0.35" fill={fill} opacity="0.7" />
      <circle cx="36" cy="28" r="0.4" fill={fill} opacity="0.8" />
      <circle cx="14" cy="50" r="0.3" fill={fill} opacity="0.6" />
      <circle cx="34" cy="74" r="0.4" fill={fill} opacity="0.7" />
    </svg>
  );
}

function GlyphCorner({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      className="absolute top-0.5 left-0.5 pointer-events-none"
      style={{ color, opacity: 0.7 }}
      aria-hidden
    >
      {children}
    </span>
  );
}

function GlyphRune({ color }: { color: string }) {
  return (
    <GlyphCorner color={color}>
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
        <path d="M2 2 L5 1 L8 2 L5 9 Z" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
        <line x1="3.5" y1="4" x2="6.5" y2="4" stroke="currentColor" strokeWidth="0.8" />
      </svg>
    </GlyphCorner>
  );
}

function GlyphSeal({ color }: { color: string }) {
  return (
    <GlyphCorner color={color}>
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="3.4" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="5" cy="5" r="1.2" fill="currentColor" />
      </svg>
    </GlyphCorner>
  );
}

function GlyphStar({ color }: { color: string }) {
  return (
    <GlyphCorner color={color}>
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
        <path
          d="M5 1 L6 4 L9 4.2 L6.6 6 L7.5 9 L5 7.2 L2.5 9 L3.4 6 L1 4.2 L4 4 Z"
          fill="currentColor"
        />
      </svg>
    </GlyphCorner>
  );
}

// ---------------------------------------------------------------------------
//  Illustrated skin helpers — Tarot & Astral
// ---------------------------------------------------------------------------

const TAROT_ICONS = [
  GiMagicSwirl,    // 0 — The Fool
  GiWizardStaff,   // 1 — The Magician
  GiMoon,          // 2 — The Moon / High Priestess
  GiSun,           // 3 — The Sun
  GiCrown,         // 4 — The Emperor
  GiAnkh,          // 5 — The Hierophant
  GiStarSwirl,     // 6 — The Star
];

const ASTRAL_ICONS = [
  GiVortex,         // 0 — black hole / void
  GiOrbital,        // 1 — Mercury
  GiAsteroid,       // 2 — Venus / asteroid
  GiEarthAmerica,   // 3 — Earth
  GiPlanetCore,     // 4 — Mars
  GiJupiter,        // 5 — Jupiter
  GiRingedPlanet,   // 6 — Saturn
];

function TarotValueIcon({ value, color }: { value: number; color: string }) {
  return <IconValueRenderer value={value} color={color} icons={TAROT_ICONS} />;
}

function AstralValueIcon({ value, color }: { value: number; color: string }) {
  return <IconValueRenderer value={value} color={color} icons={ASTRAL_ICONS} />;
}

// ---------------------------------------------------------------------------
//  Bestiario — 7 creature icons via react-icons/gi (Game Icons)
// ---------------------------------------------------------------------------

const BESTIARIO_ICONS = [
  GiGhost,         // 0 — fantasma
  GiEyeball,       // 1 — ojo arcano
  GiCobra,         // 2 — serpiente
  GiWizardFace,    // 3 — brujo
  GiDragonHead,    // 4 — dragon
  GiDevilMask,     // 5 — demonio
  GiCrownedSkull,  // 6 — lich
];

const NATURALEZA_ICONS = [
  GiAcorn,         // 0 — bellota
  GiMushroom,      // 1 — hongo
  GiOakLeaf,       // 2 — hoja
  GiButterfly,     // 3 — mariposa
  GiTreeBranch,    // 4 — rama
  GiWolfHead,      // 5 — lobo
  GiFlowerHat,     // 6 — flor coronada
];

const MECANICO_ICONS = [
  GiCog,                // 0 — engranaje basico
  GiAtom,               // 1 — atomo
  GiCircuitry,          // 2 — circuito
  GiGearStickPattern,   // 3 — engranaje complejo
  GiMechanicalArm,      // 4 — brazo mecanico
  GiPowerLightning,     // 5 — rayo
  GiRobotGolem,         // 6 — golem
];

function IconValueRenderer({ value, color, icons }: { value: number; color: string; icons: typeof BESTIARIO_ICONS }) {
  const Icon = icons[Math.min(value, 6)] ?? icons[0]!;
  return (
    <div style={{ width: "100%", height: "100%", color, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size="100%" />
    </div>
  );
}

function BestiarioValueIcon({ value, color }: { value: number; color: string }) {
  return <IconValueRenderer value={value} color={color} icons={BESTIARIO_ICONS} />;
}

function NaturalezaValueIcon({ value, color }: { value: number; color: string }) {
  return <IconValueRenderer value={value} color={color} icons={NATURALEZA_ICONS} />;
}

function MecanicoValueIcon({ value, color }: { value: number; color: string }) {
  return <IconValueRenderer value={value} color={color} icons={MECANICO_ICONS} />;
}

// ---------------------------------------------------------------------------
//  Skin definitions
// ---------------------------------------------------------------------------

export const ALL_TILE_SKINS: TileSkinDef[] = [
  {
    id: "default",
    name: "Clasica",
    flavor: "La piedra basica del ritual.",
    bg: "",
    border: "",
    dot: "",
    separator: "via-tile-border/40",
    dotShape: "round",
    accent: "#a8b2c1",
    pattern: null,
    glyph: null,
    unlockLevel: 0,
  },
  {
    id: "banda_doble",
    name: "La Banda del Doble",
    flavor: "Siete caras. Ninguna juega limpio.",
    bg: "bg-gradient-to-b from-[#21172d] via-[#151020] to-[#0a0811]",
    border: "border-violet-400/55",
    dot: "bg-amber-100",
    separator: "via-amber-200/40",
    dotShape: "round",
    accent: "#f5ddb9",
    pattern: null,
    glyph: null,
    unlockLevel: 0,
    valueArtStyle: "portrait",
    valueIcon: (value) => <BandaPortrait value={value} />,
  },
  {
    id: "chatarra_lujo",
    name: "Chatarra de Lujo",
    flavor: "Hechos de sobras. Nacidos para encajar.",
    bg: "bg-gradient-to-b from-[#241c24] via-[#15151f] to-[#0a0911]",
    border: "border-orange-300/55",
    dot: "bg-amber-100",
    separator: "via-orange-200/40",
    dotShape: "square",
    accent: "#f6cca5",
    pattern: null,
    glyph: null,
    unlockLevel: 0,
    valueArtStyle: "portrait",
    valueIcon: (value) => <ChatarraPortrait value={value} />,
  },
  {
    id: "invitados_umbral",
    name: "Invitados del Umbral",
    flavor: "Siete mundos. Una misma mesa.",
    bg: "bg-gradient-to-b from-[#211b30] via-[#15111e] to-[#0a0911]",
    border: "border-fuchsia-300/50",
    dot: "bg-amber-100",
    separator: "via-violet-200/40",
    dotShape: "round",
    accent: "#f3deca",
    pattern: null,
    glyph: null,
    unlockLevel: 0,
    valueArtStyle: "portrait",
    valueIcon: (value) => <InvitadosPortrait value={value} />,
  },
  {
    id: "among_us",
    name: "Among Us · Tripulación",
    flavor: "Esmalte gastado, cristal cian y secretos bajo el visor.",
    bg: "bg-gradient-to-b from-[#182834] via-[#141c2a] to-[#0b111d]",
    border: "border-cyan-300/55", dot: "bg-cyan-100", separator: "via-cyan-200/45",
    dotShape: "round", accent: "#8eedf0", pattern: null, glyph: null, unlockLevel: 0,
    valueArtStyle: "portrait", valueIcon: value => <CollectionPortrait collection="among_us" value={value} />,
    valueFace: value => <NumericCollectionFace collection="among_us" value={value}/>,
  },
  {
    id: "hollow_knight",
    name: "Hollow Knight · Hallownest",
    flavor: "Siete ecos de Hallownest. Una máscara distinta para cada valor.",
    bg: "bg-gradient-to-b from-[#24283b] via-[#171a29] to-[#0a0c16]",
    border: "border-slate-300/55", dot: "bg-slate-100", separator: "via-slate-200/45",
    dotShape: "round", accent: "#e4e6d5", pattern: null, glyph: null, unlockLevel: 0,
    valueArtStyle: "portrait", valueIcon: value => <CollectionPortrait collection="hollow_knight" value={value} />,
    valueFace: value => <NumericCollectionFace collection="hollow_knight" value={value}/>,
  },
  {
    id: "one_piece",
    name: "One Piece · Sombrero de Paja",
    flavor: "El tesoro marca el valor. La tripulación pone el rumbo.",
    bg: "bg-gradient-to-b from-[#30222a] via-[#1d1828] to-[#0e101c]",
    border: "border-amber-300/55", dot: "bg-amber-100", separator: "via-amber-200/45",
    dotShape: "round", accent: "#f5ca7c", pattern: null, glyph: null, unlockLevel: 0,
    valueArtStyle: "portrait", valueIcon: value => <CollectionPortrait collection="one_piece" value={value} />,
    valueFace: value => <NumericCollectionFace collection="one_piece" value={value}/>,
  },
  {
    id: "roma_eterna",
    name: "Roma Eterna",
    flavor: "El valor grabado en grande. El imperio, detrás.",
    bg: "bg-gradient-to-b from-[#30271e] via-[#201a21] to-[#100e16]",
    border: "border-accent-gold/60", dot: "bg-amber-100", separator: "via-amber-200/50",
    dotShape: "round", accent: "#dfc18a", pattern: null, glyph: null, unlockLevel: 0,
    valueArtStyle: "portrait", portraitNumerals: "roman", valueIcon: value => <CollectionPortrait collection="roma_eterna" value={value} />,
    valueFace: value => <NumericCollectionFace collection="roma_eterna" value={value}/>,
  },
  ...([
    ["eclipse_glass", "Vitrales del eclipse", "La noche, engastada en plomo. Cuenta las estrellas de cristal.", "#e6cf98", "bg-[#191627]", "border-violet-300/50"],
    ["orbital_reactor", "Reactor orbital", "Una sección de la nave. Cada indicador encendido marca un punto.", "#a4ebdb", "bg-[#13212b]", "border-teal-300/50"],
    ["sunken_temple", "Templo sumergido", "Piedra bajo la marea. El valor permanece en sus perlas.", "#e6d6a6", "bg-[#18302f]", "border-teal-200/50"],
    ["dragon_forge", "Forja del dragón", "Hierro templado. Cada remache conserva una brasa.", "#ffd59a", "bg-[#281c23]", "border-orange-300/50"],
    ["alchemist_cabinet", "Gabinete de alquimia", "Latón, vidrio y una medida exacta de luz.", "#d9e9a0", "bg-[#252a1e]", "border-lime-200/50"],
    ["midnight_express", "Expreso de medianoche", "Madera, latón y un último destino. Cuenta las ventanas encendidas.", "#e5c68f", "bg-[#231f20]", "border-amber-200/55"],
  ] as const).map(([id, name, flavor, accent, bg, border]): TileSkinDef => ({
    id, name, flavor, accent, bg, border, dot: "bg-amber-100", separator: "via-amber-100/30",
    dotShape: "round", unlockLevel: 0, valueArtStyle: "portrait", glyph: null,
    pattern: <WorldSkinSurface world={id as WorldSkinId}/>,
    valueIcon: value => <WorldSkinFace world={id} value={value}/>,
    valueFace: value => <WorldSkinFace world={id} value={value}/>,
  })),
  {
    id: "obsidian",
    material: "obsidian",
    name: "Obsidiana",
    flavor: "Cortada del eco frio del primer pacto.",
    bg: "bg-gradient-to-b from-[#1c1c28] to-[#0e0e18]",
    border: "border-slate-400/40",
    dot: "bg-slate-300",
    separator: "via-slate-500/40",
    dotShape: "square",
    accent: "#94a3b8",
    pattern: <PatternStrokes stroke="#94a3b8" opacity={0.16} />,
    glyph: null,
    unlockLevel: 3,
  },
  {
    id: "emerald",
    material: "emerald",
    name: "Esmeralda",
    flavor: "El verdor que precede a toda cadena.",
    bg: "bg-gradient-to-b from-[#0d2b1f] to-[#071a12]",
    border: "border-emerald-500/50",
    dot: "pip-emerald",
    separator: "via-emerald-500/40",
    dotShape: "round",
    accent: "#34d399",
    pattern: <PatternCrystal stroke="#34d399" opacity={0.08} />,
    glyph: null,
    unlockLevel: 6,
  },
  {
    id: "ruby",
    material: "ruby",
    name: "Rubi",
    flavor: "Calor que empuja la siguiente jugada.",
    bg: "bg-gradient-to-b from-[#2a0d10] to-[#180608]",
    border: "border-rose-500/50",
    dot: "pip-ruby",
    separator: "via-rose-500/40",
    dotShape: "round",
    accent: "#f87171",
    pattern: <PatternCrystal stroke="#f87171" opacity={0.08} />,
    glyph: null,
    unlockLevel: 10,
  },
  {
    id: "ivory",
    material: "ivory",
    name: "Marfil",
    flavor: "Tradicion. Marqueteria fina, fuerza de lo clasico.",
    bg: "bg-gradient-to-b from-[#f5f0e8] to-[#e8dcc8]",
    border: "border-stone-400/60",
    dot: "pip-ivory",
    separator: "via-stone-400/50",
    dotShape: "round",
    accent: "#78716c",
    pattern: <PatternHeritage stroke="#78716c" opacity={0.14} />,
    glyph: null,
    unlockLevel: 12,
  },
  {
    id: "diamond", name: "Diamante", flavor: "Luz tallada. Cada punto, una incisión.",
    material: "diamond", bg: "bg-gradient-to-br from-[#c8e8f2] via-[#89aebf] to-[#49647c]",
    border: "border-sky-100/65", dot: "pip-diamond", separator: "via-slate-700/50", dotShape: "diamond",
    accent: "#173144", pattern: null, glyph: null, unlockLevel: 0,
  },
  {
    id: "imperium", name: "Imperium", flavor: "Piedra, laurel y el peso de cada decisión.",
    material: "roman", valueArtStyle: "roman", bg: "bg-gradient-to-b from-[#e4d5b6] via-[#d1bb94] to-[#a98b60]",
    border: "border-amber-200/60", dot: "pip-ivory", separator: "via-amber-950/40", dotShape: "round",
    accent: "#412b1b", pattern: null, glyph: null, unlockLevel: 0,
  },
  {
    id: "void",
    name: "Vacio",
    flavor: "Ningun acto se pierde, todos se devoran.",
    bg: "bg-gradient-to-b from-[#07070f] to-[#030306]",
    border: "border-violet-400/50",
    dot: "bg-violet-400",
    separator: "via-violet-500/40",
    dotShape: "diamond",
    accent: "#a78bfa",
    pattern: <PatternVoid stroke="#a78bfa" fill="#c4b5fd" opacity={0.65} />,
    glyph: null,
    unlockLevel: 15,
  },
  {
    id: "neon",
    name: "Neon",
    flavor: "Eco moderno del dominio.",
    bg: "bg-gradient-to-b from-[#040812] to-[#010408]",
    border: "border-cyan-400/70",
    dot: "bg-cyan-400",
    separator: "via-cyan-400/50",
    dotShape: "diamond",
    accent: "#22d3ee",
    pattern: <PatternCircuit stroke="#22d3ee" opacity={0.4} />,
    glyph: null,
    unlockLevel: 18,
  },
  {
    id: "gold",
    name: "Dorado",
    flavor: "El privilegio de los que cierran su ritual.",
    bg: "bg-gradient-to-b from-[#2a1d06] to-[#190f02]",
    border: "border-amber-400/60",
    dot: "bg-amber-300",
    separator: "via-amber-400/50",
    dotShape: "round",
    accent: "#fbbf24",
    pattern: <PatternFiligree stroke="#fbbf24" opacity={0.32} />,
    glyph: null,
    unlockLevel: 20,
  },

  // ---- Identity-strong skins (new) -----------------------------------------
  {
    id: "pacto",
    name: "Pacto",
    flavor: "Marcado en sangre. Cada ficha recuerda lo prometido.",
    bg: "bg-gradient-to-b from-[#3b0a0f] via-[#1f0407] to-[#0c0203]",
    border: "border-red-500/60",
    dot: "bg-red-200",
    separator: "via-red-400/45",
    dotShape: "diamond",
    accent: "#fca5a5",
    pattern: <PatternRunes stroke="#fca5a5" opacity={0.32} />,
    glyph: <GlyphRune color="#fca5a5" />,
    unlockLevel: 8,
  },
  {
    id: "reliquia",
    name: "Reliquia",
    flavor: "Recuperada de un ritual anterior. Aun guarda peso.",
    bg: "bg-gradient-to-b from-[#3a2a18] via-[#241a0f] to-[#120c07]",
    border: "border-amber-700/60",
    dot: "bg-amber-100",
    separator: "via-amber-700/45",
    dotShape: "round",
    accent: "#d6b67a",
    pattern: <PatternMarble stroke="#d6b67a" opacity={0.32} />,
    glyph: <GlyphSeal color="#d6b67a" />,
    unlockLevel: 13,
  },
  {
    id: "cosmos",
    name: "Cosmos",
    flavor: "Talla la noche con cada conexion.",
    bg: "bg-gradient-to-b from-[#0a0d24] via-[#070a1d] to-[#04060f]",
    border: "border-indigo-400/60",
    dot: "bg-indigo-200",
    separator: "via-indigo-400/45",
    dotShape: "diamond",
    accent: "#a5b4fc",
    pattern: <PatternOrbits stroke="#a5b4fc" fill="#c7d2fe" opacity={0.7} />,
    glyph: <GlyphStar color="#c7d2fe" />,
    unlockLevel: 16,
  },

  // ---- Illustrated skins (value art replaces dot-grid) -------------------
  {
    id: "bestiario",
    name: "Bestiario",
    flavor: "Siete criaturas. Siete valores. Solo una cadena los contiene.",
    bg: "bg-gradient-to-b from-[#1a0d2e] via-[#10081c] to-[#06040e]",
    border: "border-purple-400/55",
    dot: "bg-purple-300",
    separator: "via-purple-500/40",
    dotShape: "round",
    accent: "#c084fc",
    pattern: <PatternStars fill="#c084fc" opacity={0.5} />,
    glyph: null,
    unlockLevel: 21,
    valueIcon: (v) => <BestiarioValueIcon value={v} color="#d8b4fe" />,
  },
  {
    id: "naturaleza",
    name: "Naturaleza",
    flavor: "El bosque guarda siete formas. Reconocelas y la cadena florece.",
    bg: "bg-gradient-to-b from-[#0c2018] via-[#071510] to-[#040a07]",
    border: "border-emerald-400/55",
    dot: "bg-emerald-300",
    separator: "via-emerald-500/40",
    dotShape: "round",
    accent: "#86efac",
    pattern: <PatternMarble stroke="#86efac" opacity={0.18} />,
    glyph: null,
    unlockLevel: 24,
    valueIcon: (v) => <NaturalezaValueIcon value={v} color="#86efac" />,
  },
  {
    id: "mecanico",
    name: "Mecanico",
    flavor: "Forja, engranaje, descarga. La cadena como maquina ritual.",
    bg: "bg-gradient-to-b from-[#1a1106] via-[#120a04] to-[#080502]",
    border: "border-orange-400/50",
    dot: "bg-orange-300",
    separator: "via-orange-500/40",
    dotShape: "square",
    accent: "#fdba74",
    pattern: <PatternStrokes stroke="#fdba74" opacity={0.16} />,
    glyph: null,
    unlockLevel: 25,
    valueIcon: (v) => <MecanicoValueIcon value={v} color="#fdba74" />,
  },
  {
    id: "tarot",
    name: "Tarot",
    flavor: "Cada valor es un arcano. El dominó como oraculo.",
    bg: "bg-gradient-to-b from-[#2a1c06] via-[#1c1308] to-[#100a03]",
    border: "border-amber-500/55",
    dot: "bg-amber-400",
    separator: "via-amber-600/40",
    dotShape: "round",
    accent: "#d4a234",
    pattern: <PatternRunes stroke="#d4a234" opacity={0.18} />,
    glyph: null,
    unlockLevel: 22,
    valueIcon: (v) => <TarotValueIcon value={v} color="#d4a234" />,
  },
  {
    id: "astral",
    name: "Astral",
    flavor: "El sistema solar como tablero. Cada ficha, un mundo.",
    bg: "bg-gradient-to-b from-[#04091a] via-[#030612] to-[#02040b]",
    border: "border-blue-400/55",
    dot: "bg-blue-300",
    separator: "via-blue-500/40",
    dotShape: "round",
    accent: "#7eb8f7",
    pattern: <PatternStars fill="#93c5fd" opacity={0.75} />,
    glyph: null,
    unlockLevel: 23,
    valueIcon: (v) => <AstralValueIcon value={v} color="#7eb8f7" />,
  },
];

const BY_ID = new Map(ALL_TILE_SKINS.map((s) => [s.id, s]));

export function getTileSkin(id: string | null | undefined): TileSkinDef {
  if (!id) return ALL_TILE_SKINS[0]!;
  return BY_ID.get(id) ?? ALL_TILE_SKINS[0]!;
}

export function isCustomSkin(id: string | null | undefined): boolean {
  return !!id && id !== "default";
}
