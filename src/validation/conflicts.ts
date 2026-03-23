import nodepath from "node:path";

import type { NonIndexRouteObject } from "react-router";

import type { RouteConflict, ValidationIssue } from "@/types";

import { detectConflicts, findTypo } from "./utils";

export interface PathValidationResult {
  issues: ValidationIssue[];
  conflicts: RouteConflict[];
}

export function checkPathConflicts(routes: NonIndexRouteObject[]): PathValidationResult {
  const issues: ValidationIssue[] = [];
  const conflicts = detectConflicts(routes);

  for (const conflict of conflicts) {
    issues.push({
      severity: "error",
      message: `Route conflict: "${conflict.path}" is defined by multiple files`,
      files: conflict.files,
      suggestion: "Rename one of the files or merge their content",
    });
  }

  for (const route of routes) {
    const path = route.path!;
    const file = route.element as string;

    if (path.includes("//")) {
      issues.push({
        severity: "error",
        message: `Invalid route path: "${path}" contains empty segment`,
        files: [file],
        suggestion: "Check for consecutive slashes in file path",
      });
    }

    if (path.startsWith("/")) {
      issues.push({
        severity: "warn",
        message: `Route path should not start with "/": "${path}"`,
        files: [file],
      });
    }
  }

  return {
    issues,
    conflicts,
  };
}

export function checkFieldKeyTypos(
  sideEffectRoutes: NonIndexRouteObject[],
  allRoutes: NonIndexRouteObject[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const route of sideEffectRoutes) {
    const basename = nodepath.basename(route.element as string);

    const typo = findTypo(basename);
    if (typo) {
      issues.push({
        severity: "warn",
        message: `Possible typo in field key file: "${basename}"`,
        files: [route.element as string],
        suggestion: `Did you mean "${typo}.tsx"?`,
      });
    }

    if (basename.includes(".")) {
      const baseRouteName = basename.split(".")[0];
      const expectedPath = nodepath.join(nodepath.dirname(route.element as string), baseRouteName);

      const exists = allRoutes.some((r) => (r.element as string).includes(expectedPath));

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

  return issues;
}
