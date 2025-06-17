import nodepath from "node:path";

import fg, { type Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";

import {
  DEFAULT_IGNORE_PATTERN,
  DYNAMIC_ROUTE_FLAG,
  ERROR_BOUNDARY_FILE_NAME,
  FILE_PATH_SEP,
  HANDLE_FILE_NAME,
  LAYOUT_FILE_NAME,
  LOADER_FILE_NAME,
  NOT_FOUND_FILE_NAME,
  OPTIONAL_ROUTE_FLAG,
  PLUGIN_MAIN_PAGE_FILE,
  ROUTE_PATH_SEP,
  SPECIAL_PATH_SPLIT,
} from "@/constants";
import { pluginlog } from "@/index";

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

/**
 * Collect files from FS by fast-glob.
 */
export const collectRoutePages = (
  pages: Pattern[],
  ignore: Pattern[] = [],
): NonIndexRouteObject[] => {
  let pageModules: string[] = [];
  let routes: string[] = [];

  for (const pattern of pages) {
    let files = globSync(pattern, ignore);

    pageModules = [
      ...pageModules,
      ...files.map((file) => nodepath.resolve(file)),
    ];

    while (true) {
      const group = files.map((file) => file[0]);
      if (new Set(group).size > 1) {
        break;
      } else {
        files = files.map((file) => file.slice(1));
      }
    }

    routes = [...routes, ...files.map((file) => file).flat()];
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

const validRouteFieldKeyRegexp = (
  fieldKey: string,
  filepath: string,
  options: { allowTs?: boolean } = {},
) => {
  if (fieldKey === LOADER_FILE_NAME || fieldKey === HANDLE_FILE_NAME) {
    options.allowTs = true;
  }

  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0,}(${fieldKey})(\\.tsx${options.allowTs ? "?" : ""})$`,
  ).test(nodepath.basename(filepath));
};

export const isFieldKeyRoute = (
  routeA: NonIndexRouteObject,
  routeB: NonIndexRouteObject,
  fieldKey: string,
) => {
  if (
    nodepath.dirname(routeA.element as string) ===
    nodepath.dirname(routeB.element! as string)
  ) {
    const condition = validRouteFieldKeyRegexp(
      fieldKey,
      routeB.element! as string,
    );

    if (routeA.path === "" && routeB.path!.split("/").length === 1) {
      return condition;
    }

    return (
      condition &&
      routeB.path!.split(ROUTE_PATH_SEP).length -
        routeA.path!.split(ROUTE_PATH_SEP).length ===
        1
    );
  }

  return false;
};

/**
 * Field keys from *react-router* <Route /> component.
 */
const reserved_route_filed_keys = {
  [LAYOUT_FILE_NAME]: LAYOUT_FILE_NAME,
  [ERROR_BOUNDARY_FILE_NAME]: ERROR_BOUNDARY_FILE_NAME,
  [LOADER_FILE_NAME]: LOADER_FILE_NAME,
  [HANDLE_FILE_NAME]: HANDLE_FILE_NAME,
};

type SideEffects = {
  [Key in keyof typeof reserved_route_filed_keys]?: NonIndexRouteObject;
} & { routes?: NonIndexRouteObject[] };

export function collectRouteFieldKeyRoute(routes: NonIndexRouteObject[]) {
  const testRoutePath = (routePath: string) => {
    return Object.keys(reserved_route_filed_keys)
      .map((fieldKey) => {
        return validRouteFieldKeyRegexp(fieldKey, routePath);
      })
      .some((result) => result);
  };

  return routes.filter((route) =>
    testRoutePath(nodepath.basename(route.element! as string)),
  );
}

const reserved_root_field_keys = {
  [NOT_FOUND_FILE_NAME]: NOT_FOUND_FILE_NAME,
  [LAYOUT_FILE_NAME]: LAYOUT_FILE_NAME,
  [LOADER_FILE_NAME]: LOADER_FILE_NAME,
  [HANDLE_FILE_NAME]: HANDLE_FILE_NAME,
};

type CollectReturn = {
  [Key in keyof typeof reserved_root_field_keys]?: NonIndexRouteObject;
} & { routes?: NonIndexRouteObject[] };

export const collectRootRouteRelatedRoute = (
  routes: NonIndexRouteObject[],
): CollectReturn => {
  return Object.assign(
    Object.keys(reserved_root_field_keys).reduce<CollectReturn>(
      (object, fieldKey) => ({
        ...object,
        [fieldKey]: routes.find((route) => route.path === fieldKey),
      }),
      {},
    ),
    {
      routes: routes.filter(
        (route) => !Object.keys(reserved_root_field_keys).includes(route.path!),
      ),
    },
  );
};

/**
 * Arrange routes. Flat to tree
 */
export const arrangeRoutes = (
  isolateRoutes: NonIndexRouteObject[],
  parent: NonIndexRouteObject,
  subRoutesPathAppendToParent: string[],
  sideEffectRoutes: NonIndexRouteObject[] = [],
): NonIndexRouteObject => {
  const subs = isolateRoutes.filter((route) =>
    isSubPath(parent.path!, route.path!),
  );

  const { handle, loader, errorBoundary, layout } = Object.keys(
    reserved_route_filed_keys,
  ).reduce<SideEffects>(
    (obj, fieldKey) => ({
      ...obj,
      [fieldKey]: sideEffectRoutes.find((route) => {
        return isFieldKeyRoute(parent, route, fieldKey);
      }),
    }),
    {},
  );

  subRoutesPathAppendToParent.push(
    ...subs.map((s) => ROUTE_PATH_SEP + s.path!),
  );

  Object.assign(parent, {
    path: ROUTE_PATH_SEP + parent.path!,
    loader: loader?.element,
    handle: handle?.element,
    ErrorBoundary: errorBoundary?.element,
    children: subs.map((sub) =>
      arrangeRoutes(
        isolateRoutes,
        sub,
        subRoutesPathAppendToParent,
        sideEffectRoutes,
      ),
    ),
  });

  if (layout) {
    const parentCopy = deepCopy(parent);
    delete parent.path;
    return Object.assign(parent, layout, {
      path: parentCopy.path,
      children: [parentCopy],
      // Don't set error boundary in layout
      ErrorBoundary: undefined,
    });
  }

  return parent;
};

// For window capability
const fileProtocol = (path: string) => {
  return process.platform === "win32" ? new URL(`file://${path}`).href : path;
};

/**
 * Stringify routes data.
 */
export const stringifyRoutes = (
  routes: NonIndexRouteObject[],
  imports: string[] = [],
  lazy = false,
): string => {
  const code = routes
    .map((route) => {
      const length_ = imports.length;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { loader, handle, ErrorBoundary, action, element } = route;

      if (loader)
        imports.push(
          `import loader${length_} from "${fileProtocol(loader as unknown as string)}";`,
        );

      if (handle)
        imports.push(
          `import handle${length_} from "${fileProtocol(handle as unknown as string)}";`,
        );

      if (ErrorBoundary)
        imports.push(
          `import ErrorBoundary${length_} from "${fileProtocol(ErrorBoundary as unknown as string)}";`,
        );

      if (action)
        imports.push(
          `import action${length_} from "${fileProtocol(action as unknown as string)}";`,
        );

      if (lazy) {
        return `{
          path: "${route.path}",
          lazy: async () => {
            const element = await import("${fileProtocol(element as string)}");
            return {
              Component: element.default,
              shouldRevalidate: element.shouldRevalidate,
              loader: ${loader ? `loader${length_}` : `element.loader`},
              action: ${action ? `action${length_}` : `element.action`},
              handle: ${handle ? `handle${length_}` : `element.handle`},
              ErrorBoundary: ${ErrorBoundary ? `ErrorBoundary${length_}` : `element.ErrorBoundary`},
            };
          },
          children: ${!route.children ? "[]" : stringifyRoutes(route.children as NonIndexRouteObject[], imports, lazy)}
        }`;
      } else {
        return `{
          path: "${route.path}",
          shouldRevalidate: element${length_}.shouldRevalidate,
          loader: ${loader ? `loader${length_}` : `element${length_}.loader`},
          action: ${action ? `action${length_}` : `element${length_}.action`} ,
          handle: ${handle ? `handle${length_}` : `element${length_}.handle`},
          Component: element${length_}.default,
          ErrorBoundary: ${ErrorBoundary ? `ErrorBoundary${length_}` : `element${length_}.ErrorBoundary`}  ,
          children: ${!route.children ? "[]" : stringifyRoutes(route.children as NonIndexRouteObject[], imports, lazy)}
        }`;
      }
    })
    .join(",");

  return `[${code}]`;
};

export const deepCopy = <T = unknown>(data: T): T =>
  JSON.parse(JSON.stringify(data)) as T;

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
  const extname = nodepath.extname(filepath);
  filepath =
    filepath
      .replace(extname, "")
      .replaceAll(SPECIAL_PATH_SPLIT, FILE_PATH_SEP) + extname;

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
        const [, p] =
          new RegExp(`^\\${OPTIONAL_ROUTE_FLAG}(.+)`).exec(seg) ?? [];
        return p ? `:${p}?` : seg;
      }

      return seg;
    })
    .join(ROUTE_PATH_SEP);
};

/**
 * Sub-path evaluation.
 */
export const isSubPath = (parentPath: string, subPath: string) => {
  if (
    parentPath !== "" &&
    subPath.startsWith(parentPath) &&
    subPath.split(ROUTE_PATH_SEP).length -
      parentPath.split(ROUTE_PATH_SEP).length ===
      1
  ) {
    return true;
  }

  return false;
};
