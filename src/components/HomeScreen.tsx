import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SavedData } from "@/types/domino";
import { getDailyDateString, hasDailyBeenPlayed } from "@/engine/daily";
import { getNextUnlocks } from "@/engine/unlocks";
import { ALL_RELICS } from "@/engine/relics";
import { loadProgression, getXPForNextLevel, LEVEL_REWARDS, loadActiveSkin, type LevelReward } from "@/engine/progression";
import { loadAscension } from "@/engine/ascension";
import { useTranslation } from "@/engine/i18n";
import { localizeRelic, localizeSkin } from "@/engine/i18nContent";
import { getTileSkin } from "@/engine/tileSkins";
import { useReduceMotion } from "@/hooks/useSettings";
import ModifierSelect from "./ModifierSelect";
import ResourceSheet from "./ResourceSheet";
import "./HomeScreen.css";

export interface HomeScreenProps {
  onContinue?: () => void;
  continueRound?: number;
  recoveryStatus?: string;
  savedData: SavedData;
  onStartRun: (modifiers: string[]) => void;
  onStartDaily: () => void;
  onShowWeekly: () => void;
  onStartEndless: () => void;
  onShowAchievements: () => void;
  onShowLeaderboard: () => void;
  onShowHowToPlay: () => void;
  onShowStats: () => void;
  onShowCollection: () => void;
  onShowAppearance?: () => void;
  onShowTalents: () => void;
  onShowCharacters: () => void;
  onShowSettings: () => void;
  onShowCodex: () => void;
  onShowChaos: () => void;
}
function Chevron() { return <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 3 5 5-5 5"/></svg>; }
function NextUnlockRow({ unlock }: { unlock: ReturnType<typeof getNextUnlocks>[number] }) {
  const { t } = useTranslation();
  const relic = ALL_RELICS.find(r => r.id === unlock.relicId);
  if (!relic) return null;
  return <li><span>{localizeRelic(relic).name}</span><p>{t(`home.unlock.${unlock.condition.type}`, { n: unlock.condition.value })}</p></li>;
}

/** Keep play on the surface; other content remains one deliberate action away. */
export default function HomeScreen(props: HomeScreenProps) {
  const { t } = useTranslation();
  const reduced = useReduceMotion();
  const [panel, setPanel] = useState<"menu" | "modes" | "progress" | null>(null);
  const [showModifiers, setShowModifiers] = useState(false);
  const prog = loadProgression();
  const xp = getXPForNextLevel(prog.xp);
  const nextReward = LEVEL_REWARDS.find(r => r.level > prog.level);
  const nextUnlocks = getNextUnlocks(props.savedData, 2);
  const skin = getTileSkin(loadActiveSkin());
  const ascension = loadAscension();
  const dailyPlayed = hasDailyBeenPlayed();
  const go = (action: () => void) => { setPanel(null); action(); };
  const startNew = () => { setPanel(null); setShowModifiers(true); };
  const rewardName = (reward: LevelReward) => {
    if (reward.type === "tile_skin") return t("home.reward.skin", { name: localizeSkin(getTileSkin(String(reward.value))).name });
    if (reward.type === "starting_relic") {
      const relic = ALL_RELICS.find(r => r.id === reward.value);
      return t("home.reward.relic", { name: relic ? localizeRelic(relic).name : String(reward.value) });
    }
    return t(`home.reward.${reward.type}`, { n: reward.value });
  };
  const menuGroups = [
    { title: "home.group.prepare", items: [{ key: "home.characters", action: props.onShowCharacters }, { key: "home.talents", action: props.onShowTalents }] },
    { title: "home.group.library", items: [{ key: "home.collection", action: props.onShowCollection }, { key: "home.codex", action: props.onShowCodex }] },
    { title: "home.group.history", items: [{ key: "home.stats", action: props.onShowStats }, { key: "home.leaderboard", action: props.onShowLeaderboard }, { key: "home.achievements", action: props.onShowAchievements }] },
  ];
  const modes = [
    { key: dailyPlayed ? "home.dailyComplete" : "home.dailyChallenge", detail: "home.mode.dailyDetail", tone: "blue", action: props.onStartDaily, disabled: dailyPlayed },
    { key: "home.weeklyChallenge", detail: "home.mode.weeklyDetail", tone: "green", action: props.onShowWeekly },
    { key: "home.endlessRun", detail: "home.mode.endlessDetail", tone: "purple", action: props.onStartEndless },
    { key: "home.chaos", detail: "home.mode.chaosDetail", tone: "rose", action: props.onShowChaos },
  ];

  return <div className="home-screen ambient-grain">
    <div aria-hidden="true" className="home-atmosphere"/>
    <nav className="home-navigation" aria-label={t("home.navigation")}>
      <button type="button" className="home-help" onClick={props.onShowHowToPlay}>{t("home.howToPlay")}</button>
      <div className="home-navigation-right"><button type="button" className="home-nav-link" onClick={props.onShowCollection}>{t("home.collection")}</button><button type="button" className="home-menu-trigger" aria-haspopup="dialog" aria-expanded={panel === "menu"} onClick={() => setPanel("menu")}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 4h12M2 8h12M2 12h12"/></svg>{t("home.menu")}</button></div>
    </nav>
    <div className="home-main">
      <motion.header className="home-identity" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}><h1>DOMINIX</h1><p>{t("home.tagline")}</p></motion.header>
      <section className="home-play" aria-label={t("home.play")}>
        <motion.button type="button" data-home-primary={props.onContinue ? "continue" : "new"} aria-label={props.onContinue ? t("resume.continue", { round: props.continueRound ?? 1 }) : t("home.newRun")} className="home-primary btn-premium" whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: .985 }} onClick={props.onContinue ?? startNew}>{props.onContinue ? <span className="home-continue-copy"><span>{t("home.continueAction")}</span><span className="home-continue-round">{t("score.round", { n: props.continueRound ?? 1 })}</span></span> : t("home.newRun")}<Chevron/></motion.button>
        {(["recovered", "invalid", "unavailable"].includes(props.recoveryStatus ?? "")) && <p role="status" className="home-recovery">{t(`resume.${props.recoveryStatus}`)}</p>}
        <div className="home-secondary-actions">{props.onContinue && <button type="button" className="home-secondary" onClick={startNew}>{t("home.newRun")}</button>}<button type="button" className="home-secondary" aria-haspopup="dialog" aria-expanded={panel === "modes"} onClick={() => setPanel("modes")}>{t("home.otherModes")}<Chevron/></button></div>
      </section>
      <div className="home-summary">
        <button type="button" className="home-progress-trigger" aria-haspopup="dialog" aria-expanded={panel === "progress"} onClick={() => setPanel("progress")}><span className="home-level-seal" aria-hidden="true">{prog.level}</span><span className="home-progress-copy"><span className="home-summary-title">{t("home.progress")}</span><span className="home-summary-detail">{t("home.levelN", { n: prog.level })} <span aria-hidden="true">·</span> {xp.current}/{xp.needed} XP</span><span className="home-mini-track" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, xp.progress * 100))}%` }}/></span></span><Chevron/></button>
        <button type="button" className="home-appearance" onClick={props.onShowAppearance ?? props.onShowCollection}><span className="home-skin-preview" aria-hidden="true">{skin.valueIcon ? (skin.valueFace ?? skin.valueIcon)(1) : <svg width="22" height="30" viewBox="0 0 22 30" fill="none" stroke="currentColor"><rect x="2" y="1" width="18" height="28" rx="4"/><path d="M5 15h12"/><circle cx="11" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="21" r="1.5" fill="currentColor"/><circle cx="14" cy="24" r="1.5" fill="currentColor"/></svg>}</span><span><span className="home-summary-title">{t("home.appearance")}</span><span className="home-summary-detail">{localizeSkin(skin).name}</span></span><Chevron/></button>
      </div>
    </div>
    <footer className="home-footer">{t(`home.flavor.${props.savedData.totalRuns % 6}`)}</footer>
    {panel && <ResourceSheet key={panel} mobileOnly={false} title={t(`home.panel.${panel}`)} onClose={() => setPanel(null)}>
      {panel === "menu" && <div className="home-menu-content"><div className="home-menu-groups">{menuGroups.map(group => <section key={group.title}><h3>{t(group.title)}</h3>{group.items.map(item => <button key={item.key} type="button" onClick={() => go(item.action)}>{t(item.key)}<Chevron/></button>)}</section>)}</div><div className="home-menu-bottom"><button type="button" onClick={() => setPanel("modes")}>{t("home.otherModes")}<Chevron/></button><button type="button" onClick={() => go(props.onShowSettings)}>{t("home.settings")}<Chevron/></button></div>{ascension.highestCleared > 0 && <p className="home-ascension">{t("home.ascensionTooltip", { n: ascension.highestCleared })}</p>}</div>}
      {panel === "modes" && <div className="home-modes-content"><p className="home-mode-date">{getDailyDateString()}</p><div className="home-mode-list">{modes.map(mode => <button key={mode.key} type="button" disabled={mode.disabled} aria-label={t(mode.key)} aria-describedby={`home-mode-${mode.tone}`} className="home-mode-card" data-tone={mode.tone} onClick={() => go(mode.action)}><span><strong>{t(mode.key)}</strong><span id={`home-mode-${mode.tone}`}>{t(mode.detail)}</span></span><Chevron/></button>)}</div></div>}
      {panel === "progress" && <div className="home-progress-content">
        {props.savedData.totalRuns === 0 && <p className="home-empty-progress">{t("home.emptyProgress")}</p>}
        <dl className="home-stats">{[{ value: props.savedData.bestRound, label: "home.bestRound" }, { value: props.savedData.bestScore.toLocaleString(), label: "home.bestScore" }, { value: props.savedData.totalRuns, label: "home.totalRuns" }, { value: props.savedData.totalRoundsPlayed, label: "home.totalRounds" }].map(stat => <div key={stat.label}><dt>{t(stat.label)}</dt><dd>{stat.value}</dd></div>)}</dl>
        <div className="home-level-detail"><span>{t("home.levelN", { n: prog.level })}</span><span>{xp.current}/{xp.needed} XP</span></div><div role="progressbar" aria-label={t("home.xpProgress")} aria-valuemin={0} aria-valuemax={xp.needed} aria-valuenow={xp.current} className="home-xp-track"><span style={{ width: `${Math.min(100, Math.max(0, xp.progress * 100))}%` }}/></div>
        {nextReward && <p className="home-reward-hint">{t("home.nextLevelReward", { level: nextReward.level, reward: rewardName(nextReward) })}</p>}
        {nextUnlocks.length > 0 && <section className="home-next-unlocks"><h3>{t("home.nextUnlocks")}</h3><ul>{nextUnlocks.map(unlock => <NextUnlockRow key={unlock.relicId} unlock={unlock}/>)}</ul></section>}
        <button type="button" className="home-panel-action" onClick={() => go(props.onShowStats)}>{t("home.fullStats")}<Chevron/></button>
      </div>}
    </ResourceSheet>}
    <AnimatePresence>{showModifiers && <ModifierSelect bestRound={props.savedData.bestRound} totalRuns={props.savedData.totalRuns} onStart={mods => { setShowModifiers(false); props.onStartRun(mods); }} onCancel={() => setShowModifiers(false)}/>}</AnimatePresence>
  </div>;
}
