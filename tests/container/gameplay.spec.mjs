/* global player, dungeon */
import { test, expect } from "@playwright/test";

/** Read saved progress through the shipped module's actual storage key. */
async function savedState(page) {
  return page.evaluate(
    // Import a production module over HTTP to cover real nginx module resolution.
    async () => {
      const { SAVE_KEY } = await import("/assets/js/app/snapshot-store.mjs");
      return JSON.parse(localStorage.getItem(SAVE_KEY))?.state;
    },
  );
}

// Create and resume a real character using only the image's shipped assets and modules.
test("character creation, gameplay and save/reload continuation", async ({
  page,
  context,
  baseURL,
}) => {
  const errors = [];
  // Uncaught failures must not be hidden by a partially rendered game screen.
  page.on("pageerror", (error) => errors.push(error.message));
  await context.route(
    "**/*",
    // Eliminate analytics/font services without mocking any application resource.
    (route) =>
      new URL(route.request().url()).origin === new URL(baseURL).origin
        ? route.continue()
        : route.abort(),
  );
  await page.clock.install({ time: new Date("2026-10-24T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-24T12:00:01Z"));
  await page.goto("/");
  await expect(page.locator("#name-input")).toBeEnabled();
  await page.clock.runFor(1100);
  await expect(page.locator("#character-creation")).toBeVisible();
  await page.locator("#name-input").fill("Mariner");
  await page.locator("#name-submit button").click();
  await page.clock.runFor(1100);
  await expect(page.locator("#title-screen")).toBeVisible();
  await page.locator("#title-action").click();
  await page.locator("#allocate-confirm").click();
  await page.clock.runFor(1100);
  await expect(page.locator("#dungeon-main")).toBeVisible();
  const saved = await savedState(page);
  expect(saved.player.name).toBe("Mariner");
  expect(saved.player.allocated).toBe(true);
  await page.reload();
  await expect(page.locator("#title-screen")).toBeVisible();
  expect(await savedState(page)).toEqual(saved);
  const restored = await page.evaluate(
    // Compare authoritative restored game objects without writing or replacing them.
    () => ({ player, dungeon }),
  );
  expect(restored.player).toMatchObject(saved.player);
  expect(restored.dungeon.progress).toEqual(saved.dungeon.progress);
  await page.locator("#title-action").click();
  await page.clock.runFor(1100);
  await expect(page.locator("#dungeon-main")).toBeVisible();
  await expect(page.locator("#allocate-confirm")).toHaveCount(0);
  expect(errors).toEqual([]);
});
