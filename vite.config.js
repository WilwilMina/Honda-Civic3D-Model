// Vite builds the app into ONE self-contained file (dist/index.html) that works offline,
// can be double-clicked, and is served as-is by GitHub Pages.
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  base: "./",
  plugins: [viteSingleFile()],
  build: { target: "es2020", chunkSizeWarningLimit: 4096 },
});
