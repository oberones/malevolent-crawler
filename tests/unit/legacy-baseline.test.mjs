import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const root = new URL("../fixtures/legacy/", import.meta.url);
const baseline = JSON.parse(readFileSync(new URL("baseline.json", root)));
// Hash binary content without decoding or normalizing newlines.
function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

// Retained gameplay source and browser fixtures must match the original Git revision.
test("retained legacy source matches original Git blobs and the complete manifest hash", () => {
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
    // Raster art was retired; keep the original manifest intact for optional historical performance runs.
    if (!/^assets\/(sprites|icon)\//.test(entry.path)) {
      const frozen = readFileSync(new URL(`source/${entry.path}`, root));
      assert.equal(frozen.length, entry.bytes, entry.path);
      assert.equal(sha256(frozen), entry.sha256, entry.path);
      const original = execFileSync(
        "git",
        ["show", `${baseline.revision}:${entry.path}`],
        { maxBuffer: 20 * 1024 * 1024 },
      );
      assert.equal(sha256(original), entry.sha256, `${entry.path} local Git`);
    }
    aggregate += `${entry.path}\0${entry.sha256}\n`;
  }
  assert.equal(sha256(aggregate), baseline.treeSha256);
});
