/* global document */
import { test, expect } from "@playwright/test";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";

for (const width of [331, 360, 768, 1440]) {
  // Exercise every allocation cell through its full budget at narrow and wide viewports.
  test(`two-digit allocations stay within one line at ${width}px`, async ({
    browser,
  }) => {
    const fixture = await createLegacyBrowserFixture(browser, {
      randomTape: [],
      viewport: { width, height: 900 },
    });
    try {
      const page = fixture.page;
      await page.goto("/");
      await page.locator("#name-input").fill("Mariner");
      await page.locator("#name-submit button").click();
      await page.locator("#title-action").click();
      for (const stat of ["hp", "atk", "def", "atkSpd"]) {
        await page.locator("#allocate-reset").click();
        for (let value = 6; value <= 25; value += 1) {
          await page.locator(`#${stat}Add`).click();
          const cell = page.locator(`#${stat}Allo`);
          await expect(cell).toHaveText(String(value));
          const geometry = await cell.evaluate(
            // Measure rendered text rather than assuming a CSS width prevents wrapping.
            (element) => {
              const range = document.createRange();
              range.selectNodeContents(element);
              const text = range.getBoundingClientRect();
              const box = element.getBoundingClientRect();
              return {
                lines: range.getClientRects().length,
                fits: text.left >= box.left - 1 && text.right <= box.right + 1,
              };
            },
          );
          expect(geometry, `${stat} allocation ${value}`).toEqual({
            lines: 1,
            fits: true,
          });
        }
        await expect(page.locator("#alloPts")).toHaveText("Stat Points: 0");
      }
    } finally {
      await fixture.dispose();
    }
  });
}
