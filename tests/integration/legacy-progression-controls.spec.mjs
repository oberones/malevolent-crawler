/* global player, dungeon, setVolume, lvlupPopup, openInventory, showCombatInfo */
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const saves = JSON.parse(
  await readFile(new URL("../fixtures/legacy/saves.json", import.meta.url)),
).cases;
const resting = saves.find(
  // The frozen resting state fixes all progression inputs independently of candidate code.
  (row) => row.id === "resting",
);
const normal = saves.find(
  // Upgrade panels are created within a valid original combat view.
  (row) => row.id === "normal",
);
const full = saves.find(
  // Keep duplicate holdings and six occupied slots through the reset journey.
  (row) => row.id === "full-duplicate-equipment",
);
const upgrades = {
  hp: 10,
  atk: 8,
  def: 8,
  atkSpd: 3,
  vamp: 0.5,
  critRate: 1,
  critDmg: 6,
};
for (const [index, [stat, increment]] of Object.entries(upgrades).entries()) {
  // Each selectable bonus is exercised through an actual generated button and save write.
  test(`legacy upgrade choice ${stat} applies its original increment`, async ({
    browser,
  }) => {
    const tape = [index, (index + 1) % 7, (index + 2) % 7].map(
      // Target the middle of the selected stat's probability interval.
      (value) => (value + 0.5) / 7,
    );
    const fixture = await createLegacyBrowserFixture(browser, {
      storage: normal.raw,
      randomTape: tape,
    });
    try {
      await fixture.page.goto(
        "http://127.0.0.1:4173/tests/fixtures/legacy/source/index.html",
      );
      await fixture.page.evaluate(
        // Present one earned upgrade while avoiding unrelated encounter or loader timers.
        () => {
          setVolume();
          showCombatInfo();
          player.exp.lvlGained = 1;
          player.stats.hp = 350;
          lvlupPopup();
        },
      );
      await expect(
        fixture.page.locator('#lvlupSelect button[id^="lvlSlot"]'),
      ).toHaveCount(3);
      await fixture.page.locator("#lvlSlot0").click();
      const result = await fixture.page.evaluate(
        // Read actual state and persisted data after the click, not expected fixture objects.
        () => ({
          player,
          saved: JSON.parse(localStorage.getItem("playerData")),
          draws: globalThis.__legacyRandomCalls,
        }),
      );
      expect(result.player.bonusStats).toEqual({
        ...resting.state.player.bonusStats,
        [stat]: increment,
      });
      expect(result.player.exp.lvlGained).toBe(0);
      expect(result.player.stats.hp).toBe(450);
      expect(result.saved).toEqual(result.player);
      expect(result.draws).toEqual(tape);
      await expect(fixture.page.locator("#lvlupPanel")).toBeHidden();
    } finally {
      await fixture.dispose();
    }
  });
}
// Real DOM replacement is essential here: the small VM stub intentionally does not parse listeners.
test("legacy upgrades allow two rerolls, reject a third, and replenish for the next level", async ({
  browser,
}) => {
  const tape = [0, 0, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 0, 0.2, 0.3, 0.45, 0.6];
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: normal.raw,
    randomTape: tape,
  });
  try {
    const page = fixture.page;
    await page.goto(
      "http://127.0.0.1:4173/tests/fixtures/legacy/source/index.html",
    );
    await page.evaluate(
      // Two earned levels exercise the follow-up choice set and reroll reset.
      () => {
        setVolume();
        showCombatInfo();
        player.exp.lvlGained = 2;
        lvlupPopup();
      },
    );
    await expect(page.locator("#lvlReroll")).toHaveText("Reroll 2/2");
    await page.locator("#lvlReroll").click();
    await expect(page.locator("#lvlReroll")).toHaveText("Reroll 1/2");
    await page.locator("#lvlReroll").click();
    await expect(page.locator("#lvlReroll")).toHaveText("Reroll 0/2");
    await page.locator("#lvlReroll").click();
    // A denied reroll cannot consume randomness or silently regenerate the choices.
    expect(await page.evaluate(() => globalThis.__legacyRandomCalls)).toEqual(
      tape.slice(0, 10),
    );
    await page.locator("#lvlSlot0").click();
    await expect(page.locator("#lvlReroll")).toHaveText("Reroll 2/2");
    await page.locator("#lvlSlot2").click();
    // The last generated set awards vampirism after the preceding critical-damage choice.
    const result = await page.evaluate(() => ({
      player,
      draws: globalThis.__legacyRandomCalls,
    }));
    expect(result.player.bonusStats).toEqual({
      ...resting.state.player.bonusStats,
      critDmg: 6,
      vamp: 0.5,
    });
    expect(result.player.exp.lvlGained).toBe(0);
    expect(result.draws).toEqual(tape);
  } finally {
    await fixture.dispose();
  }
});
for (const confirm of [false, true]) {
  // Follow both actual abandonment buttons and verify retained data separately from reset fields.
  test(`legacy abandonment ${confirm ? "confirm" : "cancel"} preserves holdings and lifetime progress`, async ({
    browser,
  }) => {
    const fixture = await createLegacyBrowserFixture(browser, {
      storage: full.raw,
      randomTape: [],
    });
    try {
      const page = fixture.page;
      await page.goto(
        "http://127.0.0.1:4173/tests/fixtures/legacy/source/index.html",
      );
      await page.evaluate(
        // Supply valid timer handles normally established by dungeon entry without starting real time.
        () => {
          setVolume();
          globalThis.dungeonTimer = 0;
          globalThis.playTimer = 0;
          openInventory();
        },
      );
      await page.locator("#menu-btn").click();
      await page.locator("#quit-run").click();
      // Capture the comparison after menu pause, before the destructive confirmation.
      const before = await page.evaluate(() => ({ player, dungeon }));
      await page
        .locator(confirm ? "#defaultModal #quit-run" : "#cancel-quit")
        .click();
      // Read the actual engine state; presentation and timer phases are not serialized progress.
      const after = await page.evaluate(() => ({ player, dungeon }));
      if (!confirm) expect(after).toEqual(before);
      else {
        for (const field of [
          "name",
          "inventory",
          "equipped",
          "gold",
          "playtime",
          "kills",
          "deaths",
        ])
          expect(after.player[field], field).toEqual(before.player[field]);
        expect(after.player.lvl).toBe(1);
        expect(after.player.skills).toEqual([]);
        expect(after.player.allocated).toBeUndefined();
        expect(after.dungeon.progress.floor).toBe(1);
        expect(after.dungeon.progress.room).toBe(1);
        expect(after.dungeon.status).toEqual({
          exploring: false,
          paused: true,
          event: false,
        });
      }
    } finally {
      await fixture.dispose();
    }
  });
}
