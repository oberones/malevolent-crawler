import { createDialogService } from "./dialogs.mjs";
import { createLifecycle } from "./lifecycle.mjs";
import { createCharacterExchangeView } from "./character-exchange-view.mjs";
/**
 * Present recovery in the existing loader/modal; all source and error text stays inert.
 * @param {object} dependencies document, payload(), options(), recover(kind), retry(), reload(), activate().
 * @returns {object} showBoot(), show(), report(result); choices never write implicitly.
 */
export function createRecoveryView({
  document,
  payload,
  options,
  recover,
  retry,
  reload,
  activate,
}) {
  const exchange = createCharacterExchangeView(document);
  const lifecycle = createLifecycle({ clock: document.defaultView });
  const dialogs = createDialogService({ document, lifecycle });
  let closeConfirmation;
  let last = { status: "unsaved" };
  // Construct a labelled native control without interpreting user data as markup.
  function button(id, label, action) {
    const node = document.createElement("button");
    node.id = id;
    node.textContent = label;
    node.onclick = action;
    return node;
  }
  // Retain a persistent status and a reachable recovery action during unsaved play.
  function report(result) {
    last = result;
    let region = document.querySelector("#save-notice");
    let status = document.querySelector("#save-status");
    if (!region) {
      region = document.createElement("aside");
      region.id = "save-notice";
      if (!status) {
        status = document.createElement("p");
        status.id = "save-status";
      }
      status.setAttribute("role", "status");
      region.append(
        status,
        button("save-recovery", "Recover / export", () => show()),
      ); // Inspect current memory without requesting a save.
      document.body.append(region);
    }
    status.textContent =
      result.status === "saved"
        ? ""
        : result.status === "conflict"
          ? "Progress is not saved: another tab changed this save. Reload or export this session; saving is suspended."
          : "Progress is not saved. Keep this tab open and export your session or retry.";
    region.hidden = result.status === "saved";
  }
  // Render exact raw source strings and current memory as a locally downloadable JSON document.
  function contents(root, boot) {
    root.classList.add("recovery-content");
    const message = document.createElement("p");
    message.id = boot ? "boot-status" : "recovery-status";
    message.setAttribute("role", "alert");
    const data = payload();
    message.textContent = boot
      ? "Unable to load your saved progress safely. Original data is retained. "
      : "Export your current session before leaving this tab. ";
    for (const entry of data.issues ?? [])
      message.textContent += `${entry.path}: ${entry.code}. `;
    const text = document.createElement("textarea");
    text.id = "recovery-raw";
    text.readOnly = true;
    text.setAttribute("aria-label", "Recovery data");
    text.value = JSON.stringify(boot ? data.raw : data, null, 2);
    root.append(
      message,
      text,
      button("recovery-download", "Download recovery data", () =>
        exchange.download(text.value, "malevolent-crawler-recovery.json", root),
      ),
    ); // Download exact selectable recovery text.
    if (boot) {
      root.append(button("boot-retry", "Retry loading", reload));
      for (const [kind, label] of [
        ["previous", "Use prior-good save for this session"],
        ["character", "Recover retained character and reset run"],
        ["candidate", "Use loaded save for this session"],
      ]) {
        if (!options()[kind]) continue;
        root.append(
          button(`recover-${kind}`, label, () => confirm(root, kind, label)),
        ); // Require a second explicit decision before replacing memory.
      }
    } else {
      if (last.status === "conflict")
        root.append(button("conflict-reload", "Reload newer save", reload));
      else if (last.issue?.code !== "session-only")
        root.append(
          button("save-retry", "Retry saving", () => {
            // Retry this complete current state without rereading over memory.
            const result = retry();
            report(result);
            message.textContent =
              result.status === "saved"
                ? "Saved."
                : "Still not saved. Export your recovery data before leaving.";
          }),
        );
      root.append(
        button("recovery-close", "Close", () => {
          // Modal bridge restores the invoking control on close.
          root.parentElement.style.display = "none";
        }),
      );
    }
  }
  // Confirmation keeps originals intact; all recovery adoption is explicitly session-only.
  function confirm(root, kind, label) {
    root.replaceChildren();
    const description = document.createElement("p");
    description.id = "recovery-description";
    description.textContent = `${label}? This replaces the in-memory session only. Original stored data will remain unchanged; progress is not saved. Export before closing this tab.`;
    root.append(
      description,
      button("recovery-confirm", "Use for this session only", () => {
        // Adoption never writes a malformed source or silent reset.
        const result = recover(kind);
        if (!result.ok) {
          description.textContent =
            "Unable to recover safely. Retry loading or download the original data.";
          return;
        }
        closeConfirmation?.();
        report({ status: "session-only", issue: { code: "session-only" } });
        activate();
      }),
      button("recovery-cancel", "Cancel", () => {
        closeConfirmation?.();
        root.replaceChildren();
        contents(root, true);
        root.querySelector(`#recover-${kind}`)?.focus();
      }),
    ); // Cancellation is read-only.
    root.setAttribute("aria-label", "Confirm recovery");
    closeConfirmation = dialogs.open(root, {
      initialFocus: root.querySelector("#recovery-cancel"),
      // Escape invokes the same read-only cancellation as the button.
      onCancel: () => root.querySelector("#recovery-cancel").click(),
    });
  }
  // The guarded loader remains the sole boot recovery region.
  function showBoot() {
    const loader = document.querySelector("#loading");
    loader.replaceChildren();
    const root = document.createElement("div");
    loader.append(root);
    contents(root, true);
    loader.style.display = "flex";
  }
  // Reuse the existing default modal and its shared dialog/focus owner.
  function show() {
    const modal = document.querySelector("#defaultModal");
    const root = document.createElement("div");
    root.className = "content";
    modal.replaceChildren(root);
    contents(root, false);
    modal.style.display = "flex";
  }
  return {
    showBoot,
    show,
    report,
    // Release confirmation focus ownership during teardown.
    dispose() {
      dialogs.dispose();
      lifecycle.dispose();
    },
  };
}
