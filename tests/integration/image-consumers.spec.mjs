/* global document, gameServices */
import { test, expect } from "@playwright/test";
// Removed symbol trees must release image handlers even when classic code replaces the parent.
test("symbol removal and explicit teardown dispose pending owners", async ({
  page,
}) => {
  await page.route(
    "**/assets/art/relic-*.png",
    // Hold network completion independently of removal timing.
    (route) => route.abort(),
  );
  await page.goto("/tests/fixtures/services.html");
  const result = await page.evaluate(
    // Exercise repeated mounting, moving, removal and final owner teardown.
    async () => {
      const { createSymbolView } =
        await import("/assets/js/app/symbol-view.mjs");
      const symbol = createSymbolView(document);
      const output = document.querySelector("#output");
      const states = [];
      for (let i = 0; i < 10; i++) {
        const node = symbol("Sword", "sword/detail");
        output.append(node);
        output.prepend(node);
        await Promise.resolve();
        states.push(
          node.querySelector("img").dataset.imageState !== "disposed",
        );
        node.remove();
        await Promise.resolve();
        states.push(
          node.querySelector("img").dataset.imageState === "disposed",
        );
        states.push(!node.querySelector("img").hasAttribute("src"));
      }
      const last = symbol("Sword", "sword/detail");
      output.append(last);
      symbol.dispose();
      symbol.dispose();
      states.push(last.querySelector("img").dataset.imageState === "disposed");
      return states;
    },
  );
  expect(result).toEqual(Array(31).fill(true));
});

// Teardown is a public callback and must release all image owners without a bound receiver.
test("game service teardown can be passed as an unbound callback", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#character-creation")).toBeVisible();
  const result = await page.evaluate(
    // The classic bridge exposes its single service owner in this lexical environment.
    () => {
      const { dispose } = gameServices;
      dispose();
      dispose();
      return [...document.querySelectorAll(".inline-symbol img")].every(
        // Every mounted image must be invalidated along with storage and dialog resources.
        (image) => image.dataset.imageState === "disposed",
      );
    },
  );
  expect(result).toBe(true);
});
