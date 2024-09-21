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
var stripSlash = (filepath) => {
  return filepath.replace(/^\//, "").replace(/\/$/, "");
};
var filePathToRoutePath = (filepath) => {
  return filepath.endsWith(PLUGIN_MAIN_PAGE_FILE) ? stripSlash(filepath.replace(PLUGIN_MAIN_PAGE_FILE, "")) : stripSlash(filepath.replace(filepath, nodepath__default.default.extname(filepath)));
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
var isSubPath = (parentPath, subPath) => {
  if (parentPath !== "" && subPath.startsWith(parentPath) && subPath.split("/").length - parentPath.split("/").length === 1) {
    return true;
  }
  return false;
};
var arrangeRoutes = (routes, parent, subRoutesPathAppendToParent) => {
  const subs = routes.filter((route) => isSubPath(parent.path, route.path));
  subRoutesPathAppendToParent.push(...subs.map((s) => "/" + s.path));
  return Object.assign(parent, {
    path: "/" + parent.path,
    children: subs.map((sub) => arrangeRoutes(routes, sub, subRoutesPathAppendToParent))
  });
};
var stringifyRoutes = (routes) => {
  return `[
    ${routes.map(
    (route, index) => `{
        path: "${route.path}",
        lazy: () => import("${route.element}"),
        children: ${!route.children ? "[]" : stringifyRoutes(route.children)}
        // Component: Page$${index}.default,
        // shouldValidate: !!Page$${index}.shouldValidate
      },`
  )}
  ]`;
};
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
        const subRoutesPathAppendToParent = [];
        routes.filter((r) => r.path.split("/").length === 1).map((route) => arrangeRoutes(routes, route, subRoutesPathAppendToParent));
        const finalRoutes = routes.filter((r) => !subRoutesPathAppendToParent.includes(r.path)).map(
          (r) => r.path.startsWith("/") ? r : {
            ...r,
            path: "/" + r.path
          }
        );
        console.log(finalRoutes);
        return {
          code: `
          const routes = ${stringifyRoutes(finalRoutes)};
          console.log(routes);
          export default routes;`
        };
      }
      return null;
    }
  };
}

module.exports = ConventionalRouter;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map