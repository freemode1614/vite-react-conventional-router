import nodepath from 'node:path';
import fg from 'fast-glob';
import 'react';

// src/index.ts
var PLUGIN_NAME = "vite-plugin-conventional-router";
var mainPageFile = "index.tsx";
var filePathToRoutePath = (filepath) => {
  return filepath.endsWith(mainPageFile) ? filepath.replace(mainPageFile, "") : filepath.replace(filepath, nodepath.extname(filepath));
};
async function collectRoutePages(pages) {
  const pageModules = [];
  let routes = [];
  for (const pattern of pages) {
    let files = fg.sync(pattern, { deep: Infinity }).map((file) => file.split("/"));
    for (const file of files) {
      pageModules.push(nodepath.resolve(file.join("/")));
    }
    while (true) {
      const group = files.map((file) => file[0]);
      if (new Set(group).size > 1) {
        break;
      } else {
        files = files.map((file) => file.slice(1));
      }
    }
    const files_ = files.map((file) => file.join("/")).flat();
    routes = [...routes, ...files_];
  }
  console.log(routes.map((s) => filePathToRoutePath(s)));
  console.log(pageModules);
  return routes;
}
function ConventionalRouter(options) {
  if (!options) {
    options = { pages: [] };
  }
  let { pages = [] } = options;
  if (!Array.isArray(pages)) {
    pages = [pages];
  }
  return {
    name: PLUGIN_NAME,
    async buildStart() {
      await collectRoutePages(pages);
    },
    load() {
    }
  };
}

export { ConventionalRouter as default };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map