import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Plain module logic with a stubbed fetch — no DOM needed, so the node
    // environment keeps the setup (and the dependency list) small.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
