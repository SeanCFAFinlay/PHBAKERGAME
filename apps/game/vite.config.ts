import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "../../packages/shared/src"),
      "@assets": resolve(__dirname, "../../assets"),
      "@configs": resolve(__dirname, "../../configs")
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "../../assets/**", dest: "assets" },
        { src: "../../configs/**", dest: "configs" }
      ]
    })
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
});