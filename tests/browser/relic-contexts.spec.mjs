/* global Howler, enemy:writable, showCombatInfo, document, player, dungeon, gameServices, setVolume, playerLoadStats, openInventory, getComputedStyle */
import { test, expect } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
import { relics } from "../../assets/js/content/relics.mjs";
const corrections = JSON.parse(
  await readFile("art/cosmic-horror/review/relic-baseline-corrections.json"),
).corrections;
const baseline = JSON.parse(await readFile("art/cosmic-horror/baseline.json"));
const resting = JSON.parse(
  await readFile("tests/fixtures/legacy/saves.json"),
).cases.find(/* Seed a validated resting save. */ (r) => r.id === "resting");
const normal = JSON.parse(
  await readFile("tests/fixtures/legacy/saves.json"),
).cases.find(
  /* Supply real encounter fields to the existing combat panel. */ (r) =>
    r.id === "normal",
);
for (const width of [360, 768, 1440])
  for (const scale of [1, 2]) {
    // Exercise every actual role/context at its measured size; optional captures are exclusive evidence writes.
    test(`live relic contexts ${width}/${scale}`, async ({
      browser,
      browserName,
    }) => {
      test.setTimeout(180000);
      const f = await createLegacyBrowserFixture(browser, {
        storage: resting.raw,
        viewport: {
          width,
          height: width === 360 ? 800 : width === 768 ? 1024 : 900,
        },
      });
      const records = [];
      const directory = process.env.RELIC_CAPTURE_DIR
        ? `${process.env.RELIC_CAPTURE_DIR}/${browserName}-${width}-${scale}`
        : null;
      try {
        if (directory) await mkdir(directory, { recursive: false });
        await f.page.goto("/");
        await expect(f.page.locator("#title-screen")).toBeVisible();
        await f.page.clock.install({ time: new Date("2026-10-07T12:00:00Z") });
        await f.page.clock.pauseAt(new Date("2026-10-07T12:00:01Z"));
        await f.page.addStyleTag({
          content:
            "*,*::before,*::after{transition:none!important;animation:none!important}",
        });
        await f.page.evaluate(
          /* Reuse one muted audio set and await the retained local metric font. */ () => {
            Howler.mute(true);
            setVolume();
            return document.fonts.load("16px RPGAwesome");
          },
        );
        for (const relic of relics)
          for (const stage of [
            "inventory",
            "equipped",
            "detail",
            "sale",
            "dungeon-reward",
            "combat-reward",
          ]) {
            const id = `${relic.symbolId.slice(6)}/${stage}`;
            await f.page.evaluate(
              /* Render real live surfaces from a valid already-owned item, never generate or award again. */ ({
                relic,
                stage,
                scale,
                enemyState,
              }) => {
                for (const n of document.querySelectorAll("[data-test-size]")) {
                  n.style.fontSize = n.dataset.testSize;
                  delete n.dataset.testSize;
                }
                for (const id of [
                  "dungeon-main",
                  "inventory",
                  "equipmentInfo",
                  "combatPanel",
                ])
                  document.getElementById(id).style.filter = "brightness(100%)";
                for (const id of [
                  "title-screen",
                  "inventory",
                  "equipmentInfo",
                  "defaultModal",
                  "combatPanel",
                ])
                  document.getElementById(id).style.display = "none";
                document.querySelector("#dungeon-main").style.display = "flex";
                dungeon.status.paused = true;
                const item = {
                  category: relic.legacyCategory,
                  type: relic.type,
                  attribute: relic.attribute,
                  rarity: "Heirloom",
                  lvl: 100,
                  tier: 10,
                  value: 12345,
                  stats: [{ hp: 123 }, { critRate: 8 }],
                };
                player.inventory.equipment = [JSON.stringify(item)];
                player.equipped = [structuredClone(item)];
                playerLoadStats();
                if (["inventory", "equipped", "detail", "sale"].includes(stage))
                  openInventory();
                if (["detail", "sale"].includes(stage))
                  document.querySelector("#playerInventory button").click();
                if (stage === "sale")
                  document.querySelector("#sell-equip").click();
                if (stage.endsWith("reward")) {
                  if (stage === "combat-reward") {
                    enemy = structuredClone(enemyState);
                    if (enemy.name !== enemyState.name)
                      throw new Error("Fixture encounter mismatch");
                    showCombatInfo();
                  }
                  const target = document.querySelector(
                    stage === "combat-reward" ? "#combatLogBox" : "#dungeonLog",
                  );
                  if (stage === "combat-reward")
                    document.querySelector("#combatPanel").style.display =
                      "flex";
                  target.replaceChildren();
                  const line = document.createElement("div");
                  target.append(line);
                  gameServices.narrative.renderLog(
                    line,
                    gameServices.narrative.record("inventory.reward", { item }),
                  );
                }
                if (scale === 2) {
                  const rows = [...document.querySelectorAll("body *")].map(
                    /* Capture computed fonts before updating inheritance. */ (
                      n,
                    ) => [n, getComputedStyle(n).fontSize, n.style.fontSize],
                  );
                  for (const [n, size, original] of rows) {
                    n.dataset.testSize = original;
                    n.style.fontSize = `${parseFloat(size) * 2}px`;
                  }
                }
              },
              { relic, stage, scale, enemyState: normal.state.enemy },
            );
            const selector = `.inline-symbol[data-context="${id}"]`;
            const symbol = f.page.locator(selector);
            await symbol
              .locator("img")
              .evaluate(
                /* Decode the correct shipped art before visual capture. */ (
                  image,
                ) => image.decode(),
              );
            const measured = await symbol.evaluate(
              /* Read the same line after adding a zero-size baseline probe to avoid stale pre-probe coordinates. */ (
                node,
              ) => {
                const probe = document.createElement("span");
                probe.style.cssText =
                  "display:inline-block;width:0;height:0;padding:0;margin:0;vertical-align:baseline";
                node.after(probe);
                try {
                  const b = node.getBoundingClientRect(),
                    s = getComputedStyle(node);
                  return {
                    box: { x: b.x, y: b.y, width: b.width, height: b.height },
                    baselineOffset: probe.getBoundingClientRect().top - b.y,
                    marginLeft: s.marginLeft,
                    paddingLeft: s.paddingLeft,
                    paddingRight: s.paddingRight,
                    verticalAlign: s.verticalAlign,
                    lineHeight: s.lineHeight,
                    marginRight: s.marginRight,
                    fontSize: s.fontSize,
                    fontStatus: document.fonts.status,
                  };
                } finally {
                  probe.remove();
                }
              },
            );
            const original = baseline.contexts.find(
              /* Match only this engine's frozen viewport/context. */ (r) =>
                r.status === "PASS" &&
                r.browser.name === browserName &&
                r.viewport.width === width &&
                r.textScale === scale &&
                r.id === id,
            );
            for (const dimension of ["width", "height"])
              expect(
                Math.abs(measured.box[dimension] - original.box[dimension]),
                `${id} ${dimension}`,
              ).toBeLessThanOrEqual(0.5);
            const correction = corrections.find(
              /* Match only reviewed legacy probe corrections. */ (r) =>
                r.id === id &&
                r.browser === browserName &&
                r.viewportWidth === width &&
                r.textScale === scale,
            );
            expect(
              Math.abs(
                measured.baselineOffset -
                  (correction?.baselineOffset ?? original.baselineOffset),
              ),
              `${id} baseline`,
            ).toBeLessThanOrEqual(0.5);
            expect(measured.marginLeft).toBe(original.marginLeft);
            expect(measured.marginRight).toBe(original.marginRight);
            let screenshot = null,
              screenshotSha256 = null;
            if (directory) {
              screenshot = `${directory}/${id.replaceAll("/", "-")}.png`;
              const bytes = await symbol
                .locator("..")
                .screenshot({ animations: "disabled" });
              await writeFile(screenshot, bytes, { flag: "wx" });
              screenshotSha256 = createHash("sha256")
                .update(bytes)
                .digest("hex");
            }
            records.push({
              id,
              assetId: relic.symbolId,
              stage,
              browser: { name: browserName, version: browser.version() },
              viewport: {
                width,
                height: width === 360 ? 800 : width === 768 ? 1024 : 900,
              },
              textScale: scale,
              dpr: 1,
              ...measured,
              screenshot,
              screenshotSha256,
              baselineScreenshot: original.screenshot,
              baselineBox: original.box,
              baselineOffsetOriginal: original.baselineOffset,
              footprintStatus: "PASS",
              status: "OPEN",
              scope:
                "Live size/spacing and decoded art verified; absolute page coordinates and native qualification are separate.",
            });
          }
        expect(records).toHaveLength(84);
        if (directory)
          await writeFile(
            `${directory}/measurements.json`,
            JSON.stringify(records, null, 2) + "\n",
            { flag: "wx" },
          );
      } finally {
        await f.dispose();
      }
    });
  }
