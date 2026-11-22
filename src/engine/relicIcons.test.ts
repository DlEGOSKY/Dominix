import { describe, expect, it } from "vitest";
import { ALL_RELICS } from "./relics";
import { getRelicIcon } from "./relicIcons";
import { ALL_PATTERNS } from "./patterns";
import { getPatternIcon } from "./patternIcons";

describe("relic visual identities", () => {
  it("gives every catalog relic an explicit, distinct emblem", () => {
    const icons = ALL_RELICS.map(relic => ({ id: relic.id, icon: getRelicIcon(relic.id) }));
    expect(icons.filter(entry => !entry.icon).map(entry => entry.id)).toEqual([]);
    expect(new Set(icons.map(entry => entry.icon)).size).toBe(ALL_RELICS.length);
  });

  it("handles an unknown or obsolete id without inventing an identity", () => {
    expect(getRelicIcon("unknown-relic")).toBeNull();
  });

  it("does not reuse scoring-pattern symbols as relic identities", () => {
    const patternIcons = new Set(ALL_PATTERNS.map(pattern => getPatternIcon(pattern.id)));
    expect(ALL_RELICS.filter(relic => patternIcons.has(getRelicIcon(relic.id))).map(relic => relic.id)).toEqual([]);
  });
});
