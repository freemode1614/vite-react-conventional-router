import * as logger from "@moccona/logger";
import { PLUGIN_NAME } from "@/constants";

const { createScopedLogger } = logger;

/**
 * Scoped logger for the plugin.
 * Exported from a separate module to avoid circular dependencies.
 */
export const pluginlog = createScopedLogger(PLUGIN_NAME);
