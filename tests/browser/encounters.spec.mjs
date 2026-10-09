/* global document, player:writable, dungeon:writable, enemy:writable, enemyDead:writable, playerDead:writable, updateCombatLog, playerLoadStats, setVolume, showCombatInfo, generateRandomEnemy, engageBattle, mimicBattle, guardianBattle, specialBossBattle, endCombat, playerAttack, enemyAttack, combatBacklog */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { platform, release, arch } from "node:os";
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

// Rounded health labels must remain readable while fractional HP fill widths stay precise.
test("enlarged player HP stays readable above EXP at full, half and near-zero health", async ({
  browser,
}) => {
  const f = await createLegacyBrowserFixture(browser, {
    storage: resting.raw,
    randomTape: [],
    viewport: { width: 360, height: 800 },
  });
  try {
    await f.page.goto("/");
    await expect(f.page.locator("#title-screen")).toBeVisible();
    const rows = await f.page.evaluate(
      // Measure actual text glyph bounds, not the fixed-height fill that previously concealed wrapping.
      (selected) => {
        document.documentElement.style.fontSize = "200%";
        document.querySelector("#title-screen").style.display = "none";
        document.querySelector("#combatPanel").style.display = "flex";
        enemy = selected;
        showCombatInfo();
        player.inCombat = true;
        return [500, 250, 1].map(
          // Preserve ordinary HP updates while testing the text/fill boundary independently.
          (hp) => {
            player.stats.hp = hp;
            playerLoadStats();
            const fill = document.querySelector("#player-hp-battle");
            const range = document.createRange();
            range.selectNodeContents(fill);
            const text = range.getBoundingClientRect();
            const track = fill.parentElement.getBoundingClientRect();
            const exp = document
              .querySelector("#player-exp-bar")
              .getBoundingClientRect();
            return {
              hp,
              text: fill.textContent.trim(),
              fillWidth: fill.style.width,
              fits:
                text.left >= track.left - 0.5 &&
                text.right <= track.right + 0.5,
              aboveExp: text.bottom <= exp.top - 0.5,
              linesFit: text.bottom <= track.bottom + 0.5,
              draws: globalThis.__legacyRandomCalls.length,
            };
          },
        );
      },
      portraits[0],
    );
    for (const row of rows)
      expect(row).toEqual({
        hp: row.hp,
        text: `${row.hp}/500(${Math.round(row.hp / 5)}%)`,
        fillWidth: `${row.hp / 5}%`,
        fits: true,
        aboveExp: true,
        linesFit: true,
        draws: 0,
      });
  } finally {
    await f.dispose();
  }
});

for (const width of [360, 768, 1440]) {
  for (const scale of [1, 2]) {
    // Qualify real decoded replacements separately from the existing missing-byte geometry tests.
    test(`52 decoded portraits at ${width}px and ${scale * 100}% text`, async ({
      browser,
      browserName,
    }) => {
      test.setTimeout(120_000);
      const viewport = {
        width,
        height: width === 360 ? 800 : width === 768 ? 1024 : 900,
      };
      const f = await createLegacyBrowserFixture(browser, {
        storage: resting.raw,
        randomTape: [],
        viewport,
      });
      const captureRoot = process.env.CAPTURE_ENCOUNTERS_DIR;
      const directory =
        captureRoot && join(captureRoot, `${browserName}-${width}-${scale}`);
      const rows = [];
      try {
        // Refuse to replace a prior evidence tuple, including a partly completed capture.
        if (directory) await mkdir(directory, { recursive: false });
        await f.page.goto("/");
        await expect(f.page.locator("#title-screen")).toBeVisible();
        await f.page.evaluate(
          // Keep capture fixtures deterministic without starting attack/reward timers.
          (scale) => {
            document.documentElement.style.fontSize = `${scale * 100}%`;
            document.querySelector("#title-screen").style.display = "none";
            document.querySelector("#combatPanel").style.display = "flex";
          },
          scale,
        );
        for (const selected of portraits) {
          const { encounter, variant } = resolveEncounter(
            selected.name,
            selected.image,
          ).value;
          const result = await f.page.evaluate(
            // Decode the actual selected sprite before measuring its reserved combat layout.
            async (selected) => {
              enemy = selected;
              const before = JSON.stringify(enemy);
              showCombatInfo();
              // Match startCombat's state-before-refresh order without scheduling attacks.
              player.inCombat = true;
              playerLoadStats();
              enemyDead = true;
              playerDead = false;
              combatBacklog.length = 0;
              if (enemyDead && !playerDead) updateCombatLog();
              const image = document.querySelector("#enemy-sprite");
              await image.decode();
              await document.fonts.ready;
              const box = image.getBoundingClientRect();
              const label = document.querySelector("#enemyPanel > p");
              const panel = document.querySelector("#enemyPanel");
              const style = globalThis.getComputedStyle(panel);
              return {
                box: {
                  x: box.x,
                  y: box.y,
                  width: box.width,
                  height: box.height,
                },
                naturalWidth: image.naturalWidth,
                naturalHeight: image.naturalHeight,
                src: image.getAttribute("src"),
                alt: image.alt,
                name: label.textContent,
                playerName: document.querySelector("#player-combat-info")
                  .textContent,
                playerHp: document
                  .querySelector("#player-hp-battle")
                  .textContent.trim(),
                panelWidth:
                  panel.clientWidth -
                  parseFloat(style.paddingLeft) -
                  parseFloat(style.paddingRight),
                labelFits: label.scrollWidth <= label.clientWidth + 1,
                portraitBelowHp:
                  box.top >=
                  document
                    .querySelector("#enemyPanel .battle-bar")
                    .getBoundingClientRect().bottom,
                portraitAbovePlayer:
                  box.bottom <=
                  document.querySelector("#playerPanel").getBoundingClientRect()
                    .top +
                    0.5,
                horizontalOverflow:
                  document.documentElement.scrollWidth > globalThis.innerWidth,
                unchanged: before === JSON.stringify(enemy),
                draws: globalThis.__legacyRandomCalls.length,
              };
            },
            selected,
          );
          expect(result, variant.id).toMatchObject({
            naturalWidth: variant.width,
            naturalHeight: variant.height,
            src: `/${variant.path}`,
            alt: variant.alt,
            name: `${encounter.displayName} Lv.${selected.lvl}`,
            playerName: `${resting.state.player.name} Lv.${resting.state.player.lvl} (0%)`,
            playerHp: "500/500(100%)",
            labelFits: true,
            portraitBelowHp: true,
            portraitAbovePlayer: true,
            horizontalOverflow: false,
            unchanged: true,
            draws: 0,
          });
          expect(
            Math.abs(
              result.box.height -
                (result.box.width * variant.height) / variant.width,
            ),
            variant.id,
          ).toBeLessThanOrEqual(0.5);
          expect(
            Math.abs(
              result.box.width -
                (result.panelWidth * parseInt(variant.legacyImage.size)) / 100,
            ),
            variant.id,
          ).toBeLessThanOrEqual(0.5);
          const claim = f.page.getByRole("button", {
            name: "Claim",
            exact: true,
          });
          await claim.click({ trial: true });
          await claim.focus();
          await expect(claim).toBeFocused();
          const row = {
            variantId: variant.id,
            assetId: variant.assetId,
            encounterId: encounter.id,
            fixture: selected.image.name,
            selector: "#enemy-sprite",
            browser: browserName,
            browserVersion: browser.version(),
            os: `${platform()} ${release()} ${arch()}`,
            viewport,
            textScale: scale,
            dpr: 1,
            ...result,
            claimReceivesPointer: true,
            claimReceivesFocus: true,
          };
          if (directory) {
            const screenshot = join(directory, `${selected.image.name}.png`);
            const bytes = await f.page.screenshot({
              fullPage: true,
              animations: "disabled",
            });
            await writeFile(screenshot, bytes, { flag: "wx" });
            const portraitScreenshot = join(
              directory,
              `${selected.image.name}-portrait.png`,
            );
            await writeFile(
              portraitScreenshot,
              await f.page
                .locator("#enemyPanel")
                .screenshot({ animations: "disabled" }),
              { flag: "wx" },
            );
            Object.assign(row, {
              screenshot,
              sha256: createHash("sha256").update(bytes).digest("hex"),
              portraitScreenshot,
            });
          }
          rows.push(row);
        }
        expect(
          new Set(
            rows.map(
              /* Count selected identities independently of variants. */ (r) =>
                r.encounterId,
            ),
          ).size,
        ).toBe(51);
        if (directory)
          await writeFile(
            join(directory, "measurements.json"),
            JSON.stringify(rows, null, 2) + "\n",
            { flag: "wx" },
          );
      } finally {
        await f.dispose();
      }
    });
  }
}

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
