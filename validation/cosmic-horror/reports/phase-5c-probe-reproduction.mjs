/* global player:writable, dungeon:writable, enemy:writable, combatBacklog, setVolume, playerLoadStats,
   openInventory, showItemInfo, equipmentIcon, createEquipmentPrint, allocationPopup,
   dungeonEvent, goldDrop, hpValidation, showCombatInfo,
   document, getComputedStyle, Howler */
import { test, expect } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
import { measureSymbols, writeBaseline } from "../helpers/measure-symbols.mjs";
const corpus = JSON.parse(
  await readFile(
    new URL("../fixtures/legacy/symbol-contexts.json", import.meta.url),
  ),
);
const saves = JSON.parse(
  await readFile(new URL("../fixtures/legacy/saves.json", import.meta.url)),
).cases;
const resting = saves.find(
  // Select a captured state rather than reconstructing application defaults.
  (row) => row.id === "resting",
);
const normal = saves.find(
  // Reward panels require a real baseline encounter with valid stat fields.
  (row) => row.id === "normal",
);
const categories = [
  ...new Set(
    corpus.contexts
      .filter(
        // Equipment roles carry a category; pictograms do not.
        (row) => row.category,
      )
      .map(
        // Preserve the inventory's declared category ordering.
        (row) => row.category,
      ),
  ),
];
for (const viewport of [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  for (const scale of [1, 2]) {
    // Every engine records real layout at each declared viewport/text-size combination.
    test(`original symbol contexts ${viewport.width} text ${scale}`, async ({
      browser,
    }, info) => {
      test.setTimeout(180_000);
      const fixture = await createLegacyBrowserFixture(browser, {
        storage: resting.raw,
        viewport,
      });
      const { page } = fixture;
      const captureRoot = process.env.CAPTURE_BASELINE_DIR;
      const name = `${info.project.name}-${viewport.width}-${scale}`;
      const directory = captureRoot ? join(captureRoot, name) : null;
      const measurements = [];
      let soundCount;
      try {
        if (directory) await mkdir(directory, { recursive: false });
        await page.clock.install({ time: new Date("2026-10-06T12:00:00Z") });
        await page.clock.pauseAt(new Date("2026-10-06T12:00:00Z"));
        await page.goto(
          "http://127.0.0.1:4173/tests/fixtures/legacy/source/index.html",
        );
        // Static geometry must not sample intermediate font-size transitions during reset/scaling.
        await page.addStyleTag({
          content:
            "*, *::before, *::after { transition: none !important; animation: none !important; }",
        });
        await page.evaluate(
          // One muted audio set serves this context; closing the fixture disposes it.
          () => {
            Howler.mute(true);
            setVolume();
          },
        );
        for (const context of corpus.contexts.filter(/* Restrict this diagnostic to the two anomalous original glyphs. */ row => ["dagger/combat-reward", "flail/combat-reward"].includes(row.id))) {
          await page.evaluate(
            // Exercise trusted original renderers with explicit synthetic state and finite draws.
            ({ context, state, enemyState, categories, scale }) => {
              // Restore computed-font overrides from the preceding scenario before rendering again.
              for (const node of document.querySelectorAll(
                "[data-baseline-font]",
              )) {
                node.style.fontSize = node.dataset.baselineFont;
                delete node.dataset.baselineFont;
              }
              player = structuredClone(state.player);
              dungeon = structuredClone(state.dungeon);
              enemy = structuredClone(enemyState);
              // Restore the original undimmed resting containers before opening this scenario's panels.
              for (const id of [
                "dungeon-main",
                "inventory",
                "equipmentInfo",
                "combatPanel",
              ])
                document.getElementById(id).style.filter = "brightness(100%)";
              for (const id of [
                "title-screen",
                "dungeon-main",
                "inventory",
                "equipmentInfo",
                "defaultModal",
                "combatPanel",
                "lvlupPanel",
              ])
                document.getElementById(id).style.display = "none";
              document.getElementById("dungeon-main").style.display = "flex";
              document.getElementById("dungeonLog").innerHTML = "";
              combatBacklog.length = 0;
              playerLoadStats();
              const stage = context.stage;
              const i = categories.indexOf(context.category);
              const tape =
                i < 6
                  ? [0, (i + 0.1) / 6, 0]
                  : [
                      0.9,
                      (Math.floor((i - 6) / 3) + 0.1) / 3,
                      (((i - 6) % 3) + 0.1) / (i >= 12 ? 2 : 3),
                      0,
                    ];
              tape.push(...Array(22).fill(0));
              let cursor = 0;
              // A finite deterministic recipe controls original item generation, never application math.
              Math.random = () => {
                if (cursor >= tape.length)
                  throw new Error("capture tape exhausted");
                return tape[cursor++];
              };
              if (context.category || stage === "sale-control") {
                const category = context.category ?? "Sword";
                const item = {
                  category,
                  attribute: "Damage",
                  type: "Weapon",
                  rarity: "Common",
                  lvl: 1,
                  tier: 1,
                  value: 123,
                  stats: [{ atk: 10 }],
                };
                player.inventory.equipment = [JSON.stringify(item)];
                player.equipped = [structuredClone(item)];
                playerLoadStats();
                if (
                  [
                    "inventory",
                    "equipped",
                    "detail",
                    "sale",
                    "sale-control",
                  ].includes(stage)
                )
                  openInventory();
                if (["detail", "sale", "sale-control"].includes(stage))
                  showItemInfo(item, equipmentIcon(category), "Equip", 0);
                if (stage === "sale")
                  document.getElementById("sell-equip").click();
                if (stage === "dungeon-reward") createEquipmentPrint("dungeon");
                if (stage === "combat-reward") {
                  showCombatInfo();
                  document.getElementById("combatPanel").style.display = "flex";
                  createEquipmentPrint("combat");
                }
              }
              if (stage === "title") {
                document.getElementById("dungeon-main").style.display = "none";
                document.getElementById("title-screen").style.display = "flex";
              }
              if (stage === "allocation") allocationPopup();
              if (
                ["treasure", "chamber", "blessing", "curse"].includes(stage)
              ) {
                tape.length = 0;
                tape.push(
                  ...{
                    treasure: [0.2],
                    chamber: [0.999, 0.4],
                    blessing: [0, 0],
                    curse: [0.1, 0],
                  }[stage],
                );
                cursor = 0;
                dungeon.status = {
                  exploring: true,
                  paused: false,
                  event: false,
                };
                if (stage === "chamber") dungeon.action = 5;
                dungeonEvent();
                if (stage === "chamber")
                  document.getElementById("choice1").click();
              }
              if (stage === "gold") goldDrop();
              if (stage === "victory") {
                showCombatInfo();
                document.getElementById("combatPanel").style.display = "flex";
                enemy.stats.hp = 0;
                enemy.rewards = { exp: 1, gold: 123, drop: false };
                globalThis.combatTimer = 0;
                hpValidation();
              }
              if (scale === 2) {
                // Snapshot sizes before applying them to avoid compounding inherited text scaling.
                const sizes = [...document.querySelectorAll("body *")].map(
                  // Pair each element with its original computed size and inline value.
                  (node) => [
                    node,
                    getComputedStyle(node).fontSize,
                    node.style.fontSize,
                  ],
                );
                for (const [node, size, original] of sizes) {
                  node.dataset.baselineFont = original;
                  node.style.fontSize = `${parseFloat(size) * 2}px`;
                }
              }
            },
            {
              context,
              state: resting.state,
              enemyState: normal.state.enemy,
              categories,
              scale,
            },
          );
          // Repeated rendering must reuse the same test-owned sound instances.
          const currentSoundCount = await page.evaluate(
            () => Howler._howls.length,
          );
          soundCount ??= currentSoundCount;
          expect(currentSoundCount).toBe(soundCount);
          // WebKit reports unscaled computed values for the hidden dungeon on the title screen.
          if (context.stage !== "title") {
            // The original menu icon is 1.3rem; scaling must not compound across scenarios.
            expect(
              await page.locator("#dungeon-main .fa-bars").evaluate(
                // Read the rendered size so an in-progress CSS transition cannot hide drift.
                (node) => parseFloat(getComputedStyle(node).fontSize),
              ),
            ).toBeCloseTo(20.8 * scale, 1);
            // Its parent button uses 1rem and must also return to its original size.
            expect(
              await page.locator("#dungeon-main .fa-bars").evaluate(
                // Transitioned parent sizes must not become the next scenario's baseline.
                (node) =>
                  parseFloat(getComputedStyle(node.parentElement).fontSize),
              ),
            ).toBeCloseTo(16 * scale, 1);
          }
          if (context.stage === "dungeon-reward") {
            // A previous inventory modal must not leave exploration dimmed after the fixture reset.
            expect(
              await page.locator("#dungeon-main").evaluate(
                // Inspect the same container filter that the original close action restores.
                (node) => getComputedStyle(node).filter,
              ),
            ).toBe("brightness(1)");
          }
          const [row] = await measureSymbols(page, [context]);
          const diagnostic = await page.locator(context.selector).evaluate(/* Compare coordinates before and after probe insertion on immutable source. */ node => {
            const before = node.getBoundingClientRect();
            const probe=document.createElement("span");probe.style.cssText="display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline";node.after(probe);
            const after=node.getBoundingClientRect();const top=probe.getBoundingClientRect().top;probe.remove();return {beforeY:before.y,afterY:after.y,probeY:top,staleOffset:top-before.y,settledOffset:top-after.y};
          });
          console.log(JSON.stringify({id:context.id,recorded:row.baselineOffset,diagnostic}));
          expect(row.baselineOffset).toBeCloseTo(diagnostic.settledOffset, 1);
          expect(row.box.width).toBeGreaterThan(0);
          expect(row.fontStatus).toBe("loaded");
          row.role = context.role;
          row.stage = context.stage;
          row.textScale = scale;
          row.browser = { name: info.project.name, version: browser.version() };
          row.status = "PASS";
          if (directory) {
            const filename = `${context.id.replaceAll("/", "-")}.png`;
            await writeFile(
              join(directory, filename),
              await page.screenshot({ fullPage: true, animations: "disabled" }),
              { flag: "wx" },
            );
            row.screenshot = `${name}/${filename}`;
          }
          measurements.push(row);
        }
        expect(
          new Set(
            measurements.map(
              // Each declared role must have at least one actual measured rendering context.
              (row) => row.role,
            ),
          ).size,
        ).toBe(2);
        if (directory)
          await writeBaseline(join(directory, "measurements.json"), {
            fontPolicy: corpus.fontPolicy,
            measurements,
          });
      } finally {
        await fixture.dispose();
      }
    });
  }
}
