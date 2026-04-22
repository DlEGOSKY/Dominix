import { motion } from "framer-motion";

export type SanctuaryChoice = "heal_actions" | "remove_tile" | "gold";

interface SanctuaryScreenProps {
  onSelect: (choice: SanctuaryChoice) => void;
  goldReward: number;
  extraActions: number;
}

export default function SanctuaryScreen({ onSelect, goldReward, extraActions }: SanctuaryScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full flex flex-col items-center gap-8"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-400/50 flex items-center justify-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path d="M16 4a8 8 0 1 0 4 14 7 7 0 0 1-4-14z" stroke="currentColor" strokeWidth="1.6" className="text-green-300" fill="currentColor" fillOpacity="0.15" strokeLinejoin="round" />
            </svg>
          </div>
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ boxShadow: "0 0 40px rgba(74, 222, 128, 0.4)" }}
          />
        </motion.div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Santuario</h1>
          <p className="text-accent-silver/60 leading-relaxed max-w-md mx-auto">
            Un momento de calma antes de continuar. Elige un beneficio.
          </p>
        </div>

        {/* Choices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <ChoiceCard
            title="Energia"
            description={`+${extraActions} acciones extra esta ronda`}
            color="blue"
            onClick={() => onSelect("heal_actions")}
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M13 3v7h5l-7 11v-7H6l7-11z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.15" strokeLinejoin="round" />
              </svg>
            }
          />
          <ChoiceCard
            title="Purificar"
            description="Remueve una ficha al azar del pool"
            color="purple"
            onClick={() => onSelect("remove_tile")}
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                <line x1="7" y1="7" x2="17" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            }
          />
          <ChoiceCard
            title="Ofrenda"
            description={`+${goldReward} oro`}
            color="gold"
            onClick={() => onSelect("gold")}
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor">$</text>
              </svg>
            }
          />
        </div>
      </motion.div>
    </div>
  );
}

interface ChoiceCardProps {
  title: string;
  description: string;
  color: "blue" | "purple" | "gold";
  onClick: () => void;
  icon: React.ReactNode;
}

function ChoiceCard({ title, description, color, onClick, icon }: ChoiceCardProps) {
  const colorMap = {
    blue: {
      bg: "hover:bg-blue-500/15",
      border: "border-blue-400/30 hover:border-blue-400/70",
      icon: "text-blue-300",
    },
    purple: {
      bg: "hover:bg-purple-500/15",
      border: "border-purple-400/30 hover:border-purple-400/70",
      icon: "text-purple-300",
    },
    gold: {
      bg: "hover:bg-accent-gold/15",
      border: "border-accent-gold/30 hover:border-accent-gold/70",
      icon: "text-accent-gold",
    },
  }[color];

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-6 rounded-xl bg-surface-800/60 border-2 ${colorMap.border} ${colorMap.bg} transition-all cursor-pointer`}
    >
      <div className={colorMap.icon}>{icon}</div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-xs text-accent-silver/60 text-center leading-relaxed">{description}</p>
    </motion.button>
  );
}
