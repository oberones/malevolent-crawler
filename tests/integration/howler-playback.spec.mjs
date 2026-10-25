/* global bgmDungeon, setVolume */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";

const resting = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases.find(
  // A resting save starts exploration music without advancing combat.
  (entry) => entry.id === "resting",
);

// Exercise real decoding and playback across replacements, with a bounded codec budget.
test("shipped Howler starts, pauses, resumes and releases replaced audio", async ({
  browser,
}) => {
  // Each replacement decodes all four music tracks again. Linux WebKit measured
  // 7.6–9.6s for later loads, so decoding has a separate budget from playback.
  test.setTimeout(120_000);
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: resting.raw,
  });
  try {
    const page = fixture.page;
    const errors = [];
    page.on(
      "pageerror",
      // Retain asynchronous failures, including callbacks after audio replacement.
      (error) => errors.push(error.message),
    );
    await page.goto("http://127.0.0.1:4173/");
    await expect(page.locator("#title-action")).toBeVisible();
    expect(
      await page.evaluate(
        // Startup must wait for the title gesture before allocating audio.
        () => Boolean(bgmDungeon),
      ),
    ).toBe(false);
    await page.locator("#title-action").click();
    for (let cycle = 0; cycle < 3; cycle++) {
      await expect
        .poll(
          // Allow queued multi-megabyte decoding to finish without extending playback waits.
          () =>
            page.evaluate(
              // Read the public Howler loading state.
              () => bgmDungeon.state(),
            ),
          {
            timeout: 30_000,
            message: `Music must finish decoding in replacement cycle ${cycle}`,
          },
        )
        .toBe("loaded");
      await expect
        .poll(
          // The initial gesture and each explicit replay must start a real voice.
          () =>
            page.evaluate(
              // Read the public playback state after asynchronous startup.
              () => bgmDungeon.playing(),
            ),
        )
        .toBe(true);
      expect(
        await page.evaluate(
          // Pausing keeps the decoded sound available for a later resume.
          () => {
            bgmDungeon.pause();
            return { state: bgmDungeon.state(), playing: bgmDungeon.playing() };
          },
        ),
      ).toEqual({ state: "loaded", playing: false });
      await page.evaluate(
        // Resume the paused instance through Howler's public API.
        () => bgmDungeon.play(),
      );
      await expect
        .poll(
          // Resume can complete asynchronously when the audio context is suspended.
          () =>
            page.evaluate(
              // Observe resumed playback without relying on host speakers.
              () => bgmDungeon.playing(),
            ),
        )
        .toBe(true);
      expect(
        await page.evaluate(
          // App reconfiguration must release the old decoder and playback voice.
          () => {
            const old = bgmDungeon;
            setVolume();
            bgmDungeon.play();
            return { state: old.state(), playing: old.playing() };
          },
        ),
      ).toEqual({ state: "unloaded", playing: false });
    }
    expect(errors).toEqual([]);
  } finally {
    await fixture.dispose();
  }
});
