import { getSymbol, resolveEncounter } from "../content/catalog.mjs";

// Anchor authored paths to the application root, including deployments in a subdirectory.
function assetUrl(path) {
  return new URL(`../../../${path}`, import.meta.url).pathname;
}
const fallbackUrl = assetUrl("assets/art/fallback.png");

// Reject unknown state identities before altering the current image or issuing a request.
function resolveArt(reference) {
  if (reference?.kind === "encounter") {
    const result = resolveEncounter(reference.identity, reference.variant);
    if (result.ok)
      return {
        path: result.value.variant.path,
        label: result.value.variant.alt,
      };
  } else if (reference?.kind === "symbol" && reference.contextId) {
    const result = getSymbol(reference.role, reference.contextId);
    if (result.ok)
      return { path: result.value.path, label: result.value.accessibleLabel };
  }
  throw new TypeError("Invalid image identity or context");
}

/**
 * Own one image request lifecycle without owning layout, gameplay or identity selection.
 * Consumers reserve image dimensions and overlay a terminal span in the same box;
 * visibility preserves that geometry. Keep adjacent identity text and controls outside
 * these nodes. Dispose before replacing the view or creating another owner for its slot.
 * @param {HTMLImageElement} image Consumer-owned image with reserved geometry.
 * @param {HTMLSpanElement} terminal Separate, positioned local-symbol overlay.
 * @returns {{load: function(object, object=): void, dispose: function(): void}}
 * Synchronous load validates catalog references; network/decode failures are handled
 * internally. image.dataset.imageState is loading, ready, fallback, text or disposed.
 * @throws {TypeError} Invalid nodes, non-boolean decorative option or unknown reference.
 * @throws {Error} load after disposal.
 */
export function createImageLoader(image, terminal) {
  if (
    image?.localName !== "img" ||
    terminal?.localName !== "span" ||
    image.ownerDocument !== terminal.ownerDocument ||
    terminal.contains(image)
  )
    throw new TypeError("Expected separate image and terminal symbol slots");
  let generation = 0;
  let disposed = false;
  let decorativeImage = false;
  let cleanup = null;

  // Remove exact owned listeners without disturbing unrelated consumer handlers.
  function detach() {
    cleanup?.();
    cleanup = null;
  }

  // Each attempt gets a fresh token, so even an old primary decode cannot beat its fallback.
  function request(path, isFallback) {
    detach();
    const token = ++generation;
    // Promise completions and queued events may outlive a replaced identity or view.
    function current() {
      return !disposed && token === generation;
    }
    // Attempt the authored fallback once; terminal rendering never requests another image.
    function failed() {
      if (!current()) return;
      detach();
      if (!isFallback) {
        request(fallbackUrl, true);
        return;
      }
      generation++;
      // Retain the failed catalog URL: removing src can turn an inline image into
      // a text-sized element in native engines, even with reserved dimensions.
      image.style.visibility = "hidden";
      image.dataset.imageState = "text";
      terminal.textContent = "◇";
      terminal.hidden = false;
    }
    // A load event alone is insufficient: require completed pixel decoding before display.
    async function loaded() {
      if (!current()) return;
      detach();
      try {
        await image.decode();
        if (!current()) return;
        if (!image.naturalWidth || !image.naturalHeight) {
          failed();
          return;
        }
        if (decorativeImage) image.alt = "";
        image.style.visibility = "visible";
        image.dataset.imageState = isFallback ? "fallback" : "ready";
      } catch {
        failed();
      }
    }
    // Release both handlers on completion, replacement, fallback and disposal.
    cleanup = () => {
      image.removeEventListener("load", loaded);
      image.removeEventListener("error", failed);
    };
    image.addEventListener("load", loaded);
    image.addEventListener("error", failed);
    image.setAttribute("src", path);
  }

  /**
   * Start or replace a catalog-owned request after atomic identity validation.
   * @param {object} reference {kind:'encounter',identity,variant} or
   * {kind:'symbol',role,contextId}; relics use their catalog symbol and context.
   * @param {object} [options] decorative=true when adjacent text supplies identity.
   * @returns {void} Loading never blocks the caller or disables controls.
   * @throws {TypeError|Error} Invalid reference/options or disposed owner.
   */
  function load(reference, { decorative = false } = {}) {
    if (disposed) throw new Error("Image loader is disposed");
    if (typeof decorative !== "boolean")
      throw new TypeError("Invalid image alternative option");
    const art = resolveArt(reference);
    // A nonempty alternative keeps failed decorative images from collapsing in
    // WebKit. They remain hidden from accessibility and sight until decoded;
    // successful decorative images then receive the usual empty alternative.
    // Broken inline images otherwise lay out their alternative text instead of
    // respecting the reserved width/height in Chromium and Firefox.
    if (
      image.ownerDocument.defaultView.getComputedStyle(image).display ===
      "inline"
    )
      image.style.display = "inline-block";
    decorativeImage = decorative;
    image.alt = art.label;
    if (decorative) image.setAttribute("aria-hidden", "true");
    else image.removeAttribute("aria-hidden");
    image.removeAttribute("srcset");
    image.style.visibility = "hidden";
    image.dataset.imageState = "loading";
    terminal.textContent = "";
    terminal.hidden = true;
    if (decorative) {
      terminal.setAttribute("aria-hidden", "true");
      terminal.removeAttribute("role");
      terminal.removeAttribute("aria-label");
    } else {
      terminal.removeAttribute("aria-hidden");
      terminal.setAttribute("role", "img");
      terminal.setAttribute("aria-label", art.label);
    }
    request(assetUrl(art.path), false);
  }

  /**
   * Invalidate pending completions, remove owned listeners and release the source.
   * @returns {void} Repeated disposal is harmless; later load calls throw.
   */
  function dispose() {
    if (disposed) return;
    disposed = true;
    generation++;
    detach();
    image.removeAttribute("src");
    image.style.visibility = "hidden";
    image.dataset.imageState = "disposed";
    terminal.hidden = true;
  }

  return { load, dispose };
}
