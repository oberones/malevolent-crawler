/* global document, innerWidth */
import { test, expect } from "@playwright/test";
import {
  SAVE,
  PREVIOUS,
  envelope,
  recoveryFixture,
  resting,
} from "../helpers/recovery-fixtures.mjs";
// Verify enlarged inert recovery text and retain each screenshot in its own test output.
test("boot recovery keyboard confirmation cancels with focus and reflows at 200%", async ({
  browser,
  browserName,
}, testInfo) => {
  const bytes =
    '<img src=x onerror="globalThis.__unsafe=1">' + "x".repeat(6000);
  const fixture = await recoveryFixture(browser, {
    [SAVE]: bytes,
    [PREVIOUS]: envelope(),
  });
  try {
    const page = fixture.page;
    await page.addStyleTag({ content: "html {font-size: 200% !important}" });
    await expect(page.locator("#recover-previous")).toBeVisible();
    await page.locator("#recover-previous").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#recovery-cancel")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("#recover-previous")).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true); // Check document reflow, not screenshot appearance.
    expect(await page.evaluate(() => globalThis.__unsafe)).toBeUndefined(); // Raw source is inert.
    await expect(page.locator("#boot-status")).toHaveAttribute("role", "alert");
    await page.screenshot({
      path: testInfo.outputPath(`recovery-200-${browserName}.png`),
    });
  } finally {
    await fixture.dispose();
  }
});
// Import and export dialogs share keyboard ownership even with a long hostile-looking name.
test("exchange and import errors keep keyboard cancellation and enlarged controls reachable", async ({
  browser,
}) => {
  const state = structuredClone(resting.state);
  state.player.name = "<img src=x>" + "長".repeat(300);
  const fixture = await recoveryFixture(browser, { [SAVE]: envelope(state) });
  try {
    const page = fixture.page;
    await page.locator("#title-action").click();
    await expect(page.locator("#dungeon-main")).toBeVisible();
    await page.locator("#open-inventory").click();
    await page.locator("#menu-btn").click();
    await page.locator("#export-import").click();
    await page.addStyleTag({ content: "html {font-size: 200% !important}" });
    await page.locator("#import-input").fill("invalid");
    await page.locator("#data-import").click();
    await expect(page.locator("#import-status")).toHaveAttribute(
      "role",
      "alert",
    );
    await page.keyboard.press("Escape");
    await expect(page.locator("#data-import")).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true); // Controls must reflow at the narrow viewport.
    await expect(page.locator("#export-download")).toBeVisible();
  } finally {
    await fixture.dispose();
  }
});
// Real browser touch events exercise the same explicit confirmation on supported automation engines.
test("touch recovery requires confirmation and preserves source bytes", async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName === "firefox",
    "Playwright Firefox does not support hasTouch contexts; physical Firefox touch remains OPEN.",
  );
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 360, height: 800 },
  });
  const raw = { [SAVE]: "broken", [PREVIOUS]: envelope() };
  try {
    await context.route("**/*", (route) => {
      // Keep this touch fixture offline except for its local app.
      return new URL(route.request().url()).hostname === "127.0.0.1"
        ? route.continue()
        : route.abort();
    });
    await context.addInitScript((raw) => {
      // Seed exact source strings before initialization.
      for (const [key, value] of Object.entries(raw))
        localStorage.setItem(key, value);
    }, raw);
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173/");
    await page.locator("#recover-previous").tap();
    await page.locator("#recovery-cancel").tap();
    expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(raw); // Cancellation cannot alter durable state.
    await page.locator("#recover-previous").tap();
    await page.locator("#recovery-confirm").tap();
    await expect(page.locator("#title-screen")).toBeVisible();
    expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(raw); // Explicit memory-only adoption preserves sources.
  } finally {
    await context.close();
  }
});
