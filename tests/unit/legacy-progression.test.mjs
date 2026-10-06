import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createLegacyHarness } from "../helpers/legacy-harness.mjs";
// Read committed oracle data without executing any fixture strings.
function fixture(name) {
  return JSON.parse(
    readFileSync(new URL(`../fixtures/legacy/${name}.json`, import.meta.url)),
  );
}
const corpus = fixture("progression");
const selectors = fixture("dom-selectors");
const resting = fixture("saves").cases.find(
  // Use the stable resting input, not a state produced by the candidate.
  (row) => row.id === "resting",
).state;
for (const row of corpus.cases) {
  // Replay real frozen rules and compare every captured value and consumed random draw.
  test(`progression: ${row.id}`, () => {
    const h = createLegacyHarness({ selectors, randomTape: row.tape });
    try {
      for (const [key, value] of Object.entries(resting)) h.write(key, value);
      for (const [key, value] of Object.entries(row.setup)) h.write(key, value);
      h.call("setVolume");
      for (const op of row.operations) {
        if (op.call) h.call(op.call, ...(op.args ?? []));
        if (op.value) h.dom.nodes.get(op.value).value = op.text;
        if (op.click) h.dom.nodes.get(op.click).dispatch("click");
        if (op.advance) h.clock.advance(op.advance);
      }
      for (const [key, value] of Object.entries(row.expected))
        assert.deepEqual(h.read(key), value, key);
      h.random.assertConsumed();
      assert.deepEqual(h.random.calls, row.tape);
    } finally {
      h.dispose();
    }
  });
}
