import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = new URL("../fixtures/legacy/", import.meta.url);
const baseline = JSON.parse(readFileSync(new URL("baseline.json", root)));
const art = JSON.parse(
  readFileSync(
    new URL("../../art/cosmic-horror/baseline.json", import.meta.url),
  ),
);
// Hash binary content without decoding or normalizing newlines.
function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

// Every frozen byte must match both the manifest and the independently recorded Git revision.
test("immutable source tree matches local Git blobs and the recorded aggregate hash", () => {
  const paths = execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", baseline.revision],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(
      // Capture all runtime assets plus the page and its license, excluding tooling.
      (path) =>
        path.startsWith("assets/") || ["index.html", "LICENSE"].includes(path),
    );
  assert.deepEqual(
    baseline.files.map(
      // Require complete coverage, not just validity of whatever entries were supplied.
      (entry) => entry.path,
    ),
    paths,
  );
  let aggregate = "";
  for (const entry of baseline.files) {
    const frozen = readFileSync(new URL(`source/${entry.path}`, root));
    assert.equal(frozen.length, entry.bytes, entry.path);
    assert.equal(sha256(frozen), entry.sha256, entry.path);
    const original = execFileSync(
      "git",
      ["show", `${baseline.revision}:${entry.path}`],
      { maxBuffer: 20 * 1024 * 1024 },
    );
    assert.equal(sha256(original), entry.sha256, `${entry.path} local Git`);
    aggregate += `${entry.path}\0${entry.sha256}\n`;
  }
  assert.equal(sha256(aggregate), baseline.treeSha256);
});
// Decode every PNG and inspect the original DIB ICO's independent header/directory.
test("all 55 original raster files retain dimensions, alpha headers and full bytes", async () => {
  assert.equal(art.assets.length, 55);
  assert.equal(readdirSync(new URL("source/assets/sprites/", root)).length, 53);
  for (const entry of art.assets) {
    const data = readFileSync(new URL(`source/${entry.path}`, root));
    assert.equal(sha256(data), entry.sha256);
    if (entry.path.endsWith(".png")) {
      const { info } = await sharp(data)
        .raw()
        .toBuffer({ resolveWithObject: true });
      assert.equal(info.width, entry.width);
      assert.equal(info.height, entry.height);
      assert.equal(info.channels, 4);
      assert.equal(entry.alpha, true);
    } else {
      assert.equal(data.readUInt16LE(0), 0);
      assert.equal(data.readUInt16LE(2), 1);
      assert.equal(data.readUInt16LE(4), 1);
      assert.equal(data[6], 127);
      assert.equal(data[7], 128);
      const offset = data.readUInt32LE(18);
      const size = data.readUInt32LE(14);
      assert.equal(offset + size, data.length);
      assert.equal(data.readUInt32LE(offset + 4), 127);
      assert.equal(data.readUInt32LE(offset + 8), 256); // DIB includes image and mask heights.
      assert.equal(data.readUInt16LE(offset + 14), 32);
      assert.equal(entry.width, 127);
      assert.equal(entry.height, 128);
    }
  }
});
