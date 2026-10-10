import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateCandidate,
  readBoundedData,
} from "../../assets/js/app/save-validation.mjs";
const cases = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases;
const attacks = JSON.parse(
  readFileSync("tests/fixtures/adversarial/saves.json"),
).cases;
// Each case starts detached from the immutable corpus.
function state(id = "normal") {
  return structuredClone(
    cases.find(
      // Match the named independently captured legacy state.
      (row) => row.id === id,
    ).state,
  );
}
// Traverse fixture paths without executing values as code.
function change(target, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  for (const key of keys) target = target[key];
  target[last] = value;
}
for (const row of cases) {
  // Accept legitimate saves and distinguish interrupted multi-key outcomes.
  test(`schema corpus: ${row.id}`, () => {
    const before = JSON.stringify(row.state);
    const result = validateCandidate(row.state, "legacy");
    assert.equal(
      result.ok,
      !row.classification.startsWith("recovery"),
      JSON.stringify(result),
    );
    assert.equal(JSON.stringify(row.state), before);
    if (result.ok) {
      assert.equal(result.candidate.player.name, row.state.player.name);
      assert.equal(result.candidate.player.gold, row.state.player.gold);
    }
  });
}
for (const row of attacks) {
  // Hostile references fail while user-authored markup remains inert text.
  test(`adversarial ${row.path}: ${JSON.stringify(row.value)}`, () => {
    const input = state();
    change(input, row.path, row.value);
    assert.equal(validateCandidate(input, "legacy").ok, Boolean(row.valid));
  });
}
// Defaults derive from legacy initialization without modifying holdings or calling RNG.
test("defaults, duplicate holdings, derived/null fields and idempotence", () => {
  const input = state("optional-null-derived");
  const result = validateCandidate(input, "legacy");
  assert.equal(result.ok, true);
  const p = result.candidate.player;
  assert.equal(p.stats.pen, null);
  assert.equal(p.stats.hpPercent, "100");
  assert.equal(p.equippedStats.penPct, 0);
  assert.deepEqual(p.skills, []);
  assert.deepEqual(p.tempStats, { atk: 0, atkSpd: 0 });
  assert.equal(p.blessing, 1);
  assert.equal(JSON.parse(p.inventory.equipment[0]).tier, 1);
  assert.deepEqual(
    validateCandidate(result.candidate, "state").candidate,
    result.candidate,
  );
  const full = state("full-duplicate-equipment");
  const kept = validateCandidate(full, "state");
  assert.deepEqual(kept.candidate, full);
  full.player.equipped.push(full.player.equipped[0]);
  assert.equal(validateCandidate(full, "state").ok, false);
});
// Character previews require no enemy; local active/allocated saves cannot invent one.
test("source kinds, early defaults and complete envelopes", () => {
  const input = state();
  assert.equal(validateCandidate(input.player, "character").ok, true);
  assert.equal(validateCandidate({ player: input.player }, "legacy").ok, false);
  const early = state("early");
  const result = validateCandidate({ player: early.player }, "legacy");
  assert.equal(result.ok, true);
  assert.deepEqual(result.candidate.dungeon, early.dungeon);
  assert.deepEqual(result.candidate.enemy, early.enemy);
  assert.deepEqual(result.candidate.volume, early.volume);
  assert.equal(validateCandidate({ player: early.player }, "state").ok, false);
  const env = {
    format: "malevolent-crawler-save",
    version: 1,
    contentVersion: 1,
    revision: 1,
    savedAt: "2026-10-06T12:00:00.000Z",
    state: input,
  };
  assert.equal(validateCandidate(env, "snapshot").ok, true);
  for (const key of [
    "format",
    "version",
    "contentVersion",
    "revision",
    "savedAt",
  ]) {
    const bad = structuredClone(env);
    bad[key] = "bad";
    assert.equal(validateCandidate(bad, "snapshot").ok, false, key);
  }
  assert.equal(validateCandidate(input, "unknown").ok, false);
});
// Budget checks precede parsing/deep traversal and retain recoverable field diagnostics.
test("16 MiB, depth 64 and 64 KiB text budgets without collection caps", () => {
  assert.equal(
    validateCandidate(" ".repeat(16 * 1024 * 1024 + 1), "legacy").issues[0]
      .code,
    "size-limit",
  );
  assert.equal(
    validateCandidate("[".repeat(65) + "0" + "]".repeat(65), "legacy").issues[0]
      .code,
    "depth-limit",
  );
  const input = state();
  input.player.name = "a".repeat(65536);
  assert.equal(validateCandidate(input, "legacy").ok, true);
  input.player.name += "a";
  assert.equal(
    validateCandidate(input, "legacy").issues[0].code,
    "field-limit",
  );
  input.player.name = "𐀀".repeat(16385);
  assert.equal(validateCandidate(input, "legacy").ok, false);
  const large = state("full-duplicate-equipment");
  large.player.inventory.equipment = Array(2000).fill(
    large.player.inventory.equipment[0],
  );
  large.dungeon.backlog = Array(2000).fill("history");
  assert.equal(validateCandidate(large, "legacy").ok, true);
});
// Non-JSON objects and dangerous property keys never become engine state.
test("prototypes, getters, cycles, nonfinite numbers and unknown stat keys reject", () => {
  const input = state();
  input.player.stats.atk = Infinity;
  assert.equal(validateCandidate(input, "state").ok, false);
  input.player.stats.atk = 100;
  input.player.self = input;
  assert.equal(validateCandidate(input, "state").ok, false);
  assert.equal(validateCandidate('{"__proto__":{}}', "legacy").ok, false);
  const getter = state();
  Object.defineProperty(getter.player, "danger", {
    enumerable: true,
    // Accessor tripwire proves validation never reads hostile getters.
    get() {
      throw new Error("must not execute");
    },
  });
  assert.equal(validateCandidate(getter, "state").ok, false);
  const item = state("full-duplicate-equipment");
  item.player.equipped[0].stats = [{ evil: 1 }];
  assert.equal(validateCandidate(item, "state").ok, false);
  item.player.equipped[0].stats = [{ atk: 1 }, { atk: 2 }];
  assert.equal(validateCandidate(item, "state").ok, false);
  item.player.equipped[0].stats = [{ atk: 1 }];
  item.player.equipped[0].type = "Armor";
  assert.equal(validateCandidate(item, "state").ok, false);
});
// Text budgets also cover structured history, and defaults never reinterpret explicit null.
test("structured history text budgets and explicit null item tier reject", () => {
  const input = state();
  input.dungeon.backlog = [
    { id: "history.unavailable", params: { recoveryRef: "a".repeat(65537) } },
  ];
  assert.equal(validateCandidate(input, "state").ok, false);
});
// Only an absent historical tier receives the default; explicit null is malformed.
test("null equipment tier is not a missing default", () => {
  const full = state("full-duplicate-equipment");
  full.player.equipped[0].tier = null;
  assert.equal(validateCandidate(full, "state").ok, false);
});
// Detached validation must not consult or consume gameplay randomness.
test("validation is independent of randomness and preserves fractional rewards", () => {
  const original = Math.random;
  try {
    // Tripwire detects any implicit selection or default roll.
    Math.random = () => {
      throw new Error("No validation RNG");
    };
    const input = state("fractional-exp");
    const result = validateCandidate(input, "state");
    assert.equal(result.ok, true);
    assert.equal(result.candidate.enemy.rewards.exp, input.enemy.rewards.exp);
    result.candidate.player.gold = 99;
    assert.equal(input.player.gold, 0);
  } finally {
    Math.random = original;
  }
});
// Resource checks measure serialized data, not inflated per-number or per-index estimates.
test("bounded JSON accepts a wide value below 16 MiB and nesting at 64", () => {
  const json = "[" + Array(550000).fill("0").join(",") + "]";
  assert.equal(readBoundedData(json).length, 550000);
  assert.doesNotThrow(
    // Exactly 64 container levels remain within the documented safeguard.
    () => readBoundedData("[".repeat(64) + "0" + "]".repeat(64)),
  );
});
// Engine-facing rule fields cannot be silently replaced by presentation catalog IDs.
test("save rule tokens remain legacy category/name/image keys", () => {
  const full = state("full-duplicate-equipment");
  full.player.equipped[0].category = "tideglass-edge";
  assert.equal(validateCandidate(full, "state").ok, false);
  const active = state("guardian");
  active.enemy.name = "the-lantern-without-flame";
  active.enemy.image = { name: "alfadriel", type: ".png", size: "70%" };
  assert.equal(validateCandidate(active, "state").ok, false);
});
