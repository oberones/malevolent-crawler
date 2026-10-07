import test from "node:test";
import assert from "node:assert/strict";
import { artProofContexts } from "../helpers/art-proof-contexts.mjs";

// Build independent geometry fixtures with a catalog alias unlike its asset ID.
function fixture() {
  const row = {
    id: "health/main",
    status: "PASS",
    browser: { name: "chromium" },
    viewport: { width: 360, height: 800 },
    textScale: 1,
    box: { width: 16, height: 18 },
  };
  return {
    symbol: { id: "stat-hp", contextIds: ["health/main", "health/bonus"] },
    contexts: [
      row,
      { ...row, id: "health/bonus" },
      { ...row, id: "health/other" },
      { ...row, browser: { name: "firefox" } },
      { ...row, textScale: 2 },
    ],
    browser: "chromium",
    viewport: { width: 360, height: 800 },
    textScale: 1,
  };
}
test("uses explicit context IDs and the complete browser/viewport/scale tuple", /* Select only independently known matches. */ () => {
  const input = fixture();
  assert.deepEqual(artProofContexts(input), input.contexts.slice(0, 2));
});
test("rejects a missing required context rather than producing empty proof success", /* Exercise absent bonus coverage. */ () => {
  const input = fixture();
  input.contexts.splice(1, 1);
  assert.throws(
    /* Invoke the invalid evidence selection. */ () => artProofContexts(input),
    /health\/bonus/,
  );
});
test("rejects duplicate measured rows", /* Prevent ambiguous evidence selection. */ () => {
  const input = fixture();
  input.contexts.push(input.contexts[0]);
  assert.throws(
    /* Invoke the invalid evidence selection. */ () => artProofContexts(input),
    /health\/main/,
  );
});
test("does not accept another viewport height or a blocked native row", /* Refuse mismatched baseline qualification. */ () => {
  const input = fixture();
  input.contexts[0] = {
    ...input.contexts[0],
    viewport: { width: 360, height: 900 },
  };
  input.contexts.push({
    ...input.contexts[1],
    id: "health/main",
    status: "BLOCKED",
  });
  assert.throws(
    /* Invoke the invalid evidence selection. */ () => artProofContexts(input),
    /health\/main/,
  );
});
test("rejects nonpositive or nonfinite measured geometry", /* Avoid invisible or invalid proof boxes. */ () => {
  for (const width of [0, -1, NaN]) {
    const input = fixture();
    input.contexts[0] = { ...input.contexts[0], box: { width, height: 18 } };
    assert.throws(
      /* Invoke the invalid evidence selection. */ () =>
        artProofContexts(input),
      /geometry/,
    );
  }
});
