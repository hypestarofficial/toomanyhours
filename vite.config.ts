import { defineConfig, loadEnv } from "vite"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
import tailwindcssAutoReference from "vite-plugin-vue-tailwind-auto-reference"
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      react(),
      tailwindcss(),
      tailwindcssAutoReference(),
      svgr(),
      ViteImageOptimizer({
        png: { quality: 80 },
        jpg: { quality: 80 },
        webp: { quality: 80 },
      }),
    ],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    server: {
      // Bind to all interfaces so the dev server is reachable from other
      // machines on the LAN, not just localhost.
      host: true,
      port: 3100,
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          // Without this the API sees only Vite's own connection, so every
          // user would share one rate-limit bucket. The API trusts
          // X-Forwarded-For from loopback only, which is where this comes from.
          xfwd: true,
        },
      },
    },
  }
})
