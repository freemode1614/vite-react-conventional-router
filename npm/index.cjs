'use strict';

var nodepath = require('path');
var fg = require('fast-glob');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var nodepath__default = /*#__PURE__*/_interopDefault(nodepath);
var fg__default = /*#__PURE__*/_interopDefault(fg);

// src/index.ts
var PLUGIN_NAME = "vite-plugin-conventional-router";
var PLUGIN_VIRTUAL_MODULE_NAME = "virtual:routes";
var PLUGIN_MAIN_PAGE_FILE = "index.tsx";
var filePathToRoutePath = (filepath) => {
  return filepath.endsWith(PLUGIN_MAIN_PAGE_FILE) ? filepath.replace(PLUGIN_MAIN_PAGE_FILE, "").replace(/^\//, "").replace(/\/$/, "") : filepath.replace(filepath, nodepath__default.default.extname(filepath)).replace(/^\//, "").replace(/\/$/, "");
};
function collectRoutePages(pages) {
  const pageModules = [];
  let routes = [];
  for (const pattern of pages) {
    let files = fg__default.default.sync(pattern, { deep: Infinity }).map((file) => file.split("/"));
    for (const file of files) {
      pageModules.push(nodepath__default.default.resolve(file.join("/")));
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
  return routes.map((s) => filePathToRoutePath(s)).map((route, index) => {
    return {
      path: route,
      element: pageModules[index]
    };
  });
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
    resolveId(source) {
      if (source === PLUGIN_VIRTUAL_MODULE_NAME) {
        return source;
      }
      return null;
    },
    async load(id) {
      if (id === PLUGIN_VIRTUAL_MODULE_NAME) {
        const routes = collectRoutePages(pages);
        console.count("generate routes");
        return {
          code: `
          ${routes.map((route, index) => `import * as Page$${index} from "${route.element}"`).join("\n")}

          export default [${routes.map(
            (route, index) => `{
              path: "${route.path}",
              Component: Page$${index}.default,
              shouldValidate: !!Page$${index}.shouldValidate
            },`
          )}]`
        };
      }
      return null;
    }
  };
}

module.exports = ConventionalRouter;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map