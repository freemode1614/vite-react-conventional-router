import { defineConfig } from "vitest/config";

export default defineConfig({
  server: { port: 5173 },
  test: {
    include: ["e2e/**/*.spec.ts"],
    globals: true,
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
