import { test, expect } from "@playwright/test";

const viewports = [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

for (const viewport of viewports) {
  // Each isolated context verifies static entry at one required viewport.
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    // Avoid external font/analytics timing when validating the local setup.
    test.beforeEach(async ({ context }) => {
      await context.route(
        /https:\/\/(www\.googletagmanager\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,
        // Functional smoke checks use the documented external-resource failure policy.
        (route) => route.abort(),
      );
    });

    // Fresh storage enters character creation; module evaluation checks server wiring.
    test("loads character creation and a native module", async ({
      page,
    }, testInfo) => {
      const errors = [];
      // Retain uncaught application errors instead of accepting a painted screen alone.
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/");
      await expect(page.locator("#character-creation")).toBeVisible();
      // Dynamic import checks actual browser MIME handling, not just an HTTP header.
      const ready = await page.evaluate(async () => {
        const probe = await import("/tests/fixtures/static/module.mjs");
        return probe.staticModuleReady;
      });
      expect(ready).toBe(true);
      expect(errors).toEqual([]);
      // Record actual emulated viewport/DPR/input metadata for the setup evidence.
      const environment = await page.evaluate(() => ({
        viewport: {
          width: globalThis.innerWidth,
          height: globalThis.innerHeight,
        },
        dpr: globalThis.devicePixelRatio,
        touchPoints: globalThis.navigator.maxTouchPoints,
        userAgent: globalThis.navigator.userAgent,
      }));
      await testInfo.attach("environment", {
        body: JSON.stringify(environment),
        contentType: "application/json",
      });
    });

    // Verify supported touch contexts without claiming physical-device qualification.
    test("supports the declared input fixture", async ({
      browser,
      browserName,
    }) => {
      const hasTouch = browserName !== "firefox";
      const context = await browser.newContext({
        viewport,
        hasTouch,
        deviceScaleFactor: 1,
      });
      try {
        const page = await context.newPage();
        await page.setContent(
          '<button type="button" onclick="this.textContent = Number(this.textContent) + 1">0</button>',
        );
        const button = page.getByRole("button");
        if (hasTouch) await button.tap();
        else await button.click();
        await expect(button).toHaveText("1");
        await button.focus();
        await page.keyboard.press("Enter");
        await expect(button).toHaveText("2");
      } finally {
        await context.close();
      }
    });
  });
}
