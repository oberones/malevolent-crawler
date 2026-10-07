import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { artObligations } from "../../scripts/art-obligations.mjs";
import { inspectPng } from "../../scripts/image-inspection.mjs";
import { inspectIco } from "../../scripts/pack-ico.mjs";
import { sha256 } from "../../scripts/art-common.mjs";
const manifest = JSON.parse(await readFile("art/cosmic-horror/manifest.json"));
const baseline = JSON.parse(await readFile("art/cosmic-horror/baseline.json"));
// Verify the authored fallback contract independently of the older manifest path.
test("fallback obligation names the delivered recovery image", () => {
  assert.equal(artObligations(baseline).at(-1).path, "assets/art/fallback.png");
});
for (const entry of manifest.entries) {
  // Audit bytes, source provenance and immutable originals without claiming visual geometry.
  test(`${entry.id}: complete collection delivery is traceable`, async () => {
    const bytes = await readFile(entry.delivered.path);
    const decoded = entry.delivered.path.endsWith(".ico")
      ? await inspectIco(bytes)
      : await inspectPng(bytes, entry.delivered);
    assert.equal(decoded.sha256, entry.delivered.sha256);
    assert.equal(decoded.alpha, true);
    assert.equal(decoded.width, entry.delivered.width);
    assert.equal(decoded.height, entry.delivered.height);
    const generation = entry.generation;
    assert.equal(
      sha256(await readFile(generation.masterPath)),
      generation.masterSha256,
    );
    assert.ok((await readFile(generation.promptPath)).length > 0);
    assert.equal(generation.provenance.tool, "image_gen.imagegen");
    assert.ok(
      generation.provenance.sourcePath || generation.provenance.sourceUrl,
    );
    if (entry.baseline) {
      assert.equal(
        sha256(await readFile(entry.baseline.snapshotPath)),
        entry.baseline.sha256,
      );
      assert.notEqual(decoded.sha256, entry.baseline.sha256);
      assert.equal(decoded.width, entry.baseline.width);
      assert.equal(decoded.height, entry.baseline.height);
    }
    assert.equal(entry.review.status, "PASS");
  });
}
