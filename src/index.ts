import nodepath from "node:path";

import fg, { Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";
import { type Plugin } from "vite";

const PLUGIN_NAME = "vite-plugin-conventional-router";
const PLUGIN_VIRTUAL_MODULE_NAME = "virtual:routes";
const PLUGIN_MAIN_PAGE_FILE = "index.tsx";

const LAYOUT_FILE_NAME = "layout",
  NOT_FOUND_FILE_NAME = "404",
  ERROR_BOUNDARY_FILE_NAME = "errorBoundary";

const OPTIONAL_ROUTE_FLAG = "$",
  DYNAMIC_ROUTE_FLAG = "@";

type ConventionalRouterProps = {
  pages: Pattern | Pattern[];
};

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
  filepath = filepath.replace(nodepath.extname(filepath), "").replaceAll(".", "/") + nodepath.extname(filepath);

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
        const [, p] = new RegExp(`^\\${OPTIONAL_ROUTE_FLAG}(.+)`).exec(seg) ?? [];
        return p ? `:${p}?` : seg;
      }

      return seg;
    })
    .join("/");
};

/**
 * Collect files from FS by fast-glob.
 */
export const collectRoutePages = (pages: Pattern[]): NonIndexRouteObject[] => {
  const pageModules: string[] = [];
  let routes: string[] = [];

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

export const isLayoutFilePath = (filepath: string) => {
  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0}(${LAYOUT_FILE_NAME})(\\.tsx)$`,
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
export const isLayoutRoute = (route: NonIndexRouteObject, layoutRoute: NonIndexRouteObject) => {
  if (nodepath.dirname(route.element! as string) === nodepath.dirname(layoutRoute.element! as string)) {
    return isLayoutFilePath(nodepath.basename(layoutRoute.element! as string));
  }

  return false;
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
export const isErrorBoundaryRoute = (route: NonIndexRouteObject, errorBoundaryRoute: NonIndexRouteObject) => {
  if (nodepath.dirname(route.element! as string) === nodepath.dirname(errorBoundaryRoute.element! as string)) {
    return new RegExp(
      `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0}(${ERROR_BOUNDARY_FILE_NAME})(\\.tsx)$`,
    ).test(nodepath.basename(errorBoundaryRoute.element! as string));
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
): NonIndexRouteObject => {
  const layout = routes.find((route) => isLayoutRoute(parent, route));
  const subs = routes.filter((route) => isSubPath(parent.path!, route.path!) && route.path !== layout?.path);
  const errorBoundary = routes.find((route) => isErrorBoundaryRoute(parent, route));

  subRoutesPathAppendToParent.push(...subs.map((s) => "/" + s.path!));

  if (layout) {
    subRoutesPathAppendToParent.push(`/${layout.path!}`);
  }

  if (errorBoundary) {
    subRoutesPathAppendToParent.push(`/${errorBoundary.path!}`);
  }

  Object.assign(parent, {
    path: "/" + parent.path!,
    children: subs.map((sub) => arrangeRoutes(routes, sub, subRoutesPathAppendToParent)),
    ErrorBoundary: errorBoundary ? errorBoundary.element! : undefined,
  });

  if (layout) {
    const index = routes.findIndex((route) => route.element === parent.element);
    routes.splice(index, 1);
    if ((parent.element! as string).endsWith(PLUGIN_MAIN_PAGE_FILE)) {
      return Object.assign(layout, {
        path: parent.path,
        children: [parent],
        ErrorBoundary: parent.ErrorBoundary,
      });
    }
  }

  return parent;
};

/**
 * Stringify routes data.
 */
export const stringifyRoutes = (routes: NonIndexRouteObject[]): string => {
  const code = routes.map(
    (route) => `{
        async lazy(){
          const { default: Component, ...rest }  = await import("${route.element}");
          let ErrorBoundary = undefined;
          ${
            route.ErrorBoundary
              ? `const { default: ErrorBoundary_ } = await import("${route.ErrorBoundary}");
            ErrorBoundary = ErrorBoundary_;
          `
              : ""
          }
          return {
            ...rest, ErrorBoundary, Component,
          }
        },
        path: "${route.path}",
        children: ${!route.children ? "[]" : stringifyRoutes(route.children as NonIndexRouteObject[])}
      },`,
  );

  return `[${code}]`;
};

export default function ConventionalRouter(options?: Partial<ConventionalRouterProps>): Plugin {
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
        const subRoutesPathAppendToParent: string[] = [];

        const notFoundRoute = routes.find((route) => route.path === NOT_FOUND_FILE_NAME);
        const layoutRoute = routes.find((route) => route.path === LAYOUT_FILE_NAME);

        if (notFoundRoute) {
          subRoutesPathAppendToParent.push(`/${notFoundRoute.path!}`);
        }

        if (layoutRoute) {
          subRoutesPathAppendToParent.push(`/${layoutRoute.path!}`);
        }

        routes = routes.filter((route) => {
          return (
            (notFoundRoute && route.path !== notFoundRoute.path!) || (layoutRoute && layoutRoute.path !== route.path!)
          );
        });

        routes
          .filter((r) => r.path!.split("/").length === 1)
          .map((route) => arrangeRoutes(routes, route, subRoutesPathAppendToParent));

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

        let finalRoutes = routes.filter((r) => !subRoutesPathAppendToParent.includes(r.path!)).map(mapCallback);

        if (layoutRoute) {
          finalRoutes = [
            {
              ...layoutRoute,
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
          console.log(routes);
          export default routes;
`,
        };
      }

      return null;
    },
  };
}
