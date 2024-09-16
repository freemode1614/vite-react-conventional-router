import type { Plugin } from "vite";

const PLUGIN_NAME = "react-conventional-router";

export default function ConventionalRouter(): Plugin {
  return {
    name: PLUGIN_NAME,
    buildStart: {
      order: "pre",
      handler() {
        console.log(`${PLUGIN_NAME}-> buildStart`);
        this.info(`${PLUGIN_NAME}-> buildStart`);
      },
    },
  };
}
