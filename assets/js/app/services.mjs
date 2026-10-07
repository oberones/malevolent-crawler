import { createSymbolView } from "./symbol-view.mjs";
import { createItemView } from "./item-view.mjs";
import { createModalBridge } from "./modal-bridge.mjs";
import { createOutcomeView } from "./outcome-view.mjs";
import { createEntryView } from "./entry-view.mjs";
import { createEventView } from "./event-view.mjs";
import { createSnapshotStore } from "./snapshot-store.mjs";
import { createTransitions } from "./transitions.mjs";
import { initialStateSections } from "./save-validation.mjs";
/**
 * Connect persistence and optional DOM presentation to the classic engine through explicit accessors.
 * @param {object} dependencies Storage, clock, eventTarget, capture/replace and report callbacks; optional document enables narrative views.
 * @returns {object} One initialized owner; recovery never replaces live state.
 */
export function createGameServices({
  storage,
  now,
  eventTarget,
  capture,
  replace,
  report,
  document,
  itemEffects,
}) {
  const store = createSnapshotStore({ storage, now, eventTarget });
  const transitions = createTransitions({
    capture,
    commitSnapshot: store.commitSnapshot,
  });
  const loaded = store.readLocalState();
  let status = "recovery";
  if (loaded.status === "empty") {
    replace({ player: null, ...initialStateSections(), volume: loaded.volume });
    status = "ready";
  } else if (loaded.status === "ready") {
    const committed =
      loaded.source === "legacy"
        ? store.commitSnapshot(loaded.candidate)
        : { status: "saved" };
    if (committed.status === "saved") {
      replace(loaded.candidate);
      status = "ready";
    } else report(committed);
  }
  const symbol = document ? createSymbolView(document) : null;
  const modals = document ? createModalBridge(document) : null;
  const items =
    document && itemEffects
      ? createItemView({
          document,
          ...itemEffects,
          // Read the live player, including replacements on reset/import.
          getPlayer: () => capture().player,
        })
      : null;
  const narrative = document
    ? {
        ...createOutcomeView(document, {
          historyRecovery: loaded.recoveryData?.history,
        }),
        entry: createEntryView(document),
        events: createEventView(document),
      }
    : null;
  return {
    status,
    loaded,
    symbol,
    /**
     * Replace authored slots with catalog-only symbols in this newly rendered region.
     * @param {Document|Element} root Owned document or newly constructed region.
     * @returns {void}
     * @throws {TypeError} For an unknown role/context; caller data cannot provide URLs.
     */
    mountSymbols(root) {
      for (const slot of root.querySelectorAll(
        "[data-symbol-role][data-symbol-context]",
      ))
        slot.replaceWith(
          symbol(slot.dataset.symbolRole, slot.dataset.symbolContext),
        );
    },
    items,
    narrative,
    /** Execute a complete synchronous engine action, nesting all requested writes. */
    run(callback) {
      if (status !== "ready") return undefined;
      const result = transitions.run(
        // Request after successful work; nested requests still collapse at the outer boundary.
        () => {
          const value = callback();
          if (capture().player !== null) transitions.requestSave();
          return value;
        },
      );
      if (result.persistence) report(result.persistence);
      return result.value;
    },
    requestSave: transitions.requestSave,
    /** Release presentation resources together with storage listeners. */
    dispose() {
      items?.dispose();
      narrative?.dispose();
      symbol?.dispose();
      modals?.dispose();
      store.dispose();
    },
  };
}
