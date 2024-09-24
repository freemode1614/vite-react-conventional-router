import nodepath from 'node:path';
import fg from 'fast-glob';

// src/index.ts
var PLUGIN_NAME = "vite-plugin-conventional-router";
var PLUGIN_VIRTUAL_MODULE_NAME = "virtual:routes";
var PLUGIN_MAIN_PAGE_FILE = "index.tsx";
var LAYOUT_FILE_NAME = "layout";
var NOT_FOUND_FILE_NAME = "404";
var ERROR_BOUNDARY_FILE_NAME = "errorBoundary";
var OPTIONAL_ROUTE_FLAG = "$";
var DYNAMIC_ROUTE_FLAG = "@";
var deepCopy = (data) => JSON.parse(JSON.stringify(data));
var stripSlash = (filepath) => {
  return filepath.replace(/^\//, "").replace(/\/$/, "");
};
var filePathToRoutePath = (filepath) => {
  filepath = filepath.replace(nodepath.extname(filepath), "").replaceAll(".", "/") + nodepath.extname(filepath);
  const path_ = filepath.endsWith(PLUGIN_MAIN_PAGE_FILE) ? stripSlash(filepath.replace(PLUGIN_MAIN_PAGE_FILE, "")) : stripSlash(filepath.replace(nodepath.extname(filepath), ""));
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
  ).test(nodepath.basename(filepath));
};
var isLayoutRoute = (route, layoutRoute) => {
  if (nodepath.dirname(route.element) === nodepath.dirname(layoutRoute.element)) {
    const condition1 = isLayoutFilePath(nodepath.basename(layoutRoute.element));
    return condition1 && layoutRoute.path.split("/").length - route.path.split("/").length === 1;
  }
  return false;
};
var isErrorBoundaryFilePath = (filepath) => {
  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0,}(${ERROR_BOUNDARY_FILE_NAME})(\\.tsx)$`
  ).test(nodepath.basename(filepath));
};
var isErrorBoundaryRoute = (route, errorBoundaryRoute) => {
  if (nodepath.dirname(route.element) === nodepath.dirname(errorBoundaryRoute.element)) {
    const condition1 = isErrorBoundaryFilePath(nodepath.basename(errorBoundaryRoute.element));
    if (route.path.split("/").length === 1) {
      return condition1;
    }
    return condition1 && errorBoundaryRoute.path.split("/").length - route.path.split("/").length === 1;
  }
  return false;
};
var arrangeRoutes = (routes, parent, subRoutesPathAppendToParent, layoutAndErrorBoundaries = []) => {
  const subs = routes.filter((route) => isSubPath(parent.path, route.path));
  const layout = layoutAndErrorBoundaries.find((route) => isLayoutRoute(parent, route));
  const errorBoundary = layoutAndErrorBoundaries.find((route) => isErrorBoundaryRoute(parent, route));
  subRoutesPathAppendToParent.push(...subs.map((s) => "/" + s.path));
  Object.assign(parent, {
    path: "/" + parent.path,
    children: subs.map((sub) => arrangeRoutes(routes, sub, subRoutesPathAppendToParent, layoutAndErrorBoundaries)),
    ErrorBoundary: errorBoundary ? errorBoundary.element : void 0
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
  const code = routes.map(
    (route) => `{
        async lazy(){
          const { default: Component, ...rest }  = await import("${route.element}");
          let ErrorBoundary = undefined;
          ${route.ErrorBoundary ? `const { default: ErrorBoundary_ } = await import("${route.ErrorBoundary}");
            ErrorBoundary = ErrorBoundary_;
          ` : ""}
          return {
            ...rest, ErrorBoundary, Component,
          }
        },
        path: "${route.path}",
        children: ${!route.children ? "[]" : stringifyRoutes(route.children)}
      }`
  ).join(",");
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
        const routes = collectRoutePages(pages);
        const subRoutesPathAppendToParent = [];
        const notFoundRoute = routes.find((route) => route.path === NOT_FOUND_FILE_NAME);
        const rootLayoutRoute = routes.find((route) => route.path === LAYOUT_FILE_NAME);
        const layoutsAndErrorBoundaries = routes.filter((route) => {
          return (isLayoutFilePath(nodepath.basename(route.element)) || isErrorBoundaryFilePath(nodepath.basename(route.element))) && route.path !== rootLayoutRoute?.path;
        });
        if (notFoundRoute) {
          subRoutesPathAppendToParent.push(`/${notFoundRoute.path}`);
        }
        const layoutsAndErrorBoundariesElements = new Set(layoutsAndErrorBoundaries.map((route) => route.element));
        const routesReadyToArrange = routes.filter(
          (r) => !layoutsAndErrorBoundariesElements.has(r.element) && r.element !== notFoundRoute?.element && r.element !== rootLayoutRoute?.element
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
          (route) => arrangeRoutes(routesReadyToArrange, route, subRoutesPathAppendToParent, layoutsAndErrorBoundaries)
        );
        const intermediaRoutes = routesReadyToArrange.filter((r) => !subRoutesPathAppendToParent.includes(r.path));
        subRoutesPathAppendToParent.length = 0;
        intermediaRoutes.filter((r) => r.path.split("/").length > 2).forEach(
          (route) => arrangeRoutes(intermediaRoutes, route, subRoutesPathAppendToParent, layoutsAndErrorBoundaries)
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
          console.log(routes);
          export default routes;
`
        };
      }
      return null;
    }
  };
}

export { arrangeRoutes, collectRoutePages, deepCopy, ConventionalRouter as default, filePathToRoutePath, isErrorBoundaryFilePath, isErrorBoundaryRoute, isLayoutFilePath, isLayoutRoute, isSubPath, stringifyRoutes, stripSlash };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map