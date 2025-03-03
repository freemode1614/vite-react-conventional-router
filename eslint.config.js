import { default as config } from "@moccona/eslint-config/flat/node";

/**
 */
export default [
  ...config,
  {
    ignores: ["example/**"],
  },
];
