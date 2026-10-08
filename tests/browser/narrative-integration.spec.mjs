/* global document, player, dungeon, enemy:writable, setVolume, showCombatInfo, playerLoadStats, addCombatLog, addDungeonLog, updateDungeonLog, openInventory */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
import { skills } from "../../assets/js/content/messages.mjs";
import { getRelic } from "../../assets/js/content/catalog.mjs";
const saveCases = JSON.parse(
  readFileSync(new URL("../fixtures/legacy/saves.json", import.meta.url)),
).cases;
const resting = saveCases.find(
  // Reuse a validated legacy character with holdings.
  (row) => row.id === "resting",
);
// Current logs and all name surfaces must use inert nodes, including after menu navigation.
test("current narrative keeps hostile names inert and records the last fifty events", async ({
  browser,
}) => {
  const f = await createLegacyBrowserFixture(browser, {
    storage: resting.raw,
    randomTape: [],
  });
  try {
    const p = f.page;
    await p.goto("/");
    await expect(p.locator("#title-screen")).toBeVisible();
    await p.locator("#title-action").click();
    await expect(p.locator("#dungeon-main")).toBeVisible();
    const name = 'Goblin <img src=x onerror="globalThis.injected=true"> $&';
    const result = await p.evaluate(
      // Drive production presentation without executing saved strings or changing numeric rules.
      ({ name, encounter }) => {
        enemy = encounter;
        player.name = name;
        setVolume();
        showCombatInfo();
        playerLoadStats();
        addCombatLog({
          id: "combat.enemyHit",
          params: { encounter: enemy.name, player: name, damage: 12.5 },
        });
        dungeon.backlog = [];
        for (let i = 0; i < 55; i++)
          addDungeonLog({ id: "event.gold", params: { amount: i } });
        updateDungeonLog();
        return {
          name: document.querySelector("#player-name").textContent,
          log: document.querySelector("#combatLogBox").textContent,
          paragraphs: document.querySelectorAll("#dungeonLog > p").length,
          first: document.querySelector("#dungeonLog > p").textContent,
          last: dungeon.backlog.at(-1),
          injected: !!globalThis.injected,
          images: document.querySelectorAll(
            "#player-name img, #combatLogBox img",
          ).length,
        };
      },
      {
        name,
        encounter: saveCases.find(
          /* Use an actual active identity for the battle view. */ (row) =>
            row.id === "normal",
        ).state.enemy,
      },
    );
    expect(result.name).toContain(name);
    expect(result.log).toContain(name);
    expect(result.log).toContain("12.5");
    expect(result).toMatchObject({
      paragraphs: 50,
      first: "You recover 5 Quay Marks.",
      last: { id: "event.gold", params: { amount: 54 } },
      injected: false,
      images: 0,
    });
    await p.evaluate(/* Open the unchanged menu path. */ () => openInventory());
    await p.locator("#menu-btn").click();
    expect(await p.locator("#player-menu").textContent()).toBe(name);
    await p.locator("#player-menu").click();
    expect(await p.locator("#profile-tab").textContent()).toContain(name);
    expect(await p.locator("#profile-tab img").count()).toBe(0);
  } finally {
    await f.dispose();
  }
});
// Every selectable alias retains its original value and exposes catalog name and exact effect.
test("allocation uses catalog skills without changing rule tokens", async ({
  browser,
}) => {
  const f = await createLegacyBrowserFixture(browser, { randomTape: [] });
  try {
    const p = f.page;
    await p.goto("/");
    await expect(p.locator("#character-creation")).toBeVisible();
    await p.locator("#name-input").fill("Keeper");
    await p.locator("#name-submit button").click();
    await p.locator("#title-action").click();
    for (const [alias, skill] of Object.entries(skills)) {
      if (alias === "Rampager") continue;
      await p.locator("#select-skill").selectOption(alias);
      await expect(p.locator("#select-skill option:checked")).toHaveText(
        skill.name,
      );
      await expect(p.locator("#skill-desc")).toHaveText(skill.description);
    }
    await expect(p.locator("#defaultModal")).toContainText(
      "Drowned Observatory",
    );
  } finally {
    await f.dispose();
  }
});
// Item naming is shared by list, details and confirmation, with unchanged holding data.
test("relic labels agree across inventory details and sale confirmation", async ({
  browser,
}) => {
  const holdings = saveCases.find(
    /* Select an actual captured holding rather than an empty resting pack. */ (
      row,
    ) => row.id === "full-duplicate-equipment",
  );
  const f = await createLegacyBrowserFixture(browser, {
    storage: holdings.raw,
    randomTape: [],
  });
  try {
    const p = f.page;
    await p.goto("/");
    await expect(p.locator("#title-screen")).toBeVisible();
    await p.locator("#title-action").click();
    await expect(p.locator("#dungeon-main")).toBeVisible();
    const item = await p.evaluate(
      // Inspect the existing holding; do not roll or fabricate an item.
      () => {
        openInventory();
        return JSON.parse(player.inventory.equipment[0]);
      },
    );
    const label = getRelic(item.category).value.displayName;
    await expect(p.locator("#playerInventory")).toContainText(label);
    await p.locator("#playerInventory .items").first().click();
    await expect(p.locator("#equipmentInfo h3")).toContainText(label);
    await p.locator("#sell-equip").click();
    await expect(p.locator("#defaultModal")).toContainText(label);
    await expect(p.locator("#defaultModal")).toContainText(
      `${item.value} Quay Marks`,
    );
    await p.locator("#sell-cancel").click();
    const after = await p.evaluate(
      /* Read the original holding after cancel. */ () =>
        JSON.parse(player.inventory.equipment[0]),
    );
    expect(after).toEqual(item);
  } finally {
    await f.dispose();
  }
});
