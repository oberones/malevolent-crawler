/* global document, player:writable, dungeon:writable, enemy:writable, setVolume, showCombatInfo, createEquipmentPrint, getComputedStyle */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
import { measureSymbols } from "../helpers/measure-symbols.mjs";
const state = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases.find(/* Use the frozen combat tuple. */ (r) => r.id === "normal").state;
// Inserting a baseline probe can reflow a centered reward panel; both coordinates must share the settled layout.
test("baseline probes read settled symbol and baseline coordinates together", async ({
  browser,
}) => {
  const f = await createLegacyBrowserFixture(browser, {
    viewport: { width: 360, height: 800 },
  });
  try {
    await f.page.clock.install({ time: new Date("2026-10-06T12:00:00Z") });
    await f.page.clock.pauseAt(new Date("2026-10-06T12:00:00Z"));
    await f.page.goto("/tests/fixtures/legacy/source/index.html");
    await f.page.addStyleTag({
      content:
        "*,*::before,*::after{transition:none!important;animation:none!important}",
    });
    const fixtureState = await f.page.evaluate(
      /* Reproduce the immutable small-screen dagger reward without candidate code. */ (
        state,
      ) => {
        player = structuredClone(state.player);
        dungeon = structuredClone(state.dungeon);
        enemy = structuredClone(state.enemy);
        setVolume();
        document.querySelector("#title-screen").style.display = "none";
        document.querySelector("#dungeon-main").style.display = "flex";
        const tape = [0, 3.1 / 6, 0, ...Array(22).fill(0)];
        let i = 0;
        Math.random = /* Replay only the captured category recipe. */ () =>
          tape[i++];
        showCombatInfo();
        document.querySelector("#combatPanel").style.display = "flex";
        createEquipmentPrint("combat");
        const rows = [...document.querySelectorAll("body *")].map(
          /* Snapshot before applying inherited scaling. */ (n) => [
            n,
            getComputedStyle(n).fontSize,
          ],
        );
        for (const [n, size] of rows)
          n.style.fontSize = `${parseFloat(size) * 2}px`;
        return {
          category: JSON.parse(player.inventory.equipment.at(-1)).category,
          progress: dungeon.progress,
          enemy: enemy.name,
        };
      },
      state,
    );
    expect(fixtureState).toEqual({
      category: "Dagger",
      progress: state.dungeon.progress,
      enemy: state.enemy.name,
    });
    const [row] = await measureSymbols(f.page, [
      {
        id: "dagger/combat-reward",
        selector: "#combatLogBox h4 i",
        requiredFont: "16px RPGAwesome",
      },
    ]);
    const settled = await f.page.locator("#combatLogBox h4 i").evaluate(
      /* Independently measure both edges with the probe already attached. */ (
        node,
      ) => {
        const p = document.createElement("span");
        p.style.cssText =
          "display:inline-block;width:0;height:0;vertical-align:baseline";
        node.after(p);
        const offset =
          p.getBoundingClientRect().top - node.getBoundingClientRect().top;
        p.remove();
        return offset;
      },
    );
    expect(row.baselineOffset).toBeCloseTo(settled, 1);
  } finally {
    await f.dispose();
  }
});
