import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
const { chromium } = await import(process.argv[2]);
const config = JSON.parse(await readFile(process.argv[4], "utf8"));
const browser = await chromium.launch({ executablePath: process.argv[3], headless: true });
const report = [];
try {
  const page = await browser.newPage();
  for (const item of config) {
    await mkdir(path.dirname(item.archive), { recursive: true });
    await mkdir(path.dirname(item.output), { recursive: true });
    await copyFile(item.source, item.archive);
    const data = await readFile(item.archive);
    const result = await page.evaluate(async ({ png, smoothing }) => {
      const image = new Image(); image.src = `data:image/png;base64,${png}`; await image.decode();
      const size = 128, canvas = document.createElement("canvas"); canvas.width = size * 7; canvas.height = size;
      const ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = smoothing; ctx.imageSmoothingQuality = "high";
      for (let value = 0; value < 7; value++) {
        const col = value % 3, row = Math.floor(value / 3);
        const left = Math.round(col * image.width / 3), top = Math.round(row * image.height / 3);
        const width = Math.round((col + 1) * image.width / 3) - left, height = Math.round((row + 1) * image.height / 3) - top;
        ctx.drawImage(image, left, top, width, height, value * size, 0, size, size);
      }
      const faceCanvas = document.createElement("canvas"); faceCanvas.width = faceCanvas.height = size;
      const faceContext = faceCanvas.getContext("2d"); faceContext.imageSmoothingEnabled = false;
      const faces = [];
      for (let value = 0; value < 7; value++) {
        faceContext.clearRect(0, 0, size, size);
        faceContext.drawImage(canvas, value * size, 0, size, size, 0, 0, size, size);
        faces.push(faceCanvas.toDataURL("image/webp", .96).split(",")[1]);
      }
      return { width: image.width, height: image.height, atlas: canvas.toDataURL("image/webp", .96).split(",")[1], faces };
    }, { png: data.toString("base64"), smoothing: item.smoothing ?? false });
    const atlas = Buffer.from(result.atlas, "base64"); await writeFile(item.output, atlas);
    const directory = path.join(path.dirname(item.archive), "faces", item.id);
    await mkdir(directory, { recursive: true });
    const faces = [];
    for (let value = 0; value < 7; value++) {
      const file = path.join(directory, `${value}.webp`), bytes = Buffer.from(result.faces[value], "base64");
      await writeFile(file, bytes); faces.push({ value, file, bytes: bytes.length });
    }
    report.push({ id: item.id, source: item.archive, sourceWidth: result.width, sourceHeight: result.height, sourceBytes: data.length, output: item.output, width: 896, height: 128, frames: 7, frameSize: 128, bytes: atlas.length, faces, encoding: `Chrome Canvas WebP, quality 0.96, ${item.smoothing ? "high-quality smoothed" : "nearest-neighbour"} scaling` });
  }
} finally { await browser.close(); }
await writeFile(process.argv[5], JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
