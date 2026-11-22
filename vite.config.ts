/// <reference types="vitest" />
declare const process: any;
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
// @ts-expect-error Build-only JavaScript plugin; it adds no browser dependency.
import { offlineBuild } from "./tools/offlineBuild.mjs";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = "Dominix";

export default defineConfig({
  plugins: [react(), offlineBuild(__dirname)],
  base: isGitHubPages ? `/${repoName}/` : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Same tested worker mode locally and in CI; avoids Windows fork-kill EPERM.
    pool: "threads",
    environment: "node",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx,mjs}"],
  },
  build: {
    // Increase warning threshold (we now ship multiple sub-MB chunks intentionally)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Large, rarely-changing libs go into their own long-cached chunks
          react: ["react", "react-dom"],
          "framer-motion": ["framer-motion"],
          "react-icons": ["react-icons/gi"],
          confetti: ["canvas-confetti"],
        },
      },
    },
  },
});
