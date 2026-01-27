import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
import tailwindcssAutoReference from "vite-plugin-vue-tailwind-auto-reference"
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react(), tailwindcss(), tailwindcssAutoReference(), svgr()],
    server: {
      port: 3100,
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  }
})
