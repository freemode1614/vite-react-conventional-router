import nodepath from "node:path";
import type { NonIndexRouteObject } from "react-router";

import { HANDLE_FILE_NAME, LOADER_FILE_NAME, ROUTE_PATH_SEP } from "@/constants";
import type { SideEffects } from "@/types";
import { isFieldKeyRoute, isSubPath, reserved_route_filed_keys } from "../utils/shared";
import { applyLayouts, collectRootRouteRelatedRoute } from "./layout";

export function collectRouteFieldKeyRoute(routes: NonIndexRouteObject[]) {
  const testRoutePath = (routePath: string) => {
    return Object.keys(reserved_route_filed_keys)
      .map((fieldKey) => {
        const allowTs = fieldKey === LOADER_FILE_NAME || fieldKey === HANDLE_FILE_NAME;
        const regexp = new RegExp(
          `^([\\w\\$\\@]+\\.){0,}(${fieldKey})(\\.tsx${allowTs ? "|.ts" : ""})$`,
        );
        return regexp.test(nodepath.basename(routePath));
      })
      .some((result) => result);
  };

  return routes.filter((route) => testRoutePath(nodepath.basename(route.element as string)));
}

export const arrangeRoutes = (
  isolateRoutes: NonIndexRouteObject[],
  parent: NonIndexRouteObject,
  subRoutesPathAppendToParent: string[],
  sideEffectRoutes: NonIndexRouteObject[] = [],
): NonIndexRouteObject => {
  const subs = isolateRoutes.filter((route) => isSubPath(parent.path!, route.path!));

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

  subRoutesPathAppendToParent.push(...subs.map((s) => ROUTE_PATH_SEP + s.path!));

  Object.assign(parent, {
    path: ROUTE_PATH_SEP + parent.path!,
    loader: loader?.element,
    handle: handle?.element,
    ErrorBoundary: errorBoundary?.element,
    children: subs.map((sub) =>
      arrangeRoutes(isolateRoutes, sub, subRoutesPathAppendToParent, sideEffectRoutes),
    ),
  });

  if (layout) {
    const parentCopy = deepCopy(parent);
    delete parent.path;
    return Object.assign(parent, layout, {
      path: parentCopy.path,
      children: [parentCopy],
      ErrorBoundary: undefined,
    });
  }

  return parent;
};

export const deepCopy = <T = unknown>(data: T): T => JSON.parse(JSON.stringify(data)) as T;

export function buildRouteTree(routes: NonIndexRouteObject[]): NonIndexRouteObject[] {
  const subRoutesPathAppendToParent: string[] = [];
  const {
    routes: isolateRoutes = [],
    "404": notFoundRoute,
    layout: rootLayoutRoute,
  } = collectRootRouteRelatedRoute(routes);
  const sideEffectRoutes = collectRouteFieldKeyRoute(routes);

  if (notFoundRoute) {
    subRoutesPathAppendToParent.push(`/${notFoundRoute.path!}`);
  }

  const isolatedRoutes = isolateRoutes.filter(
    (r) => !new Set(sideEffectRoutes.map((route) => route.element)).has(r.element),
  );

  const mapCallback = (r: NonIndexRouteObject) =>
    r.path!.startsWith("/") ? r : { ...r, path: `/${r.path}` };

  isolatedRoutes
    .filter((r) => r.path!.split("/").length === 1)
    .forEach((route) => {
      arrangeRoutes(isolatedRoutes, route, subRoutesPathAppendToParent, sideEffectRoutes);
    });

  const intermediaRoutes = isolatedRoutes.filter(
    (r) => !subRoutesPathAppendToParent.includes(r.path!),
  );

  subRoutesPathAppendToParent.length = 0;

  intermediaRoutes
    .filter((r) => r.path!.split("/").length > 2)
    .forEach((route) => {
      arrangeRoutes(intermediaRoutes, route, subRoutesPathAppendToParent, sideEffectRoutes);
    });

  let finalRoutes = intermediaRoutes
    .filter((r) => !subRoutesPathAppendToParent.includes(r.path!))
    .map(mapCallback);

  finalRoutes = applyLayouts(finalRoutes, rootLayoutRoute);

  if (notFoundRoute) {
    finalRoutes.push({ ...notFoundRoute, path: "*" });
  }

  return finalRoutes;
}
