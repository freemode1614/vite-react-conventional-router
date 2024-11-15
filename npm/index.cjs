'use strict';

var pluginutils = require('@rollup/pluginutils');
var nodepath2 = require('path');
var fg = require('fast-glob');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var nodepath2__default = /*#__PURE__*/_interopDefault(nodepath2);
var fg__default = /*#__PURE__*/_interopDefault(fg);

// src/index.ts
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
var FILE_PATH_SEP = nodepath2__default.default.sep;
var ROUTE_PATH_SEP = "/";
var collectRoutePages = (pages, ignore) => {
  const pageModules = [];
  let routes = [];
  for (const pattern of pages) {
    let files = fg__default.default.sync(pattern, {
      deep: Infinity,
      ignore: [...DEFAULT_IGNORE_PATTERN, ...ignore ?? []]
    }).map((file) => file.split(FILE_PATH_SEP));
    for (const file of files) {
      pageModules.push(nodepath2__default.default.resolve(file.join(FILE_PATH_SEP)));
    }
    while (true) {
      const group = files.map((file) => file[0]);
      if (new Set(group).size > 1) {
        break;
      } else {
        files = files.map((file) => file.slice(1));
      }
    }
    routes = [
      ...routes,
      ...files.map((file) => file.join(FILE_PATH_SEP)).flat()
    ];
  }
  return routes.map((s) => filePathToRoutePath(s)).map((route, index) => {
    return {
      path: route,
      element: pageModules[index]
    };
  });
};
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
    if (routeA.path.split(FILE_PATH_SEP).length === 1 && routeA.path === "") {
      return condition;
    }
    return condition && routeB.path.split(FILE_PATH_SEP).length - routeA.path.split(FILE_PATH_SEP).length === 1;
  }
  return false;
};
var reserved_route_filed_keys = {
  [LAYOUT_FILE_NAME]: LAYOUT_FILE_NAME,
  [ERROR_BOUNDARY_FILE_NAME]: ERROR_BOUNDARY_FILE_NAME,
  [LOADER_FILE_NAME]: LOADER_FILE_NAME,
  [HANDLE_FILE_NAME]: HANDLE_FILE_NAME
};
function collectRouteFieldKeyRoute(routes) {
  const testRoutePath = (routePath) => {
    return Object.keys(reserved_route_filed_keys).map((fieldKey) => {
      return validRouteFieldKeyRegexp(fieldKey, routePath);
    }).some((result) => result);
  };
  return routes.filter(
    (route) => testRoutePath(nodepath2__default.default.basename(route.element))
  );
}
var reserved_root_field_keys = {
  [NOT_FOUND_FILE_NAME]: NOT_FOUND_FILE_NAME,
  [LAYOUT_FILE_NAME]: LAYOUT_FILE_NAME,
  [LOADER_FILE_NAME]: LOADER_FILE_NAME
};
function collectRootRouteRelatedRoute(routes) {
  return Object.assign(
    Object.keys(reserved_root_field_keys).reduce(
      (object, fieldKey) => ({
        ...object,
        [fieldKey]: routes.find((route) => route.path === fieldKey)
      }),
      {}
    ),
    {
      routes: routes.filter(
        (route) => !Object.keys(reserved_root_field_keys).includes(
          route.path
        )
      )
    }
  );
}
var arrangeRoutes = (isolateRoutes, parent, subRoutesPathAppendToParent, sideEffectRoutes = []) => {
  const subs = isolateRoutes.filter(
    (route) => isSubPath(parent.path, route.path)
  );
  const { handle, loader, errorBoundary, layout } = Object.keys(
    reserved_route_filed_keys
  ).reduce(
    (object, fieldKey) => ({
      ...object,
      [fieldKey]: sideEffectRoutes.find((route) => {
        return isFieldKeyRoute(parent, route, fieldKey);
      })
    }),
    {}
  );
  subRoutesPathAppendToParent.push(
    ...subs.map((s) => ROUTE_PATH_SEP + s.path)
  );
  Object.assign(parent, {
    path: ROUTE_PATH_SEP + parent.path,
    loader: loader?.element,
    handle: handle?.element,
    children: subs.map(
      (sub) => arrangeRoutes(
        isolateRoutes,
        sub,
        subRoutesPathAppendToParent,
        sideEffectRoutes
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
      `const { default: handle_ } = await import("${route.handle}");`,
      `handle = handle_;`
    ].join("\n;") : "";
    const loader = route.loader ? [
      "async (...args) => {",
      `const { default: loader_ } = await import("${route.loader}");`,
      "return loader_(...args);",
      "}"
    ].join("\n") : "undefined";
    return `{
        path: "${route.path}",
        loader: ${loader},
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
var deepCopy = (data) => JSON.parse(JSON.stringify(data));
var stripSlash = (filepath) => {
  return filepath.replace(/^\//, "").replace(/\/$/, "");
};
var filePathToRoutePath = (filepath) => {
  filepath = filepath.replace(nodepath2__default.default.extname(filepath), "").replaceAll(".", FILE_PATH_SEP) + nodepath2__default.default.extname(filepath);
  const path_ = filepath.endsWith(PLUGIN_MAIN_PAGE_FILE) ? stripSlash(filepath.replace(PLUGIN_MAIN_PAGE_FILE, "")) : stripSlash(filepath.replace(nodepath2__default.default.extname(filepath), ""));
  return path_.split(FILE_PATH_SEP).map((seg) => {
    if (seg.startsWith(DYNAMIC_ROUTE_FLAG)) {
      return seg.replace(DYNAMIC_ROUTE_FLAG, ":");
    }
    if (seg.startsWith(OPTIONAL_ROUTE_FLAG)) {
      const [, p] = new RegExp(`^\\${OPTIONAL_ROUTE_FLAG}(.+)`).exec(seg) ?? [];
      return p ? `:${p}?` : seg;
    }
    return seg;
  }).join(FILE_PATH_SEP);
};
var isSubPath = (parentPath, subPath) => {
  if (parentPath !== "" && subPath.startsWith(parentPath) && subPath.split(ROUTE_PATH_SEP).length - parentPath.split(ROUTE_PATH_SEP).length === 1) {
    return true;
  }
  return false;
};

// src/index.ts
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
        const allRoutes = collectRoutePages(include, exclude);
        const subRoutesPathAppendToParent = [];
        const {
          routes,
          "404": notFoundRoute,
          layout: rootLayoutRoute
        } = collectRootRouteRelatedRoute(allRoutes);
        const sideEffectRoutes = collectRouteFieldKeyRoute(routes);
        if (notFoundRoute) {
          subRoutesPathAppendToParent.push(`/${notFoundRoute.path}`);
        }
        const isolateRoutes = routes.filter(
          (r) => !new Set(sideEffectRoutes.map((route) => route.element)).has(
            r.element
          )
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
        isolateRoutes.filter((r) => r.path.split("/").length === 1).forEach(
          (route) => arrangeRoutes(
            isolateRoutes,
            route,
            subRoutesPathAppendToParent,
            sideEffectRoutes
          )
        );
        const intermediaRoutes = isolateRoutes.filter(
          (r) => !subRoutesPathAppendToParent.includes(r.path)
        );
        subRoutesPathAppendToParent.length = 0;
        intermediaRoutes.filter((r) => r.path.split("/").length > 2).forEach(
          (route) => arrangeRoutes(
            intermediaRoutes,
            route,
            subRoutesPathAppendToParent,
            sideEffectRoutes
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

module.exports = ConventionalRouter;
//# sourceMappingURL=index.cjs.map

module.exports = exports.default;
//# sourceMappingURL=index.cjs.map