'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var nodepath2 = require('path');
var pluginutils = require('@rollup/pluginutils');
var fg = require('fast-glob');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var nodepath2__default = /*#__PURE__*/_interopDefault(nodepath2);
var fg__default = /*#__PURE__*/_interopDefault(fg);

// src/index.ts

// src/constants.ts
var DEFAULT_IGNORE_PATTERN = ["node_modules/**"];
var PLUGIN_NAME = "vite-plugin-conventional-router";
var PLUGIN_VIRTUAL_MODULE_NAME = "virtual:routes";
var PLUGIN_MAIN_PAGE_FILE = "index.tsx";
var LAYOUT_FILE_NAME = "layout";
var NOT_FOUND_FILE_NAME = "404";
var ERROR_BOUNDARY_FILE_NAME = "errorBoundary";
var LOADER_FILE_NAME = "loader";
var HANDLE_FILE_NAME = "handle";
var OPTIONAL_ROUTE_FLAG = "$";
var DYNAMIC_ROUTE_FLAG = "@";
var reserved_route_filed_keys = [
  LAYOUT_FILE_NAME,
  ERROR_BOUNDARY_FILE_NAME,
  LOADER_FILE_NAME,
  HANDLE_FILE_NAME
];
var validRouteFieldKeyRegexp = (fieldKey, filepath, options = {}) => {
  if (fieldKey === LOADER_FILE_NAME || fieldKey === HANDLE_FILE_NAME) {
    options.allowTs = true;
  }
  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0,}(${fieldKey})(\\.tsx${options.allowTs ? "?" : ""})$`
  ).test(nodepath2__default.default.basename(filepath));
};
var isFieldKeyRoute = (routeA, routeB, fieldKey) => {
  if (nodepath2__default.default.dirname(routeA.element) === nodepath2__default.default.dirname(routeB.element)) {
    const condition = validRouteFieldKeyRegexp(
      fieldKey,
      routeB.element
    );
    if (routeA.path.split("/").length === 1 && routeA.path === "") {
      return condition;
    }
    return condition && routeB.path.split("/").length - routeA.path.split("/").length === 1;
  }
  return false;
};
function collectRouteFieldKeyRoute(routes) {
  const testRoutePath = (routePath) => {
    return reserved_route_filed_keys.map((fieldKey) => {
      return validRouteFieldKeyRegexp(fieldKey, routePath);
    }).some((result) => result);
  };
  return routes.filter(
    (route) => testRoutePath(nodepath2__default.default.basename(route.element))
  );
}
var reserved_root_field_keys = [
  NOT_FOUND_FILE_NAME,
  LAYOUT_FILE_NAME,
  LOADER_FILE_NAME
];
function collectRootRouteRelatedRoute(routes) {
  return [
    ...reserved_root_field_keys.map(
      (fieldKey) => routes.find((route) => route.path === fieldKey)
    ),
    routes.filter(
      (route) => !reserved_root_field_keys.includes(route.path)
    )
  ];
}

// src/index.ts
var deepCopy = (data) => JSON.parse(JSON.stringify(data));
var stripSlash = (filepath) => {
  return filepath.replace(/^\//, "").replace(/\/$/, "");
};
var filePathToRoutePath = (filepath) => {
  filepath = filepath.replace(nodepath2__default.default.extname(filepath), "").replaceAll(".", "/") + nodepath2__default.default.extname(filepath);
  const path_ = filepath.endsWith(PLUGIN_MAIN_PAGE_FILE) ? stripSlash(filepath.replace(PLUGIN_MAIN_PAGE_FILE, "")) : stripSlash(filepath.replace(nodepath2__default.default.extname(filepath), ""));
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
var collectRoutePages = (pages, ignore) => {
  const pageModules = [];
  let routes = [];
  for (const pattern of pages) {
    let files = fg__default.default.sync(pattern, {
      deep: Infinity,
      ignore: [...DEFAULT_IGNORE_PATTERN, ...ignore ?? []]
    }).map((file) => file.split("/"));
    for (const file of files) {
      pageModules.push(nodepath2__default.default.resolve(file.join("/")));
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
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0,}(${LAYOUT_FILE_NAME})(\\.tsx)$`
  ).test(nodepath2__default.default.basename(filepath));
};
var isLayoutRoute = (route, layoutRoute) => {
  if (nodepath2__default.default.dirname(route.element) === nodepath2__default.default.dirname(layoutRoute.element)) {
    const condition1 = isLayoutFilePath(
      nodepath2__default.default.basename(layoutRoute.element)
    );
    return condition1 && layoutRoute.path.split("/").length - route.path.split("/").length === 1;
  }
  return false;
};
var isErrorBoundaryFilePath = (filepath) => {
  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0,}(${ERROR_BOUNDARY_FILE_NAME})(\\.tsx)$`
  ).test(nodepath2__default.default.basename(filepath));
};
var isErrorBoundaryRoute = (route, errorBoundaryRoute) => {
  if (nodepath2__default.default.dirname(route.element) === nodepath2__default.default.dirname(errorBoundaryRoute.element)) {
    const condition1 = isErrorBoundaryFilePath(
      nodepath2__default.default.basename(errorBoundaryRoute.element)
    );
    if (route.path.split("/").length === 1 && route.path === "") {
      return condition1;
    }
    return condition1 && errorBoundaryRoute.path.split("/").length - route.path.split("/").length === 1;
  }
  return false;
};
var isLoaderFilePath = (filepath) => {
  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0,}(${LOADER_FILE_NAME})(\\.tsx?)$`
  ).test(nodepath2__default.default.basename(filepath));
};
var isLoaderRoute = (route, loaderRoute) => {
  if (nodepath2__default.default.dirname(route.element) === nodepath2__default.default.dirname(loaderRoute.element)) {
    const condition1 = isLoaderFilePath(
      nodepath2__default.default.basename(loaderRoute.element)
    );
    if (route.path.split("/").length === 1 && route.path === "") {
      return condition1;
    }
    return condition1 && loaderRoute.path.split("/").length - route.path.split("/").length === 1;
  }
  return false;
};
var arrangeRoutes = (routes, parent, subRoutesPathAppendToParent, layoutAndErrorBoundaries = []) => {
  const subs = routes.filter((route) => isSubPath(parent.path, route.path));
  const layout = layoutAndErrorBoundaries.find(
    (route) => isFieldKeyRoute(parent, route, LAYOUT_FILE_NAME)
  );
  const errorBoundary = layoutAndErrorBoundaries.find(
    (route) => isFieldKeyRoute(parent, route, ERROR_BOUNDARY_FILE_NAME)
  );
  const loader = layoutAndErrorBoundaries.find(
    (route) => isFieldKeyRoute(parent, route, LOADER_FILE_NAME)
  );
  const handle = layoutAndErrorBoundaries.find(
    (route) => isFieldKeyRoute(parent, route, HANDLE_FILE_NAME)
  );
  subRoutesPathAppendToParent.push(...subs.map((s) => "/" + s.path));
  Object.assign(parent, {
    path: "/" + parent.path,
    loader: loader?.element,
    handle: handle?.element,
    children: subs.map(
      (sub) => arrangeRoutes(
        routes,
        sub,
        subRoutesPathAppendToParent,
        layoutAndErrorBoundaries
      )
    ),
    ErrorBoundary: errorBoundary?.element
  });
  if (layout) {
    const parentCopy = deepCopy(parent);
    return Object.assign(parent, layout, {
      path: parentCopy.path,
      children: [parentCopy],
      // Don't set error boundary in layout
      ErrorBoundary: void 0
    });
  }
  return parent;
};
var stringifyRoutes = (routes) => {
  const code = routes.map((route) => {
    const errorBoundary = route.ErrorBoundary ? [
      `const { default: ErrorBoundary_ } = await import("${route.ErrorBoundary}")`,
      `ErrorBoundary = ErrorBoundary_;`
    ].join("\n;") : "";
    const handle = route.handle ? [
      [
        `const { default: handle_ } = await import("${route.handle}")`,
        `handle = handle_;`
      ].join(";")
    ].join("\n;") : "";
    return `{
        path: "${route.path}",
        loader: async (...args) => {
          const { default: loader_ } = await import("${route.loader}");
          return await loader_(...args);
        },
        async lazy(){
          const { default: Component, initProps ,...rest }  = await import("${route.element}");
          let ErrorBoundary = undefined;
          let loader = undefined;
          let handle = undefined;
          ${errorBoundary}
          ${handle}
          return {
            ...rest, handle, ErrorBoundary, Component
          }
        },
        children: ${!route.children ? "[]" : stringifyRoutes(route.children)}
      }`;
  }).join(",");
  return `[${code}]`;
};
function ConventionalRouter(options) {
  options = { include: [], exclude: [], ...options ?? {} };
  let { include } = options;
  let { exclude } = options;
  const filter = pluginutils.createFilter(include, exclude);
  include = Array.isArray(include) ? include : [include];
  exclude = Array.isArray(exclude) ? exclude : [exclude];
  let devServer;
  return {
    name: PLUGIN_NAME,
    configureServer(server) {
      devServer = server;
    },
    resolveId(source) {
      if (source === PLUGIN_VIRTUAL_MODULE_NAME) {
        return source;
      }
      return null;
    },
    async load(id) {
      if (id === PLUGIN_VIRTUAL_MODULE_NAME) {
        const routes_ = collectRoutePages(include, exclude);
        const subRoutesPathAppendToParent = [];
        const [notFoundRoute, rootLayoutRoute, , routes] = collectRootRouteRelatedRoute(routes_);
        const layoutsAndErrorBoundaries = collectRouteFieldKeyRoute(routes);
        if (notFoundRoute) {
          subRoutesPathAppendToParent.push(`/${notFoundRoute.path}`);
        }
        const layoutsAndErrorBoundariesElements = new Set(
          layoutsAndErrorBoundaries.map((route) => route.element)
        );
        const routesReadyToArrange = routes.filter(
          (r) => !layoutsAndErrorBoundariesElements.has(r.element)
        );
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
        routesReadyToArrange.filter((r) => r.path.split("/").length === 1).forEach(
          (route) => arrangeRoutes(
            routesReadyToArrange,
            route,
            subRoutesPathAppendToParent,
            layoutsAndErrorBoundaries
          )
        );
        const intermediaRoutes = routesReadyToArrange.filter(
          (r) => !subRoutesPathAppendToParent.includes(r.path)
        );
        subRoutesPathAppendToParent.length = 0;
        intermediaRoutes.filter((r) => r.path.split("/").length > 2).forEach(
          (route) => arrangeRoutes(
            intermediaRoutes,
            route,
            subRoutesPathAppendToParent,
            layoutsAndErrorBoundaries
          )
        );
        let finalRoutes = intermediaRoutes.filter((r) => !subRoutesPathAppendToParent.includes(r.path)).map(mapCallback);
        if (rootLayoutRoute) {
          finalRoutes = [
            {
              ...rootLayoutRoute,
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
          if(import.meta.env.DEV) {
            console.log(routes);
          }
          export default routes;
          `
        };
      }
      return null;
    },
    watchChange(id, change) {
      if (filter(id) && (change.event === "create" || change.event === "delete")) {
        devServer.restart();
      }
    }
  };
}

exports.arrangeRoutes = arrangeRoutes;
exports.collectRoutePages = collectRoutePages;
exports.deepCopy = deepCopy;
exports.default = ConventionalRouter;
exports.filePathToRoutePath = filePathToRoutePath;
exports.isErrorBoundaryFilePath = isErrorBoundaryFilePath;
exports.isErrorBoundaryRoute = isErrorBoundaryRoute;
exports.isLayoutFilePath = isLayoutFilePath;
exports.isLayoutRoute = isLayoutRoute;
exports.isLoaderFilePath = isLoaderFilePath;
exports.isLoaderRoute = isLoaderRoute;
exports.isSubPath = isSubPath;
exports.stringifyRoutes = stringifyRoutes;
exports.stripSlash = stripSlash;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map