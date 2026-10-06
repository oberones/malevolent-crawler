/* global document */
import { test, expect } from "@playwright/test";
import { encounters, variants } from "../../assets/js/content/encounters.mjs";

// Exercise the existing presentation seam so red fails on behavior, not a missing module.
test("all active portraits reserve catalog geometry without touching state or RNG", async ({
  page,
}) => {
  await page.goto("/tests/fixtures/services.html");
  const results = await page.evaluate(
    // Keep assets unavailable while measuring the space reserved before decoding.
    async () => {
      const { createOutcomeView } =
        await import("/assets/js/app/outcome-view.mjs");
      const { encounters, variants } =
        await import("/assets/js/content/encounters.mjs");
      document.querySelector("#output").innerHTML =
        '<div id="enemyPanel" style="width:400px"><p></p><img id="enemy-sprite"></div><div id="log"></div>';
      const view = createOutcomeView(document);
      const random = Math.random;
      // Any presentation draw is a contract violation, even when its result is unused.
      Math.random = () => {
        throw new Error("Presentation consumed RNG");
      };
      try {
        return variants
          .filter(
            /* The unused art obligation must never become an encounter. */ (
              v,
            ) => !v.unusedButRequired,
          )
          .map(
            // Repeated rendering must preserve each selected variant and every input field.
            (variant) => {
              const identity = encounters.find(
                /* Join the immutable identity owning this variant. */ (e) =>
                  e.id === variant.encounterId,
              );
              const enemy = {
                name: identity.legacyName,
                image: structuredClone(variant.legacyImage),
                lvl: 17,
                stats: { hp: 42 },
                rewards: { gold: 23 },
              };
              const before = JSON.stringify(enemy);
              view.encounter(enemy);
              view.encounter(enemy);
              view.renderLog(
                document.querySelector("#log"),
                view.record("event.encounter", { encounter: enemy.name }),
              );
              const image = document.querySelector("#enemy-sprite");
              return {
                id: variant.id,
                name: document.querySelector("#enemyPanel > p").textContent,
                log: document.querySelector("#log").textContent,
                src: image.getAttribute("src"),
                alt: image.alt,
                width: image.getAttribute("width"),
                height: image.getAttribute("height"),
                cssWidth: image.style.width,
                ratio: image.style.aspectRatio,
                unchanged: before === JSON.stringify(enemy),
              };
            },
          );
      } finally {
        Math.random = random;
      }
    },
  );
  expect(results).toHaveLength(52);
  expect(
    new Set(
      variants
        .filter(/* Count active identities only. */ (v) => !v.unusedButRequired)
        .map(/* Join unique identities. */ (v) => v.encounterId),
    ).size,
  ).toBe(51);
  for (const result of results) {
    const variant = variants.find(
      /* Select expected authored geometry. */ (v) => v.id === result.id,
    );
    const identity = encounters.find(
      /* Select expected authored name. */ (e) => e.id === variant.encounterId,
    );
    expect.soft(result.name).toBe(`${identity.displayName} Lv.17`);
    expect.soft(result.log).toContain(identity.displayName);
    expect.soft(result).toMatchObject({
      src: variant.path,
      alt: variant.alt,
      width: String(variant.width),
      height: String(variant.height),
      cssWidth: variant.legacyImage.size,
      ratio: `${variant.width} / ${variant.height}`,
      unchanged: true,
    });
  }
});

// Rejected identities must not partially replace a valid portrait or construct unsafe URLs.
test("unknown, mismatched and unused identities leave the existing view intact", async ({
  page,
}) => {
  await page.goto("/tests/fixtures/services.html");
  const result = await page.evaluate(
    // Test the public boundary with hostile data without interpolating it into HTML.
    async () => {
      const { createOutcomeView } =
        await import("/assets/js/app/outcome-view.mjs");
      document.querySelector("#output").innerHTML =
        '<div id="enemyPanel"><p></p><img id="enemy-sprite"></div>';
      const view = createOutcomeView(document);
      view.encounter({
        name: "Goblin",
        image: { name: "goblin", type: ".png", size: "50%" },
        lvl: 1,
      });
      const before = document.querySelector("#output").innerHTML;
      const failures = [];
      for (const [name, image] of [
        ["<img src=x>", "goblin"],
        ["Goblin", "skeleton_mage1"],
        ["Goblin", "spider_spirit"],
        ["Goblin", "../../evil"],
      ]) {
        try {
          view.encounter({ name, image, lvl: 1 });
          failures.push(false);
        } catch (error) {
          failures.push(
            error instanceof TypeError &&
              before === document.querySelector("#output").innerHTML,
          );
        }
      }
      return failures;
    },
  );
  expect(result).toEqual([true, true, true, true]);
});
