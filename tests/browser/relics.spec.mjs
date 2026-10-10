/* global document, player:writable, dungeon:writable, enemy:writable, playerDead:writable, enemyDead:writable, createEquipmentPrint, showInventory, openInventory, playerLoadStats, hpValidation, showCombatInfo, progressReset, setVolume */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
import { getRelic } from "../../assets/js/content/catalog.mjs";
// Read expected item rolls and run outcomes from the immutable oracle.
function fixture(name) {
  return JSON.parse(
    readFileSync(new URL(`../fixtures/legacy/${name}.json`, import.meta.url)),
  );
}
const resting = fixture("saves").cases.find(
  /* Start from a valid allocated resting save. */ (r) => r.id === "resting",
);
const normal = fixture("saves").cases.find(
  /* Use an existing resumable combat tuple. */ (r) => r.id === "normal",
);
const matrix = new Map();
for (const row of fixture("equipment").cases) {
  if (row.operations[0]?.call !== "createEquipment") continue;
  const item = JSON.parse(row.expected.player.inventory.equipment.at(-1));
  const key = `${item.category}/${item.rarity}`;
  if (!matrix.has(key))
    matrix.set(key, {
      ...row,
      item,
      name: getRelic(item.category).value.displayName,
    });
}
const first = [...matrix.values()][0].item;
// Open actual browser UI with stopped test time; no exploration or audio timing affects holdings.
async function open(browser, randomTape = []) {
  const f = await createLegacyBrowserFixture(browser, {
    storage: resting.raw,
    randomTape,
  });
  await f.page.goto("/");
  await expect(f.page.locator("#title-screen")).toBeVisible();
  await f.page.clock.install({ time: new Date("2026-10-07T12:00:00Z") });
  await f.page.clock.pauseAt(new Date("2026-10-07T12:00:01Z"));
  await f.page.evaluate(
    /* Expose the existing screen without starting exploration timers. */ () => {
      document.querySelector("#title-screen").style.display = "none";
      document.querySelector("#dungeon-main").style.display = "flex";
      setVolume();
      dungeon.status.paused = true;
      openInventory();
    },
  );
  return f;
}
// Exercise each category/rarity through real generation and DOM handlers, comparing captured rolls.
test("84 relic identities agree across reward, list, equipped, detail, confirmation and log", async ({
  browser,
}) => {
  const rows = [...matrix.values()];
  expect(rows).toHaveLength(84);
  const f = await open(
    browser,
    rows.flatMap(
      /* Concatenate complete immutable generation tapes. */ (r) => r.tape,
    ),
  );
  try {
    const observed = await f.page.evaluate(
      /* Use actual controls while collecting every identity, even if an early label is missing. */ ({
        rows,
        base,
      }) => {
        const results = [];
        for (const row of rows) {
          player = structuredClone(row.setup.player ?? base.player);
          dungeon = structuredClone(row.setup.dungeon ?? base.dungeon);
          enemy = structuredClone(base.enemy);
          player.inventory.equipment = [];
          player.equipped = [];
          const startGold = player.gold;
          createEquipmentPrint("dungeon");
          const rolled = JSON.parse(player.inventory.equipment[0]);
          const log = document.querySelector("#dungeonLog").textContent;
          openInventory();
          const list = document.querySelector("#playerInventory").textContent;
          document.querySelector("#playerInventory .items").click();
          const detail = document.querySelector("#equipmentInfo").textContent;
          document.querySelector("#un-equip").click();
          const equippedItem = structuredClone(player.equipped[0]);
          const equippedLabel = document
            .querySelector("#playerEquipment button")
            .getAttribute("aria-label");
          document.querySelector("#playerEquipment .items").click();
          const equippedDetail =
            document.querySelector("#equipmentInfo").textContent;
          document.querySelector("#un-equip").click();
          const returned = JSON.parse(player.inventory.equipment[0]);
          document.querySelector("#playerInventory .items").click();
          document.querySelector("#sell-equip").click();
          const confirmation =
            document.querySelector("#defaultModal").textContent;
          document.querySelector("#sell-confirm").click();
          results.push({
            rolled,
            equippedItem,
            returned,
            log,
            list,
            detail,
            equippedLabel,
            equippedDetail,
            confirmation,
            gold: player.gold - startGold,
            inventory: player.inventory.equipment,
            equipped: player.equipped,
          });
        }
        return { results, draws: globalThis.__legacyRandomCalls };
      },
      { rows, base: resting.state },
    );
    const missing = [];
    for (const [i, row] of rows.entries()) {
      const result = observed.results[i];
      expect(result.rolled).toEqual(row.item);
      expect(result.equippedItem).toEqual(row.item);
      expect(result.returned).toEqual(row.item);
      expect(result.gold).toBe(row.item.value);
      expect(result.inventory).toEqual([]);
      expect(result.equipped).toEqual([]);
      for (const surface of [
        "log",
        "list",
        "detail",
        "equippedLabel",
        "equippedDetail",
        "confirmation",
      ]) {
        if (!result[surface].includes(row.name))
          missing.push(`${row.item.category}/${row.item.rarity}: ${surface}`);
      }
    }
    expect(observed.draws).toEqual(
      rows.flatMap(
        /* Compare every draw, not only the final item. */ (r) => r.tape,
      ),
    );
    expect(
      missing,
      "Every current item surface must expose the same visible identity",
    ).toEqual([]);
  } finally {
    await f.dispose();
  }
});
// Filtered sale and unequip-all retain duplicate multiplicity and the original order.
test("duplicates, unequip-all, sale filters, cancellation and empty inventory", async ({
  browser,
}) => {
  const f = await open(browser);
  const rare = { ...first, rarity: "Rare", value: 7 };
  try {
    await f.page.evaluate(
      /* Seed separate duplicate objects and exact inventory bytes. */ ({
        first,
        rare,
      }) => {
        player.inventory.equipment = [JSON.stringify(rare)];
        player.equipped = [first, rare, structuredClone(first)];
        player.gold = 10;
        playerLoadStats();
      },
      { first, rare },
    );
    await f.page.locator("#unequip-all").click();
    await f.page.locator("#unequip-confirm").click();
    await expect(f.page.locator("#playerInventory .items")).toHaveCount(4);
    expect(
      await f.page.evaluate(
        /* Read encoded order after the UI action. */ () =>
          player.inventory.equipment,
      ),
    ).toEqual([
      JSON.stringify(rare),
      JSON.stringify(first),
      JSON.stringify(rare),
      JSON.stringify(first),
    ]);
    await f.page.locator("#sell-rarity").selectOption("Common");
    await f.page.locator("#sell-all").click();
    await f.page.locator("#sell-cancel").click();
    await expect(f.page.locator("#playerInventory .items")).toHaveCount(4);
    await f.page.locator("#sell-all").click();
    await f.page.locator("#sell-confirm").click();
    expect(
      await f.page.evaluate(
        /* Observe exact sale proceeds and surviving holdings. */ () => ({
          gold: player.gold,
          inventory: player.inventory.equipment,
          equipped: player.equipped,
        }),
      ),
    ).toEqual({
      gold: 10 + first.value * 2,
      inventory: [JSON.stringify(rare), JSON.stringify(rare)],
      equipped: [],
    });
    await f.page.locator("#sell-rarity").selectOption("All");
    await f.page.locator("#sell-all").click();
    await f.page.locator("#sell-confirm").click();
    await expect(f.page.locator("#playerInventory")).toContainText(
      "No recovered relics",
    );
    expect(
      await f.page.evaluate(
        /* Empty-sale attempts must not alter the result. */ () => player.gold,
      ),
    ).toBe(24 + first.value * 2);
  } finally {
    await f.dispose();
  }
});
// Full-loadout feedback is an explicit acceptance requirement in addition to preserving six slots.
test("full loadout rejects the seventh relic with visible capacity feedback", async ({
  browser,
}) => {
  const f = await open(browser);
  try {
    await f.page.evaluate(
      /* Populate the six legacy slots and one inventory holding. */ (item) => {
        player.equipped = Array.from(
          { length: 6 },
          /* Keep separate duplicate holdings. */ () => structuredClone(item),
        );
        player.inventory.equipment = [JSON.stringify(item)];
        playerLoadStats();
      },
      first,
    );
    await f.page.locator("#playerInventory .items").click();
    await f.page.locator("#un-equip").click();
    expect(
      await f.page.evaluate(
        /* Refusal must leave both collections intact. */ () => [
          player.equipped.length,
          player.inventory.equipment.length,
        ],
      ),
    ).toEqual([6, 1]);
    await expect(f.page.locator("#equipmentInfo")).toContainText(
      /six|6|full|capacity/i,
    );
  } finally {
    await f.dispose();
  }
});
// A confirmation cannot sell a shifted item or replay the same sale a second time.
test("stale and repeated sale callbacks preserve current holdings and gold", async ({
  browser,
}) => {
  const f = await open(browser);
  try {
    const result = await f.page.evaluate(
      /* Retain the actual DOM callback to simulate a queued stale event. */ (
        item,
      ) => {
        player.inventory.equipment = [
          JSON.stringify(item),
          JSON.stringify(item),
        ];
        player.equipped = [];
        playerLoadStats();
        document.querySelector("#playerInventory .items").click();
        document.querySelector("#sell-equip").click();
        const stale = document.querySelector("#sell-confirm").onclick;
        player.inventory.equipment.shift();
        showInventory();
        const before = JSON.stringify({
          inventory: player.inventory,
          gold: player.gold,
        });
        stale();
        const after = JSON.stringify({
          inventory: player.inventory,
          gold: player.gold,
        });
        // Start a fresh confirmation independently so both failure modes are observed.
        player.inventory.equipment = [
          JSON.stringify(item),
          JSON.stringify(item),
        ];
        showInventory();
        document.querySelector("#playerInventory .items").click();
        document.querySelector("#sell-equip").click();
        const repeated = document.querySelector("#sell-confirm").onclick;
        repeated();
        const once = JSON.stringify({
          inventory: player.inventory,
          gold: player.gold,
        });
        repeated();
        return {
          before,
          after,
          once,
          twice: JSON.stringify({
            inventory: player.inventory,
            gold: player.gold,
          }),
        };
      },
      first,
    );
    expect.soft(result.after).toEqual(result.before);
    expect.soft(result.twice).toEqual(result.once);
  } finally {
    await f.dispose();
  }
});
// Claim dismisses an already-granted reward; it never awards another item or another payment.
test("combat Claim preserves the already granted relic", async ({
  browser,
}) => {
  const row = [...matrix.values()][0];
  const f = await open(browser, row.tape);
  try {
    await f.page.evaluate(
      /* Grant through the existing victory flow with a captured deterministic roll. */ ({
        state,
        setup,
      }) => {
        player = structuredClone(setup.player ?? state.player);
        dungeon = structuredClone(setup.dungeon ?? state.dungeon);
        enemy = structuredClone(state.enemy);
        enemy.stats.hp = 0;
        enemy.rewards = { exp: 0, gold: 3, drop: true };
        player.inCombat = true;
        playerDead = false;
        enemyDead = false;
        document.querySelector("#inventory").style.display = "none";
        document.querySelector("#combatPanel").style.display = "flex";
        showCombatInfo();
        hpValidation();
      },
      { state: normal.state, setup: row.setup },
    );
    expect(
      await f.page.evaluate(
        /* Observe the terminal flags established by the victory flow. */ () => [
          enemyDead,
          playerDead,
        ],
      ),
    ).toEqual([true, false]);
    const before = await f.page.evaluate(
      /* Capture already-awarded state before Claim. */ () => ({
        inventory: player.inventory,
        gold: player.gold,
      }),
    );
    expect(JSON.parse(before.inventory.equipment.at(-1))).toEqual(row.item);
    await expect(f.page.locator("#combatLogBox")).toContainText(row.name);
    await f.page.locator("#battleButton").click();
    expect(
      await f.page.evaluate(
        /* Claim must only dismiss presentation. */ () => ({
          inventory: player.inventory,
          gold: player.gold,
        }),
      ),
    ).toEqual(before);
  } finally {
    await f.dispose();
  }
});
for (const mode of ["death", "abandon", "new-run"]) {
  // Lifetime holdings and exact duplicate multiplicity survive each run-reset entry point.
  test(`relic retention after ${mode}`, async ({ browser }) => {
    const f = await open(browser);
    try {
      await f.page.evaluate(
        /* Supply distinguishable ordering as well as duplicate values. */ (
          item,
        ) => {
          player.inventory.equipment = [
            JSON.stringify(item),
            JSON.stringify(item),
          ];
          player.equipped = [item, { ...item, value: item.value + 1 }];
          playerLoadStats();
        },
        first,
      );
      const before = await f.page.evaluate(
        /* Record exact strings and objects before resetting progression. */ () => ({
          inventory: player.inventory,
          equipped: player.equipped,
          gold: player.gold,
        }),
      );
      if (mode === "abandon") {
        await f.page.locator("#menu-btn").click();
        await f.page.locator("#quit-run").click();
        await f.page.locator("#defaultModal #quit-run").click();
      } else if (mode === "death") {
        await f.page.evaluate(
          /* Set a terminal encounter and use its real return control. */ (
            state,
          ) => {
            enemy = structuredClone(state.enemy);
            player.stats.hp = 0;
            player.inCombat = true;
            playerDead = false;
            enemyDead = false;
            document.querySelector("#inventory").style.display = "none";
            document.querySelector("#combatPanel").style.display = "flex";
            showCombatInfo();
            hpValidation();
          },
          normal.state,
        );
        await f.page.locator("#battleButton").click();
      } else {
        await f.page.evaluate(
          /* Reset the finished run and expose the normal title entry point. */ () => {
            progressReset();
            document.querySelector("#inventory").style.display = "none";
            document.querySelector("#dungeon-main").style.display = "none";
            document.querySelector("#title-screen").style.display = "flex";
          },
        );
        await f.page.locator("#title-action").click();
        await f.page.locator("#allocate-confirm").click();
        expect(
          await f.page.evaluate(
            /* New-run allocation must finish without replacing the retained holdings. */ () =>
              player.allocated,
          ),
        ).toBe(true);
      }
      expect(
        await f.page.evaluate(
          /* Compare the lifetime fields after the selected reset path. */ () => ({
            inventory: player.inventory,
            equipped: player.equipped,
            gold: player.gold,
          }),
        ),
      ).toEqual(before);
    } finally {
      await f.dispose();
    }
  });
}

// Verify percentage rounding on both item surfaces without changing stored rolls.
test("item percentages display nearest integers in rewards and details", async ({
  browser,
}) => {
  const f = await open(browser);
  const item = {
    ...first,
    stats: [
      { hp: 12 },
      { atkSpd: 2.49 },
      { vamp: 2.5 },
      { critRate: 0.1 },
      { critDmg: 9.99 },
    ],
  };
  try {
    await f.page.evaluate(
      // Render a deterministic reward and open its actual inventory detail control.
      async (item) => {
        const { createOutcomeView } =
          await import("/assets/js/app/outcome-view.mjs");
        const view = createOutcomeView(document);
        view.renderLog(document.querySelector("#dungeonLog"), {
          id: "inventory.reward",
          params: { item },
        });
        player.inventory.equipment = [JSON.stringify(item)];
        player.equipped = [];
        openInventory();
        document.querySelector("#playerInventory .items").click();
      },
      item,
    );
    await expect(f.page.locator("#equipmentInfo li")).toHaveText([
      "HP +12",
      "Attack speed +2%",
      "Vampirism +3%",
      "Critical rate +0%",
      "Critical damage +10%",
    ]);
    await expect(f.page.locator("#dungeonLog li")).toHaveText([
      "HP+12",
      "ATK.SPD+2%",
      "VAMP+3%",
      "C.RATE+0%",
      "C.DMG+10%",
    ]);
    await f.page.locator("#un-equip").click();
    await f.page.locator("#playerEquipment .items").click();
    await expect(f.page.locator("#equipmentInfo li")).toHaveText([
      "HP +12",
      "Attack speed +2%",
      "Vampirism +3%",
      "Critical rate +0%",
      "Critical damage +10%",
    ]);
    expect(
      await f.page.evaluate(
        // Read the actual equipped holding to prove rendering preserved precision.
        () => player.equipped[0],
      ),
    ).toEqual(item);
  } finally {
    await f.context.close();
  }
});
