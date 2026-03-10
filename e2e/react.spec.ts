import nodepath from "node:path";

import { chromium, expect, test } from "@playwright/test";
import type { Browser, BrowserContext, Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";

const port = 8888;
let viteServer: ViteDevServer | undefined;

test.beforeAll(async () => {
  viteServer = await createServer({
    configFile: nodepath.resolve(process.cwd(), "example/react/vite.config.ts"),
  });
});

test.afterAll(async () => {
  if (viteServer) {
    await viteServer.close();
  }
  viteServer = undefined;
});

test.describe("React Conventional Router E2E Tests", () => {
  let browser: Browser;
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async () => {
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await browser?.close();
  });

  // Helper function to get page content locator (inside .pages container, excluding App.tsx header)
  const getPageContent = (p: Page) => p.locator(".pages");

  /**
   * ============================================
   * 基础路由测试 (Basic Routing)
   * ============================================
   */
  test.describe("Basic Routing", () => {
    test("should render root page at /", async () => {
      await page.goto(`http://localhost:${port}`);
      const content = getPageContent(page);
      await expect(content.getByText("index.tsx")).toBeVisible();
    });

    test("should render page at /page1", async () => {
      await page.goto(`http://localhost:${port}/page1`);
      const content = getPageContent(page);
      await expect(content.getByText("page1/index.tsx")).toBeVisible();
    });

    test("should render page at /page4 (flat file route)", async () => {
      await page.goto(`http://localhost:${port}/page4`);
      const content = getPageContent(page);
      await expect(content.getByText("page4.tsx")).toBeVisible();
    });
  });

  /**
   * ============================================
   * 嵌套路由测试 (Nested Routing)
   * ============================================
   * - 目录结构嵌套: page2/page2-1/
   * - 文件名嵌套: page4.list.tsx → /page4/list
   */
  test.describe("Nested Routing", () => {
    test("should render nested route /page1/page1-1", async () => {
      await page.goto(`http://localhost:${port}/page1/page1-1`);
      const content = getPageContent(page);
      await expect(content.getByText("page1/page1-1.tsx")).toBeVisible();
    });

    test("should render deeply nested route /page2/page2-1/page2-1-1", async () => {
      await page.goto(`http://localhost:${port}/page2/page2-1/page2-1-1`);
      const content = getPageContent(page);
      await expect(content.getByText("page2/page2-1/page2-1-1/index.tsx")).toBeVisible();
    });

    test("should render nested route /page2", async () => {
      await page.goto(`http://localhost:${port}/page2`);
      const content = getPageContent(page);
      await expect(content.getByText("page2/index.tsx")).toBeVisible();
    });

    test("should render nested route /page2/page2-1", async () => {
      await page.goto(`http://localhost:${port}/page2/page2-1`);
      const content = getPageContent(page);
      await expect(content.getByText("page2/page2-1/index.tsx")).toBeVisible();
    });

    test("should render nested route /page3/page3-1/page3-1-1", async () => {
      await page.goto(`http://localhost:${port}/page3/page3-1/page3-1-1`);
      const content = getPageContent(page);
      await expect(content.getByText("page3/page3-1/page3-1-1/index.tsx")).toBeVisible();
    });

    test("should render dot-notation nested route /page4/list", async () => {
      await page.goto(`http://localhost:${port}/page4/list`);
      const content = getPageContent(page);
      await expect(content.getByText("page4.list.tsx")).toBeVisible();
    });
  });

  /**
   * ============================================
   * 动态路由测试 (Dynamic Routing)
   * ============================================
   * - @id 参数路由: /page4/list/:id
   */
  test.describe("Dynamic Routing", () => {
    test("should render dynamic route /page4/list/:id with parameter", async () => {
      await page.goto(`http://localhost:${port}/page4/list/15`);
      const content = getPageContent(page);
      await expect(content.getByText("page4.list.15.tsx")).toBeVisible();
    });

    test("should render dynamic route /page5/:id with required parameter", async () => {
      await page.goto(`http://localhost:${port}/page5/15`);
      const content = getPageContent(page);
      await expect(content.getByText("page5.@id.tsx (15)")).toBeVisible();
    });
  });

  /**
   * ============================================
   * 布局测试 (Layouts)
   * ============================================
   * - 目录级布局: layout.tsx
   * - 路由级布局: [route].layout.tsx
   */
  test.describe("Layouts", () => {
    test("should apply root layout to all routes", async () => {
      await page.goto(`http://localhost:${port}`);
      const content = getPageContent(page);
      await expect(content.getByText("Root Layout")).toBeVisible();
    });

    test("should apply directory layout at /page1", async () => {
      await page.goto(`http://localhost:${port}/page1`);
      const content = getPageContent(page);
      await expect(content.getByText("PageOneLayout")).toBeVisible();
    });

    test("should apply route-level layout at /page4/list", async () => {
      await page.goto(`http://localhost:${port}/page4/list`);
      const content = getPageContent(page);
      await expect(content.getByText("PageFourListLayout")).toBeVisible();
    });

    test("should apply route-level layout at /page4/list/:id", async () => {
      await page.goto(`http://localhost:${port}/page4/list/123`);
      const content = getPageContent(page);
      await expect(content.getByText("PageFourListLayout")).toBeVisible();
    });
  });

  /**
   * ============================================
   * 数据加载测试 (Data Loading)
   * ============================================
   * - loader.ts 文件
   */
  test.describe("Data Loading", () => {
    test("should load data from root loader.ts", async () => {
      await page.goto(`http://localhost:${port}`);
      const content = getPageContent(page);
      await expect(content.getByText("Say My Name!!!")).toBeVisible();
    });

    test("should load data from nested loader.ts at /page2/page2-1", async () => {
      await page.goto(`http://localhost:${port}/page2/page2-1`);
      const content = getPageContent(page);
      await expect(content.locator("h1").filter({ hasText: "page2-1" })).toBeVisible();
    });

    test("should load data from deeply nested loader.ts at /page2/page2-1/page2-1-1", async () => {
      await page.goto(`http://localhost:${port}/page2/page2-1/page2-1-1`);
      const content = getPageContent(page);
      await expect(content.locator("h1").filter({ hasText: "page2-1-1" })).toBeVisible();
    });

    test("should load data from page4 loader", async () => {
      await page.goto(`http://localhost:${port}/page4`);
      const content = getPageContent(page);
      await expect(content.getByText("job")).toBeVisible();
    });
  });

  /**
   * ============================================
   * 客户端导航测试 (Client-side Navigation)
   * ============================================
   */
  test.describe("Client-side Navigation", () => {
    test("should navigate from / to /page1", async () => {
      await page.goto(`http://localhost:${port}`);
      await page.getByRole("button", { name: "page1" }).click();
      await expect(page).toHaveURL(`http://localhost:${port}/page1`);
      const content = getPageContent(page);
      await expect(content.getByText("page1/index.tsx")).toBeVisible();
    });

    test("should navigate from / to /page2", async () => {
      await page.goto(`http://localhost:${port}`);
      await page.getByRole("button", { name: "page2" }).click();
      await expect(page).toHaveURL(`http://localhost:${port}/page2`);
      const content = getPageContent(page);
      await expect(content.getByText("page2/index.tsx")).toBeVisible();
    });

    test("should navigate from / to /page3/page3-1/page3-1-1", async () => {
      await page.goto(`http://localhost:${port}`);
      await page.getByRole("button", { name: "page3" }).click();
      await expect(page).toHaveURL(`http://localhost:${port}/page3/page3-1/page3-1-1`);
      const content = getPageContent(page);
      await expect(content.getByText("page3/page3-1/page3-1-1/index.tsx")).toBeVisible();
    });

    test("should navigate from / to /page4", async () => {
      await page.goto(`http://localhost:${port}`);
      await page.getByRole("button", { name: "page4" }).click();
      await expect(page).toHaveURL(`http://localhost:${port}/page4`);
      const content = getPageContent(page);
      await expect(content.getByText("page4.tsx")).toBeVisible();
    });

    test("should navigate from /page2 to /page2/page2-1", async () => {
      await page.goto(`http://localhost:${port}/page2`);
      await page.getByRole("button", { name: "page2-1" }).click();
      await expect(page).toHaveURL(`http://localhost:${port}/page2/page2-1`);
      const content = getPageContent(page);
      await expect(content.getByText("page2/page2-1/index.tsx")).toBeVisible();
    });

    test("should navigate between nested routes", async () => {
      // Test navigation from /page2 to /page2/page2-1 to /page2/page2-1/page2-1-1
      await page.goto(`http://localhost:${port}/page2`);
      
      // Navigate to page2-1
      await page.getByRole("button", { name: "page2-1" }).click();
      await expect(page).toHaveURL(`http://localhost:${port}/page2/page2-1`);
      let content = getPageContent(page);
      await expect(content.getByText("page2/page2-1/index.tsx")).toBeVisible();
      
      // Navigate to page2-1-1
      await page.getByRole("button", { name: "page2-1-1" }).click();
      await expect(page).toHaveURL(`http://localhost:${port}/page2/page2-1/page2-1-1`);
      content = getPageContent(page);
      await expect(content.getByText("page2/page2-1/page2-1-1/index.tsx")).toBeVisible();
      
      // Navigate back to home
      await page.getByRole("button", { name: "/" }).first().click();
      await expect(page).toHaveURL(`http://localhost:${port}/`);
      content = getPageContent(page);
      await expect(content.getByText("index.tsx")).toBeVisible();
    });
  });

  /**
   * ============================================
   * 404 页面测试 (Not Found)
   * ============================================
   */
  test.describe("404 Page", () => {
    test("should render 404 page for non-existent routes", async () => {
      await page.goto(`http://localhost:${port}/non-existent-route`);
      const content = getPageContent(page);
      await expect(content.getByText("Page Not Found")).toBeVisible();
    });
  });
});
