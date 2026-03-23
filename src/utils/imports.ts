import type { NonIndexRouteObject } from "react-router";

import type { ImportTracker } from "@/types";

import { isStringExport } from "../type-guards";

const fileProtocol = (path: string) => {
  return process.platform === "win32" ? new URL(`file://${path}`).href : path;
};

const createImportTracker = (): ImportTracker => ({
  loader: new Map(),
  handle: new Map(),
  action: new Map(),
  errorBoundary: new Map(),
});

const getOrCreateImport = (
  tracker: Map<string, string>,
  path: string,
  prefix: string,
  imports: string[],
): string => {
  if (tracker.has(path)) {
    return tracker.get(path)!;
  }
  const index = tracker.size;
  const identifier = `${prefix}${index}`;
  tracker.set(path, identifier);
  imports.push(`import ${identifier} from "${fileProtocol(path)}";`);
  return identifier;
};

export const stringifyRoutes = (
  routes: NonIndexRouteObject[],
  imports: string[] = [],
  lazy = false,
  importTracker: ImportTracker = createImportTracker(),
): string => {
  const code = routes
    .map((route) => {
      const { loader, handle, ErrorBoundary, action, element } = route;

      const loaderRef =
        loader && isStringExport(loader)
          ? getOrCreateImport(importTracker.loader, loader, "loader", imports)
          : null;

      const handleRef =
        handle && isStringExport(handle)
          ? getOrCreateImport(importTracker.handle, handle, "handle", imports)
          : null;

      const actionRef =
        action && isStringExport(action)
          ? getOrCreateImport(importTracker.action, action, "action", imports)
          : null;

      const errorBoundaryRef =
        ErrorBoundary && isStringExport(ErrorBoundary)
          ? getOrCreateImport(importTracker.errorBoundary, ErrorBoundary, "ErrorBoundary", imports)
          : null;

      const elementIndex = imports.length;
      if (!lazy) {
        imports.push(`import element${elementIndex} from "${fileProtocol(element as string)}";`);
      }

      const lazyLoaderProp = loaderRef ? `loader: ${loaderRef},` : "";
      const lazyActionProp = actionRef ? `action: ${actionRef},` : "";
      const lazyHandleProp = handleRef ? `handle: ${handleRef},` : "";
      const lazyErrorBoundaryProp = errorBoundaryRef ? `ErrorBoundary: ${errorBoundaryRef},` : "";

      const staticLoaderProp = loaderRef ? `loader: ${loaderRef},` : "";
      const staticActionProp = actionRef ? `action: ${actionRef},` : "";
      const staticHandleProp = handleRef ? `handle: ${handleRef},` : "";
      const staticErrorBoundaryProp = errorBoundaryRef ? `ErrorBoundary: ${errorBoundaryRef},` : "";

      if (lazy) {
        return `{
          path: "${route.path}",
          lazy: async () => {
            const element = await import("${fileProtocol(element as string)}");
            return {
              Component: element.default,
              shouldRevalidate: element.shouldRevalidate,
              ${lazyLoaderProp}
              ${lazyActionProp}
              ${lazyHandleProp}
              ${lazyErrorBoundaryProp}
            };
          },
          children: ${!route.children ? "[]" : stringifyRoutes(route.children as NonIndexRouteObject[], imports, lazy, importTracker)}
        }`;
      } else {
        return `{
          path: "${route.path}",
          ${staticLoaderProp}
          ${staticActionProp}
          ${staticHandleProp}
          ${staticErrorBoundaryProp}
          Component: element${elementIndex}.default,
          children: ${!route.children ? "[]" : stringifyRoutes(route.children as NonIndexRouteObject[], imports, lazy, importTracker)}
        }`;
      }
    })
    .join(",");

  return `[${code}]`;
};
