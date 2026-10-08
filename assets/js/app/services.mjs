import { createRecoveryView } from "./recovery-view.mjs";
import { createCharacterExchangeView } from "./character-exchange-view.mjs";
import { migrateLegacyState } from "./legacy-migration.mjs";
import { continueEncounter } from "./continuation.mjs";
import { createLifecycle } from "./lifecycle.mjs";
import { createCharacterImport, resetCandidate } from "./character-import.mjs";
import { encodeCharacter } from "./character-codec.mjs";
import { createSymbolView } from "./symbol-view.mjs";
import { createItemView } from "./item-view.mjs";
import { createModalBridge } from "./modal-bridge.mjs";
import { createOutcomeView } from "./outcome-view.mjs";
import { createEntryView } from "./entry-view.mjs";
import { createEventView } from "./event-view.mjs";
import { createSnapshotStore } from "./snapshot-store.mjs";
import { createTransitions } from "./transitions.mjs";
import {
  initialStateSections,
  validateCandidate,
  readBoundedData,
  validateVolume,
} from "./save-validation.mjs";
/**
 * Connect persistence and optional DOM presentation to the classic engine through explicit accessors.
 * @param {object} dependencies Storage, clock, eventTarget, capture/replace and report callbacks; optional document enables views; activateRecovery enables entry after explicit recovery; cleanupImport releases classic resources after commit.
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
  activateRecovery,
  // Hosts without running engine resources need no cleanup.
  cleanupImport = () => {},
}) {
  const lifecycle = createLifecycle({
    clock: document?.defaultView ?? globalThis,
  });
  const runLifecycle = createLifecycle({
    clock: document?.defaultView ?? globalThis,
  });
  const combatLifecycle = createLifecycle({
    clock: document?.defaultView ?? globalThis,
  });
  const audioLifecycle = createLifecycle({
    clock: document?.defaultView ?? globalThis,
  });
  const store = createSnapshotStore({
    storage,
    now,
    eventTarget,
    onConflict: report,
  });
  let sessionOnly = false;
  // Explicit unsaved sessions cannot silently overwrite the retained durable character.
  function commit(candidate) {
    return sessionOnly
      ? { status: "unsaved", issue: { code: "session-only", path: "import" } }
      : store.commitSnapshot(candidate);
  }
  const transitions = createTransitions({
    capture,
    commitSnapshot: commit,
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
    } else {
      loaded.issues.push(committed.issue);
      report(committed);
    }
  }
  const characterImport = createCharacterImport({
    capture,
    commit,
    // Invalidate queued attack/UI callbacks before releasing classic interval/audio handles.
    cleanup() {
      lifecycle.invalidate();
      runLifecycle.invalidate();
      combatLifecycle.invalidate();
      audioLifecycle.invalidate();
      cleanupImport();
    },
    // Replace only after the importer has persisted or received explicit session-only consent.
    replace(candidate, result) {
      sessionOnly = result.status === "session-only";
      replace(candidate);
      report(result);
    },
  });
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
  const historyRecovery = loaded.recoveryData?.history ?? {};
  const narrative = document
    ? {
        ...createOutcomeView(document, {
          historyRecovery,
        }),
        entry: createEntryView(document),
        events: createEventView(document),
      }
    : null;
  // Extract a separately validated retained character without trusting a damaged run.
  function recoveryOptions() {
    const raw = loaded.recoveryData?.raw ?? {};
    let character;
    try {
      const source = raw["malevolentCrawler.save.v1"]
        ? readBoundedData(raw["malevolentCrawler.save.v1"]).state?.player
        : raw.playerData;
      const checked = validateCandidate(source, "character");
      if (checked.ok) character = checked.candidate;
    } catch (error) {
      // Failed extraction remains explicit; raw source recovery stays available.
      return {
        previous: loaded.recoveryData?.previous,
        extractionIssue: {
          code: error.code ?? "invalid-json",
          path: "retained-character",
        },
      };
    }
    return {
      previous: loaded.recoveryData?.previous,
      character,
      candidate: loaded.status === "ready" ? loaded.candidate : undefined,
    };
  }
  // Adopt only a confirmed validated recovery into memory; originals remain untouched.
  function recoverSession(kind) {
    const choice = recoveryOptions()[kind];
    if (!choice) return { ok: false };
    let checked;
    if (kind === "character") {
      const preferences = validateVolume(loaded.recoveryData?.raw?.volumeData);
      checked = resetCandidate(choice, {
        player: choice,
        ...initialStateSections(),
        ...(preferences.ok ? { volume: preferences.candidate } : {}),
      });
    } else
      checked = migrateLegacyState(
        kind === "previous" ? choice.state : choice,
        { sourceKind: "state", source: "canonical" },
      );
    if (!checked.ok) return checked;
    Object.assign(
      historyRecovery,
      choice.historyRecovery ?? {},
      checked.recovery ?? {},
    );
    sessionOnly = true;
    replace(checked.candidate);
    status = "ready";
    return { ok: true };
  }
  // Recovery exports include exact source strings plus the latest in-memory tuple.
  function recoveryPayload() {
    return {
      raw: loaded.recoveryData?.raw ?? {},
      issues: loaded.issues,
      history: historyRecovery,
      state: capture(),
    };
  }
  const recovery = document
    ? createRecoveryView({
        document,
        payload: recoveryPayload,
        options: recoveryOptions,
        recover: recoverSession,
        retry: () => commit(capture()), // Retry never reloads over newer in-memory progress.
        reload: () => document.defaultView.location.reload(), // Explicitly abandon memory only through the reload control.
        activate: activateRecovery,
      })
    : null;
  return {
    // Recovery can explicitly promote a validated session to ready.
    get status() {
      return status;
    },
    recovery,
    exchange: document ? createCharacterExchangeView(document) : null,
    loaded,
    characterImport,
    lifecycle,
    runLifecycle,
    combatLifecycle,
    audioLifecycle,
    continueEncounter,
    /** Export only the current validated character with Unicode-safe transport. */
    exportCharacter() {
      return encodeCharacter(capture().player);
    },
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
    /** Release pending engine work, presentation resources and storage listeners. */
    dispose() {
      lifecycle.dispose();
      runLifecycle.dispose();
      combatLifecycle.dispose();
      audioLifecycle.dispose();
      items?.dispose();
      narrative?.dispose();
      symbol?.dispose();
      recovery?.dispose();
      modals?.dispose();
      store.dispose();
    },
  };
}
