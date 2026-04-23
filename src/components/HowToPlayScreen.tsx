import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import TileView from "./TileView";
import AnimatedDemo from "./AnimatedDemo";
import RelicCard from "./RelicCard";
import type { Tile } from "@/types/domino";

interface HowToPlayScreenProps {
  onBack: () => void;
}

const SECTIONS = [
  { id: "basics", title: "Que es el domino", icon: "1" },
  { id: "gameplay", title: "Como se juega", icon: "2" },
  { id: "patterns", title: "Patrones", icon: "3" },
  { id: "advanced", title: "Sistemas avanzados", icon: "4" },
  { id: "meta", title: "Sistemas meta", icon: "5" },
];

// Demo tiles for examples
const DEMO_TILES: Record<string, Tile> = {
  "3-3": { id: "demo-3-3", top: 3, bottom: 3 },
  "3-5": { id: "demo-3-5", top: 3, bottom: 5 },
  "5-2": { id: "demo-5-2", top: 5, bottom: 2 },
  "2-6": { id: "demo-2-6", top: 2, bottom: 6 },
  "6-6": { id: "demo-6-6", top: 6, bottom: 6 },
  "1-1": { id: "demo-1-1", top: 1, bottom: 1 },
  "4-4": { id: "demo-4-4", top: 4, bottom: 4 },
  "wild": { id: "demo-wild", top: 0, bottom: 0, type: "wild" },
  "golden": { id: "demo-golden", top: 5, bottom: 3, type: "golden" },
  "locked": { id: "demo-locked", top: 2, bottom: 4, type: "locked" },
  "mirror": { id: "demo-mirror", top: 1, bottom: 4, type: "mirror" },
  "bomb": { id: "demo-bomb", top: 3, bottom: 6, type: "bomb" },
};

function SectionBasics() {
  return (
    <div className="flex flex-col gap-8">
      {/* What is a domino tile */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">La ficha de domino</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Cada ficha tiene <span className="text-white font-semibold">dos mitades</span> con puntos del 0 al 6.
          Los puntos representan el <span className="text-accent-gold font-semibold">valor</span> de cada lado.
        </p>
        
        <div className="flex items-center justify-center gap-8 py-6">
          <div className="flex flex-col items-center gap-3">
            <TileView tile={DEMO_TILES["3-5"]!} disabled size="md" animate={false} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-accent-silver/50">Ficha 3|5</span>
              <span className="text-xs text-accent-gold">Valor: 8 puntos</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <TileView tile={DEMO_TILES["6-6"]!} disabled size="md" animate={false} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-accent-silver/50">Doble 6</span>
              <span className="text-xs text-accent-gold">Valor: 12 puntos</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <TileView tile={DEMO_TILES["1-1"]!} disabled size="md" animate={false} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-accent-silver/50">Doble 1</span>
              <span className="text-xs text-accent-gold">Valor: 2 puntos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated connection demo */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Como se conectan</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Las fichas se conectan cuando <span className="text-white font-semibold">los numeros coinciden</span>.
          Mira como se forma una cadena paso a paso:
        </p>

        <AnimatedDemo
          steps={[
            {
              hand: [DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["1-1"]!],
              chain: [],
              score: 0,
              label: "Empieza con 4 fichas en la mano",
              highlight: "demo-3-5",
            },
            {
              hand: [DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["1-1"]!],
              chain: [DEMO_TILES["3-5"]!],
              score: 8,
              label: "Juega 3|5 para iniciar la cadena (+8 pts)",
            },
            {
              hand: [DEMO_TILES["2-6"]!, DEMO_TILES["1-1"]!],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!],
              score: 15,
              label: "5|2 conecta por el 5 (+7 pts)",
              highlight: "demo-5-2",
            },
            {
              hand: [DEMO_TILES["1-1"]!],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!],
              score: 23,
              label: "2|6 conecta por el 2 (+8 pts)",
            },
            {
              hand: [DEMO_TILES["1-1"]!],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!],
              score: 38,
              label: "Patron activado: Cadena Simple (+15 bonus)",
            },
          ]}
          intervalMs={2200}
        />
      </div>

      {/* Invalid connection */}
      <div className="flex flex-col items-center gap-4 py-4 px-4 rounded-xl bg-red-500/5 border border-red-500/20">
        <div className="flex items-center gap-2">
          <TileView tile={DEMO_TILES["3-5"]!} disabled size="sm" animate={false} />
          <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
            <span className="text-red-400 text-lg">X</span>
          </div>
          <TileView tile={DEMO_TILES["1-1"]!} disabled size="sm" animate={false} />
        </div>
        <p className="text-sm text-red-400/70">
          No se puede conectar: 3|5 no tiene 1
        </p>
      </div>
    </div>
  );
}

function SectionGameplay() {
  return (
    <div className="flex flex-col gap-8">
      {/* Goal */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">El objetivo</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          En cada ronda tienes una <span className="text-accent-gold font-semibold">meta de puntos</span> que debes alcanzar.
          Si la superas, avanzas a la siguiente ronda. Si no, la run termina.
        </p>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-accent-silver/50 mb-2">
              <span>Ronda 1</span>
              <span>Meta: 80</span>
            </div>
            <div className="relative w-full h-4 rounded-full bg-surface-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ delay: 0.3, duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-accent-gold to-amber-400"
              />
            </div>
            <div className="flex justify-center mt-2">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="font-mono font-bold text-2xl text-white"
              >
                60 / 80
              </motion.span>
            </div>
          </div>
          <p className="text-sm text-accent-silver/50">
            Necesitas 20 puntos mas para superar la ronda
          </p>
        </div>
      </div>

      {/* Animated round demo */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Jugando una ronda</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Empiezas con <span className="text-white font-semibold">7 fichas</span>. 
          Coloca fichas, forma cadenas y trata de superar la meta. Asi se ve:
        </p>

        <AnimatedDemo
          steps={[
            {
              hand: [DEMO_TILES["3-3"]!, DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["6-6"]!],
              chain: [],
              score: 0,
              label: "Ronda 1 — Meta: 80 pts. Tu mano esta lista",
              highlight: "demo-3-3",
            },
            {
              hand: [DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["6-6"]!],
              chain: [DEMO_TILES["3-3"]!],
              score: 6,
              label: "Juegas el doble 3 para empezar (+6)",
            },
            {
              hand: [DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["6-6"]!],
              chain: [DEMO_TILES["3-3"]!, DEMO_TILES["3-5"]!],
              score: 14,
              label: "3|5 conecta por el 3 (+8)",
              highlight: "demo-3-5",
            },
            {
              hand: [DEMO_TILES["2-6"]!, DEMO_TILES["6-6"]!],
              chain: [DEMO_TILES["3-3"]!, DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!],
              score: 21,
              label: "5|2 conecta por el 5 (+7). Patron: Cadena Simple",
            },
            {
              hand: [DEMO_TILES["6-6"]!],
              chain: [DEMO_TILES["3-3"]!, DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!],
              score: 29,
              label: "2|6 conecta por el 2 (+8). Cadena crece",
            },
            {
              hand: [],
              chain: [DEMO_TILES["3-3"]!, DEMO_TILES["3-5"]!, DEMO_TILES["5-2"]!, DEMO_TILES["2-6"]!, DEMO_TILES["6-6"]!],
              score: 86,
              label: "6|6 cierra. Score: 86 > Meta 80. Ronda ganada",
            },
          ]}
          intervalMs={2500}
        />
      </div>

      {/* Rounds progression */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Progresion de rondas</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Las metas aumentan cada ronda. Despues de ganar, recibes <span className="text-accent-gold font-semibold">oro</span> y
          eliges una <span className="text-purple-400 font-semibold">mejora</span> (reliquia o mutacion).
        </p>
        
        <div className="flex items-center justify-center gap-3 py-4">
          {[
            { round: 1, target: 80, status: "done" },
            { round: 2, target: 140, status: "done" },
            { round: 3, target: 220, status: "current" },
            { round: 4, target: 320, status: "future" },
          ].map((r, i) => (
            <motion.div
              key={r.round}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={[
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border",
                r.status === "done" ? "bg-green-500/10 border-green-500/30" :
                r.status === "current" ? "bg-accent-gold/10 border-accent-gold/30" :
                "bg-surface-800/50 border-surface-600/30 opacity-50"
              ].join(" ")}
            >
              <span className={[
                "text-xs font-bold",
                r.status === "done" ? "text-green-400" :
                r.status === "current" ? "text-accent-gold" :
                "text-accent-silver/40"
              ].join(" ")}>R{r.round}</span>
              <span className="text-xs text-accent-silver/50">{r.target}</span>
            </motion.div>
          ))}
          <span className="text-accent-silver/30">...</span>
        </div>
      </div>
    </div>
  );
}

function SectionPatterns() {
  const patterns = [
    {
      name: "Cadena Simple",
      description: "3+ fichas en la cadena",
      bonus: "+15",
      example: ["3-5", "5-2", "2-6"],
    },
    {
      name: "Doble Doble",
      description: "2 dobles en la cadena",
      bonus: "+20",
      example: ["3-3", "3-5", "5-5"],
    },
    {
      name: "Dominio",
      description: "Un numero aparece 3+ veces",
      bonus: "+25",
      example: ["5-5", "5-2", "2-5"],
    },
    {
      name: "Escalera",
      description: "Secuencia de numeros consecutivos",
      bonus: "+30",
      example: ["1-2", "2-3", "3-4"],
    },
  ];

  const [activePattern, setActivePattern] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Sistema de patrones</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Los patrones son <span className="text-accent-gold font-semibold">combinaciones especiales</span> que otorgan puntos bonus.
          Detectarlos y activarlos es clave para superar las metas mas altas.
        </p>
      </div>

      {/* Pattern selector */}
      <div className="flex flex-wrap gap-2">
        {patterns.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActivePattern(i)}
            className={[
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              activePattern === i
                ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30"
                : "bg-surface-800 text-accent-silver/60 border border-surface-600/30 hover:border-surface-600"
            ].join(" ")}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Active pattern display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePattern}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-surface-800/50 border border-surface-600/30"
        >
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-white">{patterns[activePattern]!.name}</span>
            <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-sm font-mono font-bold">
              {patterns[activePattern]!.bonus}
            </span>
          </div>
          
          <p className="text-sm text-accent-silver/60">
            {patterns[activePattern]!.description}
          </p>
          
          <div className="flex items-center gap-2 py-2">
            {patterns[activePattern]!.example.map((tileKey, i) => {
              const [top, bottom] = tileKey.split("-").map(Number);
              const tile: Tile = { id: `pattern-${i}`, top: top!, bottom: bottom! };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <TileView tile={tile} disabled size="sm" animate={false} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Combo system */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20">
        <h4 className="font-bold text-white flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-xs font-bold">COMBO</span>
          Sistema de combos
        </h4>
        <p className="text-sm text-accent-silver/60 leading-relaxed">
          Cuando activas <span className="text-purple-400 font-semibold">2 o mas patrones</span> en la misma cadena,
          obtienes un bonus de combo que multiplica tus puntos.
        </p>
        <div className="flex items-center gap-3 text-sm">
          <span className="px-2 py-1 rounded-lg bg-surface-800 text-accent-silver/60">2 patrones = x1.15</span>
          <span className="px-2 py-1 rounded-lg bg-surface-800 text-accent-silver/60">3 patrones = x1.35</span>
          <span className="px-2 py-1 rounded-lg bg-surface-800 text-accent-silver/60">4+ = x1.6</span>
        </div>
      </div>
    </div>
  );
}

function SectionAdvanced() {
  return (
    <div className="flex flex-col gap-8">
      {/* Special tiles */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Fichas especiales</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Durante la run puedes encontrar fichas con propiedades unicas.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <TileView tile={DEMO_TILES["wild"]!} disabled size="sm" animate={false} />
            <span className="font-bold text-purple-400">Wild</span>
            <p className="text-xs text-accent-silver/50 text-center">
              Conecta con cualquier numero
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <TileView tile={DEMO_TILES["golden"]!} disabled size="sm" animate={false} />
            <span className="font-bold text-yellow-400">Dorada</span>
            <p className="text-xs text-accent-silver/50 text-center">
              Duplica su valor base (x2)
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-700/30 border border-surface-600/30">
            <TileView tile={DEMO_TILES["locked"]!} disabled size="sm" animate={false} />
            <span className="font-bold text-accent-silver/60">Bloqueada</span>
            <p className="text-xs text-accent-silver/50 text-center">
              Se desbloquea al activar un patron
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <TileView tile={DEMO_TILES["mirror"]!} disabled size="sm" animate={false} />
            <span className="font-bold text-cyan-400">Espejo</span>
            <p className="text-xs text-accent-silver/50 text-center">
              Conecta con cualquier extremo. Copia el valor al que se conecta
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <TileView tile={DEMO_TILES["bomb"]!} disabled size="sm" animate={false} />
            <span className="font-bold text-red-400">Bomba</span>
            <p className="text-xs text-accent-silver/50 text-center">
              +15 puntos extra de base al jugarla en la cadena
            </p>
          </div>
        </div>
      </div>

      {/* Animated special tiles demo */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Fichas especiales en accion</h3>
        <AnimatedDemo
          steps={[
            {
              hand: [DEMO_TILES["mirror"]!, DEMO_TILES["bomb"]!, DEMO_TILES["wild"]!],
              chain: [DEMO_TILES["3-5"]!],
              score: 8,
              label: "Tienes fichas especiales en tu mano",
              highlight: "demo-mirror",
            },
            {
              hand: [DEMO_TILES["bomb"]!, DEMO_TILES["wild"]!],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["mirror"]!],
              score: 16,
              label: "Espejo conecta al 5 y copia el valor. Ahora ambos extremos son 5",
            },
            {
              hand: [DEMO_TILES["wild"]!],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["mirror"]!, DEMO_TILES["bomb"]!],
              score: 40,
              label: "Bomba da +15 extra al score base. Gran impulso",
            },
            {
              hand: [],
              chain: [DEMO_TILES["3-5"]!, DEMO_TILES["mirror"]!, DEMO_TILES["bomb"]!, DEMO_TILES["wild"]!],
              score: 48,
              label: "Wild conecta con cualquier numero sin restriccion",
            },
          ]}
          intervalMs={2800}
        />
      </div>

      {/* Relics */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Reliquias</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Las reliquias son <span className="text-accent-gold font-semibold">mejoras permanentes</span> que modifican las reglas del juego.
          Cada una pertenece a una <span className="text-white font-semibold">familia</span> con color y efecto propios.
          Juntar <span className="text-accent-gold font-semibold">3 reliquias de la misma familia</span> activa un bonus de set permanente.
        </p>

        {/* Relic card showcase */}
        <div className="flex flex-wrap justify-center gap-3 py-4">
          <div className="flex flex-col items-center gap-2">
            <RelicCard relicId="cadena_tensa" size="sm" showName={true} />
            <span className="text-[10px] text-accent-silver/40">Patron · Rara</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RelicCard relicId="seis_dorado" size="sm" showName={true} />
            <span className="text-[10px] text-accent-silver/40">Numero · Comun</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RelicCard relicId="dominio_total" size="sm" showName={true} />
            <span className="text-[10px] text-accent-silver/40">Fuerza · Legendaria</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RelicCard relicId="maestro_cadenas" size="sm" showName={true} />
            <span className="text-[10px] text-accent-silver/40">Cadena · Legendaria</span>
          </div>
        </div>

        {/* Family bonuses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: "Patron", color: "text-amber-300 bg-amber-900/30 border-amber-400/20", bonus: "+25% bonus de patrones" },
            { label: "Numero", color: "text-blue-300 bg-blue-900/30 border-blue-400/20", bonus: "+30 puntos fijos" },
            { label: "Fuerza", color: "text-red-300 bg-red-900/30 border-red-400/20", bonus: "x1.10 multiplicador global" },
            { label: "Cadena", color: "text-purple-300 bg-purple-900/30 border-purple-400/20", bonus: "+4 pts por ficha en cadena" },
            { label: "Accion", color: "text-emerald-300 bg-emerald-900/30 border-emerald-400/20", bonus: "+1 accion por ronda" },
          ].map((f) => (
            <div key={f.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${f.color}`}>
              <span className={`text-xs font-bold uppercase tracking-widest ${f.color.split(" ")[0]}`}>{f.label}</span>
              <span className="text-xs text-accent-silver/50 flex-1">{f.bonus}</span>
              <span className="text-[10px] text-accent-silver/30">x3</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active mutations */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Poderes activos</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Desde la ronda 3 puedes obtener <span className="text-purple-400 font-semibold">poderes activos</span> como recompensa.
          Se activan durante la partida gastando acciones o puntos.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "Barajar mano", cost: "3 acc", desc: "Devuelve fichas al pool y roba nuevas" },
            { name: "Toque salvaje", cost: "2 acc", desc: "Tu proxima ficha se vuelve wild" },
            { name: "Detonacion", cost: "2 acc", desc: "+25 puntos instantaneos" },
            { name: "Segundo aliento", cost: "20 pts", desc: "Recupera 4 acciones extra" },
            { name: "Reversa", cost: "1 acc", desc: "Intercambia extremos de la cadena" },
            { name: "Ancla", cost: "2 acc", desc: "La proxima ficha no cambia el extremo" },
          ].map((mut) => (
            <div key={mut.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/15">
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-purple-300">{mut.name}</span>
                <span className="text-xs text-accent-silver/50">{mut.desc}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-400/60 whitespace-nowrap">{mut.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shop */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Tienda</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Cada 3 rondas aparece la tienda donde puedes gastar <span className="text-accent-gold font-semibold">oro</span> en:
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <span className="text-sm font-medium text-purple-400">Reliquias</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <span className="text-sm font-medium text-yellow-400">Dorar ficha</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-sm font-medium text-red-400">Eliminar ficha</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <span className="text-sm font-medium text-green-400">Reducir meta</span>
          </div>
        </div>
      </div>

      {/* Bosses */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Jefes</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Cada 5 rondas enfrentas un <span className="text-red-400 font-semibold">jefe</span> con restricciones especiales.
          Algunos tienen <span className="text-red-300 font-semibold">varias fases</span> con restricciones diferentes.
          Derrotarlo otorga oro extra y a veces una reliquia.
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-xs font-bold">JEFE</span>
              <span className="font-bold text-white">El Coleccionista</span>
            </div>
            <p className="text-sm text-accent-silver/50">
              Restriccion: No puedes usar fichas dobles
            </p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-xs font-bold">MULTI-FASE</span>
              <span className="font-bold text-white">El Inquisidor</span>
            </div>
            <p className="text-sm text-accent-silver/50">
              Fase 1: Solo dobles. Fase 2: Minimo 4 fichas en cadena
            </p>
          </div>
        </div>
      </div>

      {/* Actions system */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Acciones</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Cada ronda tienes un <span className="text-white font-semibold">limite de acciones</span>.
          Jugar, descartar y robar fichas consume acciones. Cuando se agotan, la ronda termina automaticamente.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-800/50 border border-surface-600/30">
            <span className="font-mono font-bold text-lg text-white">12+</span>
            <span className="text-xs text-accent-silver/50 text-center">Acciones base por ronda</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <span className="font-mono font-bold text-lg text-red-400">2</span>
            <span className="text-xs text-accent-silver/50 text-center">Descartes por ronda</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <span className="font-mono font-bold text-lg text-blue-400">1-2</span>
            <span className="text-xs text-accent-silver/50 text-center">Robos por ronda</span>
          </div>
        </div>
      </div>

      {/* Game modes */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Modos de juego</h3>
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/20">
            <span className="font-bold text-accent-gold">Nueva Run</span>
            <p className="text-sm text-accent-silver/50 mt-1">
              Modo clasico. Avanza rondas, supera metas, construye tu build.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <span className="font-bold text-blue-400">Reto Diario</span>
            <p className="text-sm text-accent-silver/50 mt-1">
              Una run con seed fija. Todos juegan la misma partida. Compara tu score.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <span className="font-bold text-purple-400">Endless</span>
            <p className="text-sm text-accent-silver/50 mt-1">
              Sin meta. Juega hasta que quieras parar. Score acumulado infinito.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
        <h4 className="font-bold text-blue-400">Consejos para empezar</h4>
        <ul className="flex flex-col gap-2 text-sm text-accent-silver/70">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">1.</span>
            <span>Prioriza cadenas largas para activar "Cadena Simple" y "Cadena Larga"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">2.</span>
            <span>Guarda los dobles para activar "Doble Doble" o "Triple Doble"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">3.</span>
            <span>Las reliquias se acumulan - elige las que complementen tu estrategia</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">4.</span>
            <span>Ahorra oro para la tienda, las reliquias compradas son muy fuertes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">5.</span>
            <span>Las fichas espejo y bomba aparecen en rondas avanzadas, usalas estrategicamente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">6.</span>
            <span>Los poderes activos cuestan recursos, activalos solo cuando valga la pena</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function SectionMeta() {
  const blocks: { title: string; body: string; color: string; border: string; tag: string }[] = [
    {
      title: "Consumibles",
      tag: "Tarot",
      body: "Items de un solo uso que encuentras en tiendas y recompensas. Cambian la mano, revelan fichas, transforman dobles o dan puntos de golpe. Se guardan hasta que los uses.",
      color: "bg-blue-500/5",
      border: "border-blue-500/25",
    },
    {
      title: "Ediciones de ficha",
      tag: "Edicion",
      body: "Algunas fichas tienen una edicion (Dorada, Holografica, etc) que les da un bonus extra al jugarlas. Se descubren en el codex y se pueden generar mediante eventos o con el Alquimista.",
      color: "bg-amber-500/5",
      border: "border-amber-500/25",
    },
    {
      title: "Cartas celestes",
      tag: "Firmamento",
      body: "Cartas coleccionables que multiplican tu puntaje segun su firmamento (Solar, Lunar, Estelar, Cometa, Profundo). Cada firmamento potencia un estilo distinto: dobles, cadenas largas, patrones rapidos o pocas fichas.",
      color: "bg-cyan-500/5",
      border: "border-cyan-500/25",
    },
    {
      title: "Alineaciones",
      tag: "Set bonus",
      body: "Tener 3 cartas del mismo firmamento activa la Alineacion de ese firmamento con un bonus extra. Si acumulas 5 cartas distintas activas la Alineacion Cosmica: tu jugada mas devastadora.",
      color: "bg-purple-500/5",
      border: "border-purple-500/25",
    },
    {
      title: "Pacto Sagrado",
      tag: "Modifier",
      body: "Una ficha elegida al empezar la run queda marcada como pactada: +100 al jugarla. Evoluciona si la juegas dentro de un patron o con una edition. Con alineacion cosmica activa su bonus se amplifica un 20%.",
      color: "bg-red-500/5",
      border: "border-red-500/25",
    },
    {
      title: "Modo Caos",
      tag: "Modifier",
      body: "Cada ronda rolea un giro aleatorio: buff (score+, meta-, accion+), nerf (meta+, accion-, patron-) o raro (shuffle, consumible gratis). Activado con el modifier Caos; da +10% score base de compensacion.",
      color: "bg-violet-500/5",
      border: "border-violet-500/25",
    },
    {
      title: "Codex",
      tag: "Discovery",
      body: "Registra automaticamente cada patron, jefe, carta celeste y giro de caos que descubres. Los no descubiertos se muestran como '???' hasta que los vivas en una run. Accesible desde el menu principal.",
      color: "bg-indigo-500/5",
      border: "border-indigo-500/25",
    },
    {
      title: "Legado",
      tag: "Herencia",
      body: "Al terminar cada run se guarda automaticamente 1 carta celeste + 1 consumible. Tu proxima run los hereda al iniciar: un toast te avisa cuando activas el legado. Conecta tus partidas entre si.",
      color: "bg-emerald-500/5",
      border: "border-emerald-500/25",
    },
    {
      title: "Personajes",
      tag: "Passive",
      body: "Cada personaje empieza con condiciones distintas: Arquitecto (+5 por patron), Matematica (+score con dobles), Bombardero (bombas), Mercader (+oro), Alquimista (editions), Oraculo (celeste gratis), Cartografo (+score), Ermitaño (pacto gratis).",
      color: "bg-teal-500/5",
      border: "border-teal-500/25",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white">Capas meta del juego</h3>
        <p className="text-accent-silver/70 leading-relaxed">
          Dominix se profundiza con sistemas que se revelan a medida que juegas.
          No necesitas dominar todos desde el inicio: emerge naturalmente al explorar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {blocks.map((b) => (
          <div
            key={b.title}
            className={`p-4 rounded-xl border ${b.color} ${b.border}`}
          >
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h4 className="text-sm font-bold text-white">{b.title}</h4>
              <span className="text-[9px] uppercase tracking-widest font-bold text-accent-silver/40">
                {b.tag}
              </span>
            </div>
            <p className="text-xs text-accent-silver/65 leading-relaxed">{b.body}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t border-surface-700/30">
        <h4 className="text-sm font-bold text-accent-silver/80">Atajos de teclado</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-800/60 border border-surface-600/30">
            <span className="text-accent-silver/60">1-7</span>
            <span className="text-accent-silver/80">Jugar ficha</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-800/60 border border-surface-600/30">
            <span className="text-accent-silver/60">R</span>
            <span className="text-accent-silver/80">Robar</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-800/60 border border-surface-600/30">
            <span className="text-accent-silver/60">U</span>
            <span className="text-accent-silver/80">Deshacer</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  const [activeSection, setActiveSection] = useState("basics");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-900/95 backdrop-blur-sm border-b border-surface-600/30">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg text-sm text-accent-silver/60 hover:text-accent-silver border border-surface-600/30 hover:border-surface-600 transition-all"
            >
              Volver
            </button>
            <h1 className="font-display font-black text-xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
              Como jugar
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="sticky top-[73px] z-10 bg-surface-900/95 backdrop-blur-sm border-b border-surface-600/30">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  activeSection === section.id
                    ? "bg-accent-gold/15 text-accent-gold border border-accent-gold/30"
                    : "bg-surface-800/50 text-accent-silver/50 border border-surface-600/30 hover:text-accent-silver/70"
                ].join(" ")}
              >
                <span className="w-5 h-5 rounded-full bg-surface-700 flex items-center justify-center text-xs font-bold">
                  {section.icon}
                </span>
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === "basics" && <SectionBasics />}
            {activeSection === "gameplay" && <SectionGameplay />}
            {activeSection === "patterns" && <SectionPatterns />}
            {activeSection === "advanced" && <SectionAdvanced />}
            {activeSection === "meta" && <SectionMeta />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      <div className="sticky bottom-0 bg-surface-900/95 backdrop-blur-sm border-t border-surface-600/30">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const idx = SECTIONS.findIndex(s => s.id === activeSection);
                if (idx > 0) setActiveSection(SECTIONS[idx - 1]!.id);
              }}
              disabled={activeSection === SECTIONS[0]!.id}
              className="px-4 py-2 rounded-lg text-sm text-accent-silver/50 hover:text-accent-silver disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>
            
            <div className="flex gap-1.5">
              {SECTIONS.map((section) => (
                <div
                  key={section.id}
                  className={[
                    "w-2 h-2 rounded-full transition-all",
                    activeSection === section.id ? "bg-accent-gold" : "bg-surface-600"
                  ].join(" ")}
                />
              ))}
            </div>
            
            {activeSection === SECTIONS[SECTIONS.length - 1]!.id ? (
              <button
                onClick={onBack}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-accent-gold text-surface-900 hover:brightness-110 transition"
              >
                Empezar a jugar
              </button>
            ) : (
              <button
                onClick={() => {
                  const idx = SECTIONS.findIndex(s => s.id === activeSection);
                  if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1]!.id);
                }}
                className="px-4 py-2 rounded-lg text-sm text-accent-gold hover:bg-accent-gold/10 transition-all"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
