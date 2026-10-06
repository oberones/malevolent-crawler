import { createDialogService } from "./dialogs.mjs";
import { createLifecycle } from "./lifecycle.mjs";
/**
 * Adapt classic display/markup changes to one owned modal focus boundary.
 * Observation occurs after synchronous legacy handlers finish binding controls.
 * No game state, confirmation or random selection is owned by this adapter.
 * @param {Document} document The live game document.
 * @returns {object} dispose() releases observation, listeners, inert state and focus.
 */
export function createModalBridge(document) {
  const lifecycle = createLifecycle({ clock: document.defaultView });
  const dialogs = createDialogService({ document, lifecycle });
  const panels = [...document.querySelectorAll(".modal-container")];
  const history = new Map();
  let active = null;
  let visibleBefore = new Set();
  let invoker = null;
  // Pointer activation must retain the real invoking control even in Safari.
  lifecycle.listen(
    document,
    "click",
    // Retain the invoking control even when pointer activation does not focus it.
    (event) => {
      invoker = event.target.closest("button,input,select,a[href]");
    },
    true,
  );
  // Restore service-owned attributes without undoing newer legacy visibility/content decisions.
  function release() {
    if (!active) return;
    const style = active.panel.getAttribute("style");
    active.close();
    if (style === null) active.panel.removeAttribute("style");
    else active.panel.setAttribute("style", style);
    active = null;
  }
  // Locate only explicitly safe cancellation actions; mandatory decisions cannot Escape-confirm.
  function cancellation(panel) {
    return panel.querySelector(
      '[data-dialog-cancel],button[id*="cancel"],button[id*="close"],#close-menu',
    );
  }
  // Reconcile a completed render, including nested dialogs and replacement of focused controls.
  function sync() {
    const visible = panels.filter(
      // Legacy display is the source of truth, even while its background branch is inert.
      (panel) =>
        document.defaultView.getComputedStyle(panel).display !== "none",
    );
    const opened = visible.filter(
      // A newly exposed sibling takes precedence over a still-visible parent panel.
      (panel) => !visibleBefore.has(panel),
    );
    const next =
      opened.at(-1) ??
      (visible.includes(active?.panel) ? active.panel : visible.at(-1));
    visibleBefore = new Set(visible);
    if (
      next &&
      active?.panel === next &&
      active.content === next.firstElementChild &&
      next.contains(document.activeElement)
    )
      return;
    const prior = active;
    const returning = prior && history.get(prior.panel)?.invoker;
    release();
    if (next && returning && next.contains(returning))
      history.delete(prior.panel);
    if (!next) {
      history.clear();
      const fallback = [
        ...document.querySelectorAll("#open-inventory, #title-action"),
      ].find(
        // Return to a rendered screen when the original invoking panel has been removed.
        (control) => control.getClientRects().length > 0,
      );
      if (document.activeElement === document.body) fallback?.focus();
      return;
    }
    if (!history.has(next))
      history.set(next, {
        invoker: invoker?.isConnected ? invoker : document.activeElement,
      });
    const cancel = cancellation(next);
    const heading = next.querySelector("h1,h2,h3,p");
    next.setAttribute("aria-label", heading?.textContent || "Encounter");
    const initialFocus =
      returning && next.contains(returning)
        ? returning
        : (cancel ?? next.querySelector("button,input,select"));
    const close = dialogs.open(next, {
      invoker: history.get(next).invoker,
      initialFocus: initialFocus ?? next,
      dismissible: Boolean(cancel),
      // Reuse the caller's exact cancellation, including exploration and dimming cleanup.
      onCancel: () => cancel.click(),
    });
    next.style.display = "flex";
    active = { panel: next, content: next.firstElementChild, close };
  }
  const observer = new document.defaultView.MutationObserver(sync);
  for (const panel of panels)
    observer.observe(panel, {
      attributes: true,
      attributeFilter: ["style"],
      childList: true,
      subtree: true,
    });
  sync();
  return {
    /** Stop reconciliation before restoring the active dialog and owned listeners. */
    dispose() {
      observer.disconnect();
      release();
      dialogs.dispose();
      lifecycle.dispose();
      history.clear();
    },
  };
}
