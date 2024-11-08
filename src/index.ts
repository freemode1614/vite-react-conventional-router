import nodepath from "node:path";

import { createFilter } from "@rollup/pluginutils";
import fg, { Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";
import { type Plugin, ViteDevServer } from "vite";

import {
  DEFAULT_IGNORE_PATTERN,
  DYNAMIC_ROUTE_FLAG,
  ERROR_BOUNDARY_FILE_NAME,
  HANDLE_FILE_NAME,
  LAYOUT_FILE_NAME,
  LOADER_FILE_NAME,
  OPTIONAL_ROUTE_FLAG,
  PLUGIN_MAIN_PAGE_FILE,
  PLUGIN_NAME,
  PLUGIN_VIRTUAL_MODULE_NAME,
} from "./constants";
import {
  collectRootRouteRelatedRoute,
  collectRouteFieldKeyRoute,
  isFieldKeyRoute,
} from "./route";

type ConventionalRouterProps = {
  include: Pattern | Pattern[];
  exclude: Pattern | Pattern[];
};

export const deepCopy = <T = unknown>(data: T): T =>
  JSON.parse(JSON.stringify(data));

/**
 * Strp slash before and after.
 */
export const stripSlash = (filepath: string) => {
  return filepath.replace(/^\//, "").replace(/\/$/, "");
};

/**
 * Route path generate by file path.
 */
export const filePathToRoutePath = (filepath: string) => {
  filepath =
    filepath.replace(nodepath.extname(filepath), "").replaceAll(".", "/") +
    nodepath.extname(filepath);

  const path_ = filepath.endsWith(PLUGIN_MAIN_PAGE_FILE)
    ? stripSlash(filepath.replace(PLUGIN_MAIN_PAGE_FILE, ""))
    : stripSlash(filepath.replace(nodepath.extname(filepath), ""));

  return path_
    .split("/")
    .map((seg) => {
      if (seg.startsWith(DYNAMIC_ROUTE_FLAG)) {
        return seg.replace(DYNAMIC_ROUTE_FLAG, ":");
      }

      if (seg.startsWith(OPTIONAL_ROUTE_FLAG)) {
        const [, p] =
          new RegExp(`^\\${OPTIONAL_ROUTE_FLAG}(.+)`).exec(seg) ?? [];
        return p ? `:${p}?` : seg;
      }

      return seg;
    })
    .join("/");
};

/**
 * Collect files from FS by fast-glob.
 */
export const collectRoutePages = (
  pages: Pattern[],
  ignore: Pattern[],
): NonIndexRouteObject[] => {
  const pageModules: string[] = [];
  let routes: string[] = [];

  for (const pattern of pages) {
    let files = fg
      .sync(pattern, {
        deep: Infinity,
        ignore: [...DEFAULT_IGNORE_PATTERN, ...(ignore ?? [])],
      })
      .map((file) => file.split("/"));

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

  return routes
    .map((s) => filePathToRoutePath(s))
    .map((route, index) => {
      return {
        path: route,
        element: pageModules[index],
      };
    });
};

/**
 * Sub-path evaluation.
 */
export const isSubPath = (parentPath: string, subPath: string) => {
  if (
    parentPath !== "" &&
    subPath.startsWith(parentPath) &&
    subPath.split("/").length - parentPath.split("/").length === 1
  ) {
    return true;
  }

  return false;
};

/**
 * Layout file evaluation.
 */
export const isLayoutFilePath = (filepath: string) => {
  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0,}(${LAYOUT_FILE_NAME})(\\.tsx)$`,
  ).test(nodepath.basename(filepath));
};

/**
 *
 * Two possible scenario
 * 1.
 * xx/xx/index.tsx
 * xx/xx/layout.tsx
 *
 * 2.
 * xx/xx.tsx
 * xx/xx.layout.tsx
 */
export const isLayoutRoute = (
  route: NonIndexRouteObject,
  layoutRoute: NonIndexRouteObject,
) => {
  if (
    nodepath.dirname(route.element! as string) ===
    nodepath.dirname(layoutRoute.element! as string)
  ) {
    const condition1 = isLayoutFilePath(
      nodepath.basename(layoutRoute.element! as string),
    );
    return (
      condition1 &&
      layoutRoute.path!.split("/").length - route.path!.split("/").length === 1
    );
  }

  return false;
};

/**
 *
 * Valid error-boundary path
 *
 */
export const isErrorBoundaryFilePath = (filepath: string) => {
  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0,}(${ERROR_BOUNDARY_FILE_NAME})(\\.tsx)$`,
  ).test(nodepath.basename(filepath));
};

/**
 *
 * Two possible scenario
 * 1.
 * xx/xx/index.tsx
 * xx/xx/errorBoundary.tsx
 *
 * 2.
 * xx/xx.tsx
 * xx/xx.errorBoundary.tsx
 *
 */
export const isErrorBoundaryRoute = (
  route: NonIndexRouteObject,
  errorBoundaryRoute: NonIndexRouteObject,
) => {
  if (
    nodepath.dirname(route.element! as string) ===
    nodepath.dirname(errorBoundaryRoute.element! as string)
  ) {
    const condition1 = isErrorBoundaryFilePath(
      nodepath.basename(errorBoundaryRoute.element! as string),
    );
    if (route.path!.split("/").length === 1 && route.path === "") {
      return condition1;
    }
    return (
      condition1 &&
      errorBoundaryRoute.path!.split("/").length -
        route.path!.split("/").length ===
        1
    );
  }

  return false;
};

/**
 *
 * Valid loader path
 *
 */
export const isLoaderFilePath = (filepath: string) => {
  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0,}(${LOADER_FILE_NAME})(\\.tsx?)$`,
  ).test(nodepath.basename(filepath));
};

/**
 *
 * Two possible scenario
 * 1.
 * xx/xx/loader.tsx
 *
 * 2.
 * xx/xx.loader.tsx
 *
 */
export const isLoaderRoute = (
  route: NonIndexRouteObject,
  loaderRoute: NonIndexRouteObject,
) => {
  if (
    nodepath.dirname(route.element! as string) ===
    nodepath.dirname(loaderRoute.element! as string)
  ) {
    const condition1 = isLoaderFilePath(
      nodepath.basename(loaderRoute.element! as string),
    );
    if (route.path!.split("/").length === 1 && route.path === "") {
      return condition1;
    }
    return (
      condition1 &&
      loaderRoute.path!.split("/").length - route.path!.split("/").length === 1
    );
  }

  return false;
};

/**
 * Arrange routes.
 */
export const arrangeRoutes = (
  routes: NonIndexRouteObject[],
  parent: NonIndexRouteObject,
  subRoutesPathAppendToParent: string[],
  layoutAndErrorBoundaries: NonIndexRouteObject[] = [],
): NonIndexRouteObject => {
  const subs = routes.filter((route) => isSubPath(parent.path!, route.path!));

  const layout = layoutAndErrorBoundaries.find((route) =>
    isFieldKeyRoute(parent, route, LAYOUT_FILE_NAME),
  );

  const errorBoundary = layoutAndErrorBoundaries.find((route) =>
    isFieldKeyRoute(parent, route, ERROR_BOUNDARY_FILE_NAME),
  );

  const loader = layoutAndErrorBoundaries.find((route) =>
    isFieldKeyRoute(parent, route, LOADER_FILE_NAME),
  );

  const handle = layoutAndErrorBoundaries.find((route) =>
    isFieldKeyRoute(parent, route, HANDLE_FILE_NAME),
  );

  subRoutesPathAppendToParent.push(...subs.map((s) => "/" + s.path!));

  Object.assign(parent, {
    path: "/" + parent.path!,
    loader: loader?.element,
    handle: handle?.element,
    children: subs.map((sub) =>
      arrangeRoutes(
        routes,
        sub,
        subRoutesPathAppendToParent,
        layoutAndErrorBoundaries,
      ),
    ),
    ErrorBoundary: errorBoundary?.element,
  });

  if (layout) {
    const parentCopy = deepCopy(parent);
    return Object.assign(parent, layout, {
      path: parentCopy.path,
      children: [parentCopy],
      // Don't set error boundary in layout
      ErrorBoundary: undefined,
    });
  }

  return parent;
};

/**
 * Stringify routes data.
 */
export const stringifyRoutes = (routes: NonIndexRouteObject[]): string => {
  const code = routes
    .map((route) => {
      const errorBoundary = route.ErrorBoundary
        ? [
            `const { default: ErrorBoundary_ } = await import("${route.ErrorBoundary}")`,
            `ErrorBoundary = ErrorBoundary_;`,
          ].join("\n;")
        : "";

      const handle = route.handle
        ? [
            [
              `const { default: handle_ } = await import("${route.handle}")`,
              `handle = handle_;`,
            ].join(";"),
          ].join("\n;")
        : "";

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
        children: ${!route.children ? "[]" : stringifyRoutes(route.children as NonIndexRouteObject[])}
      }`;
    })
    .join(",");

  return `[${code}]`;
};

export default function ConventionalRouter(
  options?: Partial<ConventionalRouterProps>,
): Plugin {
  options = { include: [], exclude: [], ...(options ?? {}) };

  let { include } = options;
  let { exclude } = options;

  const filter = createFilter(include, exclude);

  include = (Array.isArray(include) ? include : [include]) as string[];
  exclude = (Array.isArray(exclude) ? exclude : [exclude]) as string[];

  let devServer: ViteDevServer;

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
        const subRoutesPathAppendToParent: string[] = [];

        /**
         * Only need one not found fallback
         */

        const [notFoundRoute, rootLayoutRoute, , routes] =
          collectRootRouteRelatedRoute(routes_);

        const layoutsAndErrorBoundaries = collectRouteFieldKeyRoute(routes);

        // 404 Page For Route.
        if (notFoundRoute) {
          subRoutesPathAppendToParent.push(`/${notFoundRoute.path!}`);
        }

        const layoutsAndErrorBoundariesElements = new Set(
          layoutsAndErrorBoundaries.map((route) => route.element),
        );

        const routesReadyToArrange = routes.filter(
          (r) => !layoutsAndErrorBoundariesElements.has(r.element!),
        );

        const mapCallback = (r: NonIndexRouteObject) => {
          if (r.path!.startsWith("/")) {
            return r;
          } else {
            return {
              ...r,
              path: `/${r.path}`,
            };
          }
        };

        routesReadyToArrange
          // First filer
          .filter((r) => r.path!.split("/").length === 1)
          // Start arrange
          .forEach((route) =>
            arrangeRoutes(
              routesReadyToArrange,
              route,
              subRoutesPathAppendToParent,
              layoutsAndErrorBoundaries,
            ),
          );

        // Remove all sub routes.
        const intermediaRoutes = routesReadyToArrange.filter(
          (r) => !subRoutesPathAppendToParent.includes(r.path!),
        );

        subRoutesPathAppendToParent.length = 0;

        intermediaRoutes
          // Second filter
          .filter((r) => r.path!.split("/").length > 2)
          // Start arrange
          .forEach((route) =>
            arrangeRoutes(
              intermediaRoutes,
              route,
              subRoutesPathAppendToParent,
              layoutsAndErrorBoundaries,
            ),
          );

        let finalRoutes = intermediaRoutes
          .filter((r) => !subRoutesPathAppendToParent.includes(r.path!))
          .map(mapCallback);

        if (rootLayoutRoute) {
          finalRoutes = [
            {
              ...rootLayoutRoute,
              path: "/",
              children: finalRoutes,
            },
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
          `,
        };
      }

      return null;
    },
    watchChange(id, change) {
      if (
        filter(id) &&
        (change.event === "create" || change.event === "delete")
      ) {
        devServer.restart();
      }
    },
  };
}
