/* global document, player, enemy:writable, showCombatInfo, playerLoadStats, enemyLoadStats */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";

const saves = JSON.parse(
  readFileSync(new URL("../fixtures/legacy/saves.json", import.meta.url)),
);
const resting = saves.cases.find(
  /* Select the stable starting character. */ (row) => row.id === "resting",
);
const encounters = JSON.parse(
  readFileSync(new URL("../fixtures/legacy/encounters.json", import.meta.url)),
);

for (const width of [360, 768, 1440]) {
  // Exercise health refreshes and initial rendering at each supported viewport.
  test(`combat health labels remain readable at ${width}px`, async ({
    browser,
  }) => {
    const f = await createLegacyBrowserFixture(browser, {
      storage: resting.raw,
      viewport: { width, height: 900 },
    });
    try {
      await f.page.goto("/");
      await expect(f.page.locator("#title-screen")).toBeVisible();
      const rows = await f.page.evaluate(
        // Render partial and empty health without running combat timers.
        (selected) => {
          document.querySelector("#title-screen").style.display = "none";
          document.querySelector("#combatPanel").style.display = "flex";
          enemy = selected;
          player.inCombat = true;
          const rows = [];
          for (const ratio of [0.9519, 0.956, 0.005, 0, 1]) {
            player.stats.hp = player.stats.hpMax * ratio;
            enemy.stats.hp = enemy.stats.hpMax * ratio;
            showCombatInfo();
            playerLoadStats();
            enemyLoadStats();
            for (const phase of ["refresh", "initial"]) {
              if (phase === "initial") showCombatInfo();
              const fill = document.querySelector("#enemy-hp-battle");
              const label = fill.querySelector(".battle-hp-label") ?? fill;
              const track = fill.parentElement.getBoundingClientRect();
              const range = document.createRange();
              range.selectNodeContents(label);
              const text = range.getBoundingClientRect();
              rows.push({
                ratio,
                phase,
                playerText: document
                  .querySelector("#player-hp-battle")
                  .textContent.trim(),
                statsText: document.querySelector("#player-hp").textContent,
                textWidth: text.width,
                textHeight: text.height,
                trackWidth: track.width,
                trackHeight: track.height,
              });
            }
          }
          return rows;
        },
        encounters.cases[0].expected.enemy,
      );
      for (const row of rows) {
        expect
          .soft(row.playerText)
          .toContain(`(${Math.round(row.ratio * 100)}%)`);
        expect
          .soft(row.statsText)
          .toContain(`(${Math.round(row.ratio * 100)}%)`);
        expect.soft(row.textWidth).toBeLessThanOrEqual(row.trackWidth + 1);
        expect.soft(row.textHeight).toBeLessThanOrEqual(row.trackHeight + 1);
      }
    } finally {
      await f.dispose();
    }
  });
}
