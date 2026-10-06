import test, { after } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import {
  createLegacyHarness,
  legacyFiles,
} from "../helpers/legacy-harness.mjs";
// Keep rule-only adaptation out of shipped code; browser tests exercise the real bridge separately.
const root = new URL("../../", import.meta.url);
mkdirSync(new URL(".cache/", root), { recursive: true });
const directory = mkdtempSync(new URL(".cache/candidate-rules-", root));
mkdirSync(`${directory}/assets/js`, { recursive: true });
for (const file of legacyFiles) {
  let source = readFileSync(new URL(file, root), "utf8");
  if (file.endsWith("/main.js")) {
    assert.equal(source.match(/^initializeGame\(\);$/gm)?.length, 1);
    source = source.replace(
      /^initializeGame\(\);$/m,
      'gameReady = true; gameServices = { run(callback) { return callback(); }, requestSave() { return { status: "deferred" }; } };',
    );
    source = "document.addEventListener = function () {};\n" + source;
  }
  writeFileSync(`${directory}/${file}`, source);
}
// Remove only this test's generated adapter after every case has released its realm.
after(
  /* Release the temporary rule adapter owned by this test run. */ () =>
    rmSync(directory, { recursive: true, force: true }),
);
// Load immutable inputs independently of the candidate implementation.
function fixture(name) {
  return JSON.parse(
    readFileSync(new URL(`../fixtures/legacy/${name}.json`, import.meta.url)),
  );
}
const selectors = fixture("dom-selectors");
// Seed every realm with the same captured resting tuple.
const resting = fixture("saves").cases.find(
  /* Select the captured input for this scenario. */ (row) =>
    row.id === "resting",
).state;
for (const corpus of ["encounters", "equipment", "progression"]) {
  for (const row of fixture(corpus).cases) {
    // Candidate functions must preserve exact numerical results and the complete RNG tape.
    test(`candidate ${corpus}: ${row.id}`, /* Verify the named behavior using isolated state and observable outcomes. */ () => {
      const h = createLegacyHarness({
        sourceRoot: directory,
        selectors,
        randomTape: row.tape,
      });
      try {
        for (const [key, value] of Object.entries(resting)) h.write(key, value);
        for (const [key, value] of Object.entries(row.setup))
          h.write(key, value);
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
}
