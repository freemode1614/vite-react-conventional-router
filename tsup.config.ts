import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["./src/index.ts"],
    outDir: "./npm",
    dts: true,
    format: ["esm", "cjs"],
    sourcemap: true,
    clean: process.env.NODE_ENV === "production",
    treeshake: true,
    shims: true,
  }
]);
