import nodepath from "node:path";
import type { NonIndexRouteObject } from "react-router";
import {
  DYNAMIC_ROUTE_FLAG,
  ERROR_BOUNDARY_FILE_NAME,
  HANDLE_FILE_NAME,
  LAYOUT_FILE_NAME,
  LOADER_FILE_NAME,
  OPTIONAL_ROUTE_FLAG,
  PLUGIN_MAIN_PAGE_FILE,
  ROUTE_PATH_SEP,
} from "@/constants";

export const reserved_route_filed_keys = {
  [LAYOUT_FILE_NAME]: LAYOUT_FILE_NAME,
  [ERROR_BOUNDARY_FILE_NAME]: ERROR_BOUNDARY_FILE_NAME,
  [LOADER_FILE_NAME]: LOADER_FILE_NAME,
  [HANDLE_FILE_NAME]: HANDLE_FILE_NAME,
};

export const isFieldKeyRoute = (
  routeA: NonIndexRouteObject,
  routeB: NonIndexRouteObject,
  fieldKey: string,
) => {
  if (nodepath.dirname(routeA.element as string) === nodepath.dirname(routeB.element! as string)) {
    const condition = validRouteFieldKeyRegexp(fieldKey, routeB.element! as string);

    const routeABaseName = nodepath.basename(
      routeA.element as string,
      nodepath.extname(routeA.element as string),
    );
    const routeAName =
      routeABaseName === PLUGIN_MAIN_PAGE_FILE.replace(".tsx", "") ? "" : routeABaseName;

    if (routeA.path === "") {
      return condition && routeB.path === fieldKey;
    }

    if (routeB.path === `${routeAName}/${fieldKey}`) {
      return condition;
    }

    return (
      condition &&
      routeB.path!.split(ROUTE_PATH_SEP).length - routeA.path!.split(ROUTE_PATH_SEP).length === 1
    );
  }

  return false;
};

export const isSubPath = (parentPath: string, subPath: string) => {
  if (
    parentPath !== "" &&
    subPath.startsWith(parentPath) &&
    subPath.split(ROUTE_PATH_SEP).length - parentPath.split(ROUTE_PATH_SEP).length === 1
  ) {
    return true;
  }

  return false;
};

/**
 * Helper function to validate route field key regexp.
 * This is needed by isFieldKeyRoute but not exported for external use.
 */
function validRouteFieldKeyRegexp(
  fieldKey: string,
  filepath: string,
  options: { allowTs?: boolean } = {},
) {
  if (fieldKey === LOADER_FILE_NAME || fieldKey === HANDLE_FILE_NAME) {
    options.allowTs = true;
  }

  return new RegExp(
    `^([\\w\\${OPTIONAL_ROUTE_FLAG}\\${DYNAMIC_ROUTE_FLAG}]+\\.){0,}(${fieldKey})(\\.tsx${options.allowTs ? "?" : ""})$`,
  ).test(nodepath.basename(filepath));
}
