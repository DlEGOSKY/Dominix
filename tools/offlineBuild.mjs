import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

/** Emit an offline asset list and a worker revision for this exact build. */
export function offlineBuild(root) {
  return {
    name: "dominix-offline-build",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle).filter(file => file.startsWith("assets/") || file === "index.html").sort();
      const worker = readFileSync(path.join(root, "public/sw.js"), "utf8");
      const hash = createHash("sha256").update(worker).update(JSON.stringify(files));
      for (const file of files) {
        const output = bundle[file];
        hash.update(output.type === "chunk" ? output.code : output.source);
      }
      for (const file of ["manifest.json", "icon.svg", "icon-192.png", "icon-512.png", "licenses/Inter-OFL.txt", "licenses/JetBrainsMono-OFL.txt"]) hash.update(readFileSync(path.join(root, "public", file)));
      const revision = `v5-${hash.digest("hex").slice(0, 12)}`;
      this.emitFile({ type: "asset", fileName: "offline-assets.json", source: JSON.stringify(files) });
      this.emitFile({ type: "asset", fileName: "sw.js", source: worker.replace('"v5-source"', JSON.stringify(revision)) });
    },
  };
}
