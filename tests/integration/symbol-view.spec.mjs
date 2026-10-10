/* global document, getComputedStyle */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const baseline = JSON.parse(
  readFileSync("tests/fixtures/layout/symbol-metrics.json"),
);
const corrections = JSON.parse(
  readFileSync("tests/fixtures/layout/relic-offsets.json"),
).corrections;
for (const width of [360, 768, 1440])
  for (const scale of [1, 2]) {
    // Compare independent frozen glyph metrics, including baseline and spacing, with fixture-only images.
    test(`relic symbol geometry ${width} / ${scale}`, async ({
      page,
      browserName,
    }) => {
      await page.setViewportSize({
        width,
        height: width === 360 ? 800 : width === 768 ? 1024 : 900,
      });
      await page.route(
        "**/assets/art/relic-*.png",
        /* Art availability must not establish geometry. */ (route) =>
          route.fulfill({
            contentType: "image/svg+xml",
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="3" height="7"><rect width="3" height="7" fill="red"/></svg>',
          }),
      );
      await page.goto("/tests/fixtures/services.html");
      const rows = baseline.contexts.filter(
        /* Match independently captured engine/viewport/text tuples. */ (r) =>
          r.status === "PASS" &&
          r.browser.name === browserName &&
          r.viewport.width === width &&
          r.textScale === scale &&
          [
            "inventory",
            "equipped",
            "detail",
            "sale",
            "dungeon-reward",
            "combat-reward",
          ].includes(r.stage) &&
          !r.id.startsWith("currency/"),
      );
      const results = await page.evaluate(
        /* Measure local baseline probes after font loading. */ async (
          rows,
        ) => {
          for (const href of [
            "/assets/css/style.css",
            "/assets/css/rpg-awesome.min.css",
          ]) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            document.head.append(link);
            await new Promise(
              /* Await each local stylesheet. */ (resolve) =>
                (link.onload = resolve),
            );
          }
          const { createSymbolView } =
            await import("/assets/js/app/symbol-view.mjs");
          const symbol = createSymbolView(document);
          await document.fonts.load("16px RPGAwesome");
          const output = document.querySelector("#output");
          const results = [];
          for (const row of rows) {
            const line = document.createElement("div");
            line.style.fontSize = row.fontSize;
            const node = symbol(row.role, row.id, { decorative: false });
            const probe = document.createElement("span");
            probe.style.cssText = "display:inline-block;width:0;height:0";
            line.append(node, probe);
            output.append(line);
            const reference = document.createElement("i");
            reference.className = "ra ra-relic-blade";
            reference.style.marginLeft = row.marginLeft;
            reference.style.marginRight = row.marginRight;
            const referenceLine = document.createElement("div");
            referenceLine.style.fontSize = row.fontSize;
            const referenceProbe = probe.cloneNode();
            referenceLine.append(reference, referenceProbe);
            output.append(referenceLine);
            const legacyOffset =
              referenceProbe.getBoundingClientRect().y -
              reference.getBoundingClientRect().y;
            const box = node.getBoundingClientRect(),
              css = getComputedStyle(node),
              p = probe.getBoundingClientRect(),
              img = node.querySelector("img");
            results.push({
              legacyOffset,
              width: box.width,
              height: box.height,
              baseline: p.y - box.y,
              left: parseFloat(css.marginLeft),
              right: parseFloat(css.marginRight),
              alt: img?.alt,
              src: img?.getAttribute("src"),
              imageMargin: img ? getComputedStyle(img).marginTop : null,
            });
          }
          return results;
        },
        rows,
      );
      expect(rows).toHaveLength(84);
      for (const [i, row] of rows.entries()) {
        const actual = results[i];
        expect(actual.src).toBe(
          `/assets/art/relic-${row.id.split("/")[0]}.png`,
        );
        const correction = corrections.find(
          /* Apply only the exact remeasured immutable-source tuple. */ (r) =>
            r.id === row.id &&
            r.browser === browserName &&
            r.viewportWidth === width &&
            r.textScale === scale,
        );
        expect(
          Math.abs(
            actual.legacyOffset -
              (correction?.baselineOffset ?? row.baselineOffset),
          ),
        ).toBeLessThanOrEqual(0.5);
        expect(actual.alt).toBeTruthy();
        expect(actual.imageMargin).toBe("0px");
        for (const [key, expected] of Object.entries({
          width: row.box.width,
          height: row.box.height,
          baseline: actual.legacyOffset,
          left: parseFloat(row.marginLeft),
          right: parseFloat(row.marginRight),
        }))
          expect(
            Math.abs(actual[key] - expected),
            `${row.id} ${key}`,
          ).toBeLessThanOrEqual(0.5);
      }
    });
  }
// Reject caller paths/mismatched contexts and distinguish repeated decorative art from informative art.
test("symbol identity and alternatives are catalog owned", async ({ page }) => {
  await page.goto("/tests/fixtures/services.html");
  const result = await page.evaluate(
    /* Try hostile identity and cross-role contexts without touching game state. */ async () => {
      const { createSymbolView } =
        await import("/assets/js/app/symbol-view.mjs");
      const symbol = createSymbolView(document);
      const rejected = [];
      for (const [role, context] of [
        ["https://evil.invalid/x", "sword/detail"],
        ["Sword", "axe/detail"],
      ]) {
        try {
          symbol(role, context);
          rejected.push(false);
        } catch {
          rejected.push(true);
        }
      }
      const node = symbol("Sword", "sword/detail");
      return {
        rejected,
        hiddenImage: node.querySelector("img")?.getAttribute("aria-hidden"),
        hidden: node.getAttribute("aria-hidden"),
      };
    },
  );
  expect(result).toEqual({
    rejected: [true, true],
    hiddenImage: "true",
    hidden: "true",
  });
});
