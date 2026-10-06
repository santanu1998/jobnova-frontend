import path from "path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

const projectDirectory = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectDirectory, "VITE_")
  const apiTarget =
    env.VITE_API_BASE_URL || "http://jobnova-santanu.duckdns.org:5000"

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(projectDirectory, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
        "/auth": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})