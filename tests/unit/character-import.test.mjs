import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCharacterImport } from "../../assets/js/app/character-import.mjs";
const cases = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases;
const row = cases.find(
  /* Select a legitimate existing run. */ (row) => row.id === "resting",
);
const text = JSON.parse(readFileSync("tests/fixtures/legacy/exports.json"))
  .cases[0].text;
// Replacement/cleanup order is observable without timers or browser instrumentation.
test("preview/cancel are pure; commit precedes exactly-once cleanup and replacement", () => {
  const state = structuredClone(row.state);
  const calls = [];
  const importer = createCharacterImport({
    capture: /* Read the current tuple. */ () => state,
    commit: /* Observe the old character before replacement. */ (candidate) => {
      calls.push(["commit", candidate]);
      return { status: "saved" };
    },
    cleanup: /* Release the old owner exactly once. */ () =>
      calls.push(["cleanup"]),
    replace: /* Record the new complete tuple. */ (candidate) =>
      calls.push(["replace", candidate]),
  });
  assert.equal(importer.preview(text).ok, true);
  assert.deepEqual(calls, []);
  importer.cancel();
  assert.equal(importer.confirm().status, "no-preview");
  importer.preview(text);
  assert.equal(importer.confirm().status, "saved");
  assert.deepEqual(
    calls.map(
      /* Compare externally visible side-effect order. */ (call) => call[0],
    ),
    ["commit", "cleanup", "replace"],
  );
  assert.equal(importer.confirm().status, "no-preview");
  assert.equal(calls.length, 3);
  assert.deepEqual(state, row.state);
});
// Failed persistence cannot clean up the current session; session-only needs a failed confirmation first.
test("failure retains current owner and requires explicit session-only choice", () => {
  let cleaned = 0,
    replaced = 0,
    commits = 0;
  const importer = createCharacterImport({
    capture: /* Current state is only read. */ () => row.state,
    commit: /* Simulate denied durable storage. */ () => {
      commits++;
      return { status: "unsaved" };
    },
    cleanup: /* Count lifecycle release. */ () => cleaned++,
    replace: /* Count replacement. */ () => replaced++,
  });
  importer.preview(text);
  assert.equal(
    importer.confirm({ sessionOnly: true }).status,
    "confirmation-required",
  );
  assert.equal(importer.confirm().status, "unsaved");
  assert.equal(cleaned, 0);
  assert.equal(replaced, 0);
  assert.equal(importer.confirm({ sessionOnly: true }).status, "session-only");
  assert.equal(cleaned, 1);
  assert.equal(replaced, 1);
  assert.equal(commits, 1);
});
