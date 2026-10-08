/* global window, document, runLoad, player, dungeon, enemy, volume, importData, exportData, setVolume, runGameplay */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const cases = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases;
const row = cases.find(
  /* Use a stable run with retained local preferences. */ (entry) =>
    entry.id === "resting",
);
const legacy = JSON.parse(
  readFileSync("tests/fixtures/legacy/progression.json"),
).cases.find(
  /* The frozen import oracle owns reset expectations. */ (entry) =>
    entry.id === "import/true",
);
const text = legacy.operations[0].args[0];
const key = "malevolentCrawler.save.v1";
// Capture exact live and durable values independently of importer internals.
async function snapshot(page) {
  return page.evaluate(
    /* Observe without triggering any gameplay save. */ () => ({
      state: { player, dungeon, enemy, volume },
      storage: { ...localStorage },
    }),
  );
}
for (const mode of [
  "cancel",
  "save",
  "backup-failure",
  "write-failure",
  "session-only",
  "retry",
]) {
  // Real modal controls exercise preview, persistence ordering and explicit recovery decisions.
  test(`character import ${mode}`, async ({ browser }) => {
    const fixture = await createLegacyBrowserFixture(browser, {
      storage: row.raw,
    });
    const page = fixture.page;
    try {
      await page.goto("http://127.0.0.1:4173/");
      await expect(page.locator("#title-screen")).toBeVisible();
      await page.evaluate(
        /* Initialize the existing audio controls without entering a run. */ () =>
          setVolume(),
      );
      const before = await snapshot(page);
      await page.evaluate(
        /* Preview a legacy export through the real entry point. */ (text) =>
          importData(text),
        text,
      );
      expect(await snapshot(page)).toEqual(before);
      await expect(
        page
          .locator("#confirmation-modal, #confirmationModal")
          .or(
            page
              .locator(".modal-container")
              .filter({ has: page.locator("#import-btn") }),
          ),
      ).toContainText(
        /(replace.*character|erase.*current data).*reset.*dungeon/i,
      );
      if (mode === "cancel") {
        await page.locator("#cancel-btn").click();
        expect(await snapshot(page)).toEqual(before);
        return;
      }
      await page.evaluate(
        /* Fault only the selected write stage and record the live player during writes. */ ({
          mode,
          key,
        }) => {
          const original = Storage.prototype.setItem;
          window.__importWrites = [];
          window.__restoreImportStorage =
            /* Restore storage for an explicit retry. */ () => {
              Storage.prototype.setItem = original;
            };
          Storage.prototype.setItem =
            /* Observe ordering before invoking the real storage boundary. */ function (
              name,
              value,
            ) {
              window.__importWrites.push({
                key: name,
                playerName: player.name,
              });
              if (
                (mode === "backup-failure" && name.endsWith("previous.v1")) ||
                (["write-failure", "session-only", "retry"].includes(mode) &&
                  name === key)
              )
                throw new DOMException("Full", "QuotaExceededError");
              return original.call(this, name, value);
            };
        },
        { mode, key },
      );
      await page.locator("#import-btn").click();
      if (mode !== "save") {
        expect((await snapshot(page)).state).toEqual(before.state);
        expect((await snapshot(page)).storage[key]).toBe(before.storage[key]);
        await expect(page.locator("#import-status")).toContainText(
          /not saved/i,
        );
        if (mode === "retry") {
          await page.evaluate(
            /* Allow the user's explicit retry to write. */ () =>
              window.__restoreImportStorage(),
          );
          await page.locator("#import-btn").click();
        } else if (mode === "session-only") {
          await page.locator("#import-session-only").click();
          await expect(page.locator("#save-status")).toContainText("not saved");
          await page.evaluate(
            /* Later gameplay cannot silently persist the explicitly unsaved import. */ () => {
              window.__restoreImportStorage();
              runGameplay(
                /* Request a completed save boundary without changing retained gold. */ () => {
                  player.gold += 1;
                  player.gold -= 1;
                },
              );
            },
          );
          expect((await snapshot(page)).storage[key]).toBe(before.storage[key]);
        } else {
          await page.locator("#cancel-btn").click();
          expect((await snapshot(page)).state).toEqual(before.state);
          return;
        }
      }
      const after = await snapshot(page);
      const imported = JSON.parse(atob(text));
      for (const field of [
        "name",
        "inventory",
        "equipped",
        "gold",
        "kills",
        "deaths",
        "playtime",
        "baseStats",
        "tempStats",
      ])
        expect(after.state.player[field], field).toEqual(imported[field]);
      expect(after.state.player.lvl).toBe(1);
      expect(after.state.player.blessing).toBe(1);
      expect(after.state.player.inCombat).toBe(false);
      expect(after.state.player.allocated).toBeUndefined();
      expect(after.state.player.skills).toEqual([]);
      expect(after.state.player.exp).toEqual({
        expCurr: 0,
        expMax: 100,
        expCurrLvl: 0,
        expMaxLvl: 100,
        lvlGained: 0,
      });
      expect(
        Object.values(after.state.player.bonusStats).every(
          /* Every run bonus resets. */ (n) => n === 0,
        ),
      ).toBe(true);
      expect(after.state.player.stats).toEqual({
        ...imported.stats,
        hp: imported.stats.hpMax,
      });
      expect(after.state.volume).toEqual(before.state.volume);
      expect(after.state.dungeon.progress).toEqual({
        ...before.state.dungeon.progress,
        floor: 1,
        room: 1,
      });
      expect(after.state.dungeon.backlog).toEqual([]);
      expect(after.state.dungeon.statistics).toEqual({ kills: 0, runtime: 0 });
      expect(after.state.enemy.name).toBeNull();
      for (const [name, bytes] of Object.entries(row.raw))
        expect(after.storage[name]).toBe(bytes);
      if (mode !== "session-only") {
        expect(JSON.parse(after.storage[key]).state).toEqual(after.state);
        const writes = await page.evaluate(
          /* Inspect commit ordering without issuing another save. */ () =>
            window.__importWrites,
        );
        expect(
          writes.every(
            /* Replacement must happen after the complete commit. */ (write) =>
              write.playerName === before.state.player.name,
          ),
        ).toBe(true);
      }
    } finally {
      await fixture.dispose();
    }
  });
}
// Unicode exports and invalid imports use text-only feedback rather than silent denial.
test("Unicode export and malformed import feedback", async ({ browser }) => {
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
  });
  try {
    const page = fixture.page;
    await page.goto("http://127.0.0.1:4173/");
    await expect(page.locator("#title-screen")).toBeVisible();
    const output = await page.evaluate(
      /* Export a historical Unicode name without mutating game progression. */ () => {
        setVolume();
        player.name = "潮 🌊";
        return exportData();
      },
    );
    expect(output.startsWith("MC1:")).toBe(true);
    const before = await snapshot(page);
    await page.evaluate(
      /* Invalid transport must never replace the current tuple. */ () =>
        importData("not base64"),
    );
    await expect(page.locator("#import-status")).toContainText(
      /invalid|unable/i,
    );
    expect(await snapshot(page)).toEqual(before);
  } finally {
    await fixture.dispose();
  }
});
// Pending UI work from the replaced session must never reopen its dungeon after import.
test("import invalidates the previous session's delayed work", async ({
  browser,
}) => {
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
  });
  try {
    const page = fixture.page;
    await page.goto("http://127.0.0.1:4173/");
    await expect(page.locator("#title-screen")).toBeVisible();
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    await page.evaluate(
      /* Queue old screen work before confirming a new character. */ (text) => {
        setVolume();
        runLoad("dungeon-main", "flex");
        importData(text);
        document.querySelector("#import-btn").click();
      },
      text,
    );
    await page.clock.fastForward(1100);
    await expect(page.locator("#dungeon-main")).toBeHidden();
    await expect(page.locator("#loading")).toBeHidden();
  } finally {
    await fixture.dispose();
  }
});
// Exercise the reachable exchange form with hostile-looking Unicode and keyboard cancellation.
test("exchange form previews MC1 safely and Escape cancels without saving", async ({
  browser,
}) => {
  const fixture = await createLegacyBrowserFixture(browser, {
    storage: row.raw,
    viewport: { width: 360, height: 800 },
  });
  try {
    const page = fixture.page;
    await page.goto("http://127.0.0.1:4173/");
    await expect(page.locator("#title-screen")).toBeVisible();
    await page.locator("#title-action").click();
    await expect(page.locator("#dungeon-main")).toBeVisible();
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    await page.locator("#open-inventory").click();
    await page.locator("#menu-btn").click();
    await page.locator("#export-import").click();
    const encoded = await page.locator("#export-input").inputValue();
    const data = JSON.parse(
      Buffer.from(encoded.slice(4), "base64").toString("utf8"),
    );
    data.player.name = '潮 🌊 <img src=x onerror="window.__importXss=1">';
    const modern =
      "MC1:" + Buffer.from(JSON.stringify(data), "utf8").toString("base64");
    await page.locator("#import-input").fill(modern);
    const before = await snapshot(page);
    await page.locator("#data-import").click();
    await expect(page.locator("#import-description")).toContainText(
      data.player.name,
    );
    await expect(page.locator("#import-description img")).toHaveCount(0);
    expect(await snapshot(page)).toEqual(before);
    await page.keyboard.press("Escape");
    await expect(page.locator("#data-import")).toBeFocused();
    expect(await snapshot(page)).toEqual(before);
    await page.locator("#data-import").click();
    await page.locator("#import-btn").click();
    expect((await snapshot(page)).state.player.name).toBe(data.player.name);
  } finally {
    await fixture.dispose();
  }
});
