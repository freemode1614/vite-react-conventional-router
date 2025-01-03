import tsconfigpaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  server: { port: 5173 },
  plugins: [tsconfigpaths()],
  test: {
    include: ["__tests__/**/*.spec.ts"],
    globals: true,
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      include: ["src/**"],
      provider: "istanbul", // or 'v8'
    },
  },
});
