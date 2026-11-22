import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup as render } from "react-dom/server";
import ScoreBar from "./ScoreBar";
import ScoreSummary from "./ScoreSummary";
import ActionHUD from "./ActionHUD";
import MobileInfoBar from "./MobileInfoBar";
import TileView from "./TileView";
import EditionBadge from "./EditionBadge";
import { setLanguage } from "@/engine/i18n";
import { createActionState } from "@/engine/actions";
import { createEmptyChain, placeTile } from "@/engine/chain";
import { calculateScore } from "@/engine/score";

vi.mock("@/hooks/useSettings", () => ({ useReduceMotion: () => true }));
beforeEach(() => setLanguage("es"));

describe("board readability", () => {
  it.each(["es", "en"] as const)("explains Endless without inventing a mandatory score target in %s", lang => {
    setLanguage(lang);
    const ready = render(<ScoreBar score={35} target={80} round={1} referenceOnly chainLength={1} />);
    expect(ready).toContain(lang === "es" ? "Referencia: 80" : "Reference: 80");
    expect(ready).toContain(lang === "es" ? "Puedes cerrar para avanzar" : "Close the chain to advance");
    expect(ready).not.toContain(lang === "es" ? "Faltan 45" : "45 to go");
    const empty = render(<ScoreBar score={0} target={80} round={1} referenceOnly chainLength={0} />);
    expect(empty).toContain(lang === "es" ? "Juega al menos una ficha" : "Play at least one tile");
  });
  it("announces the actual score and exact target reached without a +0 surplus", () => {
    const html = render(<ScoreBar score={80} target={80} round={2} />);
    expect(html).toContain('aria-label="Ronda 2. Puntuación 80. Meta 80."');
    expect(html).toContain("Meta alcanzada"); expect(html).not.toContain("+0 sobre meta");
    expect(html).toContain('role="progressbar"'); expect(html).toContain('aria-valuenow="80"');
  });

  it("translates the round, target, remaining score and accessible announcement", () => {
    setLanguage("en");
    const html = render(<ScoreBar score={35} target={80} round={3} />);
    expect(html).toContain("Round 3. Score 35. Target 80.");
    expect(html).toContain("Target: 80"); expect(html).toContain("45 to go");
    expect(html).not.toContain("Ronda"); expect(html).not.toContain("faltan");
  });

  it("clamps progress at the target without hiding the surplus or actual score", () => {
    const html = render(<ScoreBar score={125} target={80} round={1} />);
    expect(html).toContain("Puntuación 125"); expect(html).toContain("+45 sobre meta");
    expect(html).toContain('aria-valuenow="80"'); expect(html).toContain('aria-valuemax="80"');
  });

  it("handles a zero target without invalid progress values", () => {
    const html = render(<ScoreBar score={0} target={0} round={1} />);
    expect(html).not.toContain("NaN"); expect(html).not.toContain("Infinity");
    expect(html).toContain('aria-valuenow="1"'); expect(html).toContain('aria-valuemax="1"');
  });

  it("starts reduced-motion score and progress visible", () => {
    const html = render(<ScoreBar score={40} target={80} round={1} />);
    expect(html).toContain("width:50%"); expect(html).not.toContain("opacity:0");
  });

  it.each(["es", "en"] as const)("names action resources and quantities in %s", lang => {
    setLanguage(lang);
    const actions = { ...createActionState(1), usedActions: 3, usedDiscards: 1 };
    const html = render(<ActionHUD actions={actions} poolSize={21} />);
    expect(html).toContain(lang === "es" ? "Acciones restantes: 9 de 12" : "Actions remaining: 9 of 12");
    expect(html).toContain(lang === "es" ? "Fichas en la reserva: 21" : "Tiles in reserve: 21");
    expect(html).toContain(lang === "es" ? "Descartes restantes: 1" : "Discards remaining: 1");
  });

  it("keeps chain component values distinct from run totals and translates their labels", () => {
    let chain = createEmptyChain();
    for (let n = 1; n <= 4; n++) chain = placeTile(chain, { id: `c${n}`, top: n, bottom: n + 1 }, "right");
    const breakdown = calculateScore(chain, ["impulso_inicial"]);
    const es = render(<ScoreSummary breakdown={breakdown} />);
    expect(es).toContain("Longitud"); expect(es).toContain("Reliquias");
    expect(es).toContain("antes de otros efectos de partida");
    setLanguage("en");
    const en = render(<ScoreSummary breakdown={breakdown} />);
    expect(en).toContain("Length"); expect(en).toContain("Relics");
    expect(en).toContain("before other run effects"); expect(en).not.toContain("Patron");
    expect(breakdown.baseScore).toBe(40); expect(breakdown.lengthBonus).toBe(10);
  });

  it("translates mobile resource tabs even when they contain zero items", () => {
    setLanguage("en");
    const html = render(<MobileInfoBar relicIds={[]} consumables={[]} celestials={[]} mutationStates={[]}
      game={null!} onUseConsumable={vi.fn()} onActivateMutation={vi.fn()} />);
    expect(html).toContain("Relics"); expect(html).toContain("Consumables"); expect(html).toContain("Celestials");
    expect(html).not.toContain("Reliquias"); expect(html).not.toContain("Consumibles");
  });

  it.each(["foil", "holo", "polychrome", "negative"] as const)("keeps %s named and visually distinct on small Roman tiles without changing values", edition => {
    const tile = Object.freeze({ id: "edition", top: 4, bottom: 6, type: "bomb" as const, edition, pact: true });
    const html = render(<TileView tile={tile} skin="imperium" size="sm" staticView />);
    expect(html).toContain(`data-edition-badge="${edition}"`);
    expect(html).toContain(`edicion ${edition}`); expect(html).toContain("con Pacto Sagrado");
    expect(html).toContain(">IV</span>"); expect(html).toContain(">VI</span>");
    expect(html).toContain('aria-hidden="true"'); expect(html).toContain("Bomba");
    expect(tile.top).toBe(4); expect(tile.bottom).toBe(6);
  });

  it("gives each edition a different symbol, retaining text when color is unavailable", () => {
    const editions = ["foil", "holo", "polychrome", "negative"] as const;
    const badges = editions.map(edition => render(<EditionBadge edition={edition} />));
    const symbols = badges.map(html => html.match(/<svg.*?<\/svg>/)?.[0]);
    expect(new Set(symbols).size).toBe(4); expect(symbols.every(Boolean)).toBe(true);
    expect(badges[2]).toContain("Poli"); expect(badges[3]).toContain("Neg");
    setLanguage("en"); expect(render(<EditionBadge edition="polychrome" />)).toContain("Poly");
  });
});
