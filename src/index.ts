import nodepath from "node:path";

import fg, { Pattern } from "fast-glob";
import type { RouteObject } from "react-router";
import type { Plugin } from "vite";

// const req = Module.createRequire(process.cwd());

const PLUGIN_NAME = "vite-plugin-conventional-router";
const PLUGIN_VIRTUAL_MODULE_NAME = "virtual:routes";
const PLUGIN_MAIN_PAGE_FILE = "index.tsx";

// type PageModule = Partial<
//   Pick<
//     NonIndexRouteObject,
//     "action" | "errorElement" | "caseSensitive" | "loader" | "shouldRevalidate" | "id" | "handle"
//   > & { default: FC }
// >;

type ConventionalRouterProps = {
  pages: Pattern | Pattern[];
};

const filePathToRoutePath = (filepath: string) => {
  return filepath.endsWith(PLUGIN_MAIN_PAGE_FILE)
    ? filepath.replace(PLUGIN_MAIN_PAGE_FILE, "").replace(/^\//, "").replace(/\/$/, "")
    : filepath.replace(filepath, nodepath.extname(filepath)).replace(/^\//, "").replace(/\/$/, "");
};

function collectRoutePages(pages: Pattern[]): RouteObject[] {
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
        console.count("generate routes");
        return {
          code: `
          ${routes.map((route, index) => `import * as Page$${index} from "${route.element}"`).join("\n")}

          export default [${routes.map(
            (route, index) => `{
              path: "${route.path}",
              Component: Page$${index}.default,
              shouldValidate: !!Page$${index}.shouldValidate
            },`,
          )}]`,
        };
      }
      return null;
    },
  };
}
