/* global showItemInfo, equipmentIcon, lvlupPopup, statBlessing, document, generateLvlStats, player, dungeon, enemy, volume, objectValidation, progressReset, sellAll, setVolume, showCombatInfo, playerAttack, enemyAttack */
import { validateCandidate } from "../../assets/js/app/save-validation.mjs";
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const cases = JSON.parse(
  await readFile(new URL("../fixtures/legacy/saves.json", import.meta.url)),
).cases;
const key = "malevolentCrawler.save.v1";
for (const operation of ["reset", "sale", "attack", "reward", "death"]) {
  // Observe every actual write at existing engine entry points, including nested reward saves.
  test(`${operation} commits exactly one completed snapshot and retains legacy bytes`, /* Verify the named behavior using isolated state and observable outcomes. */ async ({
    browser,
  }) => {
    const row = cases.find(
      /* Select the captured input for this scenario. */ (entry) =>
        entry.id ===
        (operation === "sale" ? "full-duplicate-equipment" : "normal"),
    );
    const fixture = await createLegacyBrowserFixture(browser, {
      storage: row.raw,
    });
    try {
      await fixture.page.goto("http://127.0.0.1:4173/");
      await expect(fixture.page.locator("#title-screen")).toBeVisible();
      const result = await fixture.page.evaluate(
        /* Exercise or inspect the isolated browser state for this assertion. */ ({
          operation,
          key,
        }) => {
          const writes = [];
          const write = Storage.prototype.setItem;
          Storage.prototype.setItem =
            /* Observe or fault the browser boundary for this scenario. */ function (
              key,
              value,
            ) {
              writes.push({ key, value });
              return write.call(this, key, value);
            };
          setVolume();
          if (operation === "reset") progressReset();
          else if (operation === "sale") sellAll("All");
          else {
            showCombatInfo();
            // Eliminate drop-generation randomness; combat still consumes its original two draws.
            enemy.rewards.drop = false;
            if (operation === "reward") {
              enemy.stats.hp = 1;
              player.stats.atk = 100000;
            }
            if (operation === "death") {
              player.stats.hp = 1;
              enemy.stats.atk = 100000;
              enemyAttack();
            } else playerAttack();
          }
          return {
            writes,
            current: { player, dungeon, enemy, volume },
            legacy: Object.fromEntries(
              ["playerData", "dungeonData", "enemyData", "volumeData"].map(
                /* Read each requested source key without modifying its bytes. */ (
                  key,
                ) => [key, localStorage.getItem(key)],
              ),
            ),
            saved: JSON.parse(localStorage.getItem(key)),
          };
        },
        { operation, key },
      );
      expect(
        result.writes.filter(
          /* Select canonical writes independently of backup writes. */ (
            write,
          ) => write.key === key,
        ),
      ).toHaveLength(1);
      expect(result.legacy).toEqual(row.raw);
      expect(result.saved.state).toEqual(
        validateCandidate(result.current, "state").candidate,
      );
      if (["reward", "death"].includes(operation))
        expect(result.saved.state.player.inCombat).toBe(false);
    } finally {
      await fixture.dispose();
    }
  });
}
// Default normalization must neither mutate its input nor write an intermediate save.
test("object validation is pure", /* Verify the named behavior using isolated state and observable outcomes. */ async ({
  browser,
}) => {
  const row = cases.find(
    /* Select the captured input for this scenario. */ (entry) =>
      entry.id === "resting",
  );
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
  });
  try {
    await fixture.page.goto("http://127.0.0.1:4173/");
    await expect(fixture.page.locator("#title-screen")).toBeVisible();
    const result = await fixture.page.evaluate(
      /* Exercise or inspect the isolated browser state for this assertion. */ () => {
        const input = { name: "Sample" };
        const output = objectValidation(input);
        return { input, output };
      },
    );
    expect(result.input).toEqual({ name: "Sample" });
    expect(result.output).toEqual({
      name: "Sample",
      skills: [],
      tempStats: { atk: 0, atkSpd: 0 },
    });
  } finally {
    await fixture.dispose();
  }
});
// A denied canonical write retains current memory and the previously committed revision.
test("failed save keeps the completed action in memory and exposes unsaved status", /* Verify the named behavior using isolated state and observable outcomes. */ async ({
  browser,
}) => {
  // Use a run that will visibly reset without entering combat or consuming randomness.
  const row = cases.find(
    /* Select the captured input for this scenario. */ (entry) =>
      entry.id === "resting",
  );
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
  });
  try {
    await fixture.page.goto("http://127.0.0.1:4173/");
    await expect(fixture.page.locator("#title-screen")).toBeVisible();
    const result = await fixture.page.evaluate(
      /* Exercise or inspect the isolated browser state for this assertion. */ (
        key,
      ) => {
        const before = localStorage.getItem(key);
        const write = Storage.prototype.setItem;
        // Refuse only the canonical replacement, leaving the prior-good stage observable.
        Storage.prototype.setItem =
          /* Observe or fault the browser boundary for this scenario. */ function (
            name,
            value,
          ) {
            if (name === key)
              throw new DOMException("Full", "QuotaExceededError");
            return write.call(this, name, value);
          };
        player.lvl = 7;
        progressReset();
        return { before, after: localStorage.getItem(key), lvl: player.lvl };
      },
      key,
    );
    expect(result.after).toBe(result.before);
    expect(result.lvl).toBe(1);
    await expect(fixture.page.locator("#save-status")).toContainText(
      "not saved",
    );
    await expect(fixture.page.locator("#save-status")).toBeInViewport();
  } finally {
    await fixture.dispose();
  }
});
// Unexpected upgrade rendering failures must not disappear into the legacy empty catch.
test("upgrade rendering reports unexpected DOM failures", /* Verify the named behavior using isolated state and observable outcomes. */ async ({
  browser,
}) => {
  // A valid resting player isolates the DOM error from save parsing and combat state.
  const row = cases.find(
    /* Select the captured input for this scenario. */ (entry) =>
      entry.id === "resting",
  );
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
  });
  try {
    await fixture.page.goto("http://127.0.0.1:4173/");
    await expect(fixture.page.locator("#title-screen")).toBeVisible();
    const result = await fixture.page.evaluate(
      /* Exercise or inspect the isolated browser state for this assertion. */ () => {
        const create = document.createElement.bind(document);
        // Fail only generated choice buttons, after the existing panel has been populated.
        document.createElement =
          /* Observe or fault the browser boundary for this scenario. */ function (
            tag,
          ) {
            if (tag === "button") throw new Error("Synthetic DOM failure");
            return create(tag);
          };
        try {
          generateLvlStats(2, {
            hp: 10,
            atk: 8,
            def: 8,
            atkSpd: 3,
            vamp: 0.5,
            critRate: 1,
            critDmg: 6,
          });
        } catch (error) {
          return error.message;
        }
        return null;
      },
    );
    expect(result).toBe("Synthetic DOM failure");
  } finally {
    await fixture.dispose();
  }
});
for (const action of ["equip", "unequip", "upgrade", "event"]) {
  // Generated controls and event rules must commit their final state, including nested refreshes.
  test(`${action} records one completed transition`, /* Verify the named behavior using isolated state and observable outcomes. */ async ({
    browser,
  }) => {
    // Inventory fixtures retain separate duplicate items; upgrades use a valid combat panel.
    const row = cases.find(
      /* Select the captured input for this scenario. */ (entry) =>
        entry.id ===
        (["equip", "unequip"].includes(action)
          ? "full-duplicate-equipment"
          : action === "event"
            ? "resting"
            : "normal"),
    );
    const fixture = await createLegacyBrowserFixture(browser, {
      storage: row.raw,
    });
    try {
      await fixture.page.goto("http://127.0.0.1:4173/");
      await expect(fixture.page.locator("#title-screen")).toBeVisible();
      const result = await fixture.page.evaluate(
        /* Exercise or inspect the isolated browser state for this assertion. */ ({
          action,
          key,
        }) => {
          setVolume();
          if (action === "equip") {
            player.equipped.pop();
            const item = JSON.parse(player.inventory.equipment[0]);
            showItemInfo(item, equipmentIcon(item.category), "Equip", 0);
          } else if (action === "unequip") {
            const item = player.equipped[0];
            showItemInfo(item, equipmentIcon(item.category), "Unequip", 0);
          } else if (action === "upgrade") {
            showCombatInfo();
            player.exp.lvlGained = 1;
            lvlupPopup();
          }
          const writes = [];
          const write = Storage.prototype.setItem;
          // Record only the tested action, after its view has been prepared.
          Storage.prototype.setItem =
            /* Observe or fault the browser boundary for this scenario. */ function (
              name,
              value,
            ) {
              writes.push(name);
              return write.call(this, name, value);
            };
          if (action === "event") statBlessing();
          else
            document
              .querySelector(action === "upgrade" ? "#lvlSlot0" : "#un-equip")
              .click();
          return {
            writes,
            current: { player, dungeon, enemy, volume },
            saved: JSON.parse(localStorage.getItem(key)),
          };
        },
        { action, key },
      );
      // Prior-good writes are separate; exactly one canonical revision represents the whole action.
      expect(
        result.writes.filter(
          /* Select canonical writes independently of backup writes. */ (
            name,
          ) => name === key,
        ),
      ).toHaveLength(1);
      expect(result.saved.state).toEqual(
        validateCandidate(result.current, "state").candidate,
      );
    } finally {
      await fixture.dispose();
    }
  });
}
