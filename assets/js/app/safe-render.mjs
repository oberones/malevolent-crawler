import { getSymbol, getRarity, resolveEncounter } from "../content/catalog.mjs";
import { readBoundedData, SAVE_LIMITS } from "./save-validation.mjs";
import { validateMessage } from "./message-records.mjs";
// Unknown descriptor properties are rejected rather than forwarded to DOM attributes.
function fields(part, allowed) {
  for (const key of Object.keys(part))
    if (!allowed.includes(key)) throw new TypeError("Unsafe render descriptor");
}
// Keep player text inert and bounded even when rendering outside message templates.
function plain(value) {
  if (
    typeof value !== "string" ||
    new TextEncoder().encode(value).length > SAVE_LIMITS.fieldBytes
  )
    throw new TypeError("Invalid render text");
  return value;
}
/**
 * Construct a DOM renderer with no HTML, URL or CSS interpolation surface.
 * @param {Document} document Explicit owner document.
 * @param {object} [options={}] Trusted schemas/templates and optional onRecover(ref).
 * @returns {object} renderParts(parts) and renderMessage(record) produce detached nodes.
 * @throws {TypeError} Invalid descriptors/messages; no partial output is attached.
 */
export function createSafeRenderer(
  document,
  { schemas = {}, templates = {}, onRecover } = {},
) {
  // Build a fragment from a bounded descriptor tree; callers attach only on success.
  function compose(parts) {
    if (!Array.isArray(parts)) throw new TypeError("Invalid render parts");
    const fragment = document.createDocumentFragment();
    for (const part of parts) {
      if (!part || typeof part !== "object" || Array.isArray(part))
        throw new TypeError("Invalid render part");
      let node;
      if (part.kind === "text") {
        fields(part, ["kind", "text"]);
        node = document.createTextNode(plain(part.text));
      } else if (["strong", "em", "span", "rarity"].includes(part.kind)) {
        fields(
          part,
          part.kind === "rarity"
            ? ["kind", "id", "children"]
            : ["kind", "children"],
        );
        node = document.createElement(
          part.kind === "rarity" ? "span" : part.kind,
        );
        if (part.kind === "rarity") {
          const rarity = getRarity(part.id);
          if (!rarity.ok) throw new TypeError("Unknown rarity");
          node.className = rarity.value.className;
        }
        node.append(compose(part.children));
      } else if (part.kind === "symbol" || part.kind === "encounter") {
        fields(
          part,
          part.kind === "symbol"
            ? ["kind", "id", "contextId", "decorative"]
            : ["kind", "id", "image", "decorative"],
        );
        if (
          part.decorative !== undefined &&
          typeof part.decorative !== "boolean"
        )
          throw new TypeError("Invalid alternative");
        const result =
          part.kind === "symbol"
            ? getSymbol(part.id, part.contextId)
            : resolveEncounter(part.id, part.image);
        if (!result.ok) throw new TypeError("Unknown asset identity");
        const asset =
          part.kind === "symbol" ? result.value : result.value.variant;
        node = document.createElement("img");
        node.setAttribute("src", asset.path);
        node.alt = part.decorative ? "" : (asset.accessibleLabel ?? asset.alt);
      } else throw new TypeError("Unknown render kind");
      fragment.append(node);
    }
    return fragment;
  }
  return {
    /** Compose inert descriptors; throws on arbitrary attributes or unregistered assets. */
    renderParts(parts) {
      return compose(readBoundedData(parts));
    },
    /** Validate before invoking trusted templates; raw historical HTML is never a template. */
    renderMessage(input) {
      const checked = validateMessage(input, schemas);
      if (!checked.ok) throw new TypeError("Invalid message");
      const { id, params } = checked.record;
      if (id === "history.unavailable") {
        const fragment = document.createDocumentFragment();
        fragment.append(
          document.createTextNode(
            "Some history is unavailable. Original text remains available for recovery. ",
          ),
        );
        if (onRecover) {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = "Recover history";
          button.addEventListener(
            "click",
            // Treat recovery references as opaque data, never navigation targets.
            () => onRecover(params.recoveryRef),
          );
          fragment.append(button);
        }
        return fragment;
      }
      if (!Object.hasOwn(templates, id) || typeof templates[id] !== "function")
        throw new TypeError("Missing trusted template");
      return compose(readBoundedData(templates[id](params)));
    },
  };
}
