import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    rollupOptions: {
      external: ["d3", "vue"],
      output: {
        globals: {
          d3: "d3",
          vue: "Vue",
        },
      },
    },
    lib: {
      entry: resolve(dirname(fileURLToPath(import.meta.url)), "lib/main.ts"),
      name: "BarChart",
      fileName: "bar-chart",
    },
    copyPublicDir: false,
  },
});
