/* global player:writable, dungeon:writable, enemy:writable, combatBacklog, setVolume, playerLoadStats,
   openInventory, allocationPopup, showItemInfo, equipmentIcon,
   dungeonEvent, goldDrop, hpValidation, showCombatInfo,
   document, getComputedStyle, Howler */
import { getSymbol } from "../../assets/js/content/catalog.mjs";
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
const baseline = JSON.parse(await readFile("art/cosmic-horror/baseline.json"));
const contexts = corpus.contexts.filter(
  /* Remaining roles have no equipment category. */ (row) => !row.category,
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
// Measure inside the glyph so a wrapping sibling probe cannot sample a different line.
function inlineBaseline(node) {
  const probe = document.createElement("span");
  probe.style.cssText =
    "display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline";
  node.append(probe);
  try {
    return probe.getBoundingClientRect().top - node.getBoundingClientRect().top;
  } finally {
    probe.remove();
  }
}

// Reproduce the captured scenarios through either the immutable or live engine.
function renderContext({ context, state, enemyState, scale, legacy = false }) {
  // Restore computed-font overrides from the preceding scenario before rendering again.
  for (const node of document.querySelectorAll("[data-baseline-font]")) {
    node.style.fontSize = node.dataset.baselineFont;
    delete node.dataset.baselineFont;
  }
  player = structuredClone(state.player);
  dungeon = structuredClone(state.dungeon);
  enemy = structuredClone(enemyState);
  // Restore the original undimmed resting containers before opening this scenario's panels.
  for (const id of [
    "title-screen",
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
  const tape = Array(25).fill(0);
  let cursor = 0;
  // A finite tape detects unexpected gameplay draws during rendering and event setup.
  Math.random = () => {
    if (cursor >= tape.length) throw new Error("capture tape exhausted");
    return tape[cursor++];
  };
  if (stage === "sale-control") {
    const category = "Sword";
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
    openInventory();
    if (legacy) showItemInfo(item, equipmentIcon(category), "Equip", 0);
    else document.querySelector("#playerInventory button").click();
  }
  if (stage === "title") {
    document.getElementById("dungeon-main").style.display = "none";
    document.getElementById("title-screen").style.display = "flex";
  }
  if (stage === "allocation") allocationPopup();
  if (["treasure", "chamber", "blessing", "curse"].includes(stage)) {
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
    if (stage === "chamber") document.getElementById("choice1").click();
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
      (node) => [node, getComputedStyle(node).fontSize, node.style.fontSize],
    );
    for (const [node, size, original] of sizes) {
      node.dataset.baselineFont = original;
      node.style.fontSize = `${parseFloat(size) * 2}px`;
    }
  }
}

for (const viewport of [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  for (const scale of [1, 2]) {
    // Every engine records real layout at each declared viewport/text-size combination.
    test(`remaining live symbol contexts ${viewport.width} text ${scale}`, async ({
      browser,
      browserName,
    }, info) => {
      test.setTimeout(180_000);
      const fixture = await createLegacyBrowserFixture(browser, {
        storage: resting.raw,
        viewport,
      });
      const originalFixture = await createLegacyBrowserFixture(browser, {
        storage: resting.raw,
        viewport,
      });
      const { page } = fixture;
      const captureRoot = process.env.SYMBOL_CAPTURE_DIR;
      const name = `${info.project.name}-${viewport.width}-${scale}`;
      const directory = captureRoot ? join(captureRoot, name) : null;
      const measurements = [];
      let soundCount;
      try {
        if (directory) await mkdir(directory, { recursive: false });
        await page.goto("/");
        await expect(page.locator("#title-screen")).toBeVisible();
        await page.clock.install({ time: new Date("2026-10-06T12:00:00Z") });
        await page.clock.pauseAt(new Date("2026-10-06T12:00:01Z"));
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
        await originalFixture.page.clock.install({
          time: new Date("2026-10-06T12:00:00Z"),
        });
        await originalFixture.page.clock.pauseAt(
          new Date("2026-10-06T12:00:01Z"),
        );
        await originalFixture.page.goto(
          "/tests/fixtures/legacy/source/index.html",
        );
        await originalFixture.page.addStyleTag({
          content:
            "*,*::before,*::after{transition:none!important;animation:none!important}",
        });
        await originalFixture.page.evaluate(
          /* Keep the immutable fixture silent and deterministic. */ () => {
            Howler.mute(true);
            setVolume();
          },
        );
        for (const context of contexts) {
          const errorsBefore = info.errors.length;
          await originalFixture.page.evaluate(renderContext, {
            context,
            state: resting.state,
            enemyState: normal.state.enemy,
            scale,
            legacy: true,
          });
          await measureSymbols(originalFixture.page, [context]);
          const originalInline = await originalFixture.page
            .locator(context.selector)
            .evaluate(inlineBaseline);
          await page.evaluate(
            // Exercise live renderers with captured state and the original finite event recipes.
            renderContext,
            {
              context,
              state: resting.state,
              enemyState: normal.state.enemy,
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
          const selector = `.inline-symbol[data-context="${context.id}"]`;
          const live = page.locator(selector);
          await expect(live, context.id).toHaveCount(1);
          await live
            .locator("img")
            .evaluate(
              /* Require successfully decoded delivered artwork. */ (image) =>
                image.decode(),
            );
          const [row] = await measureSymbols(page, [{ ...context, selector }]);
          row.inlineBaselineOffset = await live.evaluate(inlineBaseline);
          row.immutableInlineBaselineOffset = originalInline;
          const original = baseline.contexts.find(
            /* Select only the frozen matching tuple. */ (r) =>
              r.status === "PASS" &&
              r.id === context.id &&
              r.browser.name === browserName &&
              r.viewport.width === viewport.width &&
              r.textScale === scale,
          );
          expect(original, context.id).toBeTruthy();
          for (const key of ["width", "height"])
            expect
              .soft(
                Math.abs(row.box[key] - original.box[key]),
                `${context.id} ${key}`,
              )
              .toBeLessThanOrEqual(0.5);
          expect
            .soft(
              Math.abs(row.inlineBaselineOffset - originalInline),
              `${context.id} immutable inline baseline`,
            )
            .toBeLessThanOrEqual(0.5);
          expect.soft(row.marginLeft, context.id).toBe(original.marginLeft);
          expect.soft(row.marginRight, context.id).toBe(original.marginRight);
          const art = await live.evaluate(
            /* Check image reset and compare the original glyph at the same live text anchor. */ (
              node,
              { context },
            ) => {
              const image = node.querySelector("img"),
                css = getComputedStyle(image);
              const original = document.createElement("i");
              const glyph = context.selector.match(
                /\.(fa-[\w-]+|ra-[\w-]+)$/,
              )[1];
              original.className = glyph.startsWith("fa-")
                ? `fas ${glyph}${context.stage === "title" ? " fa-5x" : ""}`
                : `ra ${glyph}`;
              original.style.fontSize = getComputedStyle(node).fontSize;
              const before = node.getBoundingClientRect();
              const parentBefore = node.parentElement.getBoundingClientRect();
              node.replaceWith(original);
              const after = original.getBoundingClientRect();
              const parentAfter =
                original.parentElement.getBoundingClientRect();
              original.replaceWith(node);
              return {
                src: image.getAttribute("src"),
                alt: image.alt,
                hidden: node.getAttribute("aria-hidden"),
                margin: css.marginTop,
                edges: [
                  before.left - after.left,
                  before.right - after.right,
                  before.top - after.top,
                  before.bottom - after.bottom,
                ],
                parentEdges: [
                  parentBefore.left - parentAfter.left,
                  parentBefore.right - parentAfter.right,
                  parentBefore.top - parentAfter.top,
                  parentBefore.bottom - parentAfter.bottom,
                ],
              };
            },
            { context, scale },
          );
          expect(art.src).toBe(
            `/${getSymbol(context.role, context.id).value.path}`,
          );
          expect(art.alt).toBe(context.id === "currency/header" ? "Gold" : "");
          expect(art.hidden).toBe(
            context.id === "currency/header" ? null : "true",
          );
          expect(art.margin).toBe("0px");
          for (const edge of [...art.edges, ...art.parentEdges])
            expect
              .soft(Math.abs(edge), `${context.id} live edge`)
              .toBeLessThanOrEqual(0.5);
          row.originalBox = original.box;
          row.originalBaselineOffset = original.baselineOffset;
          row.originalScreenshot = original.screenshot;
          row.scope =
            "Frozen size/spacing, immutable-source inline baseline, and same-anchor live edges; pre-theme page coordinates and native acceptance remain separate.";
          row.liveComparison = art;
          expect(row.box.width).toBeGreaterThan(0);
          expect(row.fontStatus).toBe("loaded");
          row.role = context.role;
          row.stage = context.stage;
          row.textScale = scale;
          row.browser = { name: info.project.name, version: browser.version() };
          row.status = info.errors.length === errorsBefore ? "PASS" : "FAIL";
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
        ).toBe(10);
        expect(measurements).toHaveLength(27);
        if (directory)
          await writeBaseline(join(directory, "measurements.json"), {
            fontPolicy: corpus.fontPolicy,
            measurements,
          });
      } finally {
        await fixture.dispose();
        await originalFixture.dispose();
      }
    });
  }
}

// The declared media type must describe the delivered favicon bytes.
test("favicon reference describes the ICO delivery", async ({ browser }) => {
  const f = await createLegacyBrowserFixture(browser);
  try {
    await f.page.goto("/");
    await expect(f.page.locator('link[rel="icon"]')).toHaveAttribute(
      "type",
      "image/x-icon",
    );
    await expect(f.page.locator('link[rel="icon"]')).toHaveAttribute(
      "href",
      "./assets/icon/favicon.ico",
    );
  } finally {
    await f.dispose();
  }
});
