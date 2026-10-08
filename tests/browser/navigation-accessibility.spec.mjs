/* global player, getComputedStyle, gameServices, document */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const resting = JSON.parse(
  readFileSync(new URL("../fixtures/legacy/saves.json", import.meta.url)),
).cases.find(
  // Exercise a real continuing character without rolling gameplay.
  (row) => row.id === "resting",
);
for (const key of ["Enter", "Space"]) {
  // Native activation must work without a pointer and retain visible focus.
  test(`title activates with ${key}`, async ({ browser }) => {
    const f = await createLegacyBrowserFixture(browser, {
      storage: resting.raw,
      randomTape: [],
    });
    try {
      const p = f.page;
      await p.goto("/");
      const title = p.getByRole("button", { name: /Begin the sounding/ });
      await expect(title).toBeVisible();
      await title.focus();
      await expect(title).toBeFocused();
      expect(
        await title.evaluate(
          // A nonzero solid outline is observable keyboard focus evidence.
          (node) => getComputedStyle(node).outlineStyle,
        ),
      ).not.toBe("none");
      await title.press(key);
      await expect(p.locator("#dungeon-main")).toBeVisible();
    } finally {
      await f.dispose();
    }
  });
}
// Exercise nested information and destructive cancellation through actual controls.
test("modal navigation blocks background and restores focus without abandonment", async ({
  browser,
}) => {
  const f = await createLegacyBrowserFixture(browser, {
    storage: resting.raw,
    randomTape: [],
  });
  try {
    const p = f.page;
    await p.goto("/");
    await p.locator("#title-action").click();
    await expect(p.locator("#dungeon-main")).toBeVisible();
    // Freeze time after the entry delay so cancellation cannot race a playtime tick.
    await p.clock.install({ time: new Date("2026-10-08T12:00:00Z") });
    await p.clock.pauseAt(new Date("2026-10-08T12:00:01Z"));
    const inventory = p.getByRole("button", { name: "Open inventory" });
    await inventory.click();
    await expect(p.locator("#inventory")).toHaveAttribute("aria-modal", "true");
    await expect(
      p.getByRole("button", { name: "Close inventory" }),
    ).toBeFocused();
    await expect(p.locator("#dungeon-main")).toHaveAttribute("inert", "");
    await p.keyboard.press("Shift+Tab");
    await expect(p.locator("#menu-btn")).toBeFocused();
    await p.keyboard.press("Tab");
    await expect(
      p.getByRole("button", { name: "Close inventory" }),
    ).toBeFocused();
    await p.keyboard.press("Escape");
    await expect(inventory).toBeFocused();
    await inventory.click();
    await p.locator("#menu-btn").click();
    const help = p.getByRole("button", { name: "Help", exact: true });
    await help.click();
    await expect(p.getByRole("dialog")).toContainText(
      "Explore the Drowned Observatory",
    );
    await p.keyboard.press("Escape");
    await expect(help).toBeFocused();
    const before = await p.evaluate(
      /* Snapshot authoritative progress before cancel. */ () =>
        JSON.stringify(player),
    );
    await p.locator("#menuModal #quit-run").click();
    await expect(p.getByRole("dialog")).toContainText("Quay Marks");
    await p.keyboard.press("Escape");
    await expect(p.locator("#menuModal #quit-run")).toBeFocused();
    expect(
      await p.evaluate(
        /* Cancellation must not apply the reset. */ () =>
          JSON.stringify(player),
      ),
    ).toBe(before);
    await p.keyboard.press("Escape");
    await expect(inventory).toBeFocused();
    await expect(p.locator("#dungeon-main")).not.toHaveAttribute("inert", "");
  } finally {
    await f.dispose();
  }
});
// Fresh entry and allocation expose labels, feedback and the scoped WCAG automated checks.
test("entry validation and allocation have accessible names and cancellation", async ({
  browser,
}) => {
  const f = await createLegacyBrowserFixture(browser);
  try {
    const p = f.page;
    await p.goto("/");
    await expect(p.getByRole("textbox", { name: "Keeper name" })).toBeVisible();
    await p.locator("#name-input").fill("!");
    await p.locator("#name-submit button").click();
    await expect(p.locator("#alert")).toHaveAttribute("role", "alert");
    await expect(p.locator("#alert")).not.toBeEmpty();
    expect(
      (
        await new AxeBuilder({ page: p })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await p.locator("#name-input").fill("Keeper");
    await p.locator("#name-submit button").click();
    await p.locator("#title-action").click();
    await expect(p.getByRole("dialog")).toBeVisible();
    await expect(p.getByRole("button", { name: "Increase HP" })).toBeVisible();
    await expect(
      p.getByRole("combobox", { name: "Passive skill" }),
    ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page: p })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await p.keyboard.press("Escape");
    await expect(
      p.getByRole("button", { name: /Begin the sounding/ }),
    ).toBeFocused();
  } finally {
    await f.dispose();
  }
});
// Repeated opens must release focus boundaries, and disposal must stop future observation.
test("repeated modal dismissal and service disposal release the page", async ({
  browser,
}) => {
  const f = await createLegacyBrowserFixture(browser, {
    storage: resting.raw,
    randomTape: [],
  });
  try {
    const p = f.page;
    await p.goto("/");
    await p.locator("#title-action").click();
    const open = p.getByRole("button", { name: "Open inventory" });
    for (let i = 0; i < 4; i++) {
      await open.click();
      await expect(p.getByRole("dialog")).toBeVisible();
      if (i % 2) await p.keyboard.press("Escape");
      else await p.getByRole("button", { name: "Close inventory" }).click();
      await expect(open).toBeFocused();
      await expect(p.locator("[aria-modal=true]")).toHaveCount(0);
    }
    await open.click();
    await p.evaluate(
      // Dispose the actual application owner twice to exercise idempotent cleanup.
      () => {
        gameServices.dispose();
        gameServices.dispose();
        document.querySelector("#inventory").style.display = "none";
      },
    );
    await open.click();
    await expect(p.locator("#inventory")).toBeVisible();
    await expect(p.locator("[inert]")).toHaveCount(0);
    await expect(p.locator("[aria-modal=true]")).toHaveCount(0);
  } finally {
    await f.dispose();
  }
});
