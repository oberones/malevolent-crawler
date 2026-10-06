/* global initializeGame, gameServices, player, dungeon */
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const cases = JSON.parse(
  await readFile(new URL("../fixtures/legacy/saves.json", import.meta.url)),
).cases;
// Select a captured valid run without generating gameplay data.
const resting = cases.find(
  /* Select the captured input for this scenario. */ (row) =>
    row.id === "resting",
);
for (const denied of [false, true]) {
  // Module loading is a hard boundary: eager reads and controls cannot precede it.
  test(`bootstrap gates storage and actions during module failure (denied=${denied})`, /* Verify the named behavior using isolated state and observable outcomes. */ async ({
    browser,
  }) => {
    const fixture = await createLegacyBrowserFixture(browser, {
      storage: resting.raw,
    });
    try {
      await fixture.context.addInitScript(
        // Observe actual storage reads and simulate browser security denial independently.
        (denied) => {
          globalThis.__reads = [];
          const read = Storage.prototype.getItem;
          Storage.prototype.getItem =
            /* Observe or fault the browser boundary for this scenario. */ function (
              key,
            ) {
              globalThis.__reads.push(key);
              if (denied) throw new DOMException("Denied", "SecurityError");
              return read.call(this, key);
            };
        },
        denied,
      );
      // A real failed module request exercises the bootstrap rejection path.
      await fixture.page.route(
        "**/assets/js/app/services.mjs",
        /* Control this request without contacting external services. */ (
          route,
        ) => route.abort(),
      );
      await fixture.page.goto("http://127.0.0.1:4173/");
      await expect(fixture.page.locator("#boot-retry")).toBeVisible();
      expect(
        await fixture.page.evaluate(
          /* Exercise or inspect the isolated browser state for this assertion. */ () =>
            globalThis.__reads,
        ),
      ).toEqual([]);
      // Dispatch bypasses visibility so the actual listener guard is exercised.
      await fixture.page.locator("#dungeonActivity").dispatchEvent("click");
      expect(
        await fixture.page.evaluate(
          /* Exercise or inspect the isolated browser state for this assertion. */ () =>
            dungeon.status.exploring,
        ),
      ).toBe(false);
      await expect(fixture.page.locator("#name-input")).toBeDisabled();
    } finally {
      await fixture.dispose();
    }
  });
}
// Denied reads must produce recovery, never a fresh character or overwritten source.
test("denied storage shows actionable recovery", /* Verify the named behavior using isolated state and observable outcomes. */ async ({
  browser,
}) => {
  const fixture = await createLegacyBrowserFixture(browser);
  try {
    await fixture.context.addInitScript(
      // Throw at the browser storage boundary, after scripts can be parsed normally.
      () => {
        Storage.prototype.getItem =
          /* Observe or fault the browser boundary for this scenario. */ function () {
            throw new DOMException("Denied", "SecurityError");
          };
      },
    );
    await fixture.page.goto("http://127.0.0.1:4173/");
    await expect(fixture.page.locator("#boot-retry")).toBeVisible();
    await expect(fixture.page.locator("#boot-status")).toContainText(
      "saved progress",
    );
    await expect(fixture.page.locator("#name-input")).toBeDisabled();
  } finally {
    await fixture.dispose();
  }
});
// Repeated calls after window load reuse one validated owner without reloading state.
test("ready bootstrap is once-only and audio waits for a gesture", /* Verify the named behavior using isolated state and observable outcomes. */ async ({
  browser,
}) => {
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: resting.raw,
  });
  try {
    await fixture.page.goto("http://127.0.0.1:4173/");
    await expect(fixture.page.locator("#title-screen")).toBeVisible();
    const result = await fixture.page.evaluate(
      /* Exercise or inspect the isolated browser state for this assertion. */ async () => {
        const first = typeof gameServices === "undefined" ? null : gameServices;
        if (typeof initializeGame === "function") {
          await initializeGame();
          await initializeGame();
        }
        return {
          ready: first?.status,
          same: first !== null && first === gameServices,
          name: player.name,
          audio: typeof bgmDungeon === "undefined",
        };
      },
    );
    expect(result).toEqual({
      ready: "ready",
      same: true,
      name: resting.state.player.name,
      audio: true,
    });
  } finally {
    await fixture.dispose();
  }
});
// A delayed module can finish after window load without exposing an unvalidated title action.
test("delayed module completion gates actions then binds audio to the first title gesture", /* Verify the named behavior using isolated state and observable outcomes. */ async ({
  browser,
}) => {
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: resting.raw,
  });
  let release;
  // Hold only the bridge response; ordinary document loading may finish independently.
  const gate = new Promise(
    /* Retain the resolver for this controlled asynchronous boundary. */ (
      resolve,
    ) => {
      release = resolve;
    },
  );
  try {
    await fixture.page.route(
      "**/assets/js/app/services.mjs",
      /* Control this request without contacting external services. */ async (
        route,
      ) => {
        await gate;
        await route.continue();
      },
    );
    await fixture.page.goto("http://127.0.0.1:4173/", {
      waitUntil: "domcontentloaded",
    });
    await expect(fixture.page.locator("#name-input")).toBeDisabled();
    await fixture.page.locator("#title-screen").dispatchEvent("click");
    expect(
      await fixture.page.evaluate(
        /* Exercise or inspect the isolated browser state for this assertion. */ () =>
          typeof bgmDungeon,
      ),
    ).toBe("undefined");
    release();
    await expect(fixture.page.locator("#title-screen")).toBeVisible();
    await fixture.page.locator("#title-screen").click();
    expect(
      await fixture.page.evaluate(
        /* Exercise or inspect the isolated browser state for this assertion. */ () =>
          typeof bgmDungeon,
      ),
    ).toBe("object");
    // Allocation is the existing resting fixture's title destination, without duplicate handlers.
    expect(
      await fixture.page.evaluate(
        /* Exercise or inspect the isolated browser state for this assertion. */ () =>
          gameServices.status,
      ),
    ).toBe("ready");
  } finally {
    release();
    await fixture.dispose();
  }
});
// Actual form and allocation controls must persist a complete fresh character without old-key writes.
test("new character and allocation persist complete state through the live controls", /* Verify the named behavior using isolated state and observable outcomes. */ async ({
  browser,
}) => {
  const fixture = await createLegacyBrowserFixture(browser);
  try {
    await fixture.page.goto("http://127.0.0.1:4173/");
    await expect(fixture.page.locator("#character-creation")).toBeVisible();
    await fixture.page.locator("#name-input").fill("Harbor");
    await fixture.page
      .locator("#name-submit")
      .evaluate(
        /* Exercise or inspect the isolated browser state for this assertion. */ (
          form,
        ) => form.requestSubmit(),
      );
    await expect(fixture.page.locator("#title-screen")).toBeVisible();
    await fixture.page.locator("#title-screen").click();
    await fixture.page.locator("#allocate-confirm").click();
    await expect(fixture.page.locator("#dungeon-main")).toBeVisible();
    const saved = await fixture.page.evaluate(
      /* Exercise or inspect the isolated browser state for this assertion. */ () => ({
        snapshot: JSON.parse(localStorage.getItem("malevolentCrawler.save.v1")),
        legacy: localStorage.getItem("playerData"),
      }),
    );
    expect(saved.legacy).toBeNull();
    expect(saved.snapshot.state.player.name).toBe("Harbor");
    expect(saved.snapshot.state.player.allocated).toBe(true);
    expect(saved.snapshot.state.player.stats.hp).toBe(
      saved.snapshot.state.player.stats.hpMax,
    );
  } finally {
    await fixture.dispose();
  }
});
