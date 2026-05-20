import { motion } from "framer-motion";
import { ALL_CHAOS_TWISTS } from "@/engine/chaos";
import type { ChaosTwist } from "@/engine/chaos";
import { GiTwirlyFlower, GiSparkles, GiCrossedSwords, GiDiceTwentyFacesTwenty } from "react-icons/gi";

interface ChaosScreenProps {
  onBack: () => void;
}

export default function ChaosScreen({ onBack }: ChaosScreenProps) {
  const goodTwists = ALL_CHAOS_TWISTS.filter((t) => t.tone === "good");
  const badTwists = ALL_CHAOS_TWISTS.filter((t) => t.tone === "bad");
  const neutralTwists = ALL_CHAOS_TWISTS.filter((t) => t.tone === "neutral");

  return (
    <div className="min-h-screen flex flex-col items-center p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-accent-silver/60 hover:text-white transition-colors text-sm"
        >
          ← Volver
        </button>
        <div className="flex items-center gap-3">
          <GiDiceTwentyFacesTwenty size={32} className="text-purple-400" />
          <h1 className="text-3xl font-display font-black bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            Modo Caos
          </h1>
        </div>
        <div className="w-16" />
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full p-6 rounded-2xl bg-purple-500/10 border border-purple-500/30 mb-8"
      >
        <p className="text-center text-sm text-accent-silver/80 leading-relaxed">
          Cada ronda, un <span className="font-bold text-purple-300">giro aleatorio</span> modifica las reglas del juego.
          Adapta tu estrategia para aprovechar los beneficios y sobrevivir a los desafíos.
        </p>
      </motion.div>

      {/* Good Twists */}
      <TwistSection
        title="Beneficios"
        icon={GiSparkles}
        color="green"
        twists={goodTwists}
      />

      {/* Bad Twists */}
      <TwistSection
        title="Desafíos"
        icon={GiCrossedSwords}
        color="red"
        twists={badTwists}
      />

      {/* Neutral Twists */}
      <TwistSection
        title="Neutrales"
        icon={GiTwirlyFlower}
        color="purple"
        twists={neutralTwists}
      />
    </div>
  );
}

interface TwistSectionProps {
  title: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: "green" | "red" | "purple";
  twists: ChaosTwist[];
}

function TwistSection({ title, icon: Icon, color, twists }: TwistSectionProps) {
  const colorConfig = {
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-300",
      titleBg: "bg-green-500/20",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-300",
      titleBg: "bg-red-500/20",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-300",
      titleBg: "bg-purple-500/20",
    },
  };

  const config = colorConfig[color];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} className={config.text} />
        <h2 className={`text-lg font-bold ${config.text}`}>{title}</h2>
        <span className="text-xs text-accent-silver/40 font-mono">({twists.length})</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {twists.map((twist, index) => (
          <motion.div
            key={twist.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-xl ${config.bg} ${config.border} border`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.titleBg} ${config.border} border flex items-center justify-center`}>
                <Icon size={16} className={config.text} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm ${config.text} mb-1`}>{twist.name}</h3>
                <p className="text-xs text-accent-silver/70 leading-relaxed">{twist.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
