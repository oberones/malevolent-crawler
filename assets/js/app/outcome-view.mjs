import { createSymbolView } from "./symbol-view.mjs";
import {
  messageText,
  messageSchemas,
  messageTemplates,
} from "../content/messages.mjs";
import { createEncounterView } from "./encounter-view.mjs";
import { createSafeRenderer } from "./safe-render.mjs";
import { getRelic, getRarity } from "../content/catalog.mjs";
/** Validate and detach a narrative record without consuming randomness or changing state.
 * @param {string} id Catalog message ID.
 * @param {object} [params] Exact template parameters.
 * @returns {object} JSON-safe record.
 * @throws {TypeError} Invalid template or parameters.
 */
export function record(id, params = {}) {
  const result = { id, params: structuredClone(params) };
  messageText(result);
  return result;
}
/** Format catalog text for textContent only.
 * @param {string} id Message ID.
 * @param {object} [params] Template parameters.
 * @returns {string} Inert text.
 * @throws {TypeError} Invalid record.
 */
export function text(id, params = {}) {
  return messageText({ id, params });
}
/** Create presentation helpers for completed outcomes; these never award rewards.
 * @param {Document} document Owner document.
 * @returns {object} Safe text, log, item and encounter presentation methods.
 */
export function createOutcomeView(document) {
  const symbol = createSymbolView(document);
  const renderer = createSafeRenderer(document, {
    schemas: messageSchemas,
    templates: messageTemplates,
  });
  return {
    record,
    text,
    /** Set one existing text slot from the shared catalog. */
    put(selector, id, params = {}) {
      document.querySelector(selector).textContent = text(id, params);
    },
    /** Render typed current messages; retain legacy bytes in state for the later migration package. */
    renderLog(target, message) {
      if (typeof message === "string") {
        target.textContent =
          "Some history is unavailable. Original text remains in saved history for recovery.";
      } else {
        target.replaceChildren(renderer.renderMessage(message));
        if (message.id === "inventory.reward") {
          const item = message.params.item;
          const id = getRelic(item.category).value.symbolId;
          const stage = target.closest("#combatLogBox")
            ? "combat-reward"
            : "dungeon-reward";
          const heading = document.createElement("h4");
          heading.append(symbol(id, `${id.slice(6)}/${stage}`));
          while (target.firstChild) heading.append(target.firstChild);
          target.append(heading);
          const list = document.createElement("ul");
          for (const stat of message.params.item.stats) {
            const [key, value] = Object.entries(stat)[0];
            const line = document.createElement("li");
            const label = key
              .replace(/([A-Z])/g, ".$1")
              .replace(/crit/g, "c")
              .toUpperCase();
            line.textContent = `${label}+${value}${["atkSpd", "vamp", "critRate", "critDmg"].includes(key) ? "%" : ""}`;
            list.append(line);
          }
          target.append(list);
        }
      }
    },
    /** Use only allowlisted rarity/category labels without modifying item data or existing icons. */
    itemLabel(target, item) {
      const relic = getRelic(item.category);
      const rarity = getRarity(item.rarity);
      if (!relic.ok || !rarity.ok) throw new TypeError("Unknown item identity");
      target.className = rarity.value.className;
      target.append(
        document.createTextNode(`${item.rarity} ${relic.value.displayName}`),
      );
    },
    encounter: createEncounterView(document),
    /** Refresh upgrade copy using already-rolled choices and the existing reroll budget. */
    upgrade(remaining, rerolls) {
      this.put("#lvlupSelect h1", "upgrade.title");
      this.put("#lvlupSelect h4", "upgrade.remaining", { count: remaining });
      this.put("#lvlReroll", "upgrade.reroll", { remaining: rerolls });
    },
  };
}
