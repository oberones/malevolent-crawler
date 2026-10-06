/* global document, FontFace */
import { test, expect } from "@playwright/test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { measureSymbols, writeBaseline } from "../helpers/measure-symbols.mjs";
// Fixed CSS provides known geometry independent of the legacy rendering or capture code.
test.beforeEach(async ({ page }) => {
  await page.setContent(
    '<style>body{margin:0}p{margin:0;font:20px/30px monospace}i{display:inline-block;width:12px;height:16px;margin-right:7px;vertical-align:baseline}</style><p><i id="icon"></i>Text</p>',
  );
});
// Flex-column siblings occupy separate lines; their top edge is not the glyph baseline.
test("a flex-item symbol uses its own text baseline", async ({ page }) => {
  await page.setContent(
    '<style>body{margin:0}.column{display:flex;flex-direction:column;align-items:center}#glyph{font:20px/30px monospace}#reference{display:inline-block;width:0;height:0;vertical-align:baseline}</style><div class="column"><i id="glyph">A<span id="reference"></span></i><p>Next line</p></div>',
  );
  const before = await page.content();
  const reference = await page.locator("#reference").boundingBox();
  const [row] = await measureSymbols(page, [
    { id: "flex", selector: "#glyph" },
  ]);
  expect(row.baselineOffset).toBeCloseTo(reference.y - row.box.y, 1);
  expect(await page.content()).toBe(before);
});
// Transparent ancestors must not create accepted measurements for invisible content.
test("transparent ancestors reject and duplicate context IDs reject", async ({
  page,
}) => {
  await expect(
    measureSymbols(page, [
      { id: "same", selector: "#icon" },
      { id: "same", selector: "#icon" },
    ]),
  ).rejects.toThrow(/Duplicate/);
  await page.locator("p").evaluate(
    // Keep layout dimensions intact while making the symbol unobservable.
    (node) => {
      node.style.opacity = "0";
    },
  );
  await expect(
    measureSymbols(page, [{ id: "transparent", selector: "#icon" }]),
  ).rejects.toThrow(/visible/);
});
// Measure an independently sized symbol and verify probes leave the DOM untouched.
test("geometry, spacing, baseline and font metadata are measured without mutation", async ({
  page,
}) => {
  const before = await page.content();
  const rows = await measureSymbols(page, [{ id: "known", selector: "#icon" }]);
  expect(rows).toHaveLength(1);
  expect(rows[0].box.width).toBe(12);
  expect(rows[0].box.height).toBe(16);
  expect(rows[0].marginRight).toBe("7px");
  expect(rows[0].lineHeight).toBe("30px");
  expect(rows[0].verticalAlign).toBe("baseline");
  expect(rows[0].baselineOffset).toBeCloseTo(16, 1);
  expect(rows[0].dpr).toBe(1);
  expect(rows[0].fontStatus).toBe("loaded");
  expect(rows[0].fontFamily).toContain("monospace");
  expect(await page.content()).toBe(before);
});
// Missing nodes must not become zero-sized baselines that later pass comparison.
test("missing, ambiguous and hidden selectors reject", async ({ page }) => {
  await expect(
    measureSymbols(page, [{ id: "missing", selector: "#absent" }]),
  ).rejects.toThrow(/exactly one/);
  await page.locator("#icon").evaluate(
    // Hide the fixture while retaining its selector.
    (node) => {
      node.style.display = "none";
    },
  );
  await expect(
    measureSymbols(page, [{ id: "hidden", selector: "#icon" }]),
  ).rejects.toThrow(/visible/);
  await expect(
    measureSymbols(page, [{ id: "multiple", selector: "body *" }]),
  ).rejects.toThrow(/exactly one/);
});
// A declared unavailable font cannot be recorded as an accepted fallback measurement.
test("font readiness is awaited and a missing declared face rejects", async ({
  page,
}) => {
  await page.evaluate(
    // An invalid font source deterministically supplies a failed local font face.
    () => {
      const face = new FontFace(
        "UnavailableFixture",
        "url(data:font/woff2;base64,AAAA)",
      );
      document.fonts.add(face);
    },
  );
  await expect(
    measureSymbols(page, [
      {
        id: "font",
        selector: "#icon",
        requiredFont: '20px "UnavailableFixture"',
      },
    ]),
  ).rejects.toThrow(/font/i);
});
// Exclusive creation protects established evidence even when a capture is rerun.
test("baseline writes preserve existing bytes", async () => {
  const directory = await mkdtemp(join(tmpdir(), "crawler-symbols-"));
  const path = join(directory, "baseline.json");
  try {
    await writeBaseline(path, { known: 12 });
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual({ known: 12 });
    await expect(writeBaseline(path, { known: 99 })).rejects.toThrow(/EEXIST/);
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual({ known: 12 });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
