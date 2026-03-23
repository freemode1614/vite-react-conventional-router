import type { NonIndexRouteObject } from "react-router";

import { stringifyRoutes } from "@/utils/imports";
import { pluginlog } from "@/logger";

export function generateRouteCode(finalRoutes: NonIndexRouteObject[], lazy: boolean): string {
  const imports: string[] = [];
  const routeString = stringifyRoutes(finalRoutes, imports, lazy);

  pluginlog.info("Generated routes:", finalRoutes);

  return `
          ${imports.join("\n")}
          const routes = ${routeString};
          export default routes;
          `;
}
