import nodepath from "node:path";

import type { NonIndexRouteObject } from "react-router";

import { pluginlog } from "@/logger";

/**
 * Represents a route conflict where multiple files map to the same route path.
 */
export interface RouteConflict {
  /** The conflicting route path */
  path: string;
  /** The files that map to this path */
  files: string[];
}

/**
 * Severity level for validation issues.
 */
export type Severity = "error" | "warn" | "info";

/**
 * Represents a validation issue found during route processing.
 */
export interface ValidationIssue {
  /** Severity of the issue */
  severity: Severity;
  /** Human-readable message describing the issue */
  message: string;
  /** The file(s) involved in the issue */
  files?: string[];
  /** Suggestion for fixing the issue */
  suggestion?: string;
}

/**
 * Result of route validation containing any conflicts or issues found.
 */
export interface ValidationResult {
  /** Whether the routes are valid (no errors) */
  valid: boolean;
  /** Array of validation issues found */
  issues: ValidationIssue[];
  /** Array of route conflicts found */
  conflicts: RouteConflict[];
}

/**
 * Detects conflicts where multiple files map to the same route path.
 *
 * Example conflict:
 * - src/pages/home.tsx
 * - src/pages/home/index.tsx
 * Both would generate the route path "home"
 *
 * @param routes - All route objects to check
 * @returns Array of route conflicts found
 */
function detectConflicts(routes: NonIndexRouteObject[]): RouteConflict[] {
  const pathMap = new Map<string, string[]>();

  for (const route of routes) {
    const path = route.path!;
    const file = route.element as string;

    if (!pathMap.has(path)) {
      pathMap.set(path, []);
    }
    pathMap.get(path)!.push(file);
  }

  return Array.from(pathMap.entries())
    .filter(([_, files]) => files.length > 1)
    .map(([path, files]) => ({ path, files }));
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for detecting potential typos in field key names.
 *
 * @param a - First string
 * @param b - Second string
 * @returns The edit distance between the strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Known field key names for typo detection.
 */
const KNOWN_FIELD_KEYS = ["layout", "loader", "errorBoundary", "handle"];

/**
 * Checks if a filename might be a typo of a known field key.
 *
 * @param filename - The filename to check
 * @returns The closest matching field key if similar, null otherwise
 */
function findTypo(filename: string): string | null {
  // Remove file extension
  const name = filename.replace(/\.tsx?$/, "");

  for (const key of KNOWN_FIELD_KEYS) {
    const distance = levenshteinDistance(name.toLowerCase(), key.toLowerCase());
    // If within 2 edits and not exact match, it's likely a typo
    if (distance > 0 && distance <= 2) {
      return key;
    }
  }

  return null;
}

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
  const issues: ValidationIssue[] = [];
  const conflicts = detectConflicts(allRoutes);

  // Report conflicts as errors
  for (const conflict of conflicts) {
    issues.push({
      severity: "error",
      message: `Route conflict: "${conflict.path}" is defined by multiple files`,
      files: conflict.files,
      suggestion: "Rename one of the files or merge their content",
    });
  }

  // Check for orphaned field keys and typos
  for (const route of sideEffectRoutes) {
    const basename = nodepath.basename(route.element as string);

    // Check for typos in field key names
    const typo = findTypo(basename);
    if (typo) {
      issues.push({
        severity: "warn",
        message: `Possible typo in field key file: "${basename}"`,
        files: [route.element as string],
        suggestion: `Did you mean "${typo}.tsx"?`,
      });
    }

    // Check if route-level field key has matching parent route
    // e.g., home.layout.tsx should have home.tsx or home/index.tsx
    if (basename.includes(".")) {
      // Field key is like home.layout.tsx - check if home exists
      const baseRouteName = basename.split(".")[0];
      const expectedPath = nodepath.join(
        nodepath.dirname(route.element as string),
        baseRouteName,
      );

      // This is a simplified check
      const exists = allRoutes.some((r) =>
        (r.element as string).includes(expectedPath),
      );

      if (!exists) {
        issues.push({
          severity: "warn",
          message: `Field key "${basename}" may not have a matching parent route`,
          files: [route.element as string],
          suggestion: `Ensure a route file exists for "${baseRouteName}"`,
        });
      }
    }
  }

  // Validate path patterns
  for (const route of allRoutes) {
    const path = route.path!;

    // Check for empty path segments (double slashes)
    if (path.includes("//")) {
      issues.push({
        severity: "error",
        message: `Invalid route path: "${path}" contains empty segment`,
        files: [route.element as string],
        suggestion: "Check for consecutive slashes in file path",
      });
    }

    // Check for paths starting with slash
    if (path.startsWith("/")) {
      issues.push({
        severity: "warn",
        message: `Route path should not start with "/": "${path}"`,
        files: [route.element as string],
      });
    }
  }

  return {
    valid: !issues.some((i) => i.severity === "error"),
    issues,
    conflicts,
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
