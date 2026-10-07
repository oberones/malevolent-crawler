/* global document, dungeon, player, updateDungeonLog */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const resting = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases.find(
  /* Use a real allocated, settled legacy run. */ (row) => row.id === "resting",
);
// Browser integration preserves history length and last-50 presentation, with inert raw recovery.
test("legacy load themes history, preserves names and exposes exact unknown text safely", async ({
  browser,
}) => {
  const state = structuredClone(resting.state);
  const hostile = '<img src=x onerror="globalThis.injected=true">';
  state.player.name = "Goblin Sword";
  state.dungeon.backlog = Array.from(
    { length: 53 },
    /* Unique amounts prove stable ordering. */ (_, i) =>
      `You found <i class="fas fa-coins" style="color: #FFD700;"></i>${i}.`,
  );
  state.dungeon.backlog.push("You encountered Skeleton Mage.", hostile);
  const storage = {
    ...resting.raw,
    playerData: JSON.stringify(state.player),
    dungeonData: JSON.stringify(state.dungeon),
  };
  const f = await createLegacyBrowserFixture(browser, {
    storage,
    randomTape: [],
  });
  try {
    const p = f.page;
    await p.goto("/");
    await expect(p.locator("#title-screen")).toBeVisible();
    await p.locator("#title-screen").click();
    await expect(p.locator("#dungeon-main")).toBeVisible();
    await expect(p.locator("#dungeonLog > p")).toHaveCount(50);
    await expect(p.locator("#dungeonLog > p").first()).toContainText(
      "You recover 5 Quay Marks.",
    );
    await expect(p.locator("#dungeonLog")).toContainText("Sounding Vessel");
    await expect(
      p.getByRole("button", { name: "Recover history" }),
    ).toBeVisible();
    await p.getByRole("button", { name: "Recover history" }).focus();
    await p.keyboard.press("Enter");
    await expect(p.locator("#dungeonLog pre")).toHaveText(hostile);
    await expect(p.locator('#dungeonLog img[src="x"]')).toHaveCount(0);
    const result = await p.evaluate(
      /* Read state only; recovery cannot replay a reward. */ () => ({
        name: player.name,
        gold: player.gold,
        count: dungeon.backlog.length,
        raw: localStorage.getItem("dungeonData"),
        injected: !!globalThis.injected,
      }),
    );
    expect(result).toEqual({
      name: state.player.name,
      gold: state.player.gold,
      count: 55,
      raw: storage.dungeonData,
      injected: false,
    });
    await p.evaluate(
      /* Re-rendering must dispose old nodes and remain idempotent. */ () =>
        updateDungeonLog(),
    );
    await expect(
      p.getByRole("button", { name: "Recover history" }),
    ).toHaveCount(1);
  } finally {
    await f.dispose();
  }
});
// Exercise the shared safe renderer with a migrated panel and player-authored old terms.
test("migrated records use safe renderer templates without evaluating markup", async ({
  page,
}) => {
  await page.goto("/tests/fixtures/services.html");
  const result = await page.evaluate(
    /* Run real modules against browser text nodes. */ async () => {
      const { migrateLegacyMessages } =
        await import("/assets/js/app/legacy-history.mjs");
      const { createSafeRenderer } =
        await import("/assets/js/app/safe-render.mjs");
      const { messageSchemas, messageTemplates } =
        await import("/assets/js/content/messages.mjs");
      const name = 'Goblin <svg onload="globalThis.injected=true"> Sword';
      const migrated = migrateLegacyMessages([
        {
          id: "combat.playerHit",
          params: { player: name, damage: 3, encounter: "Goblin" },
        },
        "<script>bad()</script>",
      ]);
      const renderer = createSafeRenderer(document, {
        schemas: messageSchemas,
        templates: messageTemplates,
        onRecover: /* Expose only opaque reference data. */ (ref) => {
          globalThis.recovered = ref;
        },
      });
      const out = document.querySelector("#output");
      for (const record of migrated.records)
        out.append(renderer.renderMessage(record));
      return {
        text: out.textContent,
        markup: out.querySelectorAll("svg,script").length,
      };
    },
  );
  expect(result.text).toContain(
    'Goblin <svg onload="globalThis.injected=true"> Sword dealt 3 damage to Quay Scavenger.',
  );
  expect(result.markup).toBe(0);
  await page.getByRole("button", { name: "Recover history" }).click();
  expect(
    await page.evaluate(
      /* Recovery references remain data, never URLs. */ () =>
        globalThis.recovered,
    ),
  ).toBe("legacy:dungeon.backlog:1");
});
