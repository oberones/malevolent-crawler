import { createImageLoader } from "./image-loader.mjs";
import { getSymbol } from "../content/catalog.mjs";
/**
 * Construct catalog-only inline art with explicit context spacing. A hidden local
 * font strut preserves the original glyph's engine-specific rounded line box and
 * baseline; the image overlays that box and contributes no intrinsic layout size.
 * @param {Document} document Owner document.
 * @returns {function} Render a role/context with optional decorative alternative;
 * release(root) disposes removed slots and dispose() releases mounted slots/observation.
 */
export function createSymbolView(document) {
  const owners = new WeakMap();
  /** Release owned requests in a subtree before its DOM is replaced.
   * @param {Node} root Symbol or containing tree; detached trees are supported.
   * @returns {void} Repeated release is harmless and retains no detached list.
   */
  function release(root) {
    owners.get(root)?.dispose();
    for (const node of root.querySelectorAll?.(".inline-symbol") ?? [])
      owners.get(node)?.dispose();
  }
  const observer = new document.defaultView.MutationObserver(
    // Classic history and allocation owners can replace whole subtrees directly.
    (records) => {
      for (const record of records)
        for (const node of record.removedNodes)
          if (!node.isConnected) release(node);
    },
  );
  observer.observe(document, { childList: true, subtree: true });
  /**
   * Reserve an existing symbol footprint without fetching or measuring game state.
   * @param {string} role Catalog symbol ID or legacy role.
   * @param {string} contextId Catalog-approved display context.
   * @param {object} [options] decorative defaults true for adjacent identity text.
   * @returns {HTMLElement} Detached inline symbol with a catalog-owned image.
   * @throws {TypeError} Unknown/mismatched identity, context or alternative.
   */
  function symbol(role, contextId, { decorative = true } = {}) {
    const result = getSymbol(role, contextId);
    if (!result.ok || !contextId || typeof decorative !== "boolean")
      throw new TypeError("Invalid symbol context");
    const node = document.createElement("span");
    node.className = "inline-symbol";
    node.dataset.symbol = result.value.id;
    node.dataset.context = contextId;
    if (decorative) node.setAttribute("aria-hidden", "true");
    const image = document.createElement("img");
    const terminal = document.createElement("span");
    terminal.className = "image-terminal";
    node.append(image, terminal);
    const loader = createImageLoader(image, terminal);
    owners.set(node, loader);
    loader.load({ kind: "symbol", role, contextId }, { decorative });
    return node;
  }
  // Explicit consumers release slots synchronously before replacing their DOM.
  symbol.release = release;
  /** Shut down document observation and mounted image requests with the service.
   * @returns {void} Repeated disposal is harmless.
   */
  symbol.dispose = () => {
    release(document);
    observer.disconnect();
  };
  return symbol;
}
