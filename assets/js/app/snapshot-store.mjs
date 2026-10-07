import { migrateLegacyState } from "./legacy-migration.mjs";
import {
  validateCandidate,
  validateVolume,
  initialStateSections,
  readBoundedData,
} from "./save-validation.mjs";
export const SAVE_KEY = "malevolentCrawler.save.v1";
export const PREVIOUS_KEY = "malevolentCrawler.save.previous.v1";
const legacyKeys = {
  player: "playerData",
  dungeon: "dungeonData",
  enemy: "enemyData",
  volume: "volumeData",
};
// Diagnostics identify the failed boundary without exposing contents or host exception text.
function issue(code, path) {
  return { code, path };
}
/**
 * Own one tab's snapshot protocol with explicit I/O and operational time.
 * Call readLocalState before commits. Recovery/disposal blocks writes; a foreign
 * storage event blocks until an explicit reread. Rechecks detect observed changes,
 * but cannot provide an atomic cross-tab lock between the read and write.
 * @param {object} dependencies storage Web Storage, now() Date, optional eventTarget.
 * @returns {object} readLocalState, commitSnapshot and idempotent dispose.
 */
export function createSnapshotStore({ storage, now, eventTarget }) {
  let historyRecovery = {};
  let observed = null,
    initialized = false,
    blocked = true,
    foreign = false,
    disposed = false;
  // A clear event also invalidates this tab; other storage areas do not.
  function onStorage(event) {
    if (
      (!event.storageArea || event.storageArea === storage) &&
      (event.key === SAVE_KEY || event.key === null)
    )
      foreign = true;
  }
  eventTarget?.addEventListener("storage", onStorage);
  // Gather raw recovery sources without attempting writes or silently substituting backup.
  function recovery(raw, issues) {
    for (const key of [PREVIOUS_KEY, ...Object.values(legacyKeys)])
      if (!Object.hasOwn(raw, key)) {
        try {
          const value = storage.getItem(key);
          if (value !== null) raw[key] = value;
        } catch {
          issues.push(issue("read-failed", key));
        }
      }
    const previous = Object.hasOwn(raw, PREVIOUS_KEY)
      ? validateCandidate(raw[PREVIOUS_KEY], "snapshot")
      : null;
    blocked = true;
    return {
      status: "recovery",
      issues,
      recoveryData: {
        raw,
        ...(previous?.ok ? { previous: previous.candidate } : {}),
      },
    };
  }
  return {
    /** Read a single complete revision or pure legacy candidate; never writes or merges revisions. */
    readLocalState() {
      if (disposed)
        return { status: "recovery", issues: [issue("disposed", "store")] };
      initialized = true;
      blocked = true;
      foreign = false;
      const raw = {};
      historyRecovery = {};
      let canonical;
      try {
        canonical = storage.getItem(SAVE_KEY);
      } catch {
        return recovery(raw, [issue("read-failed", SAVE_KEY)]);
      }
      observed = canonical;
      if (canonical !== null) {
        raw[SAVE_KEY] = canonical;
        const checked = validateCandidate(canonical, "snapshot");
        if (!checked.ok) return recovery(raw, checked.issues);
        const migrated = migrateLegacyState(checked.candidate.state, {
          sourceKind: "state",
          source: "canonical",
        });
        if (!migrated.ok) return recovery(raw, migrated.issues);
        historyRecovery = {
          ...checked.candidate.historyRecovery,
          ...migrated.recovery,
        };
        blocked = false;
        return {
          status: "ready",
          source: "canonical",
          revision: checked.candidate.revision,
          candidate: migrated.candidate,
          presentation: migrated.presentation,
          recoveryData: { raw, history: historyRecovery },
          issues: [],
        };
      }
      const failures = [];
      for (const key of [PREVIOUS_KEY, ...Object.values(legacyKeys)]) {
        try {
          const value = storage.getItem(key);
          if (value !== null) raw[key] = value;
        } catch {
          failures.push(issue("read-failed", key));
        }
      }
      if (failures.length) return recovery(raw, failures);
      if (!Object.hasOwn(raw, "playerData")) {
        if (
          Object.hasOwn(raw, PREVIOUS_KEY) ||
          Object.hasOwn(raw, "dungeonData") ||
          Object.hasOwn(raw, "enemyData")
        )
          return recovery(raw, [issue("partial-state", "legacy")]);
        const preferences = Object.hasOwn(raw, "volumeData")
          ? validateVolume(raw.volumeData)
          : { ok: true, candidate: initialStateSections().volume };
        blocked = false;
        return {
          status: "empty",
          volume: preferences.ok
            ? preferences.candidate
            : initialStateSections().volume,
          issues: preferences.ok ? [] : preferences.issues,
          ...(!preferences.ok ? { recoveryData: { raw } } : {}),
        };
      }
      const tuple = {};
      for (const [section, key] of Object.entries(legacyKeys))
        if (Object.hasOwn(raw, key)) {
          try {
            tuple[section] = readBoundedData(raw[key]);
          } catch (error) {
            return recovery(raw, [issue(error.code ?? "invalid-json", key)]);
          }
        }
      const checked = migrateLegacyState(tuple);
      if (!checked.ok) return recovery(raw, checked.issues);
      historyRecovery = checked.recovery;
      blocked = false;
      return {
        status: "ready",
        source: "legacy",
        candidate: checked.candidate,
        issues: [],
        presentation: checked.presentation,
        recoveryData: { raw, history: historyRecovery },
      };
    },
    /** Commit a validated completed candidate; failed stages never issue rollback writes. */
    commitSnapshot(candidate) {
      if (disposed || !initialized || blocked)
        return {
          status: "unsaved",
          issue: issue(disposed ? "disposed" : "recovery-required", "store"),
        };
      if (foreign)
        return { status: "conflict", issue: issue("foreign-change", SAVE_KEY) };
      const checked = validateCandidate(candidate, "state");
      if (!checked.ok) return { status: "unsaved", issue: checked.issues[0] };
      let current;
      try {
        current = storage.getItem(SAVE_KEY);
      } catch {
        return { status: "unsaved", issue: issue("read-failed", SAVE_KEY) };
      }
      if (current !== observed) {
        foreign = true;
        return {
          status: "conflict",
          issue: issue("revision-conflict", SAVE_KEY),
        };
      }
      let revision = 1;
      if (current !== null) {
        const prior = validateCandidate(current, "snapshot");
        if (!prior.ok) {
          blocked = true;
          return { status: "unsaved", issue: prior.issues[0] };
        }
        revision = prior.candidate.revision + 1;
      }
      let serialized;
      try {
        const envelope = {
          format: "malevolent-crawler-save",
          version: 1,
          contentVersion: 1,
          revision,
          savedAt: now().toISOString(),
          state: checked.candidate,
          ...(Object.keys(historyRecovery).length ? { historyRecovery } : {}),
        };
        const valid = validateCandidate(envelope, "snapshot");
        if (!valid.ok) return { status: "unsaved", issue: valid.issues[0] };
        serialized = JSON.stringify(valid.candidate);
        const encoded = validateCandidate(serialized, "snapshot");
        if (!encoded.ok) return { status: "unsaved", issue: encoded.issues[0] };
      } catch {
        return {
          status: "unsaved",
          issue: issue("serialization-failed", "snapshot"),
        };
      }
      if (current !== null)
        try {
          storage.setItem(PREVIOUS_KEY, current);
        } catch {
          return {
            status: "unsaved",
            issue: issue("backup-failed", PREVIOUS_KEY),
          };
        }
      try {
        storage.setItem(SAVE_KEY, serialized);
      } catch {
        return { status: "unsaved", issue: issue("write-failed", SAVE_KEY) };
      }
      observed = serialized;
      return { status: "saved", revision };
    },
    /** Stop foreign-change observation and disallow future reads/writes on this owner. */
    dispose() {
      if (disposed) return;
      disposed = true;
      eventTarget?.removeEventListener("storage", onStorage);
    },
  };
}
