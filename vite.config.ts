/// <reference types="vitest" />
declare const process: any;
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = "Dominix";

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? `/${repoName}/` : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
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