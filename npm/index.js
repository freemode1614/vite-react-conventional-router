import fg from 'fast-glob';

// src/index.ts
var PLUGIN_NAME = "react-conventional-router";
function ConventionalRouter(options) {
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
      }
    },
    load() {
    }
  };
}

export { ConventionalRouter as default };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map