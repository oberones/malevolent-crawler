import { validateEquipment } from "./save-validation.mjs";
import { getRarity } from "../content/catalog.mjs";

/**
 * Bind item operations to a rendered collection, position and revision.
 * The caller owns validated player state, completed-transition saves, stat refresh,
 * and DOM rendering. Call beginRender for each new item view and execute inside
 * the existing transition coordinator; success mutates holdings/gold synchronously.
 * @param {{getPlayer:function():object,rerender:function(string):void}} options
 * Live player accessor and callback requesting fresh UI after a stale action.
 * @returns {object} beginRender() binding factory and execute(binding, action, rarity).
 */
export function createItemActions({ getPlayer, rerender }) {
  let revision = 0;
  const bindings = new WeakMap();

  /**
   * Invalidate older views and capture both collections without changing item data.
   * Every engine mutation outside this service must render again, even when it
   * removes and replaces identical encoded strings (which have no instance ID).
   * @returns {function(string,number|null):object} Bind inventory/equipped index;
   * null binds the entire collection for sell-all/unequip-all confirmations.
   */
  function beginRender() {
    const player = getPlayer();
    const inventory = player.inventory.equipment;
    const equipped = player.equipped;
    const snapshot = {
      player,
      inventory,
      equipped,
      references: [...equipped],
      bytes: JSON.stringify([inventory, equipped]),
      revision: ++revision,
    };
    /**
     * Issue an immutable view-local position, never an item-content identity.
     * @param {string} collection inventory or equipped.
     * @param {number|null} [index] Rendered index, or null for a bulk operation.
     * @returns {object} Opaque binding; copies and bindings from other owners fail.
     * @throws {TypeError} Unknown collection or position outside this rendered view.
     */
    return function bind(collection, index = null) {
      const length =
        collection === "inventory" ? inventory.length : equipped.length;
      if (
        !["inventory", "equipped"].includes(collection) ||
        (index !== null &&
          (!Number.isInteger(index) || index < 0 || index >= length))
      )
        throw new TypeError("Invalid item position");
      const binding = Object.freeze({
        collection,
        index,
        revision: snapshot.revision,
      });
      bindings.set(binding, snapshot);
      return binding;
    };
  }

  /**
   * Validate the live position and apply a single legacy-equivalent item operation.
   * No random draws, rendering, stat calculations or saves occur on success.
   * @param {object} binding Original binding issued by the most recent render.
   * @param {string} action equip, unequip, sell, unequip-all, or sell-all.
   * @param {string} [rarity] Required sell-all filter: All or an existing rarity.
   * @returns {{ok:boolean,reason?:string}} Failure changes no holdings or gold;
   * stale failure requests rerender. Success consumes all current view bindings.
   */
  function execute(binding, action, rarity) {
    const snapshot = bindings.get(binding);
    const player = getPlayer();
    const inventory = player.inventory.equipment;
    const equipped = player.equipped;
    if (
      !snapshot ||
      snapshot.revision !== revision ||
      snapshot.player !== player ||
      snapshot.inventory !== inventory ||
      snapshot.equipped !== equipped ||
      snapshot.references.some(
        // Object identity detects reordered identical equipped instances.
        (item, index) => item !== equipped[index],
      ) ||
      snapshot.bytes !== JSON.stringify([inventory, equipped])
    ) {
      rerender("stale");
      return { ok: false, reason: "stale" };
    }
    const { collection, index } = binding;
    const bulk = index === null;
    if (!(
      (action === "sell" && !bulk) ||
      (action === "equip" && !bulk && collection === "inventory") ||
      (action === "unequip" && !bulk && collection === "equipped") ||
      (action === "unequip-all" && bulk && collection === "equipped") ||
      (action === "sell-all" &&
        bulk &&
        collection === "inventory" &&
        (rarity === "All" || getRarity(rarity).ok))
    ))
      return { ok: false, reason: "invalid-action" };
    if (action === "equip" && equipped.length >= 6)
      return { ok: false, reason: "capacity" };
    const source = collection === "inventory" ? inventory : equipped;
    const positions = bulk ? Array.from(source.keys()) : [index];
    const selected = [];
    for (const position of positions) {
      const result = validateEquipment(source[position]);
      if (!result.ok) return { ok: false, reason: "invalid-item" };
      if (
        action !== "sell-all" ||
        rarity === "All" ||
        result.candidate.rarity === rarity
      )
        selected.push({ position, item: result.candidate });
    }
    if (!selected.length) return { ok: false, reason: "empty" };
    if (action === "equip") {
      inventory.splice(index, 1);
      equipped.push(selected[0].item);
    } else if (action === "unequip" || action === "unequip-all") {
      // Legacy unequip-all appends in reverse equipped order, including duplicates.
      for (const { position } of selected.reverse()) {
        inventory.push(JSON.stringify(equipped[position]));
        equipped.splice(position, 1);
      }
    } else {
      // Sum in original list order to preserve floating-point legacy sale arithmetic.
      let gold = player.gold;
      for (const { item } of selected) gold += item.value;
      if (!Number.isFinite(gold)) return { ok: false, reason: "invalid-value" };
      player.gold = gold;
      for (const { position } of selected.reverse()) source.splice(position, 1);
    }
    revision++;
    return { ok: true };
  }
  return { beginRender, execute };
}
