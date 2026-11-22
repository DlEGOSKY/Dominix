import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup as render } from "react-dom/server";
import Hand from "./Hand";
import Chain from "./Chain";
import TileDetails, { tileDetailsLabel } from "./TileDetails";
import { createEmptyChain, placeTile, canPlace } from "@/engine/chain";
import { calculateScore } from "@/engine/score";
import { getPactBonus } from "@/engine/runScore";
import { setLanguage } from "@/engine/i18n";
import type { Tile } from "@/types/domino";

const settings = vi.hoisted(() => ({ showHints: true, showPreview: true }));
vi.mock("@/hooks/useSettings", () => ({ useReduceMotion: () => true, useSettings: () => [settings, vi.fn()] }));
const tile: Tile = { id: "choice", top: 1, bottom: 4 };
const chain = placeTile(createEmptyChain(), { id: "opening", top: 1, bottom: 4 }, "right");
beforeEach(() => { setLanguage("es"); settings.showHints = true; settings.showPreview = true; });

describe("tactical tile presentation", () => {
  it("shows each end's distinct score, including a loss, without replacing the default preview", () => {
    const preview = vi.fn((_tile: Tile, side?: string) => side === "left" ? -12 : 45);
    const html = render(<Hand tiles={[tile]} chain={chain} disabled={false} onPlay={vi.fn()} getScorePreview={preview} />);
    expect(html).toContain('aria-label="Jugar 1 | 4 a la izquierda · -12 puntos previstos"');
    expect(html).toContain('aria-label="Jugar 1 | 4 a la derecha · +45 puntos previstos"');
    expect(html).toContain('aria-label="+45 puntos previstos"');
    expect(preview).toHaveBeenCalledWith(tile, "left"); expect(preview).toHaveBeenCalledWith(tile, "right");
  });

  it("does not invent a zero score when the preview callback is absent", () => {
    const html = render(<Hand tiles={[tile]} chain={chain} disabled={false} onPlay={vi.fn()} />);
    expect(html).toContain('aria-label="Jugar 1 | 4 a la izquierda"');
    expect(html).not.toContain("puntos previstos"); expect(html).not.toContain("hand-side-score");
  });

  it("does not calculate or reveal end previews when the setting is off", () => {
    settings.showPreview = false;
    const preview = vi.fn(() => 98);
    const html = render(<Hand tiles={[tile]} chain={chain} disabled={false} onPlay={vi.fn()} getScorePreview={preview} />);
    expect(html).not.toContain("puntos previstos"); expect(html).not.toContain("hand-side-score");
    expect(preview).not.toHaveBeenCalled();
  });

  it("keeps invalid tiles disabled and offers no play-end controls", () => {
    const html = render(<Hand tiles={[{ id: "blocked", top: 6, bottom: 6 }]} chain={chain} disabled={false} onPlay={vi.fn()} />);
    expect(html).toMatch(/<button[^>]*disabled/);
    expect(html).toContain("No conecta con los extremos"); expect(html).not.toContain("hand-sides");
  });

  it("renders placed tiles as static, fully visible images, with a keyboard description including pact-only effects", () => {
    const placed = placeTile(createEmptyChain(), { ...tile, pact: true }, "right");
    const html = render(<Chain chain={placed} skin="imperium" patternFlash={1} />);
    expect(html).toContain('role="img"'); expect(html).toContain('tabindex="0"');
    expect(html).toContain("Pacto Sagrado"); expect(html).toContain("patrón nuevo");
    expect(html).not.toContain("<button"); expect(html).not.toContain("opacity-40");
    expect(html).not.toContain("opacity:0"); expect(html).not.toContain("scale(0.5)");
    expect(html).not.toContain("data-placement-feedback");
  });

  it("removes chain hint tab stops when hints are off, retaining tile values", () => {
    settings.showHints = false;
    const html = render(<Chain chain={chain} />);
    expect(html).not.toContain('tabindex="0"'); expect(html).toContain("Ficha 1 4");
  });

  it("renders a reduced-motion hand visible on the first frame", () => {
    const html = render(<Hand tiles={[tile]} chain={chain} disabled={false} onPlay={vi.fn()} />);
    expect(html).not.toContain("opacity:0"); expect(html).not.toContain("translateY(30px)");
  });

  it("describes the bomb's real base contribution and matching requirement", () => {
    const bomb: Tile = { id: "bomb", top: 0, bottom: 6, type: "bomb" };
    const html = render(<TileDetails tile={bomb} />);
    expect(html).toContain("+15"); expect(html).toContain("Debe conectar"); expect(html).not.toContain("Detona");
    expect(calculateScore(placeTile(createEmptyChain(), bomb, "right")).baseScore).toBe(25);
    expect(canPlace(chain, bomb, "right")).toBe(false);
  });

  it("describes pact as one placement award with a new-pattern condition", () => {
    const pact = { ...tile, pact: true, edition: "foil" as const };
    expect(tileDetailsLabel(pact)).toContain("Se cobra una vez");
    expect(tileDetailsLabel(pact)).toContain("patrón nuevo");
    expect(getPactBonus(pact, false, [])).toBe(200);
    expect(getPactBonus(pact, true, [])).toBe(300);
  });

  it("explains mirror's opening exception and keeps connection behavior", () => {
    const mirror: Tile = { id: "mirror", top: 2, bottom: 6, type: "mirror" };
    expect(tileDetailsLabel(mirror)).toContain("Si abre la cadena");
    expect(placeTile(createEmptyChain(), mirror, "right").rightEnd).toBe(6);
    expect(placeTile(chain, mirror, "right").rightEnd).toBe(4);
  });

  it("translates type, edition and pact explanations into English", () => {
    setLanguage("en");
    const html = render(<TileDetails tile={{ ...tile, type: "bomb", edition: "polychrome", pact: true }} />);
    expect(html).toContain("Bomb"); expect(html).toContain("Adds +15");
    expect(html).toContain("Sacred Pact"); expect(html).toContain("once per chain");
    expect(html).not.toContain("Pacto Sagrado"); expect(html).not.toContain("tile.details.");
  });
});
