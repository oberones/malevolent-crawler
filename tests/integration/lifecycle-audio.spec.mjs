/* global window, document, dungeon, hpValidation, enemy, endCombat, startCombat, bgmBattleMain, player, setVolume, bgmDungeon, enterDungeon, progressReset */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const row = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases.find(
  /* Use a stable run to isolate ownership from random combat. */ (entry) =>
    entry.id === "resting",
);
// Reconfiguration must release decoded audio while preserving validated preferences.
test("audio replacement unloads old instances and reset cancels run timers", async ({
  browser,
}) => {
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
  });
  try {
    const page = fixture.page;
    await page.goto("http://127.0.0.1:4173/");
    await expect(page.locator("#title-screen")).toBeVisible();
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    const released = await page.evaluate(
      /* Observe disposal of the actual old Howler object. */ () => {
        setVolume();
        const old = bgmDungeon;
        let stopped = 0,
          unloaded = 0;
        const stop = old.stop.bind(old),
          unload = old.unload.bind(old);
        old.stop =
          /* Count teardown without preventing native cleanup. */ () => {
            stopped++;
            return stop();
          };
        old.unload =
          /* Count decoder release independently of playback. */ () => {
            unloaded++;
            return unload();
          };
        setVolume();
        return { stopped, unloaded };
      },
    );
    expect(released.unloaded).toBe(1);
    expect(released.stopped).toBeGreaterThanOrEqual(1);
    const before = await page.evaluate(
      /* Reset an entered run before its delayed work fires. */ () => {
        enterDungeon();
        progressReset();
        return player.playtime;
      },
    );
    await page.clock.runFor(3000);
    expect(
      await page.evaluate(
        /* No old run timer may advance the retained character. */ () =>
          player.playtime,
      ),
    ).toBe(before);
  } finally {
    await fixture.dispose();
  }
});

// A new battle gets a full delay; queued attacks from its predecessor cannot cross it.
test("combat restart cancels stale attacks and reset cancels delayed presentation", async ({
  browser,
}) => {
  const active = JSON.parse(
    readFileSync("tests/fixtures/legacy/saves.json"),
  ).cases.find(
    /* A saved normal encounter avoids enemy generation in the timing assertion. */ (
      entry,
    ) => entry.id === "normal",
  );
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: active.raw,
  });
  try {
    const page = fixture.page;
    await page.goto("http://127.0.0.1:4173/");
    await expect(page.locator("#title-screen")).toBeVisible();
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    const delay = await page.evaluate(
      /* Enter through a saved enemy and measure its preserved period. */ () => {
        setVolume();
        enterDungeon();
        return 1000 / enemy.stats.atkSpd;
      },
    );
    await page.clock.runFor(Math.floor(delay / 2));
    const before = await page.evaluate(
      /* End and restart before either actor's first attack. */ () => {
        endCombat();
        startCombat(bgmBattleMain);
        return { hp: player.stats.hp, enemyHp: enemy.stats.hp };
      },
    );
    await page.clock.runFor(Math.ceil(delay / 2) + 1);
    expect(
      await page.evaluate(
        /* Old deadlines must not damage the new battle. */ () => ({
          hp: player.stats.hp,
          enemyHp: enemy.stats.hp,
        }),
      ),
    ).toEqual(before);
    await page.clock.runFor(Math.ceil(delay / 2));
    expect(
      await page.evaluate(
        /* The new full enemy delay produces exactly its first attack. */ () =>
          player.stats.hp,
      ),
    ).toBeLessThan(before.hp);
    const reset = await page.evaluate(
      /* Reset removes both actor chains and delayed screen callbacks. */ () => {
        progressReset();
        return { hp: player.stats.hp, playtime: player.playtime };
      },
    );
    await page.clock.runFor(4000);
    expect(
      await page.evaluate(
        /* No prior battle changes the reset character. */ () => ({
          hp: player.stats.hp,
          playtime: player.playtime,
        }),
      ),
    ).toEqual(reset);
  } finally {
    await fixture.dispose();
  }
});

// Saved silence survives gesture startup and audio reconfiguration.
test("audio waits for title gesture and retains mute preferences", async ({
  browser,
}) => {
  const storage = {
    ...row.raw,
    volumeData: JSON.stringify({ master: 0, bgm: 0.2, sfx: 0.7 }),
  };
  const fixture = await createLegacyBrowserFixture(browser, { storage });
  try {
    await fixture.page.goto("http://127.0.0.1:4173/");
    await expect(fixture.page.locator("#title-screen")).toBeVisible();
    expect(
      await fixture.page.evaluate(
        /* Boot has no audio instance to autoplay. */ () => Boolean(bgmDungeon),
      ),
    ).toBe(false);
    await fixture.page.locator("#title-action").click();
    expect(
      await fixture.page.evaluate(
        /* The first gesture respects the stored master mute. */ () =>
          bgmDungeon.volume(),
      ),
    ).toBe(0);
    expect(
      await fixture.page.evaluate(
        /* Reconfiguration retains user preferences. */ () => {
          setVolume();
          return bgmDungeon.volume();
        },
      ),
    ).toBe(0);
  } finally {
    await fixture.dispose();
  }
});

// Detached terminal controls cannot mutate a later run even if an old click was queued.
test("old defeat control is inert after reset and reentry", async ({
  browser,
}) => {
  const active = JSON.parse(
    readFileSync("tests/fixtures/legacy/saves.json"),
  ).cases.find(
    /* Use a validated battle before forcing a completed death transition. */ (
      entry,
    ) => entry.id === "normal",
  );
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: active.raw,
  });
  try {
    await fixture.page.goto("http://127.0.0.1:4173/");
    await expect(fixture.page.locator("#title-screen")).toBeVisible();
    const result = await fixture.page.evaluate(
      /* Retain the old button across the explicit run boundary. */ () => {
        setVolume();
        enterDungeon();
        player.stats.hp = 0;
        hpValidation();
        const old = document.querySelector("#battleButton");
        progressReset();
        player.allocated = true;
        enterDungeon();
        dungeon.progress.floor = 3;
        old.click();
        return dungeon.progress.floor;
      },
    );
    expect(result).toBe(3);
  } finally {
    await fixture.dispose();
  }
});

// A deterministic audio adapter exposes overlapping loops without relying on host speakers.
test("repeated entry never overlaps background playback", async ({
  browser,
}) => {
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
  });
  try {
    await fixture.page.goto("http://127.0.0.1:4173/");
    await expect(fixture.page.locator("#title-screen")).toBeVisible();
    const playing = await fixture.page.evaluate(
      /* Model Howler's new playback voice on each parameterless play. */ () => {
        window.Howl = class {
          // Keep active voices observable while preserving the control interface.
          constructor() {
            this.active = 0;
          }
          // Each play creates a voice unless the owner first stops the previous one.
          play() {
            this.active++;
          }
          // Stop releases every voice on this instance.
          stop() {
            this.active = 0;
          }
          // Pausing prevents an exploration loop from overlapping combat.
          pause() {
            this.active = 0;
          }
          // Unloading releases resources owned by a replaced instance.
          unload() {
            this.active = 0;
          }
        };
        setVolume();
        enterDungeon();
        enterDungeon();
        return bgmDungeon.active;
      },
    );
    expect(playing).toBe(1);
  } finally {
    await fixture.dispose();
  }
});
