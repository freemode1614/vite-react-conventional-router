import type { NonIndexRouteObject } from "react-router";

import { pluginlog } from "@/logger";
import type { ValidationResult } from "@/types";

import { LOADER_ERROR_NO_DEFAULT_EXPORT } from "./errors";
import { checkPathConflicts, checkFieldKeyTypos } from "./validation/conflicts";

/**
 * Validates all routes for potential issues.
 *
 * Checks performed:
 * 1. Route conflicts (multiple files mapping to same path)
 * 2. Orphaned field keys (layout/loader files without matching route)
 * 3. Path validation (empty segments, invalid patterns)
 * 4. Typo detection in field key names
 *
 * @param allRoutes - All discovered routes
 * @param sideEffectRoutes - Routes that are field keys
 * @returns Validation result with any issues found
 */
export function validateRoutes(
  allRoutes: NonIndexRouteObject[],
  sideEffectRoutes: NonIndexRouteObject[],
): ValidationResult {
  const pathValidation = checkPathConflicts(allRoutes);
  const fieldKeyIssues = checkFieldKeyTypos(sideEffectRoutes, allRoutes);

  const issues = [...pathValidation.issues, ...fieldKeyIssues];

  return {
    valid: !issues.some((i) => i.severity === "error"),
    issues,
    conflicts: pathValidation.conflicts,
  };
}

/**
 * Validates that a route export has a valid loader.
 *
 * Loaders must be either:
 * - A function (loader function)
 * - A string (module path)
 *
 * @param loader - The loader export to validate
 * @returns Validation result with success status and any error message
 */
export function validateRouteExport(loader: unknown): {
  valid: boolean;
  error?: string;
} {
  if (loader === undefined || loader === null) {
    return {
      valid: false,
      error: LOADER_ERROR_NO_DEFAULT_EXPORT,
    };
  }

  if (typeof loader === "function") {
    return { valid: true };
  }

  if (typeof loader === "string") {
    return { valid: true };
  }

  return {
    valid: false,
    error: `Loader must be a function or string, got ${typeof loader}`,
  };
}

/**
 * Logs validation issues to the console with appropriate formatting.
 *
 * @param result - The validation result to log
 */
export function logValidationIssues(result: ValidationResult): void {
  for (const issue of result.issues) {
    const prefix = issue.severity === "error" ? "❌" : issue.severity === "warn" ? "⚠️" : "ℹ️";
    const message = `${prefix} ${issue.message}`;

    switch (issue.severity) {
      case "error":
        pluginlog.error(message);
        break;
      case "warn":
        pluginlog.warn(message);
        break;
      case "info":
        pluginlog.info(message);
        break;
    }

    if (issue.files && issue.files.length > 0) {
      for (const file of issue.files) {
        pluginlog.info(`  → ${file}`);
      }
    }

    if (issue.suggestion) {
      pluginlog.info(`  💡 ${issue.suggestion}`);
    }
  }
}
