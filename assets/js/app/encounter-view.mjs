import { resolveEncounter } from "../content/catalog.mjs";

/**
 * Bind portrait presentation to the already-selected legacy identity and variant.
 * No gameplay state, random draws, rewards, timers or image-load callbacks are owned here.
 * @param {Document} document Owner of the existing combat panel.
 * @returns {function(object): void} Render an enemy into the current combat slots.
 */
export function createEncounterView(document) {
  /**
   * Resolve all identity data before updating the view; reserve space before loading art.
   * @param {object} enemy Already-selected name, image and level; never mutated.
   * @returns {void}
   * @throws {TypeError} Unknown or mismatched identity, or absent combat slots.
   */
  return function renderEncounter(enemy) {
    const resolved = resolveEncounter(enemy.name, enemy.image);
    if (!resolved.ok) throw new TypeError("Unknown encounter identity");
    const label = document.querySelector("#enemyPanel > p");
    const image = document.querySelector("#enemy-sprite");
    if (!label || !image) throw new TypeError("Missing encounter view slots");
    const { encounter, variant } = resolved.value;
    label.textContent = `${encounter.displayName} Lv.${enemy.lvl}`;
    image.alt = variant.alt;
    image.setAttribute("width", String(variant.width));
    image.setAttribute("height", String(variant.height));
    image.style.width = variant.legacyImage.size;
    image.style.height = "auto";
    image.style.aspectRatio = `${variant.width} / ${variant.height}`;
    image.src = variant.path;
  };
}
