import * as logger from "@moccona/logger";
import { createFilter } from "@rollup/pluginutils";
import { type Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";
import { type Plugin, type ViteDevServer } from "vite";

import { PLUGIN_NAME, PLUGIN_VIRTUAL_MODULE_NAME } from "@/constants";
import {
  arrangeRoutes,
  collectRootRouteRelatedRoute,
  collectRouteFieldKeyRoute,
  collectRoutePages,
  stringifyRoutes,
} from "@/utils";

type ConventionalRouterProps = {
  include: Pattern | Pattern[];
  exclude: Pattern | Pattern[];
  /**
   * Enable lazy load
   **/
  lazy: boolean;
};

const { createScopedLogger } = logger;

export const pluginlog = createScopedLogger(PLUGIN_NAME);

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

export default function ConventionalRouter(
  options: Partial<ConventionalRouterProps> = {},
): Plugin {
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
        const subRoutesPathAppendToParent: string[] = [];

        /**
         * Only need one not found fallback
         */
        const {
          routes = [],
          "404": notFoundRoute,
          layout: rootLayoutRoute,
        } = collectRootRouteRelatedRoute(allRoutes);

        const sideEffectRoutes = collectRouteFieldKeyRoute(routes);

        // 404 Page For Route.
        if (notFoundRoute) {
          subRoutesPathAppendToParent.push(`/${notFoundRoute.path!}`);
        }

        const isolateRoutes = routes.filter(
          (r) =>
            !new Set(sideEffectRoutes.map((route) => route.element)).has(
              r.element,
            ),
        );

        const mapCallback = (r: NonIndexRouteObject) => {
          if (r.path!.startsWith("/")) {
            return r;
          } else {
            return {
              ...r,
              path: `/${r.path}`,
            };
          }
        };

        isolateRoutes
          // First filer
          .filter((r) => r.path!.split("/").length === 1)
          // Start arrange
          .forEach((route) =>
            arrangeRoutes(
              isolateRoutes,
              route,
              subRoutesPathAppendToParent,
              sideEffectRoutes,
            ),
          );

        // Remove all sub routes.
        const intermediaRoutes = isolateRoutes.filter(
          (r) => !subRoutesPathAppendToParent.includes(r.path!),
        );

        subRoutesPathAppendToParent.length = 0;

        intermediaRoutes
          // Second filter
          .filter((r) => r.path!.split("/").length > 2)
          // Start arrange
          .forEach((route) =>
            arrangeRoutes(
              intermediaRoutes,
              route,
              subRoutesPathAppendToParent,
              sideEffectRoutes,
            ),
          );

        let finalRoutes = intermediaRoutes
          .filter((r) => !subRoutesPathAppendToParent.includes(r.path!))
          .map(mapCallback);

        if (rootLayoutRoute) {
          finalRoutes = [
            {
              ...rootLayoutRoute,
              path: "/",
              children: finalRoutes,
            },
          ];
        }

        if (notFoundRoute) {
          finalRoutes.push({ ...notFoundRoute, path: "*" });
        }

        const imports: string[] = [];
        const routeString = stringifyRoutes(finalRoutes, imports, options.lazy);
        return {
          code: `
          ${imports.join("\n")}
          const routes = ${routeString};
          if(import.meta.env.DEV) {
            console.log(routes);
          }
          export default routes;
          `,
        };
      }

      return undefined;
    },
    watchChange(id, change) {
      if (
        filter(id) &&
        (change.event === "create" || change.event === "delete")
      ) {
        this.info(`Prepare restart because ${id} change`);
        devServer.restart().catch((error: unknown) => {
          this.warn(`Restart failed: ${(error as Error).message}`);
        });
      }
    },
  };
}
