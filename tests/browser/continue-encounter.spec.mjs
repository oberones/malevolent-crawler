/* global window, player, dungeon, enemy, enterDungeon, setVolume */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const cases = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases;
for (const id of [
  "normal",
  "guardian",
  "boss",
  "chest-mimic",
  "door-mimic",
  "variant-1",
  "variant-2",
  "settled-victory",
]) {
  // Reload each frozen encounter without generating enemies or replaying rewards.
  test(`continue ${id} preserves state and owns one timer set`, async ({
    browser,
  }) => {
    const row = cases.find(
      /* Select the immutable saved encounter. */ (entry) => entry.id === id,
    );
    const fixture = await createLegacyBrowserFixture(browser, {
      storage: row.raw,
    });
    try {
      const page = fixture.page;
      await page.goto("http://127.0.0.1:4173/");
      await expect(page.locator("#title-screen")).toBeVisible();
      await page.clock.install();
      await page.clock.pauseAt(new Date(Date.now() + 1000));
      const before = await page.evaluate(
        /* Capture the validated tuple before entry. */ () => ({
          player,
          enemy,
          progress: dungeon.progress,
        }),
      );
      await page.evaluate(
        /* Repeat entry before any clock tick to expose duplicate owners. */ () => {
          setVolume();
          enterDungeon();
          enterDungeon();
        },
      );
      const after = await page.evaluate(
        /* Capture protected fields and resting flags. */ () => ({
          player,
          enemy,
          progress: dungeon.progress,
          status: dungeon.status,
        }),
      );
      // HP percentage is legacy presentation text; all authoritative fields stay exact.
      expect({
        ...after.enemy,
        stats: {
          ...after.enemy.stats,
          hpPercent: Number(after.enemy.stats.hpPercent),
        },
      }).toEqual(before.enemy);
      expect(after.progress).toEqual(before.progress);
      expect(after.player.stats.hp).toBe(before.player.stats.hp);
      expect(after.player.gold).toBe(before.player.gold);
      expect(after.status).toEqual({
        exploring: false,
        paused: true,
        event: before.player.inCombat,
      });
      await page.clock.runFor(1000);
      expect(
        await page.evaluate(
          /* Each entry must leave only one playtime interval. */ () =>
            player.playtime,
        ),
      ).toBe(before.player.playtime + 1);
    } finally {
      await fixture.dispose();
    }
  });
}

// Terminal interruptions must retain exact source bytes rather than guessing rewards.
for (const id of ["interrupted-player-death", "interrupted-enemy-victory"]) {
  test(`${id} stays in recovery without overwriting source`, async ({
    browser,
  }) => {
    const row = cases.find(
      /* Select a captured mid-transition tuple. */ (entry) => entry.id === id,
    );
    const fixture = await createLegacyBrowserFixture(browser, {
      storage: row.raw,
    });
    try {
      await fixture.page.goto("http://127.0.0.1:4173/");
      await expect(fixture.page.locator("#boot-status")).toBeVisible();
      expect(
        await fixture.page.evaluate(
          /* Recovery cannot persist a guessed encounter. */ () => ({
            ...localStorage,
          }),
        ),
      ).toEqual(row.raw);
    } finally {
      await fixture.dispose();
    }
  });
}

// A settled death uses the established run reset and still completes its entry presentation.
test("settled death resets once and finishes loading", async ({ browser }) => {
  const row = cases.find(
    /* Select an already-resolved death. */ (entry) =>
      entry.id === "settled-death",
  );
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
  });
  try {
    await fixture.page.goto("http://127.0.0.1:4173/");
    await expect(fixture.page.locator("#title-screen")).toBeVisible();
    await fixture.page.locator("#title-action").click();
    await expect(fixture.page.locator("#dungeon-main")).toBeVisible();
    const state = await fixture.page.evaluate(
      /* Verify reset retention independently of presentation. */ () => ({
        player,
        dungeon,
      }),
    );
    expect(state.player.deaths).toBe(row.state.player.deaths);
    expect(state.player.gold).toBe(row.state.player.gold);
    expect(state.player.inCombat).toBe(false);
    expect(state.dungeon.progress.floor).toBe(1);
  } finally {
    await fixture.dispose();
  }
});

// Each actor gets a fresh full interval, with no generation draws during continuation.
test("continued actors wait their full first delay without rerolling", async ({
  browser,
}) => {
  const row = cases.find(
    /* Use known distinct actor speeds from the frozen corpus. */ (entry) =>
      entry.id === "normal",
  );
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
  });
  try {
    const page = fixture.page;
    await page.goto("http://127.0.0.1:4173/");
    await expect(page.locator("#title-screen")).toBeVisible();
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    const initial = await page.evaluate(
      /* Count only gameplay draws after audio construction. */ () => {
        setVolume();
        window.__continuationDraws = 0;
        Math.random =
          /* Fixed combat draws reveal extra actor chains or rerolls. */ () => {
            window.__continuationDraws++;
            return 0.5;
          };
        enterDungeon();
        return {
          draws: window.__continuationDraws,
          playerDelay: 1000 / player.stats.atkSpd,
          enemyDelay: 1000 / enemy.stats.atkSpd,
          hp: player.stats.hp,
          enemyHp: enemy.stats.hp,
        };
      },
    );
    expect(initial.draws).toBe(0);
    expect(initial.playerDelay).toBeLessThan(initial.enemyDelay);
    await page.clock.runFor(Math.floor(initial.playerDelay) - 1);
    expect(
      await page.evaluate(
        /* No actor consumes randomness before the faster player's first deadline. */ () =>
          window.__continuationDraws,
      ),
    ).toBe(0);
    await page.clock.runFor(2);
    expect(
      await page.evaluate(
        /* Exactly one player attack consumes damage and critical draws. */ () =>
          window.__continuationDraws,
      ),
    ).toBe(2);
    expect(
      await page.evaluate(
        /* The player's full delay damages the saved enemy. */ () =>
          enemy.stats.hp,
      ),
    ).toBeLessThan(initial.enemyHp);
    expect(
      await page.evaluate(
        /* The slower enemy has not attacked early. */ () => player.stats.hp,
      ),
    ).toBe(initial.hp);
    await page.clock.runFor(
      Math.floor(initial.enemyDelay) - Math.floor(initial.playerDelay) - 2,
    );
    expect(
      await page.evaluate(
        /* No second actor fires immediately before the enemy deadline. */ () =>
          window.__continuationDraws,
      ),
    ).toBe(2);
    await page.clock.runFor(2);
    expect(
      await page.evaluate(
        /* Exactly one enemy attack consumes the next two draws. */ () =>
          window.__continuationDraws,
      ),
    ).toBe(4);
    expect(
      await page.evaluate(
        /* The enemy's full delay now damages the retained character. */ () =>
          player.stats.hp,
      ),
    ).toBeLessThan(initial.hp);
  } finally {
    await fixture.dispose();
  }
});
