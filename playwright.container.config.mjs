import { defineConfig } from "@playwright/test";

if (!process.env.CONTAINER_BASE_URL)
  throw new Error("CONTAINER_BASE_URL must point to the production container.");

export default defineConfig({
  testDir: "./tests/container",
  testMatch: "**/*.spec.mjs",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  timeout: 30_000,
  outputDir: "test-results/container",
  reporter: [["list"]],
  use: {
    baseURL: process.env.CONTAINER_BASE_URL,
    browserName: "chromium",
    viewport: { width: 1440, height: 900 },
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // This suite owns no dev server and cannot accidentally serve repository fixtures.
});
