/* global document, player, dungeon, enemy:writable, playerDead:writable, enemyDead:writable, setVolume, showCombatInfo, playerAttack, openInventory, playerLoadStats */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
import {
  getRelic,
  resolveEncounter,
} from "../../assets/js/content/catalog.mjs";
const saves = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases;
const resting = saves.find(
  /* Reuse frozen allocated progress without introducing save migration requirements. */ (
    row,
  ) => row.id === "resting",
);
const normal = saves.find(
  /* Use an existing known encounter without generating an enemy. */ (row) =>
    row.id === "normal",
);
const equipment = JSON.parse(
  readFileSync("tests/fixtures/legacy/equipment.json"),
).cases.find(
  /* Use an independently captured valid relic, including its sale value. */ (
    row,
  ) => row.operations[0]?.call === "createEquipment",
);
const item = JSON.parse(equipment.expected.player.inventory.equipment.at(-1));
const relic = getRelic(item.category).value;
const encounter = resolveEncounter(
  normal.state.enemy.name,
  normal.state.enemy.image,
).value;

// Isolate intercepted functional failure runs from the un-routed performance harness.
async function open(browser, mode, kind) {
  const f = await createLegacyBrowserFixture(browser, {
    storage: resting.raw,
    randomTape: kind === "creature" ? [0.5, 0.5] : [],
  });
  let release;
  const gate = new Promise(
    /* The test releases delayed bytes only after exercising real controls. */ (
      resolve,
    ) => {
      release = resolve;
    },
  );
  const counts = { primary: 0, fallback: 0 };
  await f.page.route(
    "**/assets/art/fallback.png",
    // Independently exercise a working fallback or a second failed request.
    (route) => {
      counts.fallback++;
      return mode === "fallback-missing"
        ? route.abort()
        : route.fulfill({ path: "tests/fixtures/art/valid.png" });
    },
  );
  await f.page.route(
    kind === "creature" ? "**/assets/sprites/**" : "**/assets/art/relic-*.png",
    // Explicitly gate latency; missing/corrupt runs use distinct browser failure paths.
    async (route) => {
      counts.primary++;
      if (mode === "delayed") {
        await gate;
        return route.fulfill({ path: "tests/fixtures/art/valid.png" });
      }
      return route.fulfill(
        mode === "corrupt"
          ? { contentType: "image/png", body: "corrupt" }
          : { status: 404, body: "missing" },
      );
    },
  );
  await f.page.goto("/");
  await expect(f.page.locator("#title-screen")).toBeVisible();
  await f.page.clock.install({ time: new Date("2026-10-07T12:00:00Z") });
  await f.page.clock.pauseAt(new Date("2026-10-07T12:00:01Z"));
  await f.page.evaluate(
    // Enter the established screen without advancing exploration or attack timers.
    () => {
      document.querySelector("#title-screen").style.display = "none";
      document.querySelector("#dungeon-main").style.display = "flex";
      setVolume();
      dungeon.status.paused = true;
    },
  );
  return { ...f, release, counts };
}
// Check recovery before actions remove the view; keep failures soft to verify gameplay too.
async function recovered(image, mode) {
  await expect
    .configure({ soft: true })
    .poll(
      // T104 will connect this observable loader state to the actual consumer image.
      () =>
        image.evaluate(
          /* Read state from the actual consumer element. */ (node) =>
            node.dataset.imageState,
        ),
    )
    .toBe(
      mode === "delayed"
        ? "loading"
        : mode === "fallback-missing"
          ? "text"
          : "fallback",
    );
}
for (const mode of ["delayed", "missing", "corrupt", "fallback-missing"]) {
  // Actual combat calculations and Claim stay independent of portrait network completion.
  test(`creature ${mode}: identity, victory and Claim remain usable`, async ({
    browser,
  }) => {
    const f = await open(browser, mode, "creature");
    try {
      await f.page.evaluate(
        // Seed a deterministic one-hit encounter; the existing attack grants the reward.
        (state) => {
          enemy = structuredClone(state.enemy);
          enemy.stats.hp = 1;
          enemy.stats.def = 0;
          enemy.rewards = { exp: 0, gold: 3, drop: false };
          player.inCombat = true;
          playerDead = false;
          enemyDead = false;
          document.querySelector("#combatPanel").style.display = "flex";
          showCombatInfo();
        },
        normal.state,
      );
      const image = await f.page.locator("#enemy-sprite").elementHandle();
      const box = await image.evaluate(
        // Read layout dimensions independently of the combat shake transform.
        (node) => ({
          width: globalThis.getComputedStyle(node).width,
          height: globalThis.getComputedStyle(node).height,
        }),
      );
      await recovered(image, mode);
      await expect(f.page.locator("#enemyPanel > p")).toContainText(
        encounter.encounter.displayName,
      );
      const gold = await f.page.evaluate(
        /* Observe gold before the real attack. */ () => player.gold,
      );
      await f.page.evaluate(
        // Invoke the normal timed-combat action while image bytes are delayed or broken.
        () => playerAttack(),
      );
      expect(
        await f.page.evaluate(
          /* Verify victory and exact reward without art-driven gameplay draws. */ () => ({
            hp: enemy.stats.hp,
            victory: enemyDead && !playerDead,
            gold: player.gold,
            draws: globalThis.__legacyRandomCalls,
          }),
        ),
      ).toEqual({ hp: 0, victory: true, gold: gold + 3, draws: [0.5, 0.5] });
      expect(
        await image.evaluate(
          // CSS transforms can rotate the screen rectangle without resizing the reserved slot.
          (node) => ({
            width: globalThis.getComputedStyle(node).width,
            height: globalThis.getComputedStyle(node).height,
          }),
        ),
      ).toEqual(box);
      await f.page.getByRole("button", { name: "Claim", exact: true }).click();
      await expect(f.page.locator("#combatPanel")).toBeHidden();
      expect(
        await f.page.evaluate(
          /* Claim must not award a second payment. */ () => player.gold,
        ),
      ).toBe(gold + 3);
      if (mode === "delayed") {
        f.release();
        await expect(f.page.locator("#combatPanel")).toBeHidden();
      } else expect.soft(f.counts.fallback).toBe(1);
    } finally {
      f.release();
      await f.dispose();
    }
  });
  // Opening details, equip, unequip and sale must succeed without waiting for icon bytes.
  test(`relic ${mode}: identity, equip and sale remain usable`, async ({
    browser,
  }) => {
    const f = await open(browser, mode, "relic");
    try {
      await f.page.evaluate(
        // Keep a single captured item so exact holdings and proceeds are independently known.
        (item) => {
          player.inventory.equipment = [JSON.stringify(item)];
          player.equipped = [];
          player.gold = 10;
          openInventory();
          playerLoadStats();
        },
        item,
      );
      await expect(f.page.locator("#playerInventory")).toContainText(
        relic.displayName,
      );
      const image = await f.page
        .locator("#playerInventory img")
        .elementHandle();
      await recovered(image, mode);
      const control = f.page.locator("#playerInventory button");
      await control.focus();
      await f.page.keyboard.press("Enter");
      await expect(f.page.locator("#equipmentInfo")).toContainText(
        relic.displayName,
      );
      await f.page.locator("#un-equip").click();
      await expect(
        f.page.locator("#playerEquipment button"),
      ).toHaveAccessibleName(new RegExp(relic.displayName));
      await f.page.locator("#playerEquipment button").click();
      await f.page.locator("#un-equip").click();
      await f.page.locator("#playerInventory button").click();
      await f.page.locator("#sell-equip").click();
      await f.page.locator("#sell-confirm").click();
      expect(
        await f.page.evaluate(
          /* Compare exact final holdings, payment and absence of extra random draws. */ () => ({
            inventory: player.inventory.equipment,
            equipped: player.equipped,
            gold: player.gold,
            draws: globalThis.__legacyRandomCalls,
          }),
        ),
      ).toEqual({
        inventory: [],
        equipped: [],
        gold: 10 + item.value,
        draws: [],
      });
    } finally {
      f.release();
      await f.dispose();
    }
  });
}
