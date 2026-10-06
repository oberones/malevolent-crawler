/* global document, player:writable, dungeon:writable, enemy:writable, setVolume, showCombatInfo, generateRandomEnemy, engageBattle, mimicBattle, guardianBattle, specialBossBattle, endCombat, playerAttack, enemyAttack, combatBacklog */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
import { resolveEncounter } from "../../assets/js/content/catalog.mjs";
// Load immutable legacy values rather than derive expected numbers from candidate code.
function fixture(name) {
  return JSON.parse(
    readFileSync(new URL(`../fixtures/legacy/${name}.json`, import.meta.url)),
  );
}
const corpus = fixture("encounters").cases;
const resting = fixture("saves").cases.find(
  /* Use the captured initial state. */ (r) => r.id === "resting",
);
const portraits = [
  ...new Map(
    corpus
      .filter(
        /* Select only generated portraits. */ (r) =>
          r.operations[0].call === "generateRandomEnemy",
      )
      .map(
        /* Deduplicate variants, not identities. */ (r) => [
          r.expected.enemy.image.name,
          r.expected.enemy,
        ],
      ),
  ).values(),
];

for (const width of [360, 768, 1440]) {
  for (const scale of [1, 2]) {
    // Missing image bytes must not collapse portrait space or hide long identity labels.
    test(`52 selected variants at ${width}px and ${scale * 100}% text`, async ({
      browser,
    }) => {
      const f = await createLegacyBrowserFixture(browser, {
        storage: resting.raw,
        randomTape: [],
        viewport: {
          width,
          height: width === 360 ? 800 : width === 768 ? 1024 : 900,
        },
      });
      try {
        await f.context.route(
          "**/assets/sprites/**",
          /* Hold image decoding outside the layout contract. */ (route) =>
            route.abort(),
        );
        await f.page.goto("/");
        await expect(f.page.locator("#title-screen")).toBeVisible();
        const results = await f.page.evaluate(
          // Render captured selected enemies through the actual combat entry view.
          ({ portraits, scale }) => {
            document.documentElement.style.fontSize = `${scale * 100}%`;
            document.querySelector("#title-screen").style.display = "none";
            document.querySelector("#combatPanel").style.display = "flex";
            return portraits.map(
              // Rendering must neither reroll nor mutate any enemy field.
              (selected) => {
                enemy = selected;
                const before = JSON.stringify(enemy);
                showCombatInfo();
                const image = document.querySelector("#enemy-sprite");
                const box = image.getBoundingClientRect();
                const label = document.querySelector("#enemyPanel > p");
                const panel = document.querySelector("#enemyPanel");
                const style = globalThis.getComputedStyle(panel);
                return {
                  selected,
                  name: label.textContent,
                  width: box.width,
                  height: box.height,
                  panelWidth:
                    panel.clientWidth -
                    parseFloat(style.paddingLeft) -
                    parseFloat(style.paddingRight),
                  labelFits: label.scrollWidth <= label.clientWidth + 1,
                  unchanged: before === JSON.stringify(enemy),
                  draws: globalThis.__legacyRandomCalls.length,
                };
              },
            );
          },
          { portraits, scale },
        );
        expect(results).toHaveLength(52);
        for (const row of results) {
          const { encounter, variant } = resolveEncounter(
            row.selected.name,
            row.selected.image,
          ).value;
          expect
            .soft(row.name)
            .toBe(`${encounter.displayName} Lv.${row.selected.lvl}`);
          expect.soft(row.height, variant.id).toBeGreaterThan(0);
          expect
            .soft(
              Math.abs(
                row.height - (row.width * variant.height) / variant.width,
              ),
              variant.id,
            )
            .toBeLessThanOrEqual(0.5);
          expect
            .soft(
              Math.abs(
                row.width -
                  (row.panelWidth * parseInt(variant.legacyImage.size)) / 100,
              ),
              variant.id,
            )
            .toBeLessThanOrEqual(0.5);
          expect
            .soft(row)
            .toMatchObject({ labelFits: true, unchanged: true, draws: 0 });
        }
      } finally {
        await f.dispose();
      }
    });
  }
}

// Production trigger and attack functions replay fixed oracle tapes without presentation draws.
test("encounter triggers and attacks preserve captured numeric outcomes", async ({
  browser,
}) => {
  const f = await createLegacyBrowserFixture(browser, { storage: resting.raw });
  try {
    await f.page.goto("/");
    await expect(f.page.locator("#title-screen")).toBeVisible();
    await f.page.clock.install({ time: new Date("2026-10-06T12:00:00Z") });
    await f.page.clock.pauseAt(new Date("2026-10-06T12:00:01Z"));
    const results = await f.page.evaluate(
      // Reset inputs per case while using only explicit trusted function dispatch.
      ({ base, cases }) => {
        setVolume();
        const random = Math.random;
        try {
          return cases.map(
            // Each draw is bounded by the immutable oracle's tape.
            (row) => {
              player = structuredClone(row.setup.player ?? base.player);
              dungeon = structuredClone(row.setup.dungeon ?? base.dungeon);
              enemy = structuredClone(row.setup.enemy ?? base.enemy);
              combatBacklog.length = 0;
              const draws = [];
              Math.random =
                /* Reject additional presentation randomness. */ () => {
                  if (draws.length >= row.tape.length)
                    throw new Error(`Tape exhausted: ${row.id}`);
                  const value = row.tape[draws.length];
                  draws.push(value);
                  return value;
                };
              const op = row.operations[0];
              if (op.call === "generateRandomEnemy") {
                const condition = op.args?.[0];
                if (condition === "chest" || condition === "door")
                  mimicBattle(condition);
                else if (condition === "sboss") specialBossBattle();
                else {
                  generateRandomEnemy(...(op.args ?? []));
                  engageBattle();
                }
              } else {
                if (op.call !== "guardianBattle") showCombatInfo();
                ({ guardianBattle, playerAttack, enemyAttack })[op.call]();
              }
              const result = {
                id: row.id,
                enemy: structuredClone(enemy),
                player: structuredClone(player),
                dungeon: structuredClone(dungeon),
                draws,
                title: document.querySelector("#enemyPanel > p").textContent,
              };
              endCombat();
              return result;
            },
          );
        } finally {
          Math.random = random;
        }
      },
      { base: resting.state, cases: corpus },
    );
    for (let i = 0; i < corpus.length; i++) {
      const expected = corpus[i].expected;
      const actual = results[i];
      expect.soft(actual.draws, actual.id).toEqual(corpus[i].tape);
      // Entry refresh formats the derived percentage as text; authoritative HP stays exact.
      const expectedEnemy = structuredClone(expected.enemy);
      actual.enemy.stats.hpPercent = Number(actual.enemy.stats.hpPercent);
      expectedEnemy.stats.hpPercent = Number(expectedEnemy.stats.hpPercent);
      expect.soft(actual.enemy, actual.id).toEqual(expectedEnemy);
      for (const key of ["player", "dungeon"]) {
        if (!expected[key]) continue;
        const value = structuredClone(expected[key]);
        if (key === "dungeon") {
          delete value.backlog;
          delete actual[key].backlog;
        }
        expect.soft(actual[key], `${actual.id}/${key}`).toEqual(value);
      }
      expect
        .soft(actual.title)
        .toContain(
          resolveEncounter(expected.enemy.name, expected.enemy.image).value
            .encounter.displayName,
        );
    }
  } finally {
    await f.dispose();
  }
});
