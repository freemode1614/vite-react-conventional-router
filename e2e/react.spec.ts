// import nodePath from "node:path";

import { Browser, chromium, expect, Page, test } from "@playwright/test";
// import { createServer, ViteDevServer } from "vite";

// let devServer: ViteDevServer;
// let browser: Browser;
// let page: Page;

// test.beforeAll(async () => {
//   browser = await chromium.launch();
//   page = await browser.newPage();
//   devServer = await createServer({
//     configFile: nodePath.resolve("example/react/vite.config.ts"),
//     root: nodePath.resolve("example/react"),
//   });
//   await devServer.listen();
// });

// test.afterAll(async () => {
//   await browser?.close();
//   await devServer?.close();
// });

test("go to /", async ({ page }) => {
  await page.goto(`http://localhost:5173`);
  await expect(page.getByRole("heading")).toHaveText("index.tsx");
});

test("go to '/page1'", async ({ page }) => {
  await page.goto(`http://localhost:5173/page1`);
  await expect(page.getByRole("heading")).toHaveText("page1/index.tsx");
});

test("go to '/page1/page1-1'", async ({ page }) => {
  await page.goto(`http://localhost:5173/page1/page1-1`);
  await expect(page.getByText("page1/page1-1.tsx")).toBeVisible();
});

test("go to '/page2'", async ({ page }) => {
  await page.goto(`http://localhost:5173/page2`);
  await expect(page.getByRole("heading")).toHaveText("page2/index.tsx");
});

test("go to '/page2/page2-1'", async ({ page }) => {
  await page.goto(`http://localhost:5173/page2/page2-1`);
  await expect(page.getByText("page2/page2-1/index.tsx")).toBeVisible();
});

test("go to '/page2/page2-1/page2-1-1'", async ({ page }) => {
  await page.goto(`http://localhost:5173/page2/page2-1/page2-1-1`);
  await expect(page.getByText("page2/page2-1/page2-1-1/index.tsx")).toBeVisible();
});

test("go to '/page3/page3-1/page3-1-1'", async ({ page }) => {
  await page.goto(`http://localhost:5173/page3/page3-1/page3-1-1`);
  await expect(page.getByText("page3/page3-1/page3-1-1/index.tsx")).toBeVisible();
});

test("go to '/page4'", async ({ page }) => {
  await page.goto(`http://localhost:5173/page4`);
  await expect(page.getByRole("heading")).toHaveText("page4.tsx");
});

test("go to '/page4/list'", async ({ page }) => {
  await page.goto(`http://localhost:5173/page4/list`);
  await expect(page.getByText("page4.list.tsx")).toBeVisible();
});

test("go to '/page4/list/:id'", async ({ page }) => {
  await page.goto(`http://localhost:5173/page4/list/15`);
  await expect(page.getByText("page4.list.15.tsx")).toBeVisible();
});

test("go to '/page5/15'", async ({ page }) => {
  await page.goto(`http://localhost:5173/page5/15`);
  await expect(page.getByText("page5.@id.tsx (15)")).toBeVisible();
});
