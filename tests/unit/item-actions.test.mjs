import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createItemActions } from "../../assets/js/app/item-actions.mjs";

const corpus = JSON.parse(
  readFileSync(new URL("../fixtures/legacy/equipment.json", import.meta.url)),
).cases;
const sword = JSON.parse(corpus[0].expected.player.inventory.equipment.at(-1));
// Supply live engine-shaped holdings, retaining original string bytes and duplicate instances.
function setup(
  inventory = [JSON.stringify(sword), JSON.stringify(sword)],
  equipped = [],
) {
  let player = { inventory: { equipment: inventory }, equipped, gold: 17 };
  const refreshes = [];
  const service = createItemActions({
    // Read the current owner, including replacement of a saved player.
    getPlayer: () => player,
    // Observe rejected stale actions without implementing a DOM in unit tests.
    rerender: (reason) => refreshes.push(reason),
  });
  return {
    service,
    refreshes,
    // Expose the current live state for observable assertions.
    get player() {
      return player;
    },
    // Simulate continuation replacing an otherwise identical player object.
    replace() {
      player = structuredClone(player);
    },
  };
}
// Exact duplicates remain separate; every successful action consumes its render binding.
test("duplicate inventory and equipped holdings move once with original representations", () => {
  const f = setup();
  const inventory = f.player.inventory.equipment;
  const equipped = f.player.equipped;
  const bind = f.service.beginRender();
  const token = bind("inventory", 1);
  assert.deepEqual(token, { collection: "inventory", index: 1, revision: 1 });
  assert.equal(Object.isFrozen(token), true);
  assert.equal(f.service.execute(token, "equip").ok, true);
  assert.deepEqual(inventory, [JSON.stringify(sword)]);
  assert.deepEqual(equipped, [sword]);
  const once = structuredClone(f.player);
  assert.equal(f.service.execute(token, "equip").reason, "stale");
  assert.deepEqual(f.player, once);
  assert.deepEqual(f.refreshes, ["stale"]);
  const next = f.service.beginRender();
  assert.equal(f.service.execute(next("equipped", 0), "unequip").ok, true);
  assert.deepEqual(inventory, [JSON.stringify(sword), JSON.stringify(sword)]);
  assert.deepEqual(equipped, []);
  assert.equal(f.player.inventory.equipment, inventory);
  assert.equal(f.player.equipped, equipped);
});
// An index must never silently select the next item after another view or action changes it.
for (const change of [
  "render",
  "splice",
  "append",
  "edit",
  "replace",
  "array",
  "swap-duplicates",
]) {
  test(`reject stale binding after ${change} and request a fresh view`, () => {
    const f = setup(undefined, [
      structuredClone(sword),
      structuredClone(sword),
    ]);
    const binding = f.service.beginRender()("inventory", 1);
    if (change === "render") f.service.beginRender();
    if (change === "splice") f.player.inventory.equipment.splice(0, 1);
    if (change === "append")
      f.player.inventory.equipment.push(JSON.stringify(sword));
    if (change === "edit") f.player.equipped[0].value++;
    if (change === "replace") f.replace();
    if (change === "array")
      f.player.inventory.equipment = [...f.player.inventory.equipment];
    if (change === "swap-duplicates") f.player.equipped.reverse();
    const before = structuredClone(f.player);
    assert.equal(f.service.execute(binding, "sell").reason, "stale");
    assert.deepEqual(f.player, before);
    assert.deepEqual(f.refreshes, ["stale"]);
  });
}
// Bindings are collection-specific, immutable capabilities owned by one action service.
test("invalid positions, forged bindings and wrong actions cannot mutate holdings", () => {
  const f = setup();
  const bind = f.service.beginRender();
  for (const [collection, index] of [
    ["other", 0],
    ["inventory", -1],
    ["inventory", 2],
    ["inventory", 0.5],
    ["equipped", 0],
  ]) {
    assert.throws(
      /* Invalid positions must never produce a usable handle. */ () =>
        bind(collection, index),
      TypeError,
    );
  }
  const token = bind("inventory", 0);
  const before = structuredClone(f.player);
  assert.equal(f.service.execute({ ...token }, "sell").reason, "stale");
  assert.equal(
    f.service.execute(setup().service.beginRender()("inventory", 0), "sell")
      .reason,
    "stale",
  );
  assert.equal(f.service.execute(token, "unequip").reason, "invalid-action");
  assert.equal(f.service.execute(token, "erase").reason, "invalid-action");
  assert.deepEqual(f.player, before);
});
// Capacity failure leaves the action and all six existing holdings untouched.
test("six slots reject a seventh, then a fresh action can equip after unequip", () => {
  const f = setup(
    undefined,
    Array.from(
      { length: 6 },
      /* Keep duplicates as separate objects. */ () => structuredClone(sword),
    ),
  );
  const bind = f.service.beginRender();
  const before = structuredClone(f.player);
  assert.equal(
    f.service.execute(bind("inventory", 0), "equip").reason,
    "capacity",
  );
  assert.deepEqual(f.player, before);
  assert.equal(f.service.execute(bind("equipped", 2), "unequip").ok, true);
  assert.equal(
    f.service.execute(f.service.beginRender()("inventory", 0), "equip").ok,
    true,
  );
  assert.equal(f.player.equipped.length, 6);
});
// Preserve exact rolled attributes rather than regenerating an item during transfer or sale.
test("all 84 category/rarity items retain stats, values and category across actions", () => {
  const matrix = new Map();
  for (const row of corpus) {
    const encoded = row.expected.player.inventory.equipment.at(-1);
    if (!encoded) continue;
    const item = JSON.parse(encoded);
    matrix.set(`${item.category}/${item.rarity}`, encoded);
  }
  assert.equal(matrix.size, 84);
  for (const encoded of matrix.values()) {
    const item = JSON.parse(encoded);
    const f = setup([encoded]);
    assert.equal(
      f.service.execute(f.service.beginRender()("inventory", 0), "equip").ok,
      true,
    );
    assert.deepEqual(f.player.equipped, [item]);
    assert.equal(
      f.service.execute(f.service.beginRender()("equipped", 0), "sell").ok,
      true,
    );
    assert.equal(f.player.gold, 17 + item.value);
    assert.deepEqual(f.player.equipped, []);
    assert.deepEqual(f.player.inventory.equipment, []);
  }
});
// Confirmations must bind the entire rendered collection, including identical items.
test("bulk unequip retains reverse legacy order; rarity sales preserve unmatched bytes", () => {
  const a = { ...sword, value: 2 };
  const b = { ...sword, rarity: "Rare", value: 5 };
  const kept = JSON.stringify(b, null, 1);
  const f = setup([kept], [a, b, structuredClone(a)]);
  assert.equal(
    f.service.execute(f.service.beginRender()("equipped"), "unequip-all").ok,
    true,
  );
  assert.deepEqual(f.player.inventory.equipment, [
    kept,
    JSON.stringify(a),
    JSON.stringify(b),
    JSON.stringify(a),
  ]);
  const sale = f.service.beginRender()("inventory");
  assert.equal(f.service.execute(sale, "sell-all", "Common").ok, true);
  assert.equal(f.player.gold, 21);
  assert.deepEqual(f.player.inventory.equipment, [kept, JSON.stringify(b)]);
  assert.equal(f.service.execute(sale, "sell-all", "Rare").reason, "stale");
  assert.equal(
    f.service.execute(f.service.beginRender()("inventory"), "sell-all", "All")
      .ok,
    true,
  );
  assert.equal(f.player.gold, 31);
  assert.deepEqual(f.player.equipped, []);
});
// Invalid data or filters must fail before any destructive iteration or gold change.
test("invalid item, filter and empty selection reject atomically", () => {
  const f = setup([JSON.stringify(sword), '{"category":"hostile"}']);
  const before = structuredClone(f.player);
  assert.equal(
    f.service.execute(f.service.beginRender()("inventory"), "sell-all", "All")
      .reason,
    "invalid-item",
  );
  assert.deepEqual(f.player, before);
  const valid = setup();
  assert.equal(
    valid.service.execute(
      valid.service.beginRender()("inventory"),
      "sell-all",
      "Unknown",
    ).reason,
    "invalid-action",
  );
  assert.equal(
    valid.service.execute(
      valid.service.beginRender()("inventory"),
      "sell-all",
      "Heirloom",
    ).reason,
    "empty",
  );
  const empty = setup([]);
  assert.equal(
    empty.service.execute(
      empty.service.beginRender()("equipped"),
      "unequip-all",
    ).reason,
    "empty",
  );
});
