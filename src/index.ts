import { createScopedLogger } from "@moccona/logger";
import { createFilter } from "@rollup/pluginutils";
import { type Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";
import type { Plugin, ViteDevServer } from "vite";

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
};

export const logger = createScopedLogger(PLUGIN_NAME);

export default function ConventionalRouter(
  options?: Partial<ConventionalRouterProps>,
): Plugin {
  options = { include: [], exclude: [], ...(options ?? {}) };

  let { include } = options;
  let { exclude } = options;

  // Filtering the real page files.
  const filter = createFilter(include, exclude);

  // Constrcut filter patterns
  include = (Array.isArray(include) ? include : [include]) as string[];
  exclude = (Array.isArray(exclude) ? exclude : [exclude]) as string[];

  let devServer: ViteDevServer;

  return {
    name: PLUGIN_NAME,
    configureServer(server) {
      devServer = server;
    },
    resolveId(source) {
      if (source === PLUGIN_VIRTUAL_MODULE_NAME) {
        logger.info("Read virtual routes");
        return source;
      }

      return undefined;
    },
    load(id) {
      if (id === PLUGIN_VIRTUAL_MODULE_NAME) {
        const allRoutes = collectRoutePages(include, exclude);
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

        // 2.
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

        return {
          code: `
          const routes = ${stringifyRoutes(finalRoutes)};
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
