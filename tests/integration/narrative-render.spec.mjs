/* global document */
import { test, expect } from "@playwright/test";
// Real DOM integration verifies authored templates cooperate with the existing safe renderer.
test("narrative renders player text inertly and catalog names consistently", async ({
  page,
}) => {
  await page.goto("/tests/fixtures/services.html");
  const result = await page.evaluate(
    /* Compose hostile text through the production rendering boundary. */ async () => {
      const { createSafeRenderer } =
        await import("/assets/js/app/safe-render.mjs");
      const { messageSchemas: schemas, messageTemplates: templates } =
        await import("/assets/js/content/messages.mjs");
      const renderer = createSafeRenderer(document, { schemas, templates });
      const name =
        'Goblin <img src=x onerror="globalThis.executed=true"> $& 雨';
      const output = document.querySelector("#output");
      globalThis.executed = false;
      output.append(
        renderer.renderMessage({
          id: "combat.playerHit",
          params: { player: name, encounter: "Goblin", damage: 12.5 },
        }),
      );
      output.append(
        renderer.renderMessage({
          id: "inventory.item",
          params: { relic: "Sword", rarity: "Rare", level: 3, tier: 2 },
        }),
      );
      let rejected = false;
      try {
        output.append(
          renderer.renderMessage({
            id: "event.encounter",
            params: { encounter: "../../evil" },
          }),
        );
      } catch (error) {
        rejected = error instanceof TypeError;
      }
      return {
        text: output.textContent,
        name,
        executed: globalThis.executed,
        rejected,
        elements: output.childElementCount,
      };
    },
  );
  expect(result.text).toContain(result.name);
  expect(result.text).toContain("12.5");
  expect(result.text).toContain("Tideglass Edge");
  expect(result.text).not.toContain("to Goblin.");
  expect(result).toMatchObject({
    executed: false,
    rejected: true,
    elements: 0,
  });
});
