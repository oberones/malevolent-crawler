/* global document, player:writable, dungeon:writable, enemy:writable, setVolume, dungeonEvent, chestEvent, statBlessing, nothingEvent, hpValidation, showCombatInfo, openInventory, lvlupPopup */
import { test, expect } from "@playwright/test";
import { getEncounter } from "../../assets/js/content/catalog.mjs";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
// Read immutable oracle inputs; candidate output never supplies the expected rules.
function fixture(name) {
  return JSON.parse(
    readFileSync(new URL(`../fixtures/legacy/${name}.json`, import.meta.url)),
  );
}
const saves = fixture("saves").cases;
const resting = saves.find(
  /* Fix the initial engine tuple independently of the candidate. */ (r) =>
    r.id === "resting",
);
const progression = fixture("progression").cases;
const ids = [
  "event/0/0/null",
  "event/0/0/#choice1",
  "event/0/0/#choice2",
  "event/1/0/null",
  "event/1/0/#choice1",
  "event/1/0/#choice2",
  "event/2/0/null",
  "event/2/0/#choice2",
  "event/3/0/null",
  "event/3/0/#choice1",
  "event/3/0/#choice2",
  "event/3/0.999/#choice2",
  "event/9/0/null",
  "event/9/0/#choice1",
  "event/9/0/#choice2",
  "door/2/1/0/#choice1",
  "door/2/1/0.4/#choice1",
  "door/2/1/0.9/#choice1",
  "door/2/1/0/#choice2",
  "door/2/5/0/#choice1",
  "chest/1/0",
  "chest/1/0.25",
  "chest/1/0.5",
  "chest/1/0.75",
  "chest/2/0.25",
  "offering/0/0",
  "offering/1/0",
  ...Array.from(
    { length: 5 },
    /* Cover each uneventful branch. */ (_, i) => `nothing/${i}`,
  ),
  ...Array.from(
    { length: 7 },
    /* Cover each existing offering magnitude. */ (_, i) => `blessing/${i}`,
  ),
];
// Compare every authoritative field, excluding only presentation history and derived percentages.
function protectedState(state) {
  const copy = structuredClone(state);
  delete copy.dungeon.backlog;
  delete copy.player.stats.hpPercent;
  delete copy.player.exp.expPercent;
  delete copy.enemy.stats.hpPercent;
  return copy;
}
for (const id of ids) {
  // Real event controls must retain fixture outcomes while replacing the old narrative.
  test(`setting journey ${id}`, async ({ browser }) => {
    const row = progression.find(
      /* Select a fixed named oracle row. */ (r) => r.id === id,
    );
    expect(row, `Missing oracle ${id}`).toBeTruthy();
    const f = await createLegacyBrowserFixture(browser, {
      storage: resting.raw,
      randomTape: row.tape,
    });
    try {
      const page = f.page;
      await page.goto("http://127.0.0.1:4173/");
      await expect(page.locator("#title-screen")).toBeVisible();
      await page.clock.install({ time: new Date("2026-10-06T12:00:00Z") });
      await page.clock.pauseAt(new Date("2026-10-06T12:00:01Z"));
      await page.evaluate(
        /* Supply only captured inputs; presentation still uses actual engine functions. */ ({
          base,
          setup,
        }) => {
          player = base.player;
          dungeon = base.dungeon;
          enemy = base.enemy;
          if (setup.player) player = setup.player;
          if (setup.dungeon) dungeon = setup.dungeon;
          if (setup.enemy) enemy = setup.enemy;
          setVolume();
          document.querySelector("#title-screen").style.display = "none";
          document.querySelector("#dungeon-main").style.display = "flex";
        },
        { base: resting.state, setup: row.setup },
      );
      let observed = "";
      for (const op of row.operations) {
        if (op.call)
          await page.evaluate(
            /* Explicit trusted dispatch excludes eval and arbitrary saved code. */ (
              name,
            ) => {
              const actions = {
                dungeonEvent,
                chestEvent,
                statBlessing,
                nothingEvent,
              };
              actions[name]();
            },
            op.call,
          );
        if (op.click) await page.locator(op.click).click();
        observed += await page.locator("#dungeonLog").textContent();
        observed += await page.locator("#combatPanel").textContent();
      }
      const result = await page.evaluate(
        /* Read actual state and consumed random tape after the controls. */ () => ({
          state: { player, dungeon, enemy },
          draws: globalThis.__legacyRandomCalls,
        }),
      );
      expect(protectedState(result.state)).toEqual(
        protectedState(row.expected),
      );
      expect(result.draws).toEqual(row.tape);
      if (row.expected.enemy.name) {
        const identity = getEncounter(row.expected.enemy.name);
        expect(identity.ok).toBe(true);
        expect.soft(observed).toContain(identity.value.displayName);
        expect.soft(observed).not.toContain(row.expected.enemy.name);
      }
      // The positive vocabulary assertion catches untouched copy even if no old proper noun occurs.
      expect(observed).toMatch(
        /Quay Marks|Tide Offering|Black Sounding|[Ss]ounding|[Oo]bservatory|[Cc]offer|[Tt]ide|[Qq]uay|Threshold Keeper|Deep Presence|Recovered Relic/,
      );
      expect(observed).not.toMatch(
        /Statue of Blessing|Cursed Totem|Floor Guardian|Dungeon Monarch|next floor|next room/,
      );
    } finally {
      await f.dispose();
    }
  });
}
// Fresh creation preserves name and allocation values while exposing the setting before play.
test("setting entry and allocation", async ({ browser }) => {
  const f = await createLegacyBrowserFixture(browser, { randomTape: [] });
  try {
    const p = f.page;
    await p.goto("http://127.0.0.1:4173/");
    await expect(p.locator("#character-creation")).toBeVisible();
    expect.soft(await p.title()).toBe("The Bell Beneath Brine");
    await p.locator("#name-input").fill("Mariner");
    await p.locator("#name-submit button").click();
    await expect(p.locator("#title-screen")).toBeVisible();
    await p.locator("#title-screen").click();
    await expect(p.locator("#allocate-confirm")).toBeVisible();
    await p.locator("#hpAdd").click();
    const result = await p.evaluate(
      /* Inspect the unchanged input name and initial allocation display. */ () => ({
        name: player.name,
        points: document.querySelector("#alloPts").textContent,
        hp: document.querySelector("#hpAllo").textContent,
      }),
    );
    expect(result).toEqual({
      name: "Mariner",
      points: "Stat Points: 19",
      hp: "6",
    });
    expect(await p.locator("#defaultModal").textContent()).toContain(
      "Sounding",
    );
  } finally {
    await f.dispose();
  }
});
for (const outcome of ["victory", "death"]) {
  // Resolve terminal combat and claim/return through real DOM, guarding against duplicate rewards.
  test(`setting ${outcome} and return`, async ({ browser }) => {
    const row = progression.find(
      /* Select terminal oracle without inventing reward/reset expectations. */ (
        r,
      ) => r.id === `terminal/${outcome}`,
    );
    const normal = saves.find(
      /* Boot from a valid active tuple before applying the terminal trigger. */ (
        r,
      ) => r.id === "normal",
    );
    const f = await createLegacyBrowserFixture(browser, {
      storage: normal.raw,
      randomTape: [],
    });
    try {
      const p = f.page;
      await p.goto("http://127.0.0.1:4173/");
      await expect(p.locator("#title-screen")).toBeVisible();
      await p.clock.install({ time: new Date("2026-10-06T12:00:00Z") });
      await p.clock.pauseAt(new Date("2026-10-06T12:00:01Z"));
      const text = await p.evaluate(
        /* Trigger the terminal HP boundary in an actual combat panel. */ ({
          setup,
          baseDungeon,
        }) => {
          dungeon = baseDungeon;
          player = setup.player;
          enemy = setup.enemy;
          setVolume();
          showCombatInfo();
          document.querySelector("#combatPanel").style.display = "flex";
          hpValidation();
          return document.querySelector("#combatPanel").textContent;
        },
        { setup: row.setup, baseDungeon: resting.state.dungeon },
      );
      await p.locator("#battleButton").press("Enter");
      const state = await p.evaluate(
        /* Capture the post-Claim/reset outcome. */ () => ({
          player,
          dungeon,
          enemy,
        }),
      );
      expect(protectedState(state)).toEqual(protectedState(row.expected));
      expect(text).toMatch(
        outcome === "victory" ? /Quay Marks/ : /quay|sounding/i,
      );
    } finally {
      await f.dispose();
    }
  });
}
// Both rerolls consume their original budget before one upgrade applies.
test("setting level-up and two rerolls", async ({ browser }) => {
  const normal = saves.find(
    /* Reuse the frozen active fixture. */ (r) => r.id === "normal",
  );
  const tape = [0.01, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 0.01, 0.2];
  const f = await createLegacyBrowserFixture(browser, {
    storage: normal.raw,
    randomTape: tape,
  });
  try {
    const p = f.page;
    await p.goto("http://127.0.0.1:4173/");
    await expect(p.locator("#title-screen")).toBeVisible();
    await p.evaluate(
      /* Show exactly one earned upgrade without replaying encounter rewards. */ () => {
        setVolume();
        showCombatInfo();
        player.exp.lvlGained = 1;
        player.stats.hp = 350;
        lvlupPopup();
      },
    );
    await p.locator("#lvlReroll").click();
    await p.locator("#lvlReroll").click();
    await expect(p.locator("#lvlReroll")).toHaveText("Reroll 0/2");
    const text = await p.locator("#lvlupSelect").textContent();
    await p.locator("#lvlSlot0").click();
    const state = await p.evaluate(
      /* Verify the selected critical-damage increment and consumed tape. */ () => ({
        bonus: player.bonusStats.critDmg,
        hp: player.stats.hp,
        remaining: player.exp.lvlGained,
        draws: globalThis.__legacyRandomCalls,
      }),
    );
    expect(state).toEqual({ bonus: 6, hp: 450, remaining: 0, draws: tape });
    expect(text).toContain("Attunement");
  } finally {
    await f.dispose();
  }
});
// Existing inventory/menu organization must expose accurate help, credits and reset consequences.
test("setting inventory menu help credits and abandonment", async ({
  browser,
}) => {
  const f = await createLegacyBrowserFixture(browser, {
    storage: resting.raw,
    randomTape: [],
  });
  try {
    const p = f.page;
    await p.goto("http://127.0.0.1:4173/");
    await expect(p.locator("#title-screen")).toBeVisible();
    await p.locator("#title-screen").click();
    await expect(p.locator("#dungeon-main")).toBeVisible();
    await p.clock.install({ time: new Date("2026-10-06T12:00:00Z") });
    await p.clock.pauseAt(new Date("2026-10-06T12:00:01Z"));
    await p.evaluate(
      /* Open the existing inventory through its application entry point. */ () =>
        openInventory(),
    );
    expect
      .soft(await p.locator("#inventory").textContent())
      .toContain("Recovered Relic");
    await p.locator("#menu-btn").click();
    expect.soft(await p.locator("#menuModal").textContent()).toContain("Help");
    expect
      .soft(await p.locator("#menuModal").textContent())
      .toContain("Credits");
    await p.locator("#quit-run").click();
    expect
      .soft(await p.locator("#defaultModal").textContent())
      .toContain("Quay Marks");
    await p.locator("#defaultModal #quit-run").click();
    const state = await p.evaluate(
      /* Reset keeps lifetime holdings and returns progression to its original start. */ () => ({
        gold: player.gold,
        inventory: player.inventory,
        lvl: player.lvl,
        floor: dungeon.progress.floor,
        room: dungeon.progress.room,
      }),
    );
    expect(state).toEqual({
      gold: resting.state.player.gold,
      inventory: resting.state.player.inventory,
      lvl: 1,
      floor: 1,
      room: 1,
    });
  } finally {
    await f.dispose();
  }
});
for (const section of ["Help", "Credits"]) {
  // Informational controls must open actual text and leave player progress untouched.
  test(`setting ${section} opens without changing progress`, async ({
    browser,
  }) => {
    const f = await createLegacyBrowserFixture(browser, {
      storage: resting.raw,
      randomTape: [],
    });
    try {
      const p = f.page;
      await p.goto("http://127.0.0.1:4173/");
      await expect(p.locator("#title-screen")).toBeVisible();
      await p.locator("#title-screen").click();
      await expect(p.locator("#dungeon-main")).toBeVisible();
      await p.clock.install({ time: new Date("2026-10-06T12:00:00Z") });
      await p.clock.pauseAt(new Date("2026-10-06T12:00:01Z"));
      await p.evaluate(
        /* Use the existing inventory entry point. */ () => openInventory(),
      );
      await p.locator("#menu-btn").click();
      const before = await p.evaluate(
        /* Snapshot progress before an informational action. */ () => ({
          player,
          dungeon,
          enemy,
        }),
      );
      const control = p.getByRole("button", { name: section, exact: true });
      expect(await control.count(), `Missing ${section} control`).toBe(1);
      await control.click();
      await expect(p.locator("#defaultModal")).toContainText(
        section === "Help" ? "Drowned Observatory" : "Leohpaz",
      );
      const after = await p.evaluate(
        /* Information views must not grant, spend or reset anything. */ () => ({
          player,
          dungeon,
          enemy,
        }),
      );
      expect(after).toEqual(before);
    } finally {
      await f.dispose();
    }
  });
}
