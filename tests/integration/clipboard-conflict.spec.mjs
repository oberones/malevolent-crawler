/* global player, runGameplay, window, StorageEvent */
import { test, expect } from "@playwright/test";
import {
  SAVE,
  envelope,
  recoveryFixture,
} from "../helpers/recovery-fixtures.mjs";
/** Open the reachable exchange controls from a loaded character. */
async function exchange(page) {
  await expect(page.locator("#title-screen")).toBeVisible();
  await page.locator("#title-action").click();
  await expect(page.locator("#dungeon-main")).toBeVisible();
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.locator("#open-inventory").click();
  await page.locator("#menu-btn").click();
  await page.locator("#export-import").click();
}
for (const mode of ["resolve", "reject", "unavailable"]) {
  // Clipboard feedback must follow completion; fallback text and download remain usable.
  test(`clipboard ${mode}`, async ({ browser }) => {
    const fixture = await recoveryFixture(browser, { [SAVE]: envelope() });
    try {
      const page = fixture.page;
      await exchange(page);
      await page.evaluate((mode) => {
        // Control the promise independently of permission prompts.
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value:
            mode === "unavailable"
              ? undefined
              : {
                  writeText: () =>
                    new Promise((resolve, reject) => {
                      globalThis.__copyResolve = resolve;
                      globalThis.__copyReject = reject;
                    }), // Retain pending completion callbacks.
                },
        });
      }, mode);
      const before = await page.evaluate(() => ({ ...localStorage })); // Copy must be read-only.
      await page.locator("#copy-export").click();
      if (mode !== "unavailable") {
        await expect(page.locator("#copy-export")).not.toHaveText("Copied!");
        await page.evaluate(
          (mode) =>
            mode === "resolve"
              ? globalThis.__copyResolve()
              : globalThis.__copyReject(new Error("denied")),
          mode,
        ); // Settle the requested clipboard result.
      }
      await expect(page.locator("#exchange-status")).toContainText(
        mode === "resolve" ? "Copied" : "Copy unavailable",
      );
      await expect(page.locator("#export-download")).toBeVisible();
      expect(await page.locator("#export-input").inputValue()).toMatch(/^MC1:/);
      expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(before); // No copy-induced save revision.
    } finally {
      await fixture.dispose();
    }
  });
}
for (const event of [true, false]) {
  // Both observed storage events and precommit revision checks suspend this owner's writes.
  test(`foreign revision event=${event} exposes reload or export`, async ({
    browser,
  }) => {
    const fixture = await recoveryFixture(browser, { [SAVE]: envelope() });
    try {
      const page = fixture.page;
      await expect(page.locator("#title-screen")).toBeVisible();
      const foreign = JSON.parse(envelope());
      foreign.revision = 2;
      foreign.state.player.gold += 99;
      const bytes = JSON.stringify(foreign);
      await page.evaluate(
        ({ bytes, key, event }) => {
          // Simulate an independently completed foreign revision.
          localStorage.setItem(key, bytes);
          if (event)
            window.dispatchEvent(
              new StorageEvent("storage", {
                key,
                newValue: bytes,
                storageArea: localStorage,
              }),
            );
          else
            runGameplay(() => {
              player.gold += 1;
            }); // Trigger stale-revision detection before backup.
        },
        { bytes, key: SAVE, event },
      );
      await expect(page.locator("#save-status")).toContainText("another tab");
      await page.locator("#save-recovery").click();
      await expect(page.locator("#conflict-reload")).toBeVisible();
      await expect(page.locator("#recovery-download")).toBeVisible();
      await page.evaluate(() =>
        runGameplay(() => {
          player.gold += 1;
        }),
      ); // Later autosaves stay suspended.
      expect(
        await page.evaluate((key) => localStorage.getItem(key), SAVE),
      ).toBe(bytes); // No silent overwrite or merge.
    } finally {
      await fixture.dispose();
    }
  });
}
// Native same-origin storage notifications must surface without waiting for gameplay input.
test("actual second tab suspends owner before its next save", async ({
  browser,
}) => {
  const fixture = await recoveryFixture(browser, { [SAVE]: envelope() });
  try {
    const page = fixture.page;
    await expect(page.locator("#title-screen")).toBeVisible();
    const other = await fixture.context.newPage();
    await other.goto("http://127.0.0.1:4173/tests/fixtures/services.html");
    const bytes = await other.evaluate((key) => {
      // Complete a distinct revision in another actual page.
      const state = JSON.parse(localStorage.getItem(key));
      state.revision += 1;
      state.state.player.gold += 7;
      const text = JSON.stringify(state);
      localStorage.setItem(key, text);
      return text;
    }, SAVE);
    await expect(page.locator("#save-status")).toContainText("another tab");
    await page.evaluate(() =>
      runGameplay(() => {
        player.gold += 2;
      }),
    ); // The older owner must not overwrite the new revision.
    expect(await other.evaluate((key) => localStorage.getItem(key), SAVE)).toBe(
      bytes,
    ); // Compare exact foreign bytes.
  } finally {
    await fixture.dispose();
  }
});
