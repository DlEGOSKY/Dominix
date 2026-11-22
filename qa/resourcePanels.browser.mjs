// Uses an existing Playwright installation; no project dependency is added.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
const { chromium } = await import(process.argv[2] || "playwright");
const browser = await chromium.launch({ executablePath: process.argv[3], headless: true });
const output = process.argv[4];
const results = [];
try {
  for (const lang of ["es", "en"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: lang === "es" ? "reduce" : "no-preference" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(String(e)));
    await page.goto(process.env.DOMINIX_QA_URL || "http://127.0.0.1:5178/qa/ui.html?scene=tactical", { waitUntil: "networkidle" });
    await page.getByRole("combobox", { name: "Idioma de vista QA" }).selectOption(lang);
    const name = lang === "es" ? "Consumibles" : "Consumables";
    const opener = page.getByRole("button", { name: new RegExp(`^${name}`) });
    const dialog = page.getByRole("dialog", { name, exact: true });
    await opener.click();
    await dialog.waitFor();
    assert((await dialog.innerText()).includes(lang === "es" ? "Sin consumibles" : "No consumables"));
    assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden");
    await page.getByRole("button", { name: "Preparar consumible QA" }).evaluate(el => el.focus());
    assert(await dialog.evaluate(el => el.contains(document.activeElement)), "Background must be inert");
    for (let n = 0; n < 3; n++) {
      await page.keyboard.press("Tab");
      assert(await dialog.evaluate(el => el.contains(document.activeElement) || document.activeElement === document.body));
    }
    if (output) await page.screenshot({ path: join(output, `recursos-vacio-${lang}-2026-11-13.jpg`), type: "jpeg", quality: 90 });
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert(await opener.evaluate(el => el === document.activeElement), "Focus must return to opener");
    assert.notEqual(await page.evaluate(() => document.body.style.overflow), "hidden");
    await page.getByRole("button", { name: lang === "es" ? /^Reliquias/ : /^Relics/ }).click();
    const relics = page.getByRole("dialog", { name: lang === "es" ? "Reliquias" : "Relics", exact: true });
    await relics.waitFor();
    if (output) await page.screenshot({ path: join(output, `recursos-reliquias-${lang}-2026-11-13.jpg`), type: "jpeg", quality: 90 });
    await page.keyboard.press("Escape");
    await relics.waitFor({ state: "hidden" });
    await opener.click();
    await dialog.getByRole("button", { name: lang === "es" ? "Cerrar" : "Close", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    await opener.click();
    await page.mouse.click(5, 5);
    await dialog.waitFor({ state: "hidden" });
    await opener.click();
    await page.setViewportSize({ width: 844, height: 390 });
    await dialog.waitFor({ state: "hidden" });
    assert.notEqual(await page.evaluate(() => document.body.style.overflow), "hidden");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Preparar consumible QA" }).click();
    await opener.click();
    if (output) await page.screenshot({ path: join(output, `recursos-consumible-${lang}-2026-11-13.jpg`), type: "jpeg", quality: 90 });
    await dialog.locator(".p-4 > div > button").click();
    await dialog.waitFor({ state: "hidden" });
    await page.getByText("Consumible usado en QA: callback registrado, sin efecto de partida", { exact: true }).waitFor();
    // Existing chain hints must still open with focus and close with Escape.
    const hint = page.locator('[tabindex="0"][aria-label]').first();
    await hint.focus();
    await page.getByRole("tooltip").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("tooltip").waitFor({ state: "hidden" });
    assert.equal(errors.length, 0);
    results.push({ lang, modal: "empty/use/close/backdrop/Escape/resize passed", keyboard: "inert background, Tab, focus return, tooltip passed", errors });
    await context.close();
  }
} finally {
  await browser.close();
  if (output) await writeFile(join(output, "recursos-verificacion-2026-11-13.json"), JSON.stringify(results, null, 2));
}
console.log(JSON.stringify(results, null, 2));
