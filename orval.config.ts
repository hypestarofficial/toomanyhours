import { defineConfig } from "orval"

export default defineConfig({
  toomanyhours: {
    input: {
      // Reaches into the sibling repo. The two directories are developed
      // together, and the spec is the contract between them.
      target: "../toomanyhours-api/openapi.yml",
    },
    output: {
      mode: "tags-split",
      target: "src/api/generated/endpoints.ts",
      schemas: "src/api/generated/models",
      client: "react-query",
      // Wipes src/api/generated/ on every run, which is what makes it safe to
      // treat the directory as an artifact rather than source.
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: "./src/api/mutator.ts",
          name: "customFetch",
        },
      },
    },
  },
})
