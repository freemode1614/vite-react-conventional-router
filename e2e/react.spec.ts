import nodePath from "node:path";

import { type Browser, chromium, expect, test } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";

let devServer: ViteDevServer;
let browser: Browser;

test.beforeAll(async () => {
  browser = await chromium.launch();
  devServer = await createServer({
    configFile: nodePath.resolve("example/react/vite.config.ts"),
    root: nodePath.resolve("example/react"),
  });
  await devServer.listen();
});

test.afterAll(async () => {
  await browser?.close();
  await devServer?.close();
});

test("should render page with no error", async ({ page }) => {
  await page.goto(`http://localhost:${devServer.config.server.port}`);
  await expect(page.getByRole("main")).toHaveText("Vite + React");
});
