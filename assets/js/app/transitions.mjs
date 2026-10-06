import { validateCandidate } from "./save-validation.mjs";
// Failures remain explicit at the outer boundary without exposing host data.
function unsaved(code) {
  return { status: "unsaved", issue: { code, path: "transition" } };
}
/**
 * Coalesce save requests inside synchronous, nested gameplay operations.
 * Mutations remain engine-owned; this service does not roll them back. Any nested
 * exception poisons the outer operation even when caught by its caller. Async
 * callbacks are unsupported: browser callbacks must each enter a new transition.
 * @param {object} dependencies capture() state and commitSnapshot(state) typed result.
 * @returns {object} run(callback) returns value/persistence; requestSave() queues only.
 */
export function createTransitions({ capture, commitSnapshot }) {
  let depth = 0,
    pending = false,
    failed = false;
  return {
    /** Mark a save request inside an active operation; refuse intermediate standalone saves. */
    requestSave() {
      if (!depth) return unsaved("outside-transition");
      pending = true;
      return { status: "deferred" };
    },
    /** Execute synchronous rules; rethrow rule errors and persist only a completed outer state. */
    run(callback) {
      if (callback.constructor?.name === "AsyncFunction") {
        if (depth) failed = true;
        throw new TypeError("Transitions must be synchronous");
      }
      const outer = depth === 0;
      if (outer) {
        pending = false;
        failed = false;
      }
      depth++;
      let value;
      try {
        value = callback();
        if (value && typeof value.then === "function") {
          // The synchronous TypeError reports this operation as failed; consume any
          // later rejection as well so unsupported work cannot escape unhandled.
          Promise.resolve(value).catch(
            // Persistence is already refused and the caller receives the boundary error.
            () => undefined,
          );
          failed = true;
          throw new TypeError("Transitions must be synchronous");
        }
      } catch (error) {
        failed = true;
        throw error;
      } finally {
        depth--;
        if (outer && failed) pending = false;
      }
      if (!outer) return { value, persistence: { status: "deferred" } };
      if (failed) return { value, persistence: unsaved("failed-transition") };
      if (!pending) return { value, persistence: null };
      pending = false;
      try {
        const checked = validateCandidate(capture(), "state");
        if (!checked.ok)
          return {
            value,
            persistence: { status: "unsaved", issue: checked.issues[0] },
          };
        return { value, persistence: commitSnapshot(checked.candidate) };
      } catch {
        return { value, persistence: unsaved("capture-or-commit-failed") };
      }
    },
  };
}
