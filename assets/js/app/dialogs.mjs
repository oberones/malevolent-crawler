// Snapshot only attributes this service owns; static caller markup stays intact.
function attributes(element, names) {
  return names.map(
    // Null distinguishes an absent attribute from an explicitly empty one.
    (name) => [name, element.getAttribute(name)],
  );
}
// Restore exact prior attributes, including hidden, inline display and semantics.
function restore(element, snapshot) {
  for (const [name, value] of snapshot) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
}
/**
 * Manage one existing modal at a time with explicit document/lifecycle ownership.
 * The caller supplies native buttons, a label and the triggering control (pointer
 * activation does not always focus it). Confirmation remains caller-owned.
 * @param {object} dependencies document and createLifecycle() owner.
 * @returns {object} open(element,options) returns close(); dispose() restores the page.
 * @throws {TypeError|Error} Invalid markup/label, concurrent opens or disposed owner.
 */
export function createDialogService({ document, lifecycle }) {
  let active = null,
    disposed = false;
  return {
    /**
     * Block surrounding content, focus a heading/control and trap modal keyboard navigation.
     * @param {HTMLElement} element Existing connected modal container.
     * @param {object} [options={}] initialFocus, invoker, labelledBy, dismissible, onCancel.
     * @returns {function} Idempotent close(reason); only 'cancel' calls onCancel.
     */
    open(
      element,
      {
        initialFocus,
        invoker = document.activeElement,
        labelledBy,
        dismissible = true,
        onCancel,
      } = {},
    ) {
      if (disposed) throw new Error("Dialog service disposed");
      if (active) throw new Error("A dialog is already open");
      if (
        !element?.isConnected ||
        element.ownerDocument !== document ||
        element === document.body ||
        !element.contains(initialFocus ?? element)
      )
        throw new TypeError("Invalid dialog element or focus");
      const label = labelledBy ?? element.getAttribute("aria-labelledby");
      if (
        !element.getAttribute("aria-label") &&
        (!label || !document.getElementById(label))
      )
        throw new TypeError("Dialog needs an accessible label");
      const snapshot = attributes(element, [
        "hidden",
        "style",
        "role",
        "aria-modal",
        "aria-labelledby",
        "tabindex",
        "inert",
      ]);
      const backgrounds = [];
      const releases = [];
      let closed = false;
      // List only rendered, enabled controls that can receive sequential focus.
      function controls() {
        return [
          ...element.querySelectorAll(
            "button,input,select,textarea,a[href],[tabindex]",
          ),
        ].filter(
          // Hidden/inert/disabled descendants must not create a keyboard trap.
          (node) =>
            !node.disabled &&
            node.tabIndex >= 0 &&
            !node.closest("[inert]") &&
            node.getClientRects().length > 0 &&
            document.defaultView.getComputedStyle(node).visibility !== "hidden",
        );
      }
      // Prefer the explicit control, then a heading, then a native control/container.
      function focusInitial() {
        const target =
          initialFocus ??
          element.querySelector('[tabindex="-1"]') ??
          controls()[0] ??
          element;
        target.focus();
        if (!element.contains(document.activeElement)) element.focus();
      }
      // Restore background state and focus even when the application is tearing down.
      function close(reason) {
        if (closed) return;
        closed = true;
        for (const release of releases) release();
        restore(element, snapshot);
        for (const [node, inert] of backgrounds) node.inert = inert;
        active = null;
        if (invoker?.isConnected && !invoker.closest("[inert]"))
          invoker.focus();
        if (reason === "cancel") onCancel?.();
      }
      // Escape never confirms; Tab cycles only through currently available controls.
      function onKey(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          if (dismissible) close("cancel");
        } else if (event.key === "Tab") {
          const list = controls();
          const index = list.indexOf(document.activeElement);
          if (!list.length) {
            event.preventDefault();
            element.focus();
          } else if (event.shiftKey && index <= 0) {
            event.preventDefault();
            list.at(-1).focus();
          } else if (
            !event.shiftKey &&
            (index === -1 || index === list.length - 1)
          ) {
            event.preventDefault();
            list[0].focus();
          }
        }
      }
      // Catch programmatic focus escapes in addition to native inert blocking.
      function onFocus(event) {
        if (!element.contains(event.target)) focusInitial();
      }
      try {
        // Every sibling branch is blocked, including when a modal is nested in a panel.
        for (
          let branch = element;
          branch !== document.body;
          branch = branch.parentElement
        ) {
          if (!branch?.parentElement)
            throw new TypeError("Modal must be inside body");
          for (const sibling of branch.parentElement.children)
            if (sibling !== branch) {
              backgrounds.push([sibling, sibling.inert]);
              sibling.inert = true;
            }
        }
        element.inert = false;
        element.hidden = false;
        element.style.display = "block";
        element.setAttribute("role", "dialog");
        element.setAttribute("aria-modal", "true");
        element.setAttribute("tabindex", "-1");
        if (label) element.setAttribute("aria-labelledby", label);
        releases.push(
          lifecycle.listen(document, "keydown", onKey, true),
          lifecycle.listen(document, "focusin", onFocus, true),
        );
        releases.push(lifecycle.ownCleanup(close));
        active = close;
        focusInitial();
        return close;
      } catch (error) {
        close();
        throw error;
      }
    },
    /** Restore any active dialog; never execute a cancellation or confirmation action. */
    dispose() {
      if (disposed) return;
      disposed = true;
      active?.();
    },
  };
}
