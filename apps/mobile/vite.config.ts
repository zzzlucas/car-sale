import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 6173,
    strictPort: true,
    proxy: {
      "/app": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
    },
  },
})
