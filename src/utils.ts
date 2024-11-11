import nodepath from "node:path";

import fg, { Pattern } from "fast-glob";
import { NonIndexRouteObject } from "react-router";

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
} from "./constants";

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

    if (routeA.path!.split("/").length === 1 && routeA.path === "") {
      return condition;
    }

    return (
      condition &&
      routeB.path!.split("/").length - routeA.path!.split("/").length === 1
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
} & { routes: NonIndexRouteObject[] };

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
};

type CollectReturn = {
  [Key in keyof typeof reserved_root_field_keys]: NonIndexRouteObject;
} & { routes: NonIndexRouteObject[] };

export function collectRootRouteRelatedRoute(
  routes: NonIndexRouteObject[],
): CollectReturn {
  return Object.assign(
    Object.keys(reserved_root_field_keys).reduce(
      (object, fieldKey) => ({
        ...object,
        [fieldKey]: routes.find((route) => route.path === fieldKey),
      }),
      {} as CollectReturn,
    ),
    {
      routes: routes.filter(
        (route) =>
          !Object.keys(reserved_root_field_keys).includes(
            route.path! as string,
          ),
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
  ).reduce(
    (object, fieldKey) => ({
      ...object,
      [fieldKey]: sideEffectRoutes.find((route) => {
        return isFieldKeyRoute(parent, route, fieldKey);
      }),
    }),
    {} as SideEffects,
  );

  subRoutesPathAppendToParent.push(...subs.map((s) => "/" + s.path!));

  Object.assign(parent, {
    path: "/" + parent.path!,
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
