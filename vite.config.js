import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/editor.js",
      formats: ["es"],
      fileName: "editor",
      cssFileName: "editor",
    },
    rollupOptions: {
      output: {
        entryFileNames: "editor.js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});