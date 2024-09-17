import fg, { Pattern } from "fast-glob";
import type { Plugin } from "vite";

const PLUGIN_NAME = "react-conventional-router";

type ConventionalRouterProps = {
  pages: Pattern | Pattern[];
};

export default function ConventionalRouter(options?: Partial<ConventionalRouterProps>): Plugin {
  if (!options) {
    options = { pages: [] };
  }

  let { pages = [] } = options;

  if (!Array.isArray(pages)) {
    pages = [pages];
  }

  const folders = fg.sync(pages, { deep: Infinity, markDirectories: true }).sort((a, b) => b.localeCompare(a, "en"));

  console.log("folders", folders);

  return {
    name: PLUGIN_NAME,
    buildStart: {
      order: "pre",
      handler() {
        // this.info(`${PLUGIN_NAME}-> buildStart`);
      },
    },
    load() {
      // console.log(id);
    },
  };
}
