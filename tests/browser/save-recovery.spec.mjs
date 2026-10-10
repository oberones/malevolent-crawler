/* global player, runGameplay */
import { test, expect } from "@playwright/test";
import {
  SAVE,
  PREVIOUS,
  resting,
  envelope,
  recoveryFixture,
} from "../helpers/recovery-fixtures.mjs";
const invalid = [
  ["malformed", { [SAVE]: "{broken" }],
  ["unsupported", { [SAVE]: envelope().replace('"version":1', '"version":9') }],
  ["partial", { playerData: resting.raw.playerData }],
  ["unsafe", { [SAVE]: '{"__proto__":{"polluted":true}}' }],
];
for (const [name, raw] of invalid) {
  // Invalid sources must remain selectable and byte-identical through recovery/cancellation.
  test(`recovery preserves ${name} source and offers prior-good selection`, async ({
    browser,
  }) => {
    const storage = { ...raw, [PREVIOUS]: envelope() };
    const fixture = await recoveryFixture(browser, storage);
    try {
      const page = fixture.page;
      await expect(page.locator("#recovery-raw")).toBeVisible();
      expect(
        JSON.parse(await page.locator("#recovery-raw").inputValue()),
      ).toMatchObject(storage);
      await expect(page.locator("#recovery-download")).toBeVisible();
      const download = page.waitForEvent("download");
      await page.locator("#recovery-download").click();
      expect((await download).suggestedFilename()).toBe(
        "malevolent-crawler-recovery.json",
      );
      await page.locator("#recover-previous").click();
      await expect(page.locator("#recovery-confirm")).toBeVisible();
      await page.locator("#recovery-cancel").click();
      expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(storage); // Read bytes independently of recovery code.
      await page.locator("#recover-previous").click();
      await page.locator("#recovery-confirm").click();
      await expect(page.locator("#title-screen")).toBeVisible();
      await expect(page.locator("#save-status")).toContainText("not saved");
      expect(await page.evaluate(() => player.name)).toBe(
        resting.state.player.name,
      ); // Observe adopted memory only.
      expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(storage); // Explicit session recovery preserves originals.
    } finally {
      await fixture.dispose();
    }
  });
}
for (const key of [
  SAVE,
  PREVIOUS,
  "playerData",
  "dungeonData",
  "enemyData",
  "volumeData",
]) {
  // Each read boundary exposes a recovery explanation without replacing any source.
  test(`read exception at ${key}`, async ({ browser }) => {
    const fixture = await recoveryFixture(browser, resting.raw, {
      method: "getItem",
      key,
    });
    try {
      await expect(fixture.page.locator("#boot-status")).toContainText(
        "read-failed",
      );
      await expect(fixture.page.locator("#recovery-raw")).toBeVisible();
      expect(await fixture.page.evaluate(() => ({ ...localStorage }))).toEqual(
        resting.raw,
      ); // Independent raw snapshot.
    } finally {
      await fixture.dispose();
    }
  });
}
for (const key of [SAVE, PREVIOUS]) {
  // Retry must persist the current memory only after the failing write stage is restored.
  test(`unsaved ${key} write supports export and retry`, async ({
    browser,
  }) => {
    const fixture = await recoveryFixture(browser, { [SAVE]: envelope() });
    try {
      const page = fixture.page;
      await expect(page.locator("#title-screen")).toBeVisible();
      await page.evaluate((key) => {
        // Inject faults after canonical boot; preserve a cleanup action.
        const original = Storage.prototype.setItem;
        globalThis.__restoreStorage = () => {
          Storage.prototype.setItem = original;
        }; // Restore persistence for explicit retry.
        Storage.prototype.setItem = function (name, value) {
          // Fail only the requested commit stage.
          if (name === key) throw new Error("quota");
          return original.call(this, name, value);
        };
        runGameplay(() => {
          player.gold += 1;
        }); // Complete one real state transition.
      }, key);
      await expect(page.locator("#save-status")).toContainText("not saved");
      await page.locator("#save-recovery").click();
      expect(
        JSON.parse(await page.locator("#recovery-raw").inputValue()).state
          .player.gold,
      ).toBe(resting.state.player.gold + 1);
      await page.evaluate(() => globalThis.__restoreStorage()); // Allow user retry to complete.
      await page.locator("#save-retry").click();
      await expect(page.locator("#save-status")).toHaveText("");
      expect(
        await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)).state.player.gold,
          SAVE,
        ),
      ).toBe(resting.state.player.gold + 1); // Durable state reflects retained memory.
    } finally {
      await fixture.dispose();
    }
  });
}
// A valid character in a broken run can be explicitly reset into an unsaved session.
test("retained-character recovery resets only after confirmation", async ({
  browser,
}) => {
  const raw = { playerData: resting.raw.playerData };
  const fixture = await recoveryFixture(browser, raw);
  try {
    const page = fixture.page;
    await page.locator("#recover-character").click();
    await expect(page.locator("#recovery-description")).toContainText("reset");
    await page.locator("#recovery-confirm").click();
    await expect(page.locator("#title-screen")).toBeVisible();
    expect(
      await page.evaluate(() => ({
        name: player.name,
        level: player.lvl,
        allocated: player.allocated,
      })),
    ).toEqual({
      name: resting.state.player.name,
      level: 1,
      allocated: undefined,
    }); // Inspect established reset outcomes.
    expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(raw); // Recovery never deletes partial sources.
  } finally {
    await fixture.dispose();
  }
});
// A recovered prior-good snapshot must expose its unknown history, including carried recovery metadata.
test("prior-good session preserves actionable unknown history", async ({
  browser,
}) => {
  const state = structuredClone(resting.state);
  const hostile = '<svg onload="globalThis.__historyXss=1">unmapped</svg>';
  state.dungeon.backlog = [hostile];
  const fixture = await recoveryFixture(browser, {
    [SAVE]: "broken",
    [PREVIOUS]: envelope(state),
  });
  try {
    const page = fixture.page;
    await page.locator("#recover-previous").click();
    await page.locator("#recovery-confirm").click();
    await page.locator("#title-action").click();
    await expect(page.locator("#dungeon-main")).toBeVisible();
    await page.getByRole("button", { name: "Recover history" }).click();
    await expect(page.locator("#dungeonLog pre")).toHaveText(hostile);
    expect(await page.evaluate(() => globalThis.__historyXss)).toBeUndefined(); // Recovery never executes unknown markup.
  } finally {
    await fixture.dispose();
  }
});
// A failed initial migration remains blocked until explicit recovery consent.
test("migration write failure offers loaded session without claiming saved", async ({
  browser,
}) => {
  const fixture = await recoveryFixture(browser, resting.raw, {
    method: "setItem",
    key: SAVE,
  });
  try {
    const page = fixture.page;
    await expect(page.locator("#boot-status")).toContainText("write-failed");
    await page.locator("#recover-candidate").click();
    await page.locator("#recovery-confirm").click();
    await expect(page.locator("#title-screen")).toBeVisible();
    expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(
      resting.raw,
    ); // Adoption is memory-only after write failure.
  } finally {
    await fixture.dispose();
  }
});
