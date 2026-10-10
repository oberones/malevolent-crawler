import { test, expect } from "@playwright/test";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";

// Seeded contexts reproduce state, while a second context cannot inherit writes.
test("legacy browser fixtures isolate storage and consume deterministic draws", async ({
  browser,
}) => {
  const options = { storage: { fixture: "original" }, randomTape: [0.2, 0.8] };
  const first = await createLegacyBrowserFixture(browser, options);
  const second = await createLegacyBrowserFixture(browser, options);
  try {
    await first.page.goto(
      "http://127.0.0.1:4173/tests/fixtures/static/module.mjs",
    );
    await second.page.goto(
      "http://127.0.0.1:4173/tests/fixtures/static/module.mjs",
    );
    // Read the browser's actual storage and randomness after document initialization.
    expect(
      await first.page.evaluate(() => ({
        value: localStorage.getItem("fixture"),
        draws: [Math.random(), Math.random()],
      })),
    ).toEqual({ value: "original", draws: [0.2, 0.8] });
    // Mutating one context must leave the independently initialized context unchanged.
    await first.page.evaluate(() => localStorage.setItem("fixture", "changed"));
    // Verify isolation in browser storage, not a helper's bookkeeping object.
    expect(
      await second.page.evaluate(() => localStorage.getItem("fixture")),
    ).toBe("original");
    // Exhaustion is surfaced to the case instead of silently reverting to native RNG.
    await expect(first.page.evaluate(() => Math.random())).rejects.toThrow(
      /exhausted/,
    );
  } finally {
    await first.dispose();
    await second.dispose();
  }
});

// The captured early save must render the same title in independently owned contexts.
test("immutable legacy page boots repeatably from the captured early character", async ({
  browser,
}) => {
  const { readFile } = await import("node:fs/promises");
  const saves = JSON.parse(
    await readFile(
      new URL("../fixtures/legacy/saves.json", import.meta.url),
      "utf8",
    ),
  );
  const early = saves.cases.find(
    // Use the recorded early-player tuple, without constructing a second set of defaults.
    (entry) => entry.id === "early",
  );
  const contextsBefore = browser.contexts().length;
  for (let attempt = 0; attempt < 2; attempt++) {
    const fixture = await createLegacyBrowserFixture(browser, {
      storage: early.raw,
    });
    const errors = [];
    // Record actual page errors instead of accepting a visible title after a failed boot.
    fixture.page.on("pageerror", (error) => errors.push(error.message));
    try {
      await fixture.page.goto(
        "http://127.0.0.1:4173/tests/fixtures/legacy/source/index.html",
      );
      await expect(fixture.page.locator("#title-screen")).toBeVisible();
      // Classic lexical state is read as data to verify the saved character survived boot.
      const name = await fixture.page.evaluate("player.name");
      expect(name).toBe("Mariner");
      expect(errors).toEqual([]);
    } finally {
      await fixture.dispose();
      await fixture.dispose();
    }
  }
  expect(browser.contexts().length).toBe(contextsBefore);
});
