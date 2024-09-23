'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var nodepath = require('path');
var fg = require('fast-glob');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var nodepath__default = /*#__PURE__*/_interopDefault(nodepath);
var fg__default = /*#__PURE__*/_interopDefault(fg);

// src/index.ts
var PLUGIN_NAME = "vite-plugin-conventional-router";
var PLUGIN_VIRTUAL_MODULE_NAME = "virtual:routes";
var PLUGIN_MAIN_PAGE_FILE = "index.tsx";
var LAYOUT_FILE_NAME = "layout";
var NOT_FOUND_FILE_NAME = "404";
var ERROR_BOUNDARY_FILE_NAME = "errorBoundary";
var OPTIONAL_ROUTE_FLAG = "$";
var DYNAMIC_ROUTE_FLAG = "@";
var stripSlash = (filepath) => {
  return filepath.replace(/^\//, "").replace(/\/$/, "");
};
var filePathToRoutePath = (filepath) => {
  filepath = filepath.replace(nodepath__default.default.extname(filepath), "").replaceAll(".", "/") + nodepath__default.default.extname(filepath);
  const path_ = filepath.endsWith(PLUGIN_MAIN_PAGE_FILE) ? stripSlash(filepath.replace(PLUGIN_MAIN_PAGE_FILE, "")) : stripSlash(filepath.replace(nodepath__default.default.extname(filepath), ""));
  return path_.split("/").map((seg) => {
    if (seg.startsWith(DYNAMIC_ROUTE_FLAG)) {
      return seg.replace(DYNAMIC_ROUTE_FLAG, ":");
    }
    if (seg.startsWith(OPTIONAL_ROUTE_FLAG)) {
      const [, p] = new RegExp(`^\\${OPTIONAL_ROUTE_FLAG}(.+)`).exec(seg) ?? [];
      return p ? `:${p}?` : seg;
    }
    return seg;
  }).join("/");
};
var collectRoutePages = (pages) => {
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
    routes = [...routes, ...files.map((file) => file.join("/")).flat()];
  }
  return routes.map((s) => filePathToRoutePath(s)).map((route, index) => {
    return {
      path: route,
      element: pageModules[index]
    };
  });
};
var isSubPath = (parentPath, subPath) => {
  if (parentPath !== "" && subPath.startsWith(parentPath) && subPath.split("/").length - parentPath.split("/").length === 1) {
    return true;
  }
  return false;
};
var isLayoutFilePath = (filepath) => {
  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0}(${LAYOUT_FILE_NAME})(\\.tsx)$`
  ).test(nodepath__default.default.basename(filepath));
};
var isLayoutRoute = (route, layoutRoute) => {
  if (nodepath__default.default.dirname(route.element) === nodepath__default.default.dirname(layoutRoute.element)) {
    return isLayoutFilePath(nodepath__default.default.basename(layoutRoute.element));
  }
  return false;
};
var isErrorBoundaryRoute = (route, errorBoundaryRoute) => {
  if (nodepath__default.default.dirname(route.element) === nodepath__default.default.dirname(errorBoundaryRoute.element)) {
    return new RegExp(
      `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0}(${ERROR_BOUNDARY_FILE_NAME})(\\.tsx)$`
    ).test(nodepath__default.default.basename(errorBoundaryRoute.element));
  }
  return false;
};
var arrangeRoutes = (routes, parent, subRoutesPathAppendToParent) => {
  const subs = routes.filter((route) => isSubPath(parent.path, route.path));
  const errorBoundary = routes.find((route) => isErrorBoundaryRoute(parent, route));
  subRoutesPathAppendToParent.push(...subs.map((s) => "/" + s.path));
  if (errorBoundary) {
    subRoutesPathAppendToParent.push(`/${errorBoundary.path}`);
  }
  Object.assign(parent, {
    path: "/" + parent.path,
    children: subs.map((sub) => {
      const layout = routes.find((route) => isLayoutRoute(sub, route));
      if (layout) {
        subRoutesPathAppendToParent.push(`/${layout.path}`);
        if (parent.element.endsWith(PLUGIN_MAIN_PAGE_FILE)) {
          return Object.assign(layout, {
            path: layout.path,
            children: [
              arrangeRoutes(
                routes.filter((r) => r.element !== layout.element),
                sub,
                subRoutesPathAppendToParent
              )
            ]
          });
        }
      }
      return arrangeRoutes(routes, sub, subRoutesPathAppendToParent);
    }),
    ErrorBoundary: errorBoundary ? errorBoundary.element : void 0
  });
  return parent;
};
var stringifyRoutes = (routes) => {
  const code = routes.map(
    (route) => `{
        async lazy(){
          const { default: Component, ...rest }  = await import("${route.element}");
          ${route.ErrorBoundary ? `const { default: ErrorBoundary_ } = await import("${route.ErrorBoundary}");
            ErrorBoundary = ErrorBoundary_;
          ` : ""}
          return {
            ...rest, ErrorBoundary, Component,
          }
        },
        path: "${route.path}",
        children: ${!route.children ? "[]" : stringifyRoutes(route.children)}
      },`
  );
  return `[${code}]`;
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
        let routes = collectRoutePages(pages);
        const subRoutesPathAppendToParent = [];
        const notFoundRoute = routes.find((route) => route.path === NOT_FOUND_FILE_NAME);
        const layoutRoute = routes.find((route) => route.path === LAYOUT_FILE_NAME);
        if (notFoundRoute) {
          subRoutesPathAppendToParent.push(`/${notFoundRoute.path}`);
        }
        if (layoutRoute) {
          subRoutesPathAppendToParent.push(`/${layoutRoute.path}`);
        }
        routes = routes.filter((route) => {
          return notFoundRoute && route.path !== notFoundRoute.path || layoutRoute && layoutRoute.path !== route.path;
        });
        routes.filter((r) => r.path.split("/").length === 1).map((route) => arrangeRoutes(routes, route, subRoutesPathAppendToParent));
        const mapCallback = (r) => {
          if (r.path.startsWith("/")) {
            return r;
          } else {
            return {
              ...r,
              path: `/${r.path}`
            };
          }
        };
        let finalRoutes = routes.filter((r) => !subRoutesPathAppendToParent.includes(r.path)).map(mapCallback);
        if (layoutRoute) {
          finalRoutes = [
            {
              ...layoutRoute,
              path: "/",
              children: finalRoutes
            }
          ];
        }
        if (notFoundRoute) {
          finalRoutes.push({ ...notFoundRoute, path: "*" });
        }
        return {
          code: `
          const routes = ${stringifyRoutes(finalRoutes)};
          console.log(routes);
          export default routes;
`
        };
      }
      return null;
    }
  };
}

exports.arrangeRoutes = arrangeRoutes;
exports.collectRoutePages = collectRoutePages;
exports.default = ConventionalRouter;
exports.filePathToRoutePath = filePathToRoutePath;
exports.isErrorBoundaryRoute = isErrorBoundaryRoute;
exports.isLayoutFilePath = isLayoutFilePath;
exports.isLayoutRoute = isLayoutRoute;
exports.isSubPath = isSubPath;
exports.stringifyRoutes = stringifyRoutes;
exports.stripSlash = stripSlash;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map