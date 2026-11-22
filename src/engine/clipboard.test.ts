import { afterEach, expect, it, vi } from "vitest";
import { copyText } from "./clipboard";
afterEach(() => vi.unstubAllGlobals());
it.each([undefined, {}])("does not report a copy without Clipboard API", navigator => {
  vi.stubGlobal("navigator", navigator);
  return expect(copyText("seed")).resolves.toBe(false);
});
it("waits for the browser acknowledgement before reporting success", async () => {
  let complete!: () => void;
  const write = vi.fn(() => new Promise<void>(resolve => { complete = resolve; }));
  vi.stubGlobal("navigator", { clipboard: { writeText: write } });
  let done = false;
  const result = copyText("ABC123").then(ok => { done = true; return ok; });
  await Promise.resolve(); expect(done).toBe(false);
  complete(); expect(await result).toBe(true); expect(write).toHaveBeenCalledExactlyOnceWith("ABC123");
});
it.each([false, true])("contains synchronous and asynchronous permission failures (%s)", async asynchronous => {
  vi.stubGlobal("navigator", { clipboard: { writeText: () => { if (asynchronous) return Promise.reject(new Error("denied")); throw new Error("denied"); } } });
  expect(await copyText("summary")).toBe(false);
});
