import type { NonIndexRouteObject } from "react-router";
import { describe, expect, it } from "vitest";
import { generateRouteCode } from "../src/generators/routeCode.js";

describe("generateRouteCode", () => {
  it("should generate route code with imports and exports", () => {
    const routes: NonIndexRouteObject[] = [
      {
        path: "/",
        element: "/pages/Home.tsx",
      },
      {
        path: "/about",
        element: "/pages/About.tsx",
      },
    ];

    const result = generateRouteCode(routes, false);

    expect(result).toContain("import element0 from");
    expect(result).toContain("import element1 from");
    expect(result).toContain("const routes =");
    expect(result).toContain("export default routes");
    expect(result).toContain('path: "/"');
    expect(result).toContain('path: "/about"');
  });

  it("should generate lazy route code with dynamic imports", () => {
    const routes: NonIndexRouteObject[] = [
      {
        path: "/",
        element: "/pages/Home.tsx",
      },
    ];

    const result = generateRouteCode(routes, true);

    expect(result).toContain("lazy: async () =>");
    expect(result).toContain('await import("/pages/Home.tsx")');
    expect(result).toContain("Component: element.default");
    // No element import in lazy mode
    expect(result).not.toContain("import element0 from");
  });

  it("should include loader, action, handle, and ErrorBoundary", () => {
    const routes: NonIndexRouteObject[] = [
      {
        path: "/dashboard",
        element: "/pages/Dashboard.tsx",
        loader: "/loaders/dashboard.loader.ts",
        action: "/actions/dashboard.action.ts",
        handle: "/handles/dashboard.handle.ts",
        ErrorBoundary: "/components/DashboardErrorBoundary.tsx",
      },
    ] as unknown as NonIndexRouteObject[];

    const result = generateRouteCode(routes, false);

    expect(result).toContain("import loader0 from");
    expect(result).toContain("import action0 from");
    expect(result).toContain("import handle0 from");
    expect(result).toContain("import ErrorBoundary0 from");
    expect(result).toContain("loader: loader0");
    expect(result).toContain("action: action0");
    expect(result).toContain("handle: handle0");
    expect(result).toContain("ErrorBoundary: ErrorBoundary0");
  });

  it("should handle nested routes", () => {
    const routes: NonIndexRouteObject[] = [
      {
        path: "/app",
        element: "/layouts/App.tsx",
        children: [
          {
            path: "/dashboard",
            element: "/pages/Dashboard.tsx",
          },
          {
            path: "/settings",
            element: "/pages/Settings.tsx",
          },
        ],
      },
    ];

    const result = generateRouteCode(routes, false);

    expect(result).toContain('path: "/app"');
    expect(result).toContain('path: "/dashboard"');
    expect(result).toContain('path: "/settings"');
    expect(result).toContain("children:");
  });

  it("snapshot: generateRouteCode() output with normal mode", () => {
    const routes: NonIndexRouteObject[] = [
      {
        path: "/",
        element: "/pages/index.tsx",
      },
      {
        path: "/about",
        element: "/pages/about.tsx",
      },
      {
        path: "/user/:id",
        element: "/pages/user.@id.tsx",
        loader: "/pages/user.@id.loader.ts" as unknown as NonIndexRouteObject["loader"],
      },
      {
        path: "/dashboard",
        element: "/layouts/Dashboard.tsx",
        children: [
          {
            path: "/dashboard/overview",
            element: "/pages/dashboard/overview.tsx",
          },
          {
            path: "/dashboard/settings",
            element: "/pages/dashboard/settings.tsx",
          },
        ],
      },
    ];

    const result = generateRouteCode(routes, false);

    expect(result).toMatchSnapshot();
  });

  it("snapshot: generateRouteCode() output with lazy mode", () => {
    const routes: NonIndexRouteObject[] = [
      {
        path: "/",
        element: "/pages/index.tsx",
      },
      {
        path: "/about",
        element: "/pages/about.tsx",
      },
      {
        path: "/user/:id",
        element: "/pages/user.@id.tsx",
        loader: "/pages/user.@id.loader.ts" as unknown as NonIndexRouteObject["loader"],
      },
      {
        path: "/dashboard",
        element: "/layouts/Dashboard.tsx",
        children: [
          {
            path: "/dashboard/overview",
            element: "/pages/dashboard/overview.tsx",
          },
          {
            path: "/dashboard/settings",
            element: "/pages/dashboard/settings.tsx",
          },
        ],
      },
    ];

    const result = generateRouteCode(routes, true);

    expect(result).toMatchSnapshot();
  });
});
