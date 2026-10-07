import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { prepareArt } from "../../scripts/prepare-art.mjs";
import { packIco, inspectIco } from "../../scripts/pack-ico.mjs";
import {
  inspectPng,
  validateArt,
  contextKey,
} from "../../scripts/validate-art.mjs";
const fixtureRoot = new URL("../fixtures/art/", import.meta.url);
// Read independently encoded fixture bytes.
const fixture = (name) => readFile(new URL(name, fixtureRoot));
// Match the independently computed digest in the manifest contract.
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

// Real tool responses can omit a generation timestamp; explicit absence must not become invented metadata.
test("art validator accepts explicitly unreturned timestamps but rejects missing or malformed dates", async (t) => {
  const s = await setup(t);
  const generation = s.manifest.entries[0].generation;
  generation.timestamp = null;
  generation.timestampUnavailableReason = "not-returned-by-tool";
  generation.provenance.generatedAt = null;
  assert.equal((await validateArt(s)).ok, true);
  delete generation.timestampUnavailableReason;
  assert.equal((await validateArt(s)).ok, false);
  generation.timestampUnavailableReason = "not-returned-by-tool";
  generation.timestamp = "not a date";
  assert.equal((await validateArt(s)).ok, false);
  delete generation.timestamp;
  assert.equal((await validateArt(s)).ok, false);
  generation.timestamp = null;
  generation.provenance.generatedAt = "2026-10-07T00:00:00Z";
  assert.equal((await validateArt(s)).ok, false);
});
// Build an isolated complete synthetic asset, never a production review.
async function setup(t) {
  const root = await mkdtemp(join(tmpdir(), "crawler-art-"));
  // Remove only this test's own temporary files.
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ["assets/art", "art/masters", "art/prompts", "review"])
    await mkdir(join(root, dir), { recursive: true });
  const bytes = await fixture("valid.png");
  await writeFile(join(root, "assets/art/test.png"), bytes);
  await writeFile(join(root, "art/masters/test.png"), bytes);
  await writeFile(
    join(root, "art/prompts/test.txt"),
    await fixture("prompt.txt"),
  );
  await writeFile(join(root, "review/test.txt"), await fixture("review.txt"));
  const obligation = {
    id: "test",
    kind: "symbol",
    identityId: "test",
    legacySource: null,
    aliases: ["Test"],
    unusedButRequired: false,
    contextIds: ["test/detail"],
    path: "assets/art/test.png",
    width: 8,
    height: 4,
    baseline: null,
  };
  const entry = {
    ...obligation,
    delivered: {
      path: obligation.path,
      width: 8,
      height: 4,
      sha256: hash(bytes),
      alpha: true,
    },
    generation: {
      promptPath: "art/prompts/test.txt",
      masterPath: "art/masters/test.png",
      masterSha256: hash(bytes),
      timestamp: "2026-10-06T00:00:00Z",
      provenance: { tool: "synthetic fixture", requestId: "fixture-only" },
    },
    transform: {
      processor: "sharp",
      version: sharp.versions.sharp,
      fit: "contain",
      padding: "transparent",
      options: {
        compressionLevel: 9,
        adaptiveFiltering: false,
        palette: false,
      },
    },
    review: {
      status: "PASS",
      reviewer: "Fixture reviewer",
      date: "2026-10-06",
      evidence: ["review/test.txt"],
      findings: [],
    },
    contexts: [],
  };
  const geometry = {
    id: "test/detail",
    browser: { name: "fixture", version: "1" },
    viewport: { width: 360, height: 800 },
    textScale: 1,
    dpr: 1,
    box: { x: 1, y: 2, width: 8, height: 4 },
    baselineOffset: 4,
    marginLeft: "0px",
    marginRight: "0px",
    paddingLeft: "0px",
    paddingRight: "0px",
    lineHeight: "4px",
    verticalAlign: "baseline",
    fontStatus: "loaded",
    status: "PASS",
  };
  entry.contexts = [
    { ...geometry, screenshot: "review/test.txt", review: { ...entry.review } },
  ];
  return {
    root,
    manifest: { schemaVersion: 1, entries: [entry] },
    obligations: [obligation],
    baseline: { assets: [], contexts: [geometry] },
  };
}
// Check true contain geometry using independent source pixels and known padding.
test("preparation preserves proportions with transparent padding and records exact odd dimensions", async (t) => {
  const s = await setup(t);
  const result = await prepareArt({
    root: s.root,
    master: "art/masters/test.png",
    output: "assets/art/prepared.png",
    width: 12,
    height: 12,
  });
  assert.equal(result?.width, 12);
  const { data, info } = await sharp(join(s.root, "assets/art/prepared.png"))
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(info.channels, 4);
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < 12; x++) assert.equal(data[(y * 12 + x) * 4 + 3], 0);
  assert.ok(data[(6 * 12 + 6) * 4 + 3] > 0);
  const odd = await prepareArt({
    root: s.root,
    master: "art/masters/test.png",
    output: "assets/art/odd.png",
    width: 199,
    height: 200,
  });
  assert.equal(odd.height, 200);
  assert.equal(odd.width, 199);
  const repeat = await prepareArt({
    root: s.root,
    master: "art/masters/test.png",
    output: "assets/art/repeat.png",
    width: 12,
    height: 12,
  });
  assert.equal(repeat.sha256, result.sha256);
});
// Reject baseline/source overwrite, traversal and symlink escape before any write.
test("preparation refuses unsafe destinations and preserves immutable bytes", async (t) => {
  const s = await setup(t);
  for (const output of [
    "../escape.png",
    "/tmp/escape.png",
    "art/baseline.json",
    "tests/fixtures/legacy/source/assets/a.png",
    "art/masters/test.png",
    "assets/art/../test.png",
  ]) {
    // Each rejected path must reach an explicit safety failure.
    await assert.rejects(
      () =>
        prepareArt({
          root: s.root,
          master: "art/masters/test.png",
          output,
          width: 8,
          height: 4,
        }),
      /path|destination|source/i,
    );
  }
  await symlink(join(s.root, "art/masters"), join(s.root, "assets/art/link"));
  // A runtime-looking path must not follow a symlink into the masters.
  await assert.rejects(
    () =>
      prepareArt({
        root: s.root,
        master: "art/masters/test.png",
        output: "assets/art/link/test.png",
        width: 8,
        height: 4,
      }),
    /symlink|path/i,
  );
  assert.deepEqual(
    await readFile(join(s.root, "art/masters/test.png")),
    await fixture("valid.png"),
  );
});
// Fully decode pixels; a header alone cannot establish usable transparent art.
test("PNG inspection rejects wrong-size, opaque, blank, RGB and corrupt images", async () => {
  const good = await inspectPng(await fixture("valid.png"), {
    width: 8,
    height: 4,
  });
  assert.equal(good?.width, 8);
  assert.equal(good?.alpha, true);
  for (const name of ["opaque.png", "blank.png", "rgb.png", "corrupt.png"]) {
    const bytes = await fixture(name);
    // Every independently malformed image must be refused.
    await assert.rejects(() => inspectPng(bytes, { width: 8, height: 4 }));
  }
  const bytes = await fixture("valid.png");
  // Exact canvas dimensions are mandatory.
  await assert.rejects(
    () => inspectPng(bytes, { width: 9, height: 4 }),
    /dimension/i,
  );
});
// Validate an independently packed ICO and compare deterministic encoder bytes.
test("ICO requires exactly one matching 127 by 128 PNG entry", async () => {
  const png = await fixture("odd.png");
  const expected = await fixture("valid.ico");
  assert.deepEqual(await packIco(png), expected);
  assert.equal((await inspectIco(expected))?.width, 127);
  for (const [offset, value] of [
    [0, 1],
    [2, 2],
    [4, 2],
    [6, 128],
    [7, 127],
    [8, 1],
    [10, 2],
    [12, 24],
    [14, 1],
    [18, 23],
  ]) {
    const bad = Buffer.from(expected);
    bad[offset] = value;
    // Refuse directory deviations, including reserved fields and payload boundaries.
    await assert.rejects(() => inspectIco(bad));
  }
  // Reject a directory with a truncated PNG payload.
  await assert.rejects(() =>
    inspectIco(expected.subarray(0, expected.length - 10)),
  );
});
// The independent obligation list prevents omission from weakening validation.
test("manifest accepts complete fixture and rejects missing mappings, provenance and evidence", async (t) => {
  const s = await setup(t);
  assert.equal((await validateArt(s)).ok, true);
  const mutations = [
    // Omission and duplicate rows may not reduce the required scope.
    (m) => m.entries.splice(0),
    // Isolate this invalid record so another complete field cannot mask it.
    (m) => m.entries.push(structuredClone(m.entries[0])),
    // Aliases and identity must match the catalog contract exactly.
    (m) => (m.entries[0].aliases = []),
    // Isolate this invalid record so another complete field cannot mask it.
    (m) => m.entries[0].aliases.push("Test"),
    // Isolate this invalid record so another complete field cannot mask it.
    (m) => (m.entries[0].identityId = "other"),
    // Provenance must reference real inputs and match their bytes.
    (m) => (m.entries[0].generation = null),
    // Isolate this invalid record so another complete field cannot mask it.
    (m) => (m.entries[0].generation.masterSha256 = "0".repeat(64)),
    // Isolate this invalid record so another complete field cannot mask it.
    (m) => (m.entries[0].generation.promptPath = "../outside"),
    // Output integrity and visual qualification remain independent.
    (m) => (m.entries[0].delivered.sha256 = "0".repeat(64)),
    // Isolate this invalid record so another complete field cannot mask it.
    (m) => (m.entries[0].review.status = "OPEN"),
    // Isolate this invalid record so another complete field cannot mask it.
    (m) => (m.entries[0].review.evidence = ["missing.txt"]),
    // All geometry tuples must match with no more than half a pixel deviation.
    (m) => (m.entries[0].contexts = []),
    // Isolate this invalid record so another complete field cannot mask it.
    (m) => (m.entries[0].contexts[0].box.x += 0.51),
  ];
  for (const mutate of mutations) {
    const manifest = structuredClone(s.manifest);
    mutate(manifest);
    const result = await validateArt({ ...s, manifest });
    assert.equal(result.ok, false, mutate.toString());
    assert.ok(result.issues.length);
  }
});

// Protect baseline integrity and ensure metadata cannot claim an unperformed transform.
test("manifest rejects altered baselines, bogus provenance and unrecorded export settings", async (t) => {
  const s = await setup(t);
  const mutations = [
    // A provenance object with only empty metadata is not an actual generation record.
    (m) => {
      m.entries[0].generation.provenance = {
        tool: "imagegen",
        requestId: null,
      };
    },
    // Transform options are part of the deterministic export contract.
    (m) => {
      m.entries[0].transform.options.palette = true;
    },
    // The claimed output alpha cannot disagree with decoded bytes.
    (m) => {
      m.entries[0].delivered.alpha = false;
    },
  ];
  for (const mutate of mutations) {
    // Report each independent metadata regression even when another fails.
    await t.test(mutate.toString(), async () => {
      const manifest = structuredClone(s.manifest);
      mutate(manifest);
      assert.equal((await validateArt({ ...s, manifest })).ok, false);
    });
  }
  const original = await fixture("opaque.png");
  await writeFile(join(s.root, "art/original.png"), original);
  const baseline = {
    path: "assets/art/test.png",
    snapshotPath: "art/original.png",
    width: 8,
    height: 4,
    sha256: hash(original),
  };
  s.obligations[0].baseline = baseline;
  s.manifest.entries[0].baseline = structuredClone(baseline);
  assert.equal((await validateArt(s)).ok, true);
  await writeFile(join(s.root, "art/original.png"), await fixture("valid.png"));
  assert.equal((await validateArt(s)).ok, false);
});

// Unmeasured native targets still have distinct identities; neither is a candidate pass.
test("context keys distinguish blocked native targets without fabricated browser metadata", () => {
  const row = {
    id: "title/title",
    viewport: { width: 360, height: 800 },
    textScale: 2,
    status: "BLOCKED",
  };
  assert.notEqual(
    contextKey({ ...row, target: "safari-ios" }),
    contextKey({ ...row, target: "chrome-android" }),
  );
});
