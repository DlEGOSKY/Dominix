import { afterEach, describe, expect, it, vi } from "vitest";
import { contactMaterial, playTileArrival } from "./tileArrival";
import { audio } from "./audio";

afterEach(() => vi.restoreAllMocks());
describe("placement contact", () => {
  it.each([["among_us","metal"],["chatarra_lujo","metal"],["diamond","glass"],["emerald","glass"],["roma_eterna","stone"],["ivory","stone"],["default","stone"],
    ["orbital_reactor","metal"],["dragon_forge","metal"],["eclipse_glass","glass"],["alchemist_cabinet","glass"],["sunken_temple","stone"],["midnight_express","wood"]])("gives %s the %s contact", (skin, material) => expect(contactMaterial(skin)).toBe(material));
  it("keeps the confirmation sound and skips all spatial effects with reduced motion", () => {
    const sound = vi.spyOn(audio,"playTileContact").mockImplementation(() => {});
    const target = { animate:vi.fn(),closest:vi.fn() };
    const cancel = playTileArrival(target as unknown as HTMLElement,{id:"a",side:"right",animated:false},{skin:"among_us",reduced:true,fast:false});
    expect(sound).toHaveBeenCalledExactlyOnceWith("metal"); expect(target.animate).not.toHaveBeenCalled(); expect(target.closest).not.toHaveBeenCalled(); cancel();
  });
  it("does not require the animation API to confirm an already committed placement", () => {
    const sound = vi.spyOn(audio,"playTileContact").mockImplementation(() => {});
    const cancel = playTileArrival({} as HTMLElement,{id:"a",side:"left",animated:false},{skin:"diamond",reduced:false,fast:false});
    expect(sound).toHaveBeenCalledExactlyOnceWith("glass"); expect(cancel).toBeTypeOf("function"); cancel();
  });
  it("does not create an audio context to play contact without an unlocked gesture", () => {
    const create = vi.fn(); vi.stubGlobal("AudioContext",create);
    audio.playTileContact("stone"); expect(create).not.toHaveBeenCalled(); vi.unstubAllGlobals();
  });
  it("gives materials distinct bounded contacts, with cancellable local effects", () => {
    const sound = vi.spyOn(audio,"playTileContact").mockImplementation(() => {});
    const firstFrames = new Set<string>();
    for (const skin of ["ivory","emerald","diamond","ruby","obsidian","imperium","midnight_express"]) {
      const animations: Array<{id:string;cancel:ReturnType<typeof vi.fn>;finished:Promise<void>}> = [];
      const create = vi.fn((_frames: Keyframe[], options: KeyframeAnimationOptions) => {
        expect(Number(options.duration)).toBeLessThanOrEqual(300);
        const animation = {id:"",cancel:vi.fn(),finished:new Promise<void>(()=>{})};animations.push(animation);return animation;
      });
      const link = {animate:create}, reflection = {animate:create};
      const piece = {previousElementSibling:{querySelector:()=>link}};
      const entry = {setAttribute:vi.fn(),removeAttribute:vi.fn(),closest:()=>piece};
      const target = {animate:create,closest:()=>entry,querySelector:()=>reflection};
      const cancel = playTileArrival(target as unknown as HTMLElement,{id:"a",side:"right",animated:true},{skin,reduced:false,fast:false});
      firstFrames.add(String(create.mock.calls[0]![0][0]!.transform));
      expect(animations.map(a=>a.id)).toEqual(["dominix-contact","dominix-reflection","dominix-connection"]);
      cancel();cancel();expect(animations.every(a=>a.cancel.mock.calls.length===1)).toBe(true);
      expect(entry.removeAttribute).toHaveBeenCalledExactlyOnceWith("data-contact");
    }
    expect(firstFrames.size).toBe(7);expect(sound).toHaveBeenCalledTimes(7);
  });
});
