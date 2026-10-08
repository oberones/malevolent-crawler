/* global document, player, dungeon, enemy:writable, hpValidation, showCombatInfo, setVolume, importData, window */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
import { SAVE, PREVIOUS, envelope } from "../helpers/recovery-fixtures.mjs";
import { getEncounter, getRelic } from "../../assets/js/content/catalog.mjs";
const saves = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases;
const normal = saves.find(
  // Select a frozen resumable encounter, independent of current generation.
  (row) => row.id === "normal",
);
const equipment = JSON.parse(
  readFileSync("tests/fixtures/legacy/equipment.json"),
).cases.find(
  // Use a full known roll for the earned relic without inventing random draws.
  (row) => row.operations[0]?.call === "createEquipment",
);
const item = JSON.parse(equipment.expected.player.inventory.equipment.at(-1));
const relicName = getRelic(item.category).value.displayName;

/** Read live and durable progress without issuing a gameplay save. */
async function snapshot(page) {
  return page.evaluate(
    // Serialize authoritative state separately from the browser's stored bytes.
    () => ({ player, dungeon, enemy, storage: { ...localStorage } }),
  );
}
/** Pause clocks after boot so only explicitly advanced transitions occur. */
async function freeze(page) {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
}
/** Complete a visible loader without advancing real wall-clock time. */
async function finishLoading(page) {
  await page.clock.runFor(1100);
}
/** Resolve a deterministic synthetic terminal trigger through the actual combat boundary. */
async function victory(page, drop = false) {
  await page.evaluate(
    // Preserve the live character and supply only the encounter boundary and reward inputs.
    ({ state, drop }) => {
      enemy = structuredClone(state.enemy);
      enemy.stats.hp = 0;
      enemy.rewards = { exp: 0, gold: 3, drop };
      player.inCombat = true;
      dungeon.status.event = true;
      setVolume();
      showCombatInfo();
      document.querySelector("#combatPanel").style.display = "flex";
      hpValidation();
    },
    { state: normal.state, drop },
  );
}

// New entry, earned art, item actions and reload must agree on one character and holding.
test("fresh character earns, equips and reloads one consistent relic", async ({
  browser,
}) => {
  const fixture = await createLegacyBrowserFixture(browser, {
    randomTape: equipment.tape,
  });
  try {
    const page = fixture.page;
    await page.goto("/");
    await expect(page.locator("#character-creation")).toBeVisible();
    await page.locator("#name-input").fill("Mariner");
    await page.locator("#name-submit button").click();
    await expect(page.locator("#title-screen")).toBeVisible();
    await freeze(page);
    await page.locator("#title-action").click();
    await page.locator("#allocate-confirm").click();
    await finishLoading(page);
    await victory(page, true);
    const awarded = await snapshot(page);
    expect(awarded.player.inventory.equipment).toHaveLength(1);
    await expect(page.locator("#combatLogBox")).toContainText(relicName);
    await expect(page.locator("#combatPanel")).toContainText(
      getEncounter(normal.state.enemy.name).value.displayName,
    );
    await expect(page.locator("#combatPanel")).not.toContainText(
      normal.state.enemy.name,
    );
    await page.locator("#battleButton").click();
    await page.locator("#open-inventory").click();
    await expect(page.locator("#playerInventory")).toContainText(relicName);
    await page.locator("#playerInventory button").click();
    await expect(page.locator("#equipmentInfo")).toContainText(relicName);
    await page.locator("#un-equip").click();
    await expect(page.locator("#playerEquipment button")).toHaveAccessibleName(
      new RegExp(relicName),
    );
    const equipped = await snapshot(page);
    expect(equipped.player.equipped).toEqual([
      JSON.parse(awarded.player.inventory.equipment[0]),
    ]);
    expect(equipped.player.gold).toBe(awarded.player.gold);
    expect(JSON.parse(equipped.storage[SAVE]).state.player).toMatchObject(
      equipped.player,
    );
    await page.reload();
    await expect(page.locator("#title-screen")).toBeVisible();
    const restored = await snapshot(page);
    expect(restored.player).toMatchObject(equipped.player);
    await expect(page.locator("#title-screen")).toContainText(
      "The Bell Beneath Brine",
    );
  } finally {
    await fixture.dispose();
  }
});

// A delayed duplicate terminal check must not re-award a resolved legacy encounter.
test("legacy combat resolves once through claim and reload", async ({
  browser,
}) => {
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: normal.raw,
  });
  try {
    const page = fixture.page;
    await page.goto("/");
    await expect(page.locator("#title-screen")).toBeVisible();
    await freeze(page);
    await page.locator("#title-action").click();
    await finishLoading(page);
    await victory(page);
    const once = await snapshot(page);
    await page.evaluate(
      // Reproduce a repeated terminal notification before the already-earned reward is claimed.
      () => hpValidation(),
    );
    expect((await snapshot(page)).player).toEqual(once.player);
    await page.locator("#battleButton").click();
    const claimed = await snapshot(page);
    expect(claimed.player).toEqual(once.player);
    await page.reload();
    await expect(page.locator("#title-screen")).toBeVisible();
    expect((await snapshot(page)).player).toMatchObject(once.player);
    for (const [key, bytes] of Object.entries(normal.raw))
      expect((await snapshot(page)).storage[key]).toBe(bytes);
  } finally {
    await fixture.dispose();
  }
});

for (const stale of ["repeat", "cancelled-before-import"]) {
  // Allocation callbacks cannot duplicate a skill or allocate a different imported character.
  test(`import allocation and restart reject ${stale} allocation`, async ({
    browser,
  }) => {
    const fixture = await createLegacyBrowserFixture(browser, {
      storage: normal.raw,
    });
    try {
      const page = fixture.page;
      await page.goto("/");
      await expect(page.locator("#title-screen")).toBeVisible();
      await freeze(page);
      const text = Buffer.from(
        JSON.stringify(normal.state.player),
        "latin1",
      ).toString("base64");
      await page.evaluate(
        // Enter the real preview boundary; confirmation remains a visible user action.
        (text) => importData(text),
        text,
      );
      await page.locator("#import-btn").click();
      await page.locator("#title-action").click();
      await page.evaluate(
        // Retain an actual callback as a queued event can outlive its old dialog.
        () => {
          window.__oldAllocation =
            document.querySelector("#allocate-confirm").onclick;
        },
      );
      if (stale === "repeat") {
        await page.locator("#allocate-confirm").click();
        await finishLoading(page);
      } else {
        await page.locator("#allocate-close").click();
        await page.evaluate(
          // Replacement invalidates the cancelled character's preview.
          (text) => importData(text),
          text,
        );
        await page.locator("#import-btn").click();
      }
      const before = await snapshot(page);
      await page.evaluate(
        // Invoke only the retained handler, without manufacturing another DOM click.
        () => window.__oldAllocation(),
      );
      expect(await snapshot(page)).toEqual(before);
      if (stale === "repeat") {
        await page.locator("#open-inventory").click();
        await page.locator("#menu-btn").click();
        await page.locator("#quit-run").click();
        await page.locator("#defaultModal #quit-run").click();
        await finishLoading(page);
        await page.locator("#title-action").click();
        await page.locator("#allocate-confirm").click();
        await finishLoading(page);
        const restarted = await snapshot(page);
        expect(restarted.player.skills).toHaveLength(1);
        expect(restarted.player.inventory).toEqual(
          normal.state.player.inventory,
        );
        expect(restarted.player.gold).toBe(normal.state.player.gold);
      }
    } finally {
      await fixture.dispose();
    }
  });
}

// Recovery and missing artwork must compose without writing over damaged durable sources.
test("prior-good combat recovery survives failed art and preserves raw sources", async ({
  browser,
}) => {
  const storage = { [SAVE]: "{broken", [PREVIOUS]: envelope(normal.state) };
  const fixture = await createLegacyBrowserFixture(browser, {
    storage,
    viewport: { width: 360, height: 800 },
  });
  try {
    const page = fixture.page;
    await fixture.context.route(
      "**/assets/sprites/**",
      // Fail the delivered encounter portrait while leaving its local fallback available.
      (route) => route.abort(),
    );
    await page.goto("/");
    await expect(page.locator("#recover-previous")).toBeVisible();
    await page.locator("#recover-previous").click();
    await page.locator("#recovery-confirm").click();
    await freeze(page);
    await page.locator("#title-action").click();
    await finishLoading(page);
    await expect(page.locator("#enemy-sprite")).toHaveAttribute(
      "src",
      /fallback/,
    );
    await expect(page.locator("#combatPanel")).toContainText(
      getEncounter(normal.state.enemy.name).value.displayName,
    );
    await expect(page.locator("#save-status")).toContainText("not saved");
    await victory(page);
    await page.locator("#battleButton").click();
    await page.locator("#open-inventory").click();
    await page.locator("#menu-btn").click();
    await page.locator("#export-import").click();
    await expect(page.locator("#export-input")).toHaveValue(/^MC1:/);
    expect((await snapshot(page)).storage).toEqual(storage);
  } finally {
    await fixture.dispose();
  }
});

// A narrow full loadout must keep the short sale action readable as one word.
test("full inventory keeps Sell readable at a narrow viewport", async ({
  browser,
}) => {
  const row = saves.find(
    // Reuse captured duplicate holdings instead of manufacturing a layout-only inventory.
    (entry) => entry.id === "full-duplicate-equipment",
  );
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
    viewport: { width: 360, height: 800 },
  });
  try {
    const page = fixture.page;
    await page.goto("/");
    await expect(page.locator("#title-screen")).toBeVisible();
    await page.locator("#title-action").click();
    await expect(page.locator("#dungeon-main")).toBeVisible();
    await page.locator("#open-inventory").click();
    const lines = await page.locator("#sell-all").evaluate(
      // Inspect text line boxes rather than mistaking a tall button for readable copy.
      (button) => {
        const range = document.createRange();
        range.selectNodeContents(button);
        return new Set(
          [...range.getClientRects()].map(
            // Multiple fragments on the same line still count as one readable label.
            (rect) => Math.round(rect.top),
          ),
        ).size;
      },
    );
    expect(lines).toBe(1);
  } finally {
    await fixture.dispose();
  }
});
