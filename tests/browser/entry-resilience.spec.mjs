/* global document, Howler, getComputedStyle, innerWidth */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const resting = JSON.parse(
  readFileSync(new URL("../fixtures/legacy/saves.json", import.meta.url)),
).cases.find(
  // Start from a captured continuing character.
  (row) => row.id === "resting",
);
for (const viewport of [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  // Keep the title compact and make only the visible, keyboard-accessible button activate entry.
  test(`title button is explicit at ${viewport.width}`, async ({ browser }) => {
    const f = await createLegacyBrowserFixture(browser, {
      storage: resting.raw,
      randomTape: [],
      viewport,
    });
    try {
      const p = f.page;
      await p.goto("/");
      const button = p.getByRole("button", {
        name: "Begin the descent",
        exact: true,
      });
      await expect(button).toBeVisible();
      await expect(button).toHaveText("Begin the descent");
      await expect(p).toHaveTitle("Malevolent Gods: The Drowned Labyrinth");
      await expect(p.locator("#title-heading")).toHaveText(
        "Malevolent Gods: The Drowned Labyrinth",
      );
      const headingBox = await p.locator("#title-heading").boundingBox();
      const buttonBox = await button.boundingBox();
      expect(
        buttonBox.y - headingBox.y - headingBox.height,
      ).toBeGreaterThanOrEqual(16);
      expect(
        buttonBox.y - headingBox.y - headingBox.height,
      ).toBeLessThanOrEqual(48);
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      expect(buttonBox.width).toBeLessThan(viewport.width);
      await p.locator("#title-screen").click({ position: { x: 10, y: 10 } });
      await expect(p.locator("#title-screen")).toBeVisible();
      await p.locator("#title-heading").click();
      await expect(p.locator("#title-screen")).toBeVisible();
      // Establish focus explicitly: blank-area clicks retain focus differently across engines.
      await button.focus();
      await expect(button).toBeFocused();
      await p.keyboard.press("Enter");
      await expect(p.locator("#dungeon-main")).toBeVisible();
    } finally {
      await f.dispose();
    }
  });
  // Text enlargement and failed optional resources must leave core controls reachable.
  test(`entry resilience ${viewport.width} at 200% text`, async ({
    browser,
  }) => {
    const storage = structuredClone(resting.raw);
    const character = JSON.parse(storage.playerData);
    character.name = "Keeper".repeat(40);
    storage.playerData = JSON.stringify(character);
    const f = await createLegacyBrowserFixture(browser, {
      storage,
      randomTape: [],
      viewport,
    });
    try {
      const p = f.page;
      await p.emulateMedia({ reducedMotion: "reduce" });
      await p.route(
        "**/assets/{bgm,sfx}/**",
        /* Model blocked audio separately from the external-resource fixture. */ (
          route,
        ) => route.abort(),
      );
      await p.goto("/");
      await p.addStyleTag({ content: "html { font-size: 200%; }" });
      await expect(p.locator("#title-screen")).toBeVisible();
      const motion = await p.evaluate(
        // Inspect the actual title, loader and combat/damage selectors under reduced motion.
        () => {
          const probe = document.createElement("span");
          probe.className = "animation-shake dmg-numbers";
          document.body.append(probe);
          const values = [
            document.querySelector("#title-prompt"),
            document.querySelector(".loader"),
            probe,
          ].map(
            /* CSS animation duration must be suppressed for each moving surface. */ (
              node,
            ) => getComputedStyle(node).animationName,
          );
          probe.remove();
          return values;
        },
      );
      expect(motion).toEqual(["none", "none", "none"]);
      await p.locator("#title-action").click();
      await expect(p.locator("#dungeon-main")).toBeVisible();
      await p.evaluate(
        /* Muted sound cannot disable navigation. */ () => Howler.mute(true),
      );
      expect(
        await p.evaluate(
          /* Detect horizontal overflow from an unbroken saved name. */ () =>
            document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await p.getByRole("button", { name: "Open inventory" }).click();
      await p.locator("#menu-btn").click();
      await p.locator("#volume-btn").click();
      await expect(p.getByRole("slider", { name: /Master/ })).toBeVisible();
      await p.locator("#apply-volume").click();
      await p.keyboard.press("Escape");
      await expect(p.locator("#menuModal")).toBeVisible();
      await p.keyboard.press("Escape");
      await p.locator("#dungeonActivity").focus();
      await expect(p.locator("#dungeonActivity")).toBeFocused();
    } finally {
      await f.dispose();
    }
  });
}
