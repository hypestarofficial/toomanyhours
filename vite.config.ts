import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
import tailwindcssAutoReference from "vite-plugin-vue-tailwind-auto-reference"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tailwindcssAutoReference()],
  server: {
    port: 3100,
  },
})
