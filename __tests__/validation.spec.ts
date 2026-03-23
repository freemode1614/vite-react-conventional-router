import type { NonIndexRouteObject } from "react-router";
import { describe, expect, it } from "vitest";

import { validateRouteExport, validateRoutes } from "@/validation";

describe("Route Validation", () => {
  describe("Conflict Detection", () => {
    it("should detect when multiple files map to the same route path", () => {
      const routes: NonIndexRouteObject[] = [
        { path: "home", element: "/src/pages/home.tsx" },
        { path: "home", element: "/src/pages/home/index.tsx" },
      ];

      const result = validateRoutes(routes, []);

      expect(result.valid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].path).toBe("home");
      expect(result.conflicts[0].files).toHaveLength(2);
    });

    it("should pass when no conflicts exist", () => {
      const routes: NonIndexRouteObject[] = [
        { path: "home", element: "/src/pages/home.tsx" },
        { path: "about", element: "/src/pages/about.tsx" },
      ];

      const result = validateRoutes(routes, []);

      expect(result.valid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe("Path Validation", () => {
    it("should report error for empty path segments", () => {
      const routes: NonIndexRouteObject[] = [
        { path: "home//about", element: "/src/pages/home..about.tsx" },
      ];

      const result = validateRoutes(routes, []);

      const errorIssue = result.issues.find((i) => i.message.includes("empty segment"));
      expect(errorIssue).toBeDefined();
      expect(errorIssue?.severity).toBe("error");
    });

    it("should warn for paths starting with slash", () => {
      const routes: NonIndexRouteObject[] = [{ path: "/home", element: "/src/pages/home.tsx" }];

      const result = validateRoutes(routes, []);

      const warnIssue = result.issues.find((i) => i.message.includes("should not start"));
      expect(warnIssue).toBeDefined();
      expect(warnIssue?.severity).toBe("warn");
    });
  });

  describe("Typo Detection", () => {
    it("should warn about possible typos in field key names", () => {
      const routes: NonIndexRouteObject[] = [{ path: "home", element: "/src/pages/home.tsx" }];
      const sideEffectRoutes: NonIndexRouteObject[] = [
        { path: "layuot", element: "/src/pages/layuot.tsx" }, // typo: layuot
      ];

      const result = validateRoutes(routes, sideEffectRoutes);

      const typoIssue = result.issues.find((i) => i.message.includes("typo"));
      expect(typoIssue).toBeDefined();
      expect(typoIssue?.severity).toBe("warn");
    });
  });

  describe("Orphaned Field Keys", () => {
    it("should warn about field keys without matching parent routes", () => {
      const routes: NonIndexRouteObject[] = [{ path: "home", element: "/src/pages/home.tsx" }];
      const sideEffectRoutes: NonIndexRouteObject[] = [
        {
          path: "nonexistent.layout",
          element: "/src/pages/nonexistent.layout.tsx",
        },
      ];

      const result = validateRoutes(routes, sideEffectRoutes);

      const orphanIssue = result.issues.find((i) => i.message.includes("matching parent"));
      // Note: This is a simplified check, actual implementation may vary
      expect(orphanIssue?.severity).toBe("warn");
    });
  });

  describe("Loader Export Validation", () => {
    it("should return valid for function loader", () => {
      const loader = () => Promise.resolve({ data: "test" });
      const result = validateRouteExport(loader);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return valid for async function loader", () => {
      const asyncLoader = async () => ({ data: "test" });
      const result = validateRouteExport(asyncLoader);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return valid for string loader (module path)", () => {
      const stringLoader = "/src/loaders/home.loader.ts";
      const result = validateRouteExport(stringLoader);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return invalid for undefined loader", () => {
      const result = validateRouteExport(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("No default export in loader file");
    });

    it("should return invalid for null loader", () => {
      const result = validateRouteExport(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("No default export in loader file");
    });

    it("should return invalid for non-function/non-string loader", () => {
      const result = validateRouteExport(123);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Loader must be a function or string");
    });

    it("should return invalid for object loader", () => {
      const result = validateRouteExport({});

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Loader must be a function or string");
    });

    it("should return invalid for array loader", () => {
      const result = validateRouteExport([]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Loader must be a function or string");
    });

    it("should return invalid for boolean loader", () => {
      const result = validateRouteExport(true);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Loader must be a function or string");
    });
  });
});
