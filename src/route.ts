import nodepath from "node:path";

import { NonIndexRouteObject } from "react-router";

import {
  DYNAMIC_ROUTE_FLAG,
  ERROR_BOUNDARY_FILE_NAME,
  HANDLE_FILE_NAME,
  LAYOUT_FILE_NAME,
  LOADER_FILE_NAME,
  NOT_FOUND_FILE_NAME,
  OPTIONAL_ROUTE_FLAG,
} from "./constants";

const reserved_route_filed_keys = [
  LAYOUT_FILE_NAME,
  ERROR_BOUNDARY_FILE_NAME,
  LOADER_FILE_NAME,
  HANDLE_FILE_NAME,
];

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

export function collectRouteFieldKeyRoute(routes: NonIndexRouteObject[]) {
  const testRoutePath = (routePath: string) => {
    return reserved_route_filed_keys
      .map((fieldKey) => {
        return validRouteFieldKeyRegexp(fieldKey, routePath);
      })
      .some((result) => result);
  };

  return routes.filter((route) =>
    testRoutePath(nodepath.basename(route.element! as string)),
  );
}

const reserved_root_field_keys = [
  NOT_FOUND_FILE_NAME,
  LAYOUT_FILE_NAME,
  LOADER_FILE_NAME,
];

export function collectRootRouteRelatedRoute(
  routes: NonIndexRouteObject[],
): [
  NonIndexRouteObject | undefined,
  NonIndexRouteObject | undefined,
  NonIndexRouteObject | undefined,
  NonIndexRouteObject[],
] {
  return [
    ...(reserved_root_field_keys.map((fieldKey) =>
      routes.find((route) => route.path === fieldKey),
    ) as [
      NonIndexRouteObject | undefined,
      NonIndexRouteObject | undefined,
      NonIndexRouteObject | undefined,
    ]),
    routes.filter(
      (route) => !reserved_root_field_keys.includes(route.path! as string),
    ),
  ];
}
