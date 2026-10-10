import test from "node:test";
import assert from "node:assert/strict";
import { createLegacyHarness } from "../helpers/legacy-harness.mjs";

const options = {
  sourceRoot: "tests/fixtures/harness",
  files: ["trusted.js"],
  selectors: ["#probe"],
  randomTape: [0.25, 0.75],
};
// A working realm must execute only the explicitly supplied trusted fixture files.
test("trusted classic lexical bindings use explicit DOM and ordered random draws", () => {
  const harness = createLegacyHarness(options);
  try {
    assert.equal(harness.call("drawProbe"), 0.75);
    assert.equal(harness.dom.nodes.get("#probe").textContent, "0.25");
    assert.deepEqual(harness.random.calls, [0.25, 0.75]);
    harness.random.assertConsumed();
    assert.deepEqual(harness.read("probe"), { count: 1 });
  } finally {
    harness.dispose();
  }
});
// Stubs must not silently manufacture a node and hide incorrect selectors.
test("missing DOM selectors fail explicitly", () => {
  const harness = createLegacyHarness({ ...options, selectors: [] });
  try {
    assert.throws(
      // The explicit fixture inventory intentionally omits the selector used by the rule.
      () => harness.call("drawProbe"),
      /Missing DOM stub.*#probe/,
    );
  } finally {
    harness.dispose();
  }
});
// A fresh VM restores globals; timer teardown releases retained callbacks.
test("fresh globals and timer disposal are isolated per case", () => {
  const first = createLegacyHarness(options);
  const second = createLegacyHarness(options);
  try {
    first.call("scheduleProbe");
    first.clock.advance(20);
    assert.deepEqual(first.read("probe"), { count: 2 });
    assert.deepEqual(second.read("probe"), { count: 0 });
    assert.equal(first.clock.pending(), 1);
    first.dispose();
    assert.equal(first.clock.pending(), 0);
    assert.throws(
      // Disposed realms cannot be queried or revived accidentally.
      () => first.read("probe"),
      /disposed/,
    );
  } finally {
    first.dispose();
    second.dispose();
  }
});
// Data crosses the realm as values; binding names never accept source fragments.
test("data values are cloned and never interpreted as executable code", () => {
  const harness = createLegacyHarness(options);
  const value = { name: "globalThis.executed = true", count: 4 };
  try {
    harness.write("probe", value);
    value.count = 99;
    assert.equal(harness.read("probe").count, 4);
    assert.equal(harness.read("probe").name, "globalThis.executed = true");
    assert.throws(
      // Reject source fragments in what must be a single lexical binding name.
      () => harness.read("probe; globalThis.executed = true"),
      /identifier/,
    );
    assert.throws(
      // Property expressions cannot bypass the plain-data assignment boundary.
      () => harness.write("probe.x", 3),
      /identifier/,
    );
    assert.throws(
      // File selection may not escape the explicitly selected trusted root.
      () => createLegacyHarness({ ...options, files: ["../trusted.js"] }),
      /source path/,
    );
  } finally {
    harness.dispose();
  }
});
// Independently known arithmetic establishes that the harness calls real legacy rules.
test("legacy inclusive integer and decimal calculations use exactly one draw each", () => {
  const harness = createLegacyHarness({
    files: ["assets/js/utility.js"],
    randomTape: [0, 0.999, 0.25],
  });
  try {
    assert.equal(harness.call("randomizeNum", 3, 7), 3);
    assert.equal(harness.call("randomizeNum", 3, 7), 7);
    assert.equal(harness.call("randomizeDecimal", 2, 6), 3);
    harness.random.assertConsumed();
  } finally {
    harness.dispose();
  }
});
