import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createLegacyHarness } from "../helpers/legacy-harness.mjs";

const root = new URL("../fixtures/legacy/", import.meta.url);
// Fixture documents are JSON data and never passed to the VM as source.
function fixture(name) {
  return JSON.parse(readFileSync(new URL(name, root)));
}
const selectors = fixture("dom-selectors.json");
const saves = fixture("saves.json").cases;
const exports = fixture("exports.json").cases;
const expected = fixture("expected-state.json");
// Capture detached state without adding derived values or normalizing player text.
function state(harness) {
  return Object.fromEntries(
    ["player", "dungeon", "enemy", "volume"].map(
      // Read the same four bindings used by the original saveData implementation.
      (name) => [name, harness.read(name)],
    ),
  );
}
// An unchanged name submission must reproduce independently known starting stats.
test("early fixture is reproduced by the real legacy submit handler", () => {
  const h = createLegacyHarness({ selectors });
  try {
    h.dom.window.dispatch("load");
    h.dom.nodes.get("#name-input").value = "Mariner";
    h.dom.nodes.get("#name-submit").dispatch("submit", {
      // Prevent the synthetic submission's nonexistent navigation default.
      preventDefault() {},
    });
    assert.deepEqual(state(h), expected.earlyDefaults);
    assert.equal(h.read("player").stats.hpMax, 500);
    assert.equal(h.read("player").stats.atk, 100);
    assert.equal(h.read("player").stats.def, 50);
    assert.equal(h.read("player").stats.atkSpd, 0.6);
    assert.equal(h.read("player").stats.pen, null);
    h.random.assertConsumed();
  } finally {
    h.dispose();
  }
});
for (const row of saves) {
  if (!row.recipe?.actions) continue;
  // Replay the recorded trusted actions with no spare RNG values to hide changed draw counts.
  test(`captured outcome: ${row.id}`, () => {
    const h = createLegacyHarness({
      selectors,
      randomTape: row.recipe.randomTape,
    });
    try {
      for (const [name, value] of Object.entries(row.recipe.initialState))
        h.write(name, value);
      for (const action of row.recipe.actions) {
        if (action.write) h.write(action.write, action.value);
        else h.call(action.call, ...action.args);
      }
      const actual = state(h);
      if (row.recipe.post) {
        actual.player.inCombat = true;
        actual.dungeon.status.event = true;
      }
      assert.deepEqual(actual, row.state);
      h.random.assertConsumed();
    } finally {
      h.dispose();
    }
  });
}
// Corpus assertions protect required edge cases independently of captured snapshots.
test("corpus covers all required save stages, duplicates, nulls and fractional EXP", () => {
  const ids = new Map(
    saves.map(
      // Index fixtures by stable descriptive ID; duplicates would reduce map size.
      (row) => [row.id, row],
    ),
  );
  assert.equal(ids.size, saves.length);
  for (const id of [
    "early",
    "resting",
    "normal",
    "guardian",
    "boss",
    "chest-mimic",
    "door-mimic",
    "variant-1",
    "variant-2",
    "settled-victory",
    "settled-death",
    "interrupted-player-death",
    "interrupted-enemy-victory",
    "interrupted-missing-enemy",
    "full-duplicate-equipment",
    "optional-null-derived",
    "fractional-exp",
  ])
    assert.ok(ids.has(id), id);
  const holdings = ids.get("full-duplicate-equipment").state.player;
  assert.equal(holdings.equipped.length, 6);
  assert.equal(holdings.inventory.equipment.length, 2);
  assert.equal(
    holdings.inventory.equipment[0],
    holdings.inventory.equipment[1],
  );
  assert.equal(holdings.stats.pen, null);
  assert.equal(
    Number.isInteger(ids.get("fractional-exp").state.enemy.rewards.exp),
    false,
  );
  assert.equal(ids.get("variant-1").state.enemy.image.name, "skeleton_mage1");
  assert.equal(ids.get("variant-2").state.enemy.image.name, "skeleton_mage2");
  assert.equal(ids.get("guardian").state.dungeon.progress.floor, 2);
  assert.equal(ids.get("guardian").state.dungeon.progress.room, 1);
  const victory = ids.get("settled-victory").state;
  assert.equal(victory.player.inCombat, false);
  assert.equal(victory.enemy.stats.hp, 0);
  assert.equal(victory.player.gold, victory.enemy.rewards.gold);
  assert.equal(victory.player.exp.expCurr, victory.enemy.rewards.exp);
  assert.equal(ids.get("settled-death").state.player.deaths, 1);
  for (const row of saves) {
    for (const [key, value] of Object.entries(row.raw))
      assert.deepEqual(JSON.parse(value), row.state[key.replace(/Data$/, "")]);
    assert.deepEqual(
      expected.cases.find(
        // Expected-state records remain explicit and cover every corpus entry.
        (entry) => entry.id === row.id,
      ).authoritativeState,
      row.state,
    );
  }
});
// Reproduce the generated item before using duplicate copies as migration fixtures.
test("duplicate item fixture originates in real legacy equipment generation", () => {
  const row = saves.find(
    // Locate the full-loadout input without relying on the array's presentation order.
    (entry) => entry.id === "full-duplicate-equipment",
  );
  const recipe = row.recipe.itemGeneration;
  const h = createLegacyHarness({ selectors, randomTape: recipe.randomTape });
  try {
    for (const [key, value] of Object.entries(recipe.initialState))
      h.write(key, value);
    h.call(recipe.call);
    assert.equal(
      h.read("player").inventory.equipment[0],
      row.state.player.inventory.equipment[0],
    );
    h.random.assertConsumed();
  } finally {
    h.dispose();
  }
});
for (const row of exports) {
  // Legacy exports are byte-preserving Latin-1 character data with no run/preferences envelope.
  test(`legacy export/reset retention: ${row.id}`, () => {
    const before = saves.find(
      // Resolve each export's source state using its stable fixture ID.
      (entry) => entry.id === row.id,
    ).state;
    const h = createLegacyHarness({ selectors });
    try {
      for (const [key, value] of Object.entries(before)) h.write(key, value);
      assert.equal(h.call("exportData"), row.text);
      assert.deepEqual(
        JSON.parse(Buffer.from(row.text, "base64").toString("latin1")),
        row.player,
      );
      h.call("progressReset");
      const after = state(h);
      assert.deepEqual(after, row.confirmedResetState);
      assert.deepEqual(after, expected.resetStates[row.id]);
      for (const key of [
        "name",
        "gold",
        "playtime",
        "kills",
        "deaths",
        "inventory",
        "equipped",
        "baseStats",
        "tempStats",
      ])
        assert.deepEqual(after.player[key], before.player[key], key);
      assert.deepEqual(after.volume, before.volume);
      assert.equal(after.player.lvl, 1);
      assert.equal(after.player.blessing, 1);
      assert.equal(after.player.allocated, undefined);
      assert.equal(after.dungeon.enemyMultipliers, undefined);
      assert.deepEqual(after.player.skills, []);
      assert.equal(after.player.stats.hp, before.player.stats.hpMax);
      assert.equal(after.dungeon.progress.floor, 1);
      assert.equal(after.dungeon.statistics.runtime, 0);
      h.random.assertConsumed();
    } finally {
      h.dispose();
    }
  });
}
