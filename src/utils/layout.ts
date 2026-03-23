import type { NonIndexRouteObject } from "react-router";

import {
  HANDLE_FILE_NAME,
  LAYOUT_FILE_NAME,
  LOADER_FILE_NAME,
  NOT_FOUND_FILE_NAME,
} from "@/constants";

const reserved_root_field_keys = {
  [NOT_FOUND_FILE_NAME]: NOT_FOUND_FILE_NAME,
  [LAYOUT_FILE_NAME]: LAYOUT_FILE_NAME,
  [LOADER_FILE_NAME]: LOADER_FILE_NAME,
  [HANDLE_FILE_NAME]: HANDLE_FILE_NAME,
};

export type CollectReturn = {
  "404"?: NonIndexRouteObject;
  layout?: NonIndexRouteObject;
  loader?: NonIndexRouteObject;
  handle?: NonIndexRouteObject;
  routes?: NonIndexRouteObject[];
};

export const collectRootRouteRelatedRoute = (routes: NonIndexRouteObject[]): CollectReturn => {
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

export function applyLayouts(
  routes: NonIndexRouteObject[],
  rootLayout: NonIndexRouteObject | undefined,
): NonIndexRouteObject[] {
  if (!rootLayout) {
    return routes;
  }

  return [{ ...rootLayout, path: "/", children: routes }];
}
