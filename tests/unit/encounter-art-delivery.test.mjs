import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { variants } from "../../assets/js/content/encounters.mjs";
import { artObligations } from "../../scripts/art-obligations.mjs";
import { inspectPng } from "../../scripts/image-inspection.mjs";
import {
  sha256,
  readNonempty,
  validateReview,
} from "../../scripts/art-common.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
// Read checked-in delivery evidence without altering source or baseline files.
async function json(path) {
  return JSON.parse(await readFile(new URL(`../../${path}`, import.meta.url)));
}
const manifest = await json("art/cosmic-horror/manifest.json");
const baseline = await json("art/cosmic-horror/baseline.json");
const batches = [];
for (const directory of await readdir(`${root}/art/cosmic-horror/batches`)) {
  const path = `art/cosmic-horror/batches/${directory}/generation.json`;
  for (const entry of (await json(path)).entries)
    if (entry.id.startsWith("sprite-")) batches.push({ entry, path });
}
const required = artObligations(baseline).filter(
  // Other collection packages must remain outside encounter qualification.
  (row) => row.kind === "sprite",
);

// Missing/duplicate records must fail before a collection can claim delivered coverage.
test("all 53 creature obligations have one batch and one integrated delivery", () => {
  assert.equal(required.length, 53);
  assert.equal(batches.length, 53);
  assert.equal(
    new Set(batches.map(/* Count exact asset IDs. */ (r) => r.entry.id)).size,
    53,
  );
  assert.equal(manifest.entries.length, 80);
  for (const obligation of required) {
    const rows = manifest.entries.filter(
      /* Match exact obligation. */ (r) => r.id === obligation.id,
    );
    assert.equal(rows.length, 1, obligation.id);
    assert.match(
      rows[0].delivered.sha256 ?? "",
      /^[a-f0-9]{64}$/,
      `${obligation.id}: missing delivered hash`,
    );
  }
});

for (const obligation of required) {
  // Independently decode both source and output; retain batch provenance and unperformed human review.
  test(`${obligation.id}: exact transparent delivery and truthful provenance`, async () => {
    const entry = manifest.entries.find(
      /* Resolve this manifest row. */ (r) => r.id === obligation.id,
    );
    const batch = batches.find(
      /* Resolve independently authored batch evidence. */ (r) =>
        r.entry.id === obligation.id,
    );
    for (const key of [
      "id",
      "kind",
      "identityId",
      "legacySource",
      "aliases",
      "unusedButRequired",
      "contextIds",
      "baseline",
    ])
      assert.deepEqual(entry[key], obligation[key], key);
    const { transform, ...delivered } = batch.entry.delivered;
    assert.equal(delivered.path, obligation.path);
    assert.deepEqual(entry.delivered, delivered);
    assert.deepEqual(entry.transform, transform);
    assert.equal(entry.batchRecord, batch.path);
    assert.deepEqual(entry.generation.provenance, batch.entry.generation);
    assert.equal(
      entry.generation.timestamp,
      batch.entry.generation.generatedAt,
    );
    for (const key of ["promptPath", "masterPath", "masterSha256"])
      assert.equal(entry.generation[key], batch.entry.generation[key]);
    await readNonempty(root, entry.generation.promptPath);
    const master = await readNonempty(root, entry.generation.masterPath);
    assert.equal(sha256(master), entry.generation.masterSha256);
    await inspectPng(master, await sharp(master).metadata());
    const decoded = await inspectPng(
      await readNonempty(root, entry.delivered.path),
      obligation,
    );
    assert.deepEqual(decoded, {
      width: delivered.width,
      height: delivered.height,
      alpha: true,
      sha256: delivered.sha256,
    });
    assert.notEqual(decoded.sha256, obligation.baseline.sha256);
    assert.equal(
      sha256(await readNonempty(root, obligation.baseline.snapshotPath)),
      obligation.baseline.sha256,
    );
    assert.deepEqual(entry.batchReview, batch.entry.review);
    assert.notDeepEqual(
      entry.review,
      entry.batchReview,
      "Keep human and agent review separate",
    );
    if (entry.review.status === "PASS")
      await validateReview(root, entry.review);
    else
      assert.equal(
        entry.review.status,
        "OPEN",
        "Unperformed human review stays open",
      );
    assert.equal(
      entry.unusedButRequired,
      variants.find(
        /* Match immutable path. */ (v) => v.path === delivered.path,
      ).unusedButRequired,
    );
    if (entry.unusedButRequired) assert.deepEqual(entry.contexts, []);
  });
}

// Two independently generated alternatives remain one selectable encounter identity.
test("Skeleton Mage alternatives retain distinct masters and unused art adds no encounter", () => {
  const mages = batches.filter(
    /* Select the two historical alternatives. */ (r) =>
      /^sprite-skeleton-mage[12]$/.test(r.entry.id),
  );
  assert.equal(mages.length, 2);
  assert.notEqual(
    mages[0].entry.generation.masterSha256,
    mages[1].entry.generation.masterSha256,
  );
  assert.notEqual(
    mages[0].entry.generation.sourcePath,
    mages[1].entry.generation.sourcePath,
  );
  assert.equal(
    variants.filter(
      /* Only active portraits enter combat. */ (v) => !v.unusedButRequired,
    ).length,
    52,
  );
});

// Require every automated tuple and its actual capture, without treating it as human/native acceptance.
test("all 52 active variants link 18 verified browser captures, with no unused-art selector", async () => {
  for (const obligation of required) {
    const entry = manifest.entries.find(
      /* Match this immutable obligation. */ (r) => r.id === obligation.id,
    );
    if (entry.unusedButRequired) {
      assert.deepEqual(entry.contexts, []);
      continue;
    }
    const contexts = entry.contexts.filter(
      /* Native reviews cannot substitute for pinned engine evidence. */ (r) =>
        ["chromium", "firefox", "webkit"].includes(r.browser),
    );
    assert.equal(contexts.length, 18, entry.id);
    const keys = new Set();
    for (const row of contexts) {
      const key = `${row.browser}/${row.viewport.width}/${row.textScale}`;
      assert.equal(keys.has(key), false, `Duplicate tuple ${key}`);
      keys.add(key);
      assert.ok([360, 768, 1440].includes(row.viewport.width));
      assert.ok([1, 2].includes(row.textScale));
      assert.equal(row.id, "encounter/portrait");
      assert.equal(row.automatedStatus, "PASS");
      assert.equal(row.assetSha256, entry.delivered.sha256);
      assert.equal(
        sha256(await readNonempty(root, row.screenshot)),
        row.sha256,
      );
      assert.equal(row.draws, 0);
      assert.equal(row.unchanged, true);
      assert.equal(row.claimReceivesPointer, true);
      assert.equal(row.claimReceivesFocus, true);
    }
  }
});
