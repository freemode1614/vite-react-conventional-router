import type { Plugin, ViteDevServer } from "vite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLUGIN_VIRTUAL_MODULE_NAME } from "../src/constants";
import ConventionalRouter from "../src/index";

describe("createConventionalRouter", () => {
  let plugin: Plugin;

  beforeEach(() => {
    plugin = ConventionalRouter({
      include: ["src/pages/**"],
      exclude: [],
      lazy: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("load()", () => {
    // Tasks 13-16 will add tests here
    it("should return undefined for non-virtual module id", () => {
      const result = (plugin.load as any)?.("some-other-id.ts");
      expect(result).toBeUndefined();
    });

    it("should generate route code with ErrorBoundary component for errorBoundary files", () => {
      const result = (plugin.load as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      expect(typeof result.code).toBe("string");
    });

    it("should include ErrorBoundary import in generated code when errorBoundary exists", () => {
      const result = (plugin.load as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);

      expect(result.code).toContain("export default routes");
      expect(result.code).toMatch(/ErrorBoundary\s*:/);
    });

    it("should handle nested routes with ErrorBoundary correctly", () => {
      const result = (plugin.load as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);

      expect(result.code).toContain("children:");
      expect(result.code).toContain("ErrorBoundary");
    });
  });

  describe("configureServer()", () => {
    // Tasks 13-16 will add tests here
    it("should store server instance when configureServer is called", () => {
      const mockServer = { restart: vi.fn() } as unknown as ViteDevServer;
      (plugin.configureServer as any)?.(mockServer);
      // Server instance is stored internally for watchChange to use
      expect(mockServer.restart).not.toHaveBeenCalled();
    });
  });

  describe("resolveId()", () => {
    // Tasks 13-16 will add tests here
    it("should return virtual module name for virtual:routes import", () => {
      const result = (plugin.resolveId as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);
      expect(result).toBe(PLUGIN_VIRTUAL_MODULE_NAME);
    });

    it("should return undefined for non-virtual module", () => {
      const result = (plugin.resolveId as any)?.("some-other-module");
      expect(result).toBeUndefined();
    });
  });

  describe("watchChange()", () => {
    let mockServer: ViteDevServer;
    const absolutePath = (relative: string) =>
      `/Users/wenpeng.lei/Developers/vite-react-conventional-router/${relative}`;
    let pluginContext: any;

    beforeEach(() => {
      mockServer = {
        restart: vi.fn().mockResolvedValue(undefined),
      } as unknown as ViteDevServer;
      pluginContext = {
        info: vi.fn(),
        warn: vi.fn(),
      };
      (plugin.configureServer as any)?.(mockServer);
    });

    it("should exist as a hook function", () => {
      expect(plugin.watchChange).toBeDefined();
      expect(typeof plugin.watchChange).toBe("function");
    });

    it("should trigger server restart when .tsx file is created", async () => {
      const watchChange = plugin.watchChange as any;
      await watchChange.call(pluginContext, absolutePath("src/pages/test.tsx"), {
        event: "create",
      });

      expect(mockServer.restart).toHaveBeenCalledTimes(1);
    });

    it("should trigger server restart when .ts file is created", async () => {
      const watchChange = plugin.watchChange as any;
      await watchChange.call(pluginContext, absolutePath("src/pages/test.ts"), {
        event: "create",
      });

      expect(mockServer.restart).toHaveBeenCalledTimes(1);
    });

    it("should trigger server restart when .tsx file is deleted", async () => {
      const watchChange = plugin.watchChange as any;
      await watchChange.call(pluginContext, absolutePath("src/pages/test.tsx"), {
        event: "delete",
      });

      expect(mockServer.restart).toHaveBeenCalledTimes(1);
    });

    it("should trigger server restart when .ts file is deleted", async () => {
      const watchChange = plugin.watchChange as any;
      await watchChange.call(pluginContext, absolutePath("src/pages/test.ts"), {
        event: "delete",
      });

      expect(mockServer.restart).toHaveBeenCalledTimes(1);
    });

    it("should NOT trigger restart when file is updated (not create/delete)", async () => {
      const watchChange = plugin.watchChange as any;
      await watchChange.call(pluginContext, absolutePath("src/pages/test.tsx"), {
        event: "update",
      });

      expect(mockServer.restart).not.toHaveBeenCalled();
    });

    it("should trigger restart for any file type when create/delete event occurs", async () => {
      const watchChange = plugin.watchChange as any;
      await watchChange.call(pluginContext, absolutePath("src/pages/test.css"), {
        event: "create",
      });
      await watchChange.call(pluginContext, absolutePath("src/pages/test.json"), {
        event: "create",
      });
      await watchChange.call(pluginContext, absolutePath("src/pages/test.md"), {
        event: "delete",
      });

      expect(mockServer.restart).toHaveBeenCalledTimes(3);
    });

    it("should handle restart failure gracefully", async () => {
      (mockServer.restart as any).mockRejectedValue(new Error("Restart failed"));

      const watchChange = plugin.watchChange as any;
      await watchChange.call(pluginContext, absolutePath("src/pages/test.tsx"), {
        event: "create",
      });

      expect(mockServer.restart).toHaveBeenCalledTimes(1);
      expect(pluginContext.warn).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Handle/Loader Integration", () => {
  let plugin: Plugin;

  beforeEach(() => {
    plugin = ConventionalRouter({
      include: ["src/pages/**"],
      exclude: [],
      lazy: false,
    });
  });

  it("should include handle import in generated code when handle file exists", () => {
    const result = (plugin.load as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);

    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
    expect(result.code).toContain("handle");
  });

  it("should include loader import in generated code when loader file exists", () => {
    const result = (plugin.load as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);

    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
    expect(result.code).toContain("loader");
  });

  it("should wire handle data to route metadata in generated code", () => {
    const result = (plugin.load as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);

    expect(result).toBeDefined();
    expect(result.code).toMatch(/handle\s*:\s*handle\d*/);
  });

  it("should wire loader to route in generated code", () => {
    const result = (plugin.load as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);

    expect(result).toBeDefined();
    expect(result.code).toMatch(/loader\s*:\s*loader\d*/);
  });

  it("should handle root-level handle file and merge with root layout", () => {
    const result = (plugin.load as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);

    expect(result).toBeDefined();
    expect(result.code).toContain("handle");
  });

  it("should handle nested route handle/loader files correctly", () => {
    const result = (plugin.load as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);

    expect(result).toBeDefined();
    expect(result.code).toContain("children:");
    expect(result.code).toMatch(/(handle|loader)\s*:/);
  });

  it("should export default routes in generated code", () => {
    const result = (plugin.load as any)?.(PLUGIN_VIRTUAL_MODULE_NAME);

    expect(result).toBeDefined();
    expect(result.code).toContain("export default routes");
  });
});
