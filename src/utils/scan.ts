import nodepath from "node:path";

import fg, { type Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";

import {
  DEFAULT_IGNORE_PATTERN,
  DYNAMIC_ROUTE_FLAG,
  FILE_PATH_SEP,
  OPTIONAL_ROUTE_FLAG,
  PLUGIN_MAIN_PAGE_FILE,
  ROUTE_PATH_SEP,
  SPECIAL_PATH_SPLIT,
} from "@/constants";
import { pluginlog } from "@/logger";

function globSync(pattern: Pattern | Pattern[], ignore: Pattern | Pattern[]) {
  const files = fg.sync(pattern, {
    deep: Infinity,
    ignore: [...DEFAULT_IGNORE_PATTERN, ...ignore],
  });

  pluginlog.debug(
    `Pattern: ${pattern}`,
    "\n",
    `Ignore: ${ignore}`,
    "\n",
    `Files: ${files.join("\n")}`,
    `----------------------------------------------------`,
  );

  return files;
}

export const collectRouteFiles = (
  pages: Pattern[],
  ignore: Pattern[] = [],
): NonIndexRouteObject[] => {
  let pageModules: string[] = [];
  let routes: string[] = [];

  for (const pattern of pages) {
    let files = globSync(pattern, ignore);

    pageModules = [...pageModules, ...files.map((file) => nodepath.resolve(file))];

    while (true) {
      const group = files.map((file) => file[0]);
      if (new Set(group).size > 1) {
        break;
      } else {
        files = files.map((file) => file.slice(1));
      }
    }

    routes = [...routes, ...files.flatMap((file) => file)];
  }

  return routes
    .map((s) => filePathToRoutePath(s))
    .map((route, index) => {
      return {
        path: route,
        element: nodepath.resolve(pageModules[index]),
      };
    });
};

export const filePathToRoutePath = (filepath: string) => {
  const extname = nodepath.extname(filepath);
  filepath = filepath.replace(extname, "").replaceAll(SPECIAL_PATH_SPLIT, FILE_PATH_SEP) + extname;

  const path_ = filepath.endsWith(PLUGIN_MAIN_PAGE_FILE)
    ? stripSlash(filepath.replace(PLUGIN_MAIN_PAGE_FILE, ""))
    : stripSlash(filepath.replace(extname, ""));

  return path_
    .split(ROUTE_PATH_SEP)
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
    .join(ROUTE_PATH_SEP);
};

const stripSlash = (filepath: string) => {
  return filepath.replace(/^\//, "").replace(/\/$/, "");
};
