import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import HomeScreen, { type HomeScreenProps } from "./HomeScreen";
import { setLanguage, t } from "@/engine/i18n";
vi.mock("@/hooks/useSettings",()=>({useReduceMotion:()=>true}));
const savedData={bestRound:6,bestScore:7364,totalRuns:2,totalRoundsPlayed:9};
function props():HomeScreenProps{return {savedData,onStartRun:vi.fn(),onStartDaily:vi.fn(),onShowWeekly:vi.fn(),onStartEndless:vi.fn(),onShowAchievements:vi.fn(),onShowLeaderboard:vi.fn(),onShowHowToPlay:vi.fn(),onShowStats:vi.fn(),onShowCollection:vi.fn(),onShowTalents:vi.fn(),onShowCharacters:vi.fn(),onShowSettings:vi.fn(),onShowCodex:vi.fn(),onShowChaos:vi.fn()};}
beforeEach(()=>{localStorage.clear();setLanguage("es");});
describe("home hierarchy",()=>{
  it("uses the app's main landmark rather than introducing a nested one",()=>{expect(renderToStaticMarkup(<HomeScreen {...props()}/>)).not.toContain("<main");});
  it("makes a new run primary when there is no checkpoint",()=>{
    const html=renderToStaticMarkup(<HomeScreen {...props()} savedData={{bestRound:0,bestScore:0,totalRuns:0,totalRoundsPlayed:0}}/>);
    expect(html).toContain('data-home-primary="new"');expect(html).toContain("Nueva Run");expect(html).not.toContain("Continuar partida");expect(html).toContain("Otros modos");
  });
  it("makes continuing the saved round primary and retains the new-run action",()=>{
    const html=renderToStaticMarkup(<HomeScreen {...props()} onContinue={vi.fn()} continueRound={2}/>);
    expect(html).toContain('data-home-primary="continue"');expect(html).toContain("Continuar partida · ronda 2");expect(html).toContain("Nueva Run");
  });
  it.each(["es","en"] as const)("does not alter saves or skin selection while rendering %s",lang=>{
    setLanguage(lang);localStorage.setItem("dominix_active_skin","among_us");localStorage.setItem("dominix_progression",JSON.stringify({xp:493,level:3,unlockedRewards:[]}));localStorage.setItem("dominix_active_run_v1","checkpoint-sentinel");
    const keys=["dominix_active_skin","dominix_progression","dominix_active_run_v1"],before=keys.map(key=>localStorage.getItem(key));const p=props(),resume=vi.fn();const html=renderToStaticMarkup(<HomeScreen {...p} onContinue={resume} continueRound={2}/>);
    expect(keys.map(key=>localStorage.getItem(key))).toEqual(before);expect(resume).not.toHaveBeenCalled();expect(p.onStartRun).not.toHaveBeenCalled();expect(html).toContain(t("home.otherModes"));expect(html).toContain(t("home.progress"));expect(html).toContain("193/200 XP");expect(html).not.toContain("home.otherModes");
  });
  it("keeps the statistics and full skin chooser off the initial surface",()=>{
    const html=renderToStaticMarkup(<HomeScreen {...props()}/>);
    expect(html).not.toContain(t("home.totalRounds"));expect(html).not.toContain("7,364");expect(html).not.toContain('aria-pressed=');expect(html).toContain(t("home.appearance"));expect(html).toContain(t("home.collection"));
  });
  it.each(["recovered","invalid","unavailable"])("keeps the %s recovery notice visible",status=>{
    const html=renderToStaticMarkup(<HomeScreen {...props()} recoveryStatus={status}/>);expect(html).toContain('role="status"');expect(html).toContain(t(`resume.${status}`));
  });
});
