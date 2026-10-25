import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const version = JSON.parse(readFileSync("package.json", "utf8")).version;

/** Run the release guard without a shell so tag contents remain untrusted data. */
function validate(tag) {
  const result = spawnSync(
    process.execPath,
    ["scripts/validate-release-tag.mjs", ...(tag === undefined ? [] : [tag])],
    { encoding: "utf8" },
  );
  if (result.error) throw result.error;
  return result;
}

// Commitizen emits an unprefixed stable version matching the checked-out package.
test("release guard accepts the exact package version", () => {
  const result = validate(version);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, `version=${version}\n`);
});

for (const tag of [
  undefined,
  "",
  `v${version}`,
  "01.2.3",
  "1.02.3",
  "1.2.03",
  "1.2",
  "1.2.3.4",
  "1.2.3-rc.1",
  "1.2.3+build",
  "1.2.3\n",
  "$(echo unsafe)",
  "999.0.0",
]) {
  // Reject missing, malformed and mismatched releases before publishing credentials exist.
  test(`release guard rejects ${JSON.stringify(tag)}`, () => {
    const result = validate(tag);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /stable X\.Y\.Z|does not match package\.json/);
  });
}
