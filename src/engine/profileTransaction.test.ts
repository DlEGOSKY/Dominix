import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PROFILE_TRANSACTION_KEY as KEY, recoverProfileTransaction, withProfileTransaction } from "./profileTransaction";
import { journalCurrentRun } from "./runCheckpoint";

vi.mock("./runCheckpoint", () => ({ journalCurrentRun: vi.fn().mockResolvedValue(false) }));
const keys = ["save", "xp", "history", "run"];
const prepared = (entries: Array<[string, string | null]>) => JSON.stringify({version:1,id:"interrupted",phase:"prepared",entries});
beforeEach(() => { localStorage.clear(); vi.mocked(journalCurrentRun).mockReset().mockResolvedValue(false); });
afterEach(() => vi.restoreAllMocks());

describe("durable terminal profile settlement", () => {
  it("records the before-image before the first profile write and commits only after all writes", () => {
    localStorage.setItem("save", "old");
    expect(withProfileTransaction(keys, () => {
      const record = JSON.parse(localStorage.getItem(KEY)!);
      expect(record.phase).toBe("prepared");
      expect(record.entries).toEqual([["save","old"],["xp",null],["history",null],["run",null]]);
      localStorage.setItem("save", "complete");localStorage.setItem("xp", "15");
    })).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY)!).phase).toBe("settled");
    expect(localStorage.getItem("save")).toBe("complete");expect(localStorage.getItem("xp")).toBe("15");
  });

  it("does not start accounting if the durable before-image cannot be saved", () => {
    localStorage.setItem("save", "old");const native = localStorage.setItem.bind(localStorage);
    vi.spyOn(localStorage,"setItem").mockImplementation((key,value) => { if (key === KEY) throw new Error("quota"); native(key,value); });
    const action = vi.fn();expect(withProfileTransaction(keys,action)).toBe(false);expect(action).not.toHaveBeenCalled();expect(localStorage.getItem("save")).toBe("old");
  });

  it("restores every profile key and the retired run after interruption before commit", async () => {
    localStorage.setItem(KEY,prepared([["save","old"],["xp","10"],["history",null],["run","unfinished"]]));
    localStorage.setItem("save","partial");localStorage.setItem("xp","25");localStorage.setItem("history","duplicate");
    localStorage.setItem("other-app","untouched");
    expect(await recoverProfileTransaction(keys)).toEqual({ok:true,skipRunJournal:true});
    expect(localStorage.getItem("save")).toBe("old");expect(localStorage.getItem("xp")).toBe("10");expect(localStorage.getItem("history")).toBeNull();expect(localStorage.getItem("run")).toBe("unfinished");expect(localStorage.getItem("other-app")).toBe("untouched");
    expect(await recoverProfileTransaction(keys)).toEqual({ok:true,skipRunJournal:true});expect(localStorage.getItem("xp")).toBe("10");
  });

  it("keeps a committed profile and never requests stale run-journal recovery", async () => {
    localStorage.setItem(KEY,JSON.stringify({version:1,id:"committed",phase:"settled"}));
    localStorage.setItem("save","1");localStorage.setItem("xp","15");
    expect(await recoverProfileTransaction(keys)).toEqual({ok:true,skipRunJournal:true});
    expect(localStorage.getItem("save")).toBe("1");expect(localStorage.getItem("xp")).toBe("15");expect(localStorage.getItem("run")).toBeNull();
    expect(localStorage.getItem(KEY)).not.toBeNull(); // IndexedDB is deliberately unavailable.
  });

  it("retains the before-image and blocks a second settlement until restoration can finish", async () => {
    const raw = prepared([["save","old"]]);localStorage.setItem(KEY,raw);localStorage.setItem("save","partial");
    const native = localStorage.setItem.bind(localStorage);
    const blocked = vi.spyOn(localStorage,"setItem").mockImplementation((key,value) => {if(key==="save")throw new Error("blocked");native(key,value);});
    expect(await recoverProfileTransaction(keys)).toEqual({ok:false,skipRunJournal:true});
    const action=vi.fn();expect(withProfileTransaction(keys,action)).toBe(false);expect(action).not.toHaveBeenCalled();expect(localStorage.getItem(KEY)).toBe(raw);
    blocked.mockRestore();expect((await recoverProfileTransaction(keys)).ok).toBe(true);expect(localStorage.getItem("save")).toBe("old");
  });

  it("rolls back if the commit receipt fails after all progression writes", () => {
    localStorage.setItem("save","old");const native=localStorage.setItem.bind(localStorage);let failed=false;
    vi.spyOn(localStorage,"setItem").mockImplementation((key,value)=>{if(key===KEY&&JSON.parse(value).phase==="settled"&&!failed){failed=true;throw new Error("commit denied");}native(key,value);});
    expect(withProfileTransaction(keys,()=>{localStorage.setItem("save","new");localStorage.setItem("xp","15");})).toBe(false);
    expect(localStorage.getItem("save")).toBe("old");expect(localStorage.getItem("xp")).toBeNull();
  });

  it("retires the receipt only after the durable run journal acknowledges it", async () => {
    let acknowledge!: (value:boolean)=>void;
    vi.mocked(journalCurrentRun).mockReturnValue(new Promise(resolve=>{acknowledge=resolve;}));
    expect(withProfileTransaction(keys,()=>localStorage.setItem("save","done"))).toBe(true);expect(localStorage.getItem(KEY)).not.toBeNull();
    acknowledge(true);await Promise.resolve();await Promise.resolve();expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("does not let an older journal acknowledgement erase a newer recovery record", async () => {
    let acknowledge!: (value:boolean)=>void;
    vi.mocked(journalCurrentRun).mockReturnValue(new Promise(resolve=>{acknowledge=resolve;}));
    expect(withProfileTransaction(keys,()=>localStorage.setItem("save","done"))).toBe(true);
    const newer=prepared([["save","done"]]);localStorage.setItem(KEY,newer);acknowledge(true);await Promise.resolve();await Promise.resolve();expect(localStorage.getItem(KEY)).toBe(newer);
  });

  it.each(["not JSON",JSON.stringify({version:2,id:"future",phase:"settled"}),prepared([["other-app","overwrite"]]),prepared([["save","one"],["save","two"]])])("preserves data and the record for invalid recovery input", async raw => {
    localStorage.setItem(KEY,raw);localStorage.setItem("save","keep");localStorage.setItem("other-app","keep");
    expect((await recoverProfileTransaction(keys)).ok).toBe(false);expect(localStorage.getItem("save")).toBe("keep");expect(localStorage.getItem("other-app")).toBe("keep");expect(localStorage.getItem(KEY)).toBe(raw);
  });

  it("does not bypass ordinary run recovery when there is no profile transaction", async () => {
    expect(await recoverProfileTransaction(keys)).toEqual({ok:true,skipRunJournal:false});expect(journalCurrentRun).not.toHaveBeenCalled();
  });
});
