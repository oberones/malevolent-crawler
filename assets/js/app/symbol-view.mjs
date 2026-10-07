import { getSymbol } from "../content/catalog.mjs";
/**
 * Construct catalog-only inline art with explicit context spacing. A hidden local
 * font strut preserves the original glyph's engine-specific rounded line box and
 * baseline; the image overlays that box and contributes no intrinsic layout size.
 * @param {Document} document Owner document.
 * @returns {function} Render a role/context with optional decorative alternative.
 */
export function createSymbolView(document) {
  /**
   * Reserve an existing symbol footprint without fetching or measuring game state.
   * @param {string} role Catalog symbol ID or legacy role.
   * @param {string} contextId Catalog-approved display context.
   * @param {object} [options] decorative defaults true for adjacent identity text.
   * @returns {HTMLElement} Detached inline symbol with a catalog-owned image.
   * @throws {TypeError} Unknown/mismatched identity, context or alternative.
   */
  return function symbol(role, contextId, { decorative = true } = {}) {
    const result = getSymbol(role, contextId);
    if (!result.ok || !contextId || typeof decorative !== "boolean")
      throw new TypeError("Invalid symbol context");
    const node = document.createElement("span");
    node.className = "inline-symbol";
    node.dataset.symbol = result.value.id;
    node.dataset.context = contextId;
    if (decorative) node.setAttribute("aria-hidden", "true");
    const image = document.createElement("img");
    image.setAttribute("src", result.value.path);
    image.alt = decorative ? "" : result.value.accessibleLabel;
    node.append(image);
    return node;
  };
}
