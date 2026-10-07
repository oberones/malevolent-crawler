import { chromium, firefox, webkit } from "@playwright/test";
import process from "node:process";
import console from "node:console";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { symbols } from "../../../../assets/js/content/symbols.mjs";
import { artProofContexts } from "../../../../tests/helpers/art-proof-contexts.mjs";
const baseline = JSON.parse(await readFile("art/cosmic-horror/baseline.json"));
const batch = process.argv[2];
const ids = process.argv.slice(3);
const root = `art/cosmic-horror/batches/${batch}`;
await mkdir(root, { recursive: true });
const records = [];
for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch();
  try {
    for (const width of [360, 768, 1440])
      for (const scale of [1, 2]) {
        const viewport = {
          width,
          height: width === 360 ? 800 : width === 768 ? 1024 : 900,
        };
        const page = await browser.newPage({ viewport });
        let body = "";
        const rows = [];
        for (const id of ids) {
          const bytes = await readFile(`assets/art/${id}.png`);
          const symbol = symbols.find(
            /* Resolve the explicit catalog mapping. */ (entry) =>
              entry.id === id,
          );
          if (!symbol) throw new Error(`Unknown symbol: ${id}`);
          const contexts = artProofContexts({
            symbol,
            contexts: baseline.contexts,
            browser: name,
            viewport,
            textScale: scale,
          });
          for (const row of contexts) {
            const key = `sample-${rows.length}`;
            body += `<div class="sample"><div>${id} · ${row.stage} · ${row.box.width.toFixed(2)} × ${row.box.height.toFixed(2)}</div><div class="swatches"><span><img id="${key}" src="data:image/png;base64,${bytes.toString("base64")}" style="width:${row.box.width}px;height:${row.box.height}px" alt="${id}"> Themed symbol</span><span class="light"><img src="data:image/png;base64,${bytes.toString("base64")}" style="width:${row.box.width}px;height:${row.box.height}px" alt=""> Symbol</span></div></div>`;
            rows.push({ id, context: row.id, baseline: row, key });
          }
        }
        await page.setContent(
          `<html><head><style>body{background:#111923;color:#ded8c6;font:14px sans-serif;margin:12px}h1{font-size:18px}.sample{padding:8px 0;border-bottom:1px solid #43565f}.swatches{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:5px}.swatches span{padding:5px;display:flex;gap:5px;align-items:center}.light{background:#ded8c6;color:#111923}img{object-fit:contain;margin:0;flex:none}</style></head><body><h1>${batch} — ${name} ${width} / ${scale * 100}%</h1><p>Art proof at measured sizes; not integrated UI geometry.</p>${body}</body></html>`,
        );
        await page
          .locator("img")
          .evaluateAll(
            /* Await full image decode before evidence capture. */ async (
              images,
            ) =>
              Promise.all(
                images.map(
                  /* Decode each authored asset. */ (image) => image.decode(),
                ),
              ),
          );
        const capture = `${root}/${ids.length === 1 ? "pilot-" : ""}${name}-${width}-${scale}.png`;
        const screenshot = await page.screenshot({ fullPage: true });
        await writeFile(capture, screenshot, { flag: "wx" });
        for (const row of rows) {
          const actual = await page.locator(`#${row.key}`).boundingBox();
          if (
            Math.abs(actual.width - row.baseline.box.width) > 0.5 ||
            Math.abs(actual.height - row.baseline.box.height) > 0.5
          )
            throw Error("Size mismatch");
          records.push({
            id: row.id,
            contextId: row.context,
            browser: { name, version: browser.version() },
            viewport,
            textScale: scale,
            baselineScreenshot: row.baseline.screenshot,
            baselineBox: row.baseline.box,
            renderedBox: actual,
            screenshot: capture,
            screenshotSha256: createHash("sha256")
              .update(screenshot)
              .digest("hex"),
            scope:
              "Isolated art proof at immutable measured size; no live UI geometry or native qualification",
            status: "PASS",
          });
        }
        await page.close();
      }
  } finally {
    await browser.close();
  }
}
await writeFile(
  `${root}/${ids.length === 1 ? "pilot-" : ""}context-proofs.json`,
  JSON.stringify(records, null, 2) + "\n",
  { flag: "wx" },
);
console.log(`${records.length} measured-size proofs captured`);
