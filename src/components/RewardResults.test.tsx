import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import RewardScreen from "./RewardScreen";
import GameOverScreen from "./GameOverScreen";
import { ALL_RELICS, getRelicFamily } from "@/engine/relics";
import { ALL_CONSUMABLES } from "@/engine/consumables";
import type { RunStats } from "@/types/domino";
import { setLanguage } from "@/engine/i18n";

const motionPreference = vi.hoisted(() => ({ reduced: false }));
vi.mock("@/hooks/useSettings", () => ({ useReduceMotion: () => motionPreference.reduced }));
const noop = () => {};
const stats: RunStats = { roundsCompleted: 2, totalScore: 100, patternsActivated: 0, patternBreakdown: {}, relicsCollected: 0, tilesPlayed: 3, highestRoundScore: 100, bossesDefeated: 0, shopPurchases: 0, bestCombo: 0, goldEarned: 10, tilesDiscarded: 0, tilesDrawn: 0, roundScores: [100, 0], roundNumbers: [4, 7] };
beforeEach(() => { motionPreference.reduced = false; setLanguage("es"); });

describe("tactical reward information", () => {
  it("distinguishes completing a family from an already active non-stacking bonus", () => {
    const family = ALL_RELICS.filter(r => getRelicFamily(r) === "numero");
    const relic = family[2]!;
    const option = { id: "test-relic", name: relic.name, description: relic.description, reward: { type: "relic" as const, relic } };
    const render = (owned: string[]) => renderToStaticMarkup(<RewardScreen options={[option]} ownedRelicIds={owned} onSelect={noop} onSkip={noop} />);
    expect(render(family.slice(0, 2).map(r => r.id))).toContain("Activa sinergia");
    const active = render(family.slice(0, 3).map(r => r.id));
    expect(active).toContain("Sinergia ya activa");
    expect(active).not.toContain("Activa sinergia");
    expect(active).not.toContain("4/3");
  });

  it("names the lost consumable only when a replacement is reported", () => {
    const consumable = ALL_CONSUMABLES[0]!;
    const options = [{ id: "test-consumable", name: consumable.name, description: consumable.description, reward: { type: "consumable" as const, consumableId: consumable.id } }];
    const full = renderToStaticMarkup(<RewardScreen options={options} replacedConsumableName="Sol" onSelect={noop} onSkip={noop} />);
    const free = renderToStaticMarkup(<RewardScreen options={options} onSelect={noop} onSkip={noop} />);
    expect(full).toContain("reemplaza Sol");
    expect(free).not.toContain("reemplaza");
  });
});

describe("results accessibility", () => {
  it("does not expose invisible navigation while the recap is running", () => {
    const html = renderToStaticMarkup(<GameOverScreen stats={stats} finalRound={7} relicIds={[]} isNewBest={false} onRestart={noop} onHome={noop} />);
    expect(html).not.toContain("Nueva Run");
    expect(html).not.toMatch(/>Inicio<\/button>/);
    expect(html).not.toContain('role="progressbar"');
  });

  it("exposes zero scores under the actual map depths, including reduced motion", () => {
    motionPreference.reduced = true;
    const html = renderToStaticMarkup(<GameOverScreen stats={stats} finalRound={7} relicIds={[]} isNewBest={false} onRestart={noop} onHome={noop} />);
    expect(html).toMatch(/scope="row"[^>]*>4<\/th>/);
    expect(html).toMatch(/scope="row"[^>]*>7<\/th><td[^>]*>0<\/td>/);
    expect(html).toContain('role="progressbar"');
  });
});
