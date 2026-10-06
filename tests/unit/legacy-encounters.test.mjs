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
const corpus = fixture("encounters");
const selectors = fixture("dom-selectors");
const resting = fixture("saves").cases.find(
  // Use the stable resting input, not a state produced by the candidate.
  (row) => row.id === "resting",
).state;
for (const row of corpus.cases) {
  // Replay real frozen rules and compare every captured value and consumed random draw.
  test(`encounters: ${row.id}`, () => {
    const h = createLegacyHarness({ selectors, randomTape: row.tape });
    try {
      for (const [key, value] of Object.entries(resting)) h.write(key, value);
      for (const [key, value] of Object.entries(row.setup)) h.write(key, value);
      h.call("setVolume");
      for (const op of row.operations) {
        if (op.call) h.call(op.call, ...(op.args ?? []));
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
// Independent inventory counts and explicit ordering checks prevent a reduced oracle from passing.
test("ordered pools cover all archetypes and 51 identities with both mage variants", () => {
  assert.equal(Object.keys(corpus.pools).length, 15);
  const identities = new Set();
  const variants = new Set();
  for (const [key, pool] of Object.entries(corpus.pools)) {
    const rows = corpus.cases.filter(
      // Select generation cases belonging to this precise condition and archetype.
      (row) => row.id.startsWith(`${key}/`),
    );
    const actual = [];
    for (const row of rows) {
      const name = row.expected.enemy.name;
      if (actual.at(-1) !== name) actual.push(name);
      identities.add(name);
      variants.add(row.expected.enemy.image.name);
    }
    assert.deepEqual(actual, pool, key);
  }
  assert.equal(identities.size + 2, 51);
  assert.equal(variants.size + 2, 52);
  assert.deepEqual(corpus.pools["Quick/sboss"], [
    "Naizicher, the Spider Dragon",
    "Darkness Angel Reaper",
  ]);
  for (const type of [
    "Offensive",
    "Defensive",
    "Balanced",
    "Quick",
    "Lethal",
  ]) {
    const chest = corpus.cases.find(
      // Both mimics retain the generated archetype's discarded draw sequence.
      (row) => row.id === `${type}/chest`,
    );
    const door = corpus.cases.find(
      // Door mimic and chest mimic must consume an identical tape.
      (row) => row.id === `${type}/door`,
    );
    assert.deepEqual(chest.tape, door.tape);
    assert.equal(chest.tape.length, type === "Defensive" ? 9 : 11);
    assert.deepEqual(chest.expected.enemy.stats, door.expected.enemy.stats);
  }
});
// Timing is tested at the exact pre-attack boundary rather than using host sleeps.
test("combat actors wait a full delay, then use their two damage draws", () => {
  const h = createLegacyHarness({
    selectors,
    randomTape: [0.5, 0.5, 0.5, 0.5],
  });
  try {
    for (const [key, value] of Object.entries(resting)) h.write(key, value);
    const enemy = fixture("saves").cases.find(
      // A valid active enemy makes battle setup execute the original renderer.
      (row) => row.id === "normal",
    ).state.enemy;
    enemy.stats.atkSpd = 0.4;
    enemy.stats.hp = enemy.stats.hpMax = 10000;
    h.write("enemy", enemy);
    h.call("setVolume");
    h.call("engageBattle");
    h.clock.advance(1000 / resting.player.stats.atkSpd - 0.001);
    assert.equal(h.random.calls.length, 0);
    h.clock.advance(0.002);
    assert.equal(h.random.calls.length, 2);
    h.clock.advance(2500 - h.clock.now());
    h.random.assertConsumed();
    assert.equal(h.read("combatSeconds"), 2);
  } finally {
    h.dispose();
  }
});
