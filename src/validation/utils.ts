import type { NonIndexRouteObject } from "react-router";
import type { RouteConflict } from "@/types";

export function detectConflicts(routes: NonIndexRouteObject[]): RouteConflict[] {
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

export function levenshteinDistance(a: string, b: string): number {
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

export const KNOWN_FIELD_KEYS = ["layout", "loader", "errorBoundary", "handle"];

export function findTypo(filename: string): string | null {
  const name = filename.replace(/\.tsx?$/, "");

  for (const key of KNOWN_FIELD_KEYS) {
    const distance = levenshteinDistance(name.toLowerCase(), key.toLowerCase());
    if (distance > 0 && distance <= 2) {
      return key;
    }
  }

  return null;
}
