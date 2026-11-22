import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup as render } from "react-dom/server";
import Chain from "./Chain";
import { createEmptyChain, placeTile } from "@/engine/chain";
import { setLanguage } from "@/engine/i18n";
vi.mock("@/hooks/useSettings", () => ({ useReduceMotion: () => true, useSettings: () => [{showHints:true}] }));
describe("chain reading order", () => {
  it("numbers a 28 tile chain once in board order and marks only its two ends", () => {
    setLanguage("es");
    let chain = createEmptyChain();
    for (let n = 0; n < 28; n++) chain = placeTile(chain, {id:`t${n}`,top:n%7,bottom:(n+1)%7}, "right");
    const html = render(<Chain chain={chain} skin="imperium" />);
    expect((html.match(/data-chain-position=/g) ?? []).length).toBe(28);
    expect(html).toContain("Posición 28 de 28");
    expect((html.match(/data-chain-end=/g) ?? []).length).toBe(2);
    expect(html).not.toContain("data-placement-feedback");
  });
  it("uses the real exposed end of a mirror rather than its printed value", () => {
    const opening = placeTile(createEmptyChain(), {id:"a",top:1,bottom:2}, "right");
    const chain = placeTile(opening, {id:"mirror",top:4,bottom:6,type:"mirror"}, "right");
    const html = render(<Chain chain={chain} />);
    expect(html).toContain('data-chain-end="right">2');
    expect(html).toContain('data-chain-end="left">');
    expect(html).not.toContain('data-chain-end="right">6');
  });
  it("keeps a short chain free of position counters and translates its accessible order", () => {
    setLanguage("en");
    const html = render(<Chain chain={placeTile(createEmptyChain(), {id:"a",top:0,bottom:3}, "right")} />);
    expect(html).not.toContain('class="chain-index"');
    expect(html).toContain("Position 1 of 1");
    expect(html).toContain("left to right across rows");
  });
});
