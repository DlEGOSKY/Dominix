declare const process: any;
import { defineConfig } from "vite";
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
});
