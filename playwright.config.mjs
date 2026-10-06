import { defineConfig } from "@playwright/test";

// Performance uses a separately prepared immutable server; functional runs own
// their server so repeated invocations cannot reuse or leave a stale instance.
const performanceRun = process.argv.join(" ").includes("tests/performance");
// T040/T041 own stage, source-hash and baseline validation before measurements.

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.mjs",
  testIgnore: performanceRun ? [] : ["**/performance/**"],
  fullyParallel: !performanceRun,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: performanceRun || process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: "test-results",
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  metadata: {
    requiredViewports: [
      { width: 360, height: 800 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ],
    inputPolicy:
      "Keyboard/pointer in all engines; touch emulation in Chromium/WebKit only. Native touch acceptance is separate.",
    performanceStage: performanceRun ? process.env.PERF_STAGE : null,
  },
  use: {
    baseURL: performanceRun ? process.env.BASE_URL : "http://127.0.0.1:4173",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "America/New_York",
    serviceWorkers: "block",
    trace: performanceRun ? "off" : "retain-on-failure",
    screenshot: performanceRun ? "off" : "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: performanceRun
    ? undefined
    : {
        command: "npm run dev",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: false,
        timeout: 30_000,
        gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
      },
});
