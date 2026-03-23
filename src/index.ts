import { createFilter } from "@rollup/pluginutils";
import type { Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";
import type { Plugin, ViteDevServer } from "vite";

import { PLUGIN_NAME, PLUGIN_VIRTUAL_MODULE_NAME } from "@/constants";
import { generateRouteCode } from "@/generators/routeCode";
import { pluginlog } from "@/logger";
import type { ConventionalRouterProps } from "@/types";
import { collectRootRouteRelatedRoute } from "@/utils/layout";
import { collectRouteFiles as collectRoutePages } from "@/utils/scan";
import { buildRouteTree, collectRouteFieldKeyRoute } from "@/utils/tree";
import { logValidationIssues, validateRoutes } from "@/validation";

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
