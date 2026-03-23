import type { NonIndexRouteObject } from "react-router";
import { describe, expect, it } from "vitest";
import type { ImportTracker } from "../src/types";
import { stringifyRoutes } from "../src/utils/imports";
import { filePathToRoutePath } from "../src/utils/scan";

describe("filePathToRoutePath", () => {
  it("should convert index.tsx to empty string (root route)", () => {
    expect(filePathToRoutePath("index.tsx")).toBe("");
  });

  it("should convert dynamic route with @ prefix", () => {
    expect(filePathToRoutePath("user.@id.tsx")).toBe("user/:id");
  });

  it("should convert nested dynamic route", () => {
    expect(filePathToRoutePath("blog/post.@slug.tsx")).toBe("blog/post/:slug");
  });

  it("should convert optional parameter route with $ prefix", () => {
    expect(filePathToRoutePath("posts.$optional.tsx")).toBe("posts/:optional?");
  });

  it("should keep _ prefix unchanged (splat handled elsewhere)", () => {
    expect(filePathToRoutePath("_splat.tsx")).toBe("_splat");
  });

  it("should handle regular nested routes", () => {
    expect(filePathToRoutePath("dashboard/settings.tsx")).toBe("dashboard/settings");
  });

  it("should handle mixed dynamic and regular segments", () => {
    expect(filePathToRoutePath("api/@version/users.@id.tsx")).toBe("api/:version/users/:id");
  });
});

describe("stringifyRoutes", () => {
  const createImportTracker = (): ImportTracker => ({
    loader: new Map(),
    handle: new Map(),
    action: new Map(),
    errorBoundary: new Map(),
  });

  const mockRoute: NonIndexRouteObject = {
    path: "test",
    element: "/path/to/Test.tsx",
  };

  describe("normal mode (lazy=false)", () => {
    it("should generate normal route code with element import", () => {
      const imports: string[] = [];
      const result = stringifyRoutes([mockRoute], imports, false, createImportTracker());

      expect(result).toContain('path: "test"');
      expect(result).toContain("Component: element0.default");
      expect(imports[0]).toContain('import element0 from "/path/to/Test.tsx"');
    });

    it("should generate unique import identifiers for duplicate element paths", () => {
      const imports: string[] = [];
      const tracker = createImportTracker();
      const routes: NonIndexRouteObject[] = [
        { path: "page1", element: "/shared/Page.tsx" },
        { path: "page2", element: "/shared/Page.tsx" },
        { path: "page3", element: "/shared/Page.tsx" },
      ];

      const result = stringifyRoutes(routes, imports, false, tracker);

      expect(imports.filter((imp) => imp.includes("/shared/Page.tsx")).length).toBe(3);
      expect(result).toContain("element0.default");
      expect(result).toContain("element1.default");
      expect(result).toContain("element2.default");
    });

    it("should include loader, action, handle, and ErrorBoundary when provided", () => {
      const imports: string[] = [];
      const route = {
        path: "dashboard",
        element: "/pages/Dashboard.tsx",
        loader: "/loaders/dashboard.loader.ts",
        action: "/actions/dashboard.action.ts",
        handle: "/handles/dashboard.handle.ts",
        ErrorBoundary: "/components/DashboardErrorBoundary.tsx",
      } as unknown as NonIndexRouteObject;

      const result = stringifyRoutes([route], imports, false, createImportTracker());

      expect(result).toContain("loader: loader0");
      expect(result).toContain("action: action0");
      expect(result).toContain("handle: handle0");
      expect(result).toContain("ErrorBoundary: ErrorBoundary0");
      expect(imports.length).toBe(5);
    });

    it("should handle nested routes", () => {
      const imports: string[] = [];
      const routes: NonIndexRouteObject[] = [
        {
          path: "parent",
          element: "/pages/Parent.tsx",
          children: [{ path: "child", element: "/pages/Child.tsx" }],
        },
      ];

      const result = stringifyRoutes(routes, imports, false, createImportTracker());

      expect(result).toContain('path: "parent"');
      expect(result).toContain('path: "child"');
      expect(result).toContain("children:");
    });

    it("snapshot: normal mode route generation", () => {
      const imports: string[] = [];
      const routes: NonIndexRouteObject[] = [
        { path: "home", element: "/pages/Home.tsx" },
        { path: "about", element: "/pages/About.tsx" },
      ];

      const result = stringifyRoutes(routes, imports, false, createImportTracker());

      expect(result).toMatchSnapshot();
      expect(imports).toMatchSnapshot();
    });
  });

  describe("lazy mode (lazy=true)", () => {
    it("should generate lazy route code with dynamic import", () => {
      const imports: string[] = [];
      const result = stringifyRoutes([mockRoute], imports, true, createImportTracker());

      expect(result).toContain('path: "test"');
      expect(result).toContain("lazy: async () =>");
      expect(result).toContain('await import("/path/to/Test.tsx")');
      expect(result).toContain("Component: element.default");
      // No element import in lazy mode
      expect(result).not.toContain("import element0");
    });

    it("should include loader, action, handle, and ErrorBoundary in lazy mode", () => {
      const imports: string[] = [];
      const route = {
        path: "settings",
        element: "/pages/Settings.tsx",
        loader: "/loaders/settings.loader.ts",
        action: "/actions/settings.action.ts",
        handle: "/handles/settings.handle.ts",
        ErrorBoundary: "/components/SettingsErrorBoundary.tsx",
      } as unknown as NonIndexRouteObject;

      const result = stringifyRoutes([route], imports, true, createImportTracker());

      expect(result).toContain("loader: loader0");
      expect(result).toContain("action: action0");
      expect(result).toContain("handle: handle0");
      expect(result).toContain("ErrorBoundary: ErrorBoundary0");
      expect(imports.length).toBe(4);
    });

    it("should handle nested routes in lazy mode", () => {
      const imports: string[] = [];
      const routes: NonIndexRouteObject[] = [
        {
          path: "app",
          element: "/layouts/App.tsx",
          children: [
            { path: "dashboard", element: "/pages/Dashboard.tsx" },
            { path: "settings", element: "/pages/Settings.tsx" },
          ],
        },
      ];

      const result = stringifyRoutes(routes, imports, true, createImportTracker());

      expect(result).toContain('path: "app"');
      expect(result).toContain('path: "dashboard"');
      expect(result).toContain('path: "settings"');
      expect(result).toContain("lazy: async () =>");
    });

    it("snapshot: lazy mode route generation", () => {
      const imports: string[] = [];
      const routes: NonIndexRouteObject[] = [
        { path: "home", element: "/pages/Home.tsx" },
        { path: "about", element: "/pages/About.tsx" },
      ];

      const result = stringifyRoutes(routes, imports, true, createImportTracker());

      expect(result).toMatchSnapshot();
      expect(imports).toMatchSnapshot();
    });
  });

  describe("empty routes", () => {
    it("should return empty array for empty routes", () => {
      const imports: string[] = [];
      const result = stringifyRoutes([], imports, false, createImportTracker());

      expect(result).toBe("[]");
      expect(imports.length).toBe(0);
    });
  });
});
