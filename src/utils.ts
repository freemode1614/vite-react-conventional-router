import nodepath from "node:path";

import fg, { Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";

import {
  DEFAULT_IGNORE_PATTERN,
  DYNAMIC_ROUTE_FLAG,
  ERROR_BOUNDARY_FILE_NAME,
  HANDLE_FILE_NAME,
  LAYOUT_FILE_NAME,
  LOADER_FILE_NAME,
  NOT_FOUND_FILE_NAME,
  OPTIONAL_ROUTE_FLAG,
  PLUGIN_MAIN_PAGE_FILE,
  ROUTE_PATH_SEP,
} from "@/constants";

/**
 * Collect files from FS by fast-glob.
 */
export const collectRoutePages = (
  pages: Pattern[],
  ignore: Pattern[] = [],
): NonIndexRouteObject[] => {
  const pageModules: string[] = [];
  let routes: string[] = [];

  for (const pattern of pages) {
    let files = fg
      .sync(pattern, {
        deep: Infinity,
        ignore: [...DEFAULT_IGNORE_PATTERN, ...ignore],
      })
      .map((file) => file.split(ROUTE_PATH_SEP));

    for (const file of files) {
      // Keep Relative Path For Both Windows, Linux and MacOS
      pageModules.push("/" + file.join(ROUTE_PATH_SEP));
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      ...files.map((file) => file.join(ROUTE_PATH_SEP)).flat(),
    ];
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

    if (routeA.path!.split(ROUTE_PATH_SEP).length === 1 && routeA.path === "") {
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

export function collectRootRouteRelatedRoute(
  routes: NonIndexRouteObject[],
): CollectReturn {
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
}

/**
 * Arrange routes.
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
    (object, fieldKey) => ({
      ...object,
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
    children: subs.map((sub) =>
      arrangeRoutes(
        isolateRoutes,
        sub,
        subRoutesPathAppendToParent,
        sideEffectRoutes,
      ),
    ),
    ErrorBoundary: errorBoundary?.element,
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
            `const { default: handle_ } = await import("${route.handle}");`,
            `handle = handle_;`,
          ].join("\n;")
        : "";

      const loader = route.loader
        ? [
            "async (...args) => {",
            `const { default: loader_ } = await import("${route.loader}");`,
            "return loader_(...args);",
            "}",
          ].join("\n")
        : "undefined";

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
        children: ${!route.children ? "[]" : stringifyRoutes(route.children as NonIndexRouteObject[])}
      }`;
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
  filepath =
    filepath
      .replace(nodepath.extname(filepath), "")
      .replaceAll(".", ROUTE_PATH_SEP) + nodepath.extname(filepath);

  const path_ = filepath.endsWith(PLUGIN_MAIN_PAGE_FILE)
    ? stripSlash(filepath.replace(PLUGIN_MAIN_PAGE_FILE, ""))
    : stripSlash(filepath.replace(nodepath.extname(filepath), ""));

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
