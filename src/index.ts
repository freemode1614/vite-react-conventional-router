import nodepath from "node:path";

import fg, { Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";
import type { Plugin } from "vite";

const PLUGIN_NAME = "vite-plugin-conventional-router";
const PLUGIN_VIRTUAL_MODULE_NAME = "virtual:routes";
const PLUGIN_MAIN_PAGE_FILE = "index.tsx";

type ConventionalRouterProps = {
  pages: Pattern | Pattern[];
};

const stripSlash = (filepath: string) => {
  return filepath.replace(/^\//, "").replace(/\/$/, "");
};

const filePathToRoutePath = (filepath: string) => {
  filepath = filepath.replace(nodepath.extname(filepath), "").replaceAll(".", "/") + nodepath.extname(filepath);

  const path_ = filepath.endsWith(PLUGIN_MAIN_PAGE_FILE)
    ? stripSlash(filepath.replace(PLUGIN_MAIN_PAGE_FILE, ""))
    : stripSlash(filepath.replace(nodepath.extname(filepath), ""));

  return path_
    .split("/")
    .map((seg) => {
      if (seg.startsWith("@")) {
        return seg.replace("@", ":");
      }

      if (seg.startsWith("$")) {
        const [, p] = /^\$(.+)/.exec(seg) ?? [];
        return p ? `:${p}?` : seg;
      }

      return seg;
      // ? seg.replace("@", ":")
      // : seg.startsWith("$")
      //   ? seg.replace(/^\$(.+)/, `:${RegExp.$1}?`)
      //   : seg;
    })
    .join("/");
};

function collectRoutePages(pages: Pattern[]): NonIndexRouteObject[] {
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

    const files_ = files.map((file) => file.join("/")).flat();
    routes = [...routes, ...files_];
  }

  return routes
    .map((s) => filePathToRoutePath(s))
    .map((route, index) => {
      return {
        path: route,
        element: pageModules[index],
      };
    });
}

const isSubPath = (parentPath: string, subPath: string) => {
  if (
    parentPath !== "" &&
    subPath.startsWith(parentPath) &&
    subPath.split("/").length - parentPath.split("/").length === 1
  ) {
    return true;
  }

  return false;
};

const arrangeRoutes = (
  routes: NonIndexRouteObject[],
  parent: NonIndexRouteObject,
  subRoutesPathAppendToParent: string[],
): NonIndexRouteObject => {
  const subs = routes.filter((route) => isSubPath(parent.path!, route.path!));
  subRoutesPathAppendToParent.push(...subs.map((s) => "/" + s.path!));
  return Object.assign(parent, {
    path: "/" + parent.path!,
    children: subs.map((sub) => arrangeRoutes(routes, sub, subRoutesPathAppendToParent)),
  });
};

const stringifyRoutes = (routes: NonIndexRouteObject[]): string => {
  return `[
    ${routes.map(
      (route, index) => `{
        path: "${route.path}",
        lazy: () => import("${route.element}"),
        children: ${!route.children ? "[]" : stringifyRoutes(route.children as NonIndexRouteObject[])}
        // Component: Page$${index}.default,
        // shouldValidate: !!Page$${index}.shouldValidate
      },`,
    )}
  ]`;
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
        const routes = collectRoutePages(pages);
        const subRoutesPathAppendToParent: string[] = [];
        routes
          .filter((r) => r.path!.split("/").length === 1)
          .map((route) => arrangeRoutes(routes, route, subRoutesPathAppendToParent));

        const finalRoutes = routes
          .filter((r) => !subRoutesPathAppendToParent.includes(r.path!))
          .map((r) =>
            r.path!.startsWith("/")
              ? r
              : {
                  ...r,
                  path: "/" + r.path,
                },
          );

        return {
          code: `
          const routes = ${stringifyRoutes(finalRoutes)};
          console.log(routes);
          export default routes;`,
        };
      }
      return null;
    },
  };
}
