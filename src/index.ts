import nodepath from "node:path";

import fg, { Pattern } from "fast-glob";
import { createElement, type FC } from "react";
import type { NonIndexRouteObject } from "react-router";
import type { Plugin } from "vite";

// const req = Module.createRequire(process.cwd());

const PLUGIN_NAME = "vite-plugin-conventional-router";

const mainPageFile = "index.tsx";

type PageModule = Partial<
  Pick<
    NonIndexRouteObject,
    "action" | "errorElement" | "caseSensitive" | "loader" | "shouldRevalidate" | "id" | "handle"
  > & { default: FC }
>;

type ConventionalRouterProps = {
  pages: Pattern | Pattern[];
};

const errorElement = () => {
  return createElement("div", {}, [createElement("span", {}, ["Shit happens!"])]);
};

const filePathToRoutePath = (filepath: string) => {
  return filepath.endsWith(mainPageFile)
    ? filepath.replace(mainPageFile, "")
    : filepath.replace(filepath, nodepath.extname(filepath));
};

// async function pageModuleImporter(file: string): Promise<PageModule> {
//   try {
//     const pageModule = (await import(file)) as PageModule;
//     return pageModule;
//   } catch (error) {
//     console.log(error);
//     return {
//       errorElement: errorElement(),
//     };
//   }
// }

async function collectRoutePages(pages: Pattern[]): Promise<string[]> {
  const pageModules = [];
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

  console.log(routes.map((s) => filePathToRoutePath(s)));
  console.log(pageModules);

  return routes;
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
    async buildStart() {
      await collectRoutePages(pages);
    },
    load() {
      // console.log(id);
    },
  };
}
