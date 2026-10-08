import AxeBuilder from "@axe-core/playwright";
/* global document, player, dungeon, openInventory, playerLoadStats, setVolume, getComputedStyle */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const saves = JSON.parse(readFileSync("tests/fixtures/legacy/saves.json"));
const resting = saves.cases.find(
  /* Use a valid paused character. */ (r) => r.id === "resting",
);
const item = {
  category: "Great Helm",
  type: "Helmet",
  attribute: "Defense",
  rarity: "Heirloom",
  lvl: 100,
  tier: 10,
  value: 1234567890123,
  stats: [{ hp: 123456789 }, { critDmg: 123456.789 }],
};
// Present real inventory controls with each rarity and extreme readable numeric values.
async function open(browser, viewport) {
  const f = await createLegacyBrowserFixture(browser, { storage: resting.raw });
  await f.page.setViewportSize(viewport);
  await f.page.goto("/");
  await expect(f.page.locator("#title-screen")).toBeVisible();
  await f.page.addStyleTag({
    content:
      "*,*::before,*::after{transition:none!important;animation:none!important}",
  });
  await f.page.evaluate(
    /* Await local font metrics before measuring original slot footprints. */ () =>
      document.fonts.load("16px RPGAwesome"),
  );
  await f.page.clock.install({ time: new Date("2026-10-07T12:00:00Z") });
  await f.page.clock.pauseAt(new Date("2026-10-07T12:00:01Z"));
  await f.page.evaluate(
    /* Seed six distinct visible rarity labels without changing generation. */ (
      item,
    ) => {
      setVolume();
      dungeon.status.paused = true;
      document.querySelector("#title-screen").style.display = "none";
      document.querySelector("#dungeon-main").style.display = "flex";
      player.inventory.equipment = [
        "Common",
        "Uncommon",
        "Rare",
        "Epic",
        "Legendary",
        "Heirloom",
      ].map(
        /* Preserve one instance per rarity. */ (rarity) =>
          JSON.stringify({ ...item, rarity }),
      );
      player.equipped = [structuredClone(item)];
      playerLoadStats();
      openInventory();
    },
    item,
  );
  return f;
}
for (const width of [360, 768, 1440])
  for (const scale of [1, 2]) {
    // Check rounded stat labels, complete prices and every rarity at enlarged text.
    test(`item layout and labels ${width}/${scale}`, async ({ browser }) => {
      const f = await open(browser, {
        width,
        height: width === 360 ? 800 : width === 768 ? 1024 : 900,
      });
      try {
        for (const rarity of [
          "Common",
          "Uncommon",
          "Rare",
          "Epic",
          "Legendary",
          "Heirloom",
        ])
          await expect(f.page.locator("#playerInventory")).toContainText(
            rarity,
          );
        const slot = await f.page
          .locator("#playerEquipment button")
          .boundingBox();
        expect(Math.abs(slot.width - 62.8)).toBeLessThanOrEqual(0.5);
        await f.page.locator("#playerInventory button").last().click();
        if (scale === 2)
          await f.page.evaluate(
            /* Double computed font sizes once, including existing dynamic controls. */ () => {
              const rows = [...document.querySelectorAll("body *")].map(
                /* Snapshot before changing inheritance. */ (n) => [
                  n,
                  parseFloat(getComputedStyle(n).fontSize),
                ],
              );
              for (const [n, size] of rows) n.style.fontSize = `${size * 2}px`;
            },
          );
        await expect(f.page.locator("#equipmentInfo")).toContainText(
          "Diving Reliquary",
        );
        await expect(f.page.locator("#sell-equip")).toContainText(
          String(item.value),
        );
        await expect(f.page.locator("#equipmentInfo")).toContainText(
          "Critical damage +123457%",
        );
        const boxes = await f.page.locator("#equipmentInfo button").evaluateAll(
          /* Check complete control bounds and internal text fit. */ (nodes) =>
            nodes.map(
              /* Read rendered boxes without screenshots as a substitute. */ (
                n,
              ) => {
                const b = n.getBoundingClientRect();
                return {
                  x: b.x,
                  right: b.right,
                  y: b.y,
                  bottom: b.bottom,
                  overflow: n.scrollWidth - n.clientWidth,
                };
              },
            ),
        );
        for (const b of boxes) {
          expect(b.x).toBeGreaterThanOrEqual(0);
          expect(b.right).toBeLessThanOrEqual(width);
          expect(b.overflow).toBeLessThanOrEqual(1);
        }
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++)
            expect(
              boxes[i].right <= boxes[j].x ||
                boxes[j].right <= boxes[i].x ||
                boxes[i].bottom <= boxes[j].y ||
                boxes[j].bottom <= boxes[i].y,
            ).toBe(true);
      } finally {
        await f.dispose();
      }
    });
  }
// Keyboard cancellation must restore the exact invoking control and never sell.
test("keyboard detail and sale focus returns without changing holdings", async ({
  browser,
}) => {
  const f = await open(browser, { width: 360, height: 800 });
  try {
    const control = f.page.locator("#playerInventory button").first();
    await control.focus();
    await f.page.keyboard.press("Enter");
    await expect(f.page.locator("#equipmentInfo")).toHaveAttribute(
      "role",
      "dialog",
    );
    await expect(f.page.locator("#close-item-info")).toBeFocused();
    await f.page.locator("#sell-equip").focus();
    await f.page.keyboard.press("Enter");
    await expect(f.page.locator("#sell-cancel")).toBeFocused();
    await f.page.keyboard.press("Escape");
    await expect(f.page.locator("#sell-equip")).toBeFocused();
    await f.page.keyboard.press("Escape");
    await expect(control).toBeFocused();
    expect(
      await f.page.evaluate(
        /* Confirm Escape never mutates holdings. */ () =>
          player.inventory.equipment.length,
      ),
    ).toBe(6);
  } finally {
    await f.dispose();
  }
});
// Collection confirmations cannot operate after a re-render or after being consumed once.
test("bulk confirmation rejects changed holdings and repeated actions", async ({
  browser,
}) => {
  const f = await open(browser, { width: 360, height: 800 });
  try {
    const result = await f.page.evaluate(
      /* Capture queued callbacks from real bulk controls. */ () => {
        document.querySelector("#sell-all").click();
        const stale = document.querySelector("#sell-confirm").onclick;
        player.inventory.equipment.shift();
        playerLoadStats();
        const before = JSON.stringify([player.gold, player.inventory]);
        stale();
        const after = JSON.stringify([player.gold, player.inventory]);
        document.querySelector("#sell-all").click();
        const repeat = document.querySelector("#sell-confirm").onclick;
        repeat();
        const once = JSON.stringify([player.gold, player.inventory]);
        repeat();
        return {
          before,
          after,
          once,
          twice: JSON.stringify([player.gold, player.inventory]),
        };
      },
    );
    expect(result.after).toBe(result.before);
    expect(result.twice).toBe(result.once);
  } finally {
    await f.dispose();
  }
});

// Empty or unmatched collections expose no transaction that cannot act on a holding.
test("empty inventory and unmatched rarity disable bulk actions", async ({
  browser,
}) => {
  const f = await open(browser, { width: 360, height: 800 });
  try {
    await f.page.evaluate(
      /* Remove holdings before a fresh view, retaining the same character. */ () => {
        player.inventory.equipment = [];
        player.equipped = [];
        playerLoadStats();
      },
    );
    await expect(f.page.locator("#sell-all")).toBeDisabled();
    await expect(f.page.locator("#unequip-all")).toBeDisabled();
    await f.page.evaluate(
      /* Restore one Common holding to verify filter-specific availability. */ (
        item,
      ) => {
        player.inventory.equipment = [
          JSON.stringify({ ...item, rarity: "Common" }),
        ];
        playerLoadStats();
      },
      item,
    );
    await expect(f.page.locator("#sell-all")).toBeEnabled();
    await f.page.locator("#sell-rarity").selectOption("Heirloom");
    await expect(f.page.locator("#sell-all")).toBeDisabled();
    await f.page.locator("#sell-rarity").selectOption("Common");
    await expect(f.page.locator("#sell-all")).toBeEnabled();
  } finally {
    await f.dispose();
  }
});

// Audit each changed modal in addition to the explicit keyboard and geometry assertions.
test("relic inventory, detail and sale meet automated WCAG checks", async ({
  browser,
}) => {
  const f = await open(browser, { width: 360, height: 800 });
  try {
    // Axe uses timers; this paused fixture has no active exploration/combat loop.
    await f.page.clock.resume();
    for (const stage of ["inventory", "equipmentInfo", "defaultModal"]) {
      if (stage === "equipmentInfo")
        await f.page.locator("#playerInventory button").first().click();
      if (stage === "defaultModal") await f.page.locator("#sell-equip").click();
      await expect(f.page.locator(`#${stage}`)).toHaveAttribute(
        "aria-modal",
        "true",
      );
      const result = await new AxeBuilder({ page: f.page })
        .include(`#${stage}`)
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  } finally {
    await f.dispose();
  }
});

// Enlarged text must not collapse the scrollable inventory between surrounding controls.
test("200 percent inventory rows remain fully readable in the existing modal", async ({
  browser,
}) => {
  const f = await open(browser, { width: 360, height: 800 });
  try {
    await f.page.evaluate(
      /* Apply the same fixed-viewport font policy as baseline capture. */ () => {
        const rows = [...document.querySelectorAll("body *")].map(
          /* Read all sizes before applying inherited scaling. */ (n) => [
            n,
            parseFloat(getComputedStyle(n).fontSize),
          ],
        );
        for (const [n, size] of rows) n.style.fontSize = `${size * 2}px`;
      },
    );
    const control = f.page.locator("#playerInventory button").first();
    await control.scrollIntoViewIfNeeded();
    const row = await control.boundingBox(),
      list = await f.page.locator("#playerInventory").boundingBox();
    expect(row.y).toBeGreaterThanOrEqual(list.y - 0.5);
    expect(row.y + row.height).toBeLessThanOrEqual(list.y + list.height + 0.5);
    await control.focus();
    await f.page.keyboard.press("Enter");
    await expect(f.page.locator("#equipmentInfo")).toBeVisible();
  } finally {
    await f.dispose();
  }
});
