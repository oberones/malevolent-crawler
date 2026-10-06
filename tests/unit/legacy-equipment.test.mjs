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
const corpus = fixture("equipment");
const selectors = fixture("dom-selectors");
const resting = fixture("saves").cases.find(
  // Use the stable resting input, not a state produced by the candidate.
  (row) => row.id === "resting",
).state;
for (const row of corpus.cases) {
  // Replay real frozen rules and compare every captured value and consumed random draw.
  test(`equipment: ${row.id}`, () => {
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
// Protect probability boundaries with independently stated expectations, including float accumulation.
test("rarity boundaries and item caps remain the legacy outcomes", () => {
  const expected = [
    [0, "Common"],
    [0.7, "Common"],
    [0.700001, "Uncommon"],
    [0.8999999999999999, "Uncommon"],
    [0.9, "Rare"],
    [0.94, "Rare"],
    [0.940001, "Epic"],
    [0.97, "Epic"],
    [0.970001, "Legendary"],
    [0.99, "Legendary"],
    [0.990001, "Heirloom"],
  ];
  for (const [roll, rarity] of expected) {
    const row = corpus.cases.find(
      // Hold category and stat draws fixed so only the rarity boundary changes.
      (entry) => entry.id === `Sword/${roll}/0`,
    );
    assert.equal(
      JSON.parse(row.expected.player.inventory.equipment.at(-1)).rarity,
      rarity,
    );
  }
  const capped = corpus.cases.filter(
    // These fixtures straddle the level cap while all exceed the independent tier cap.
    (entry) => entry.id.startsWith("caps/"),
  );
  assert.equal(capped.length, 3);
  for (const row of capped) {
    const item = JSON.parse(row.expected.player.inventory.equipment.at(-1));
    assert.equal(item.lvl, row.id === "caps/20" ? 96 : 100);
    assert.equal(item.tier, 10);
  }
  assert.equal(corpus.categories.length, 14);
  for (const category of corpus.categories) {
    const rarities = new Set();
    for (const row of corpus.cases) {
      if (row.id.startsWith(`${category}/`))
        rarities.add(
          JSON.parse(row.expected.player.inventory.equipment.at(-1)).rarity,
        );
    }
    assert.deepEqual(
      [...rarities],
      ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Heirloom"],
    );
  }
});
