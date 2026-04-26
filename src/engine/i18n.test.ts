import { describe, it, expect, beforeEach } from "vitest";
import { t, setLanguage, getLanguage } from "./i18n";

describe("i18n", () => {
  beforeEach(() => {
    localStorage.clear();
    setLanguage("es");
  });

  it("returns the Spanish string by default", () => {
    expect(t("home.play")).toBe("Jugar");
  });

  it("switches to English when requested", () => {
    setLanguage("en");
    expect(t("home.play")).toBe("Play");
    expect(getLanguage()).toBe("en");
  });

  it("falls back to the key itself for unknown ids (diagnostic, not crash)", () => {
    expect(t("totally.missing.key")).toBe("totally.missing.key");
  });

  it("persists the selected language in localStorage", () => {
    setLanguage("en");
    expect(localStorage.getItem("dominix_lang")).toBe("en");
    setLanguage("es");
    expect(localStorage.getItem("dominix_lang")).toBe("es");
  });
});
