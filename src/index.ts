import { createFilter } from "@rollup/pluginutils";
import type { Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";
import type { Plugin, ViteDevServer } from "vite";

import { PLUGIN_NAME, PLUGIN_VIRTUAL_MODULE_NAME } from "@/constants";
import { pluginlog } from "@/logger";
import {
  arrangeRoutes,
  collectRootRouteRelatedRoute,
  collectRouteFieldKeyRoute,
  collectRoutePages,
  stringifyRoutes,
} from "@/utils";
import { logValidationIssues, validateRoutes } from "@/validation";

type ConventionalRouterProps = {
  include: Pattern | Pattern[];
  exclude: Pattern | Pattern[];
  /**
   * Enable lazy load
   **/
  lazy: boolean;
};

/**
 *
 * Create a file filter base on the include and exclude.
 *
 */
const createFileFilter = (
  include: ConventionalRouterProps["include"] = [],
  exclude: ConventionalRouterProps["exclude"] = [],
) => createFilter(include, exclude);

/**
 *
 * Merge plugin options with default.
 *
 */
const mergeDefaultOptions = (
  options: Partial<ConventionalRouterProps>,
): Omit<ConventionalRouterProps, "include" | "exclude"> & {
  include: Pattern[];
  exclude: Pattern[];
} => {
  const _opt_ = Object.assign(
    {},
    {
      include: [],
      exclude: [],
      lazy: false,
    },
    options,
  );

  if (!Array.isArray(_opt_.include)) {
    _opt_.include = [_opt_.include];
  }

  if (!Array.isArray(_opt_.exclude)) {
    _opt_.exclude = [_opt_.exclude];
  }

  return _opt_;
};

/**
 * Build a hierarchical route tree from a flat array of route records.
 *
 * @param routes - Flat array of route records to organize into tree structure
 * @returns Tree-structured array of routes with proper parent-child relationships
 */
function buildRouteTree(routes: NonIndexRouteObject[]): NonIndexRouteObject[] {
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

/**
 * Apply root layout wrapper to route tree.
 *
 * Wraps all routes with a root layout component if present,
 * making the root layout the parent of all other routes.
 *
 * @param routes - Array of routes to wrap with layout
 * @param rootLayout - Root layout route record (optional)
 * @returns New array of routes, wrapped with layout if provided
 */
function applyLayouts(
  routes: NonIndexRouteObject[],
  rootLayout: NonIndexRouteObject | undefined,
): NonIndexRouteObject[] {
  if (!rootLayout) {
    return routes;
  }

  return [{ ...rootLayout, path: "/", children: routes }];
}

/**
 * Generate route configuration code string from route tree.
 *
 * This function creates the final JavaScript code for the virtual module by:
 * 1. Collecting all route component imports into an imports array
 * 2. Using stringifyRoutes() to serialize the route tree into code
 * 3. Wrapping the generated code with module exports and dev-mode logging
 *
 * @param finalRoutes - Tree-structured array of routes to serialize
 * @param lazy - Whether to enable lazy loading for route components
 * @returns Generated JavaScript code string for the virtual module
 */
function generateRouteCode(finalRoutes: NonIndexRouteObject[], lazy: boolean): string {
  const imports: string[] = [];
  const routeString = stringifyRoutes(finalRoutes, imports, lazy);

  return `
          ${imports.join("\n")}
          const routes = ${routeString};
          if(import.meta.env.DEV) {
            console.log(routes);
          }
          export default routes;
          `;
}

export default function ConventionalRouter(options: Partial<ConventionalRouterProps> = {}): Plugin {
  const _options = mergeDefaultOptions(options);
  const filter = createFileFilter(_options.include, _options.exclude);
  let devServer: ViteDevServer;

  return {
    name: PLUGIN_NAME,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config(config, _env) {
      // const envs = loadEnv(env.mode, config.envDir ?? ".", "");
      // const { BASE_NAME } = envs;
      // config.base = BASE_NAME || config.base;
      return config;
    },
    /**
     * Get vite dev server instance.
     */
    configureServer(server) {
      devServer = server;
    },
    /**
     * Auto-gen route config access by vitural module "virtual:routes"
     */
    resolveId(source) {
      if (source === PLUGIN_VIRTUAL_MODULE_NAME) {
        pluginlog.info("Read virtual routes");
        return source;
      }

      return undefined;
    },
    /**
     * Parse folder structure to generate code.
     */
    load(id) {
      if (id === PLUGIN_VIRTUAL_MODULE_NAME) {
        const allRoutes = collectRoutePages(_options.include, _options.exclude);

        const {
          layout: rootLayoutRoute,
          loader: rootLoaderRoute,
          handle: rootHandleRoute,
        } = collectRootRouteRelatedRoute(allRoutes);

        // Merge root field keys (loader, handle) into root layout route
        if (rootLayoutRoute) {
          if (rootLoaderRoute) {
            (rootLayoutRoute as NonIndexRouteObject).loader =
              rootLoaderRoute.element as unknown as NonIndexRouteObject["loader"];
          }
          if (rootHandleRoute) {
            (rootLayoutRoute as NonIndexRouteObject).handle = rootHandleRoute.element;
          }
        }

        const sideEffectRoutes = collectRouteFieldKeyRoute(allRoutes);

        // Validate routes and log any issues
        const validation = validateRoutes(allRoutes, sideEffectRoutes);
        if (validation.issues.length > 0) {
          logValidationIssues(validation);
        }

        // Throw error if there are critical issues
        if (!validation.valid) {
          const errorCount = validation.issues.filter((i) => i.severity === "error").length;
          throw new Error(
            `Route validation failed with ${errorCount} error(s). Check console for details.`,
          );
        }

        const finalRoutes = buildRouteTree(allRoutes);

        return {
          code: generateRouteCode(finalRoutes, options.lazy ?? false),
        };
      }

      return undefined;
    },
    watchChange(id, change) {
      if (filter(id) && (change.event === "create" || change.event === "delete")) {
        this.info(`Prepare restart because ${id} change`);
        devServer.restart().catch((error: unknown) => {
          this.warn(`Restart failed: ${(error as Error).message}`);
        });
      }
    },
  };
}
