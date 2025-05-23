import nodepath from "node:path";

import {
  Browser,
  BrowserContext,
  chromium,
  expect,
  Page,
  test,
} from "@playwright/test";
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

test.describe("react e2e test", () => {
  // let devServer: ViteDevServer;
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

  test("go to /", async () => {
    await page.goto(`http://localhost:${port}`);
    await expect(page.getByRole("heading")).toHaveText("index.tsx");
  });

  test("go to '/page1'", async () => {
    await page.goto(`http://localhost:${port}/page1`);
    await expect(page.getByRole("heading")).toHaveText("page1/index.tsx");
  });

  test("go to '/page1/page1-1'", async () => {
    await page.goto(`http://localhost:${port}/page1/page1-1`);
    await expect(page.getByText("page1/page1-1.tsx")).toBeVisible();
  });

  test("go to '/page2'", async () => {
    await page.goto(`http://localhost:${port}/page2`);
    await expect(page.getByRole("heading")).toHaveText("page2/index.tsx");
  });

  test("go to '/page2/page2-1'", async () => {
    await page.goto(`http://localhost:${port}/page2/page2-1`);
    await expect(page.getByText("page2/page2-1/index.tsx")).toBeVisible();
  });

  test("go to '/page2/page2-1/page2-1-1'", async () => {
    await page.goto(`http://localhost:${port}/page2/page2-1/page2-1-1`);
    await expect(
      page.getByText("page2/page2-1/page2-1-1/index.tsx"),
    ).toBeVisible();
  });

  test("go to '/page3/page3-1/page3-1-1'", async () => {
    await page.goto(`http://localhost:${port}/page3/page3-1/page3-1-1`);
    await expect(
      page.getByText("page3/page3-1/page3-1-1/index.tsx"),
    ).toBeVisible();
  });

  test("go to '/page4'", async () => {
    await page.goto(`http://localhost:${port}/page4`);
    await expect(page.getByRole("heading")).toHaveText("page4.tsx");
  });

  test("go to '/page4/list'", async () => {
    await page.goto(`http://localhost:${port}/page4/list`);
    await expect(page.getByText("page4.list.tsx")).toBeVisible();
    await expect(page.getByText("PageFourListLayout")).toBeVisible();
  });

  test("go to '/page4/list/:id'", async () => {
    await page.goto(`http://localhost:${port}/page4/list/15`);
    await expect(page.getByText("page4.list.15.tsx")).toBeVisible();
    await expect(page.getByText("PageFourListLayout")).toBeVisible();
  });

  test("go to '/page5/15'", async () => {
    await page.goto(`http://localhost:${port}/page5/15`);
    await expect(page.getByText("page5.@id.tsx (15)")).toBeVisible();
  });
});
