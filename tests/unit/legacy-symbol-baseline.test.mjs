import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const repository = new URL("../../", import.meta.url);
// Read saved evidence as data, without running a fresh capture or replacing its bytes.
function readJson(path) {
  return JSON.parse(readFileSync(new URL(path, repository)));
}
const baseline = readJson("art/cosmic-horror/baseline.json");
const corpus = readJson("tests/fixtures/legacy/symbol-contexts.json");
const environment = readJson("validation/cosmic-horror/environment.json");
// Known role/context obligations detect omissions even if a capture silently shrinks its own list.
test("symbol context inventory covers all 24 roles and 111 distinct original placements", () => {
  assert.equal(corpus.contexts.length, 111);
  assert.equal(
    new Set(
      corpus.contexts.map(
        // IDs distinguish shared glyphs and dynamic rendering locations.
        (row) => row.id,
      ),
    ).size,
    111,
  );
  const counts = new Map();
  for (const row of corpus.contexts)
    counts.set(row.role, (counts.get(row.role) ?? 0) + 1);
  for (const category of [
    "Sword",
    "Axe",
    "Hammer",
    "Dagger",
    "Flail",
    "Scythe",
    "Plate",
    "Chain",
    "Leather",
    "Tower",
    "Kite",
    "Buckler",
    "Great Helm",
    "Horned Helm",
  ])
    assert.equal(counts.get(category), 6, category);
  for (const stat of ["health", "attack", "defense", "attack-speed"])
    assert.equal(counts.get(stat), 3, stat);
  for (const stat of ["vampirism", "critical-rate", "critical-damage"])
    assert.equal(counts.get(stat), 2, stat);
  assert.equal(counts.get("title"), 1);
  assert.equal(counts.get("treasure"), 2);
  assert.equal(counts.get("currency"), 6);
  assert.equal(counts.size, 24);
});
// Baseline metadata must link every tuple to intact evidence on its actual recorded engine.
test("frozen automated geometry and screenshots cover the complete three-engine matrix", () => {
  const rows = baseline.contexts.filter(
    // Only actual automated captures may contribute to a measured baseline pass.
    (row) => row.status === "PASS",
  );
  assert.equal(rows.length, 1998);
  const keys = new Set();
  for (const row of rows) {
    const key = `${row.browser.name}/${row.viewport.width}/${row.textScale}/${row.id}`;
    assert.equal(keys.has(key), false, key);
    keys.add(key);
    assert.equal(row.fontStatus, "loaded");
    assert.equal(row.dpr, 1);
    assert.ok(row.box.width > 0 && row.box.height > 0);
    assert.ok(Number.isFinite(row.baselineOffset));
    const target = environment.automatedBrowsers.find(
      // A patch engine's actual version is not a substitute for a native target.
      (entry) => entry.name === row.browser.name,
    );
    assert.equal(row.browser.version, target.version);
    assert.equal(
      row.environmentFile,
      "validation/cosmic-horror/environment.json",
    );
    const bytes = readFileSync(new URL(row.screenshot, repository));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      row.screenshotSha256,
      key,
    );
  }
  for (const engine of ["chromium", "firefox", "webkit"])
    for (const width of [360, 768, 1440])
      for (const scale of [1, 2])
        for (const context of corpus.contexts)
          assert.ok(keys.has(`${engine}/${width}/${scale}/${context.id}`));
});
// Missing native measurements must stay explicit rather than inheriting emulated geometry.
test("all native baseline tuples remain blocked until separately captured", () => {
  const blocked = baseline.contexts.filter(
    // Native rows lack boxes and screenshots until real matched measurements exist.
    (row) => row.status === "BLOCKED",
  );
  assert.equal(blocked.length, 7 * 3 * 2 * 111);
  const keys = new Set();
  for (const row of blocked) {
    const key = `${row.target}/${row.viewport.width}/${row.textScale}/${row.id}`;
    assert.ok(!keys.has(key));
    keys.add(key);
    assert.ok(row.reason);
    assert.equal(row.box, undefined);
    assert.equal(row.screenshot, undefined);
  }
  for (const target of environment.nativeTargets)
    for (const viewport of environment.viewports)
      for (const scale of environment.textScales)
        for (const context of corpus.contexts)
          assert.ok(
            keys.has(`${target.id}/${viewport.width}/${scale}/${context.id}`),
          );
});
