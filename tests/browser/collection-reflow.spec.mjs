/* global document, getComputedStyle, playerLoadStats, allocationPopup */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "../helpers/browser-fixtures.mjs";
const resting = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases.find(
  // Exercise real stat and allocation renderers from supported saved progress.
  (row) => row.id === "resting",
);
for (const screen of ["stats", "allocation"]) {
  // Enlarged labels and values must remain inside the visible panel at narrow width.
  test(`collection ${screen} readable at 360px and 200% text`, async ({
    browser,
  }) => {
    const f = await createLegacyBrowserFixture(browser, {
      storage: resting.raw,
      viewport: { width: 360, height: 800 },
    });
    try {
      await f.page.goto("/");
      await expect(f.page.locator("#title-screen")).toBeVisible();
      const failures = await f.page.evaluate(
        // Measure text ranges rather than only a clipped element's outer box.
        (screen) => {
          document.querySelector("#title-screen").style.display = "none";
          document.querySelector("#dungeon-main").style.display = "flex";
          playerLoadStats();
          if (screen === "allocation") allocationPopup();
          const sizes = [...document.querySelectorAll("body *")].map(
            // Snapshot before changing inheritance, matching the geometry fixture's text scale.
            (node) => [node, parseFloat(getComputedStyle(node).fontSize) * 2],
          );
          for (const [node, size] of sizes) node.style.fontSize = `${size}px`;
          const selector =
            screen === "stats"
              ? "#dungeon-main .stat-panel .box"
              : "#allocate-stats";
          const failures = [];
          for (const panel of document.querySelectorAll(selector)) {
            const box = panel.getBoundingClientRect();
            for (const line of panel.querySelectorAll("p, h4")) {
              if (screen === "stats") {
                for (const text of line.childNodes) {
                  if (text.nodeType !== 3 || !text.textContent.trim()) continue;
                  const label = document.createRange();
                  const start = text.textContent.search(/\S/);
                  label.setStart(text, start);
                  label.setEnd(text, text.textContent.trimEnd().length);
                  if (label.getClientRects().length > 1)
                    failures.push(
                      `split stat label: ${text.textContent.trim()}`,
                    );
                }
              }
              const range = document.createRange();
              range.selectNodeContents(line);
              for (const rect of range.getClientRects())
                if (
                  rect.width &&
                  (rect.left < box.left || rect.right > box.right)
                )
                  failures.push(line.textContent);
            }
          }
          if (screen === "allocation") {
            const heading =
              document.querySelector("#allocate-stats h3").firstChild;
            for (const word of heading.textContent.matchAll(/\S+/g)) {
              const range = document.createRange();
              range.setStart(heading, word.index);
              range.setEnd(heading, word.index + word[0].length);
              if (range.getClientRects().length > 1)
                failures.push(`split heading word: ${word[0]}`);
            }
            for (const label of document.querySelectorAll(
              '#allocate-stats [id$="Display"]',
            )) {
              const range = document.createRange();
              range.selectNodeContents(label);
              if (range.getClientRects().length > 1)
                failures.push(`split label: ${label.textContent}`);
            }
          }
          return failures;
        },
        screen,
      );
      expect(failures).toEqual([]);
    } finally {
      await f.dispose();
    }
  });
}
