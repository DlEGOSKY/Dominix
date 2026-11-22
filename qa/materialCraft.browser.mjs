import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
const { chromium } = await import(process.argv[2] || "playwright");
const browser = await chromium.launch({ executablePath: process.argv[3], headless: true });
const output = process.argv[4];
const results = [];
try {
  for (const reduced of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: reduced ? "reduce" : "no-preference" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(String(e)));
    await page.goto(process.env.DOMINIX_QA_URL || "http://127.0.0.1:5178/qa/ui.html?scene=tactical", { waitUntil: "networkidle" });
    if (!reduced && output) {
      await page.getByRole("button", { name: "Acabados", exact: true }).click();
      await page.getByRole("heading", { name: "Materiales · acabado de taller" }).waitFor();
      await page.screenshot({ path: join(output, "materiales-taller-escritorio-2026-11-14.jpg"), fullPage: true, type: "jpeg", quality: 92 });
      await page.getByRole("heading", { name: "imperium", exact: true }).locator("..").screenshot({ path: join(output, "imperium-taller-2026-11-14.jpg"), type: "jpeg", quality: 92 });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('section [data-skin]').last().scrollIntoViewIfNeeded();
      await page.screenshot({ path: join(output, "materiales-taller-movil-2026-11-14.jpg"), fullPage: true, type: "jpeg", quality: 92 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
      await page.setViewportSize({ width: 1280, height: 1000 });
      await page.getByRole("button", { name: "Mesa táctica", exact: true }).click();
    }
    await page.getByText(/^Score 20/).waitFor();
    await page.waitForTimeout(550);
    await page.evaluate(() => {
      window.craftAnimationEvents = [];
      document.addEventListener("animationstart", event => {
        if (event.target.matches?.("[data-placement-feedback]")) window.craftAnimationEvents.push(event.animationName);
      });
    });
    await page.getByRole("button", { name: /^Jugar 1 \| 4 a la izquierda/ }).click();
    await page.getByText(/^Score 501/).waitFor();
    await page.waitForTimeout(550);
    const animation = await page.evaluate(() => ({
      starts: window.craftAnimationEvents,
      cues: [...document.querySelectorAll("[data-placement-feedback]")].map(el => ({ opacity: getComputedStyle(el).opacity, duration: getComputedStyle(el).animationDuration, iterations: getComputedStyle(el).animationIterationCount })),
    }));
    assert.equal(animation.starts.length, reduced ? 0 : 1, "Only the placed tile pulses");
    assert.equal(animation.cues.length, reduced ? 0 : 3);
    assert(animation.cues.every(c => c.opacity === "0" && c.iterations === "1"));
    await page.getByRole("button", { name: "Restricción QA: sin comodín", exact: true }).click();
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.craftAnimationEvents.length), reduced ? 0 : 1, "Ordinary rerenders do not replay feedback");
    await page.getByRole("button", { name: "Deshacer QA", exact: true }).click();
    await page.getByText(/^Score 20/).waitFor();
    assert.equal(errors.length, 0);
    results.push({ reducedMotion: reduced, animation, preview: 481, scoreAfter: 501, undo: 20, errors });
    await context.close();
  }
} finally {
  await browser.close();
  if (output) await writeFile(join(output, "materiales-taller-verificacion-2026-11-14.json"), JSON.stringify(results, null, 2));
}
console.log(JSON.stringify(results, null, 2));
