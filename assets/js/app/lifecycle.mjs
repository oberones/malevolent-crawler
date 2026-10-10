/**
 * Own disposable resources for one application/combat generation.
 * @param {object} dependencies Explicit clock with timeout/interval set/clear methods.
 * @returns {object} Guard, schedule, listen, audio ownership, invalidate and dispose APIs.
 * @throws {Error} Registering work after final disposal is a programming error.
 */
export function createLifecycle({ clock }) {
  let generation = 0,
    disposed = false;
  const resources = new Set();
  // Refuse resurrection of an application owner after final teardown.
  function assertActive() {
    if (disposed) throw new Error("Lifecycle disposed");
  }
  // Release exactly once and stop retaining the cleanup closure even on failure.
  function own(cleanup) {
    assertActive();
    let released = false;
    // Individual release is safe to call twice and removes its ownership record.
    function release() {
      if (released) return;
      released = true;
      resources.delete(release);
      cleanup();
    }
    resources.add(release);
    return release;
  }
  // Ignore callbacks already queued by the browser after an encounter has ended.
  function guard(callback) {
    assertActive();
    const token = generation;
    // Preserve callback arguments and receiver while enforcing generation validity.
    return function guarded(...args) {
      if (!disposed && token === generation) return callback.apply(this, args);
    };
  }
  // Invalidate first, then attempt every cleanup even if a host resource fails.
  function invalidate() {
    generation++;
    const issues = [];
    for (const release of [...resources]) {
      try {
        release();
      } catch {
        issues.push({ code: "cleanup-failed", path: "resource" });
      }
    }
    return issues;
  }
  return {
    guard,
    /** Register caller-owned restoration; returns an idempotent release function. */
    ownCleanup(cleanup) {
      return own(cleanup);
    },
    /**
     * Schedule a one-shot callback; release ownership before it executes.
     * @param {function} callback Synchronous operation to run in this generation.
     * @param {number} delay Delay in milliseconds, as accepted by the injected clock.
     * @returns {function} Idempotent cancellation function.
     */
    timeout(callback, delay) {
      assertActive();
      const id = clock.setTimeout(
        guard(
          // Remove finished timers from ownership before allowing nested scheduling.
          (...args) => {
            release();
            callback(...args);
          },
        ),
        delay,
      );
      const release = own(
        // Clear both pending and already-fired handles harmlessly.
        () => clock.clearTimeout(id),
      );
      return release;
    },
    /**
     * Schedule one owned interval; invalidation cancels all repeats.
     * @param {function} callback Operation to run in this generation.
     * @param {number} delay Repeat period in milliseconds.
     * @returns {function} Idempotent cancellation function.
     */
    interval(callback, delay) {
      assertActive();
      const id = clock.setInterval(guard(callback), delay);
      return own(
        // Prevent a repeated callback from crossing an encounter boundary.
        () => clock.clearInterval(id),
      );
    },
    /**
     * Attach an owned listener with native options and a guarded callback.
     * @param {EventTarget} target Explicit event source.
     * @param {string} type Native event name.
     * @param {function} callback Handler retaining its event-target receiver.
     * @param {object|boolean} [options] Native listener options.
     * @returns {function} Idempotent listener removal.
     */
    listen(target, type, callback, options) {
      assertActive();
      const wrapped = guard(callback);
      target.addEventListener(type, wrapped, options);
      return own(
        // Use matching registration options for capture-mode removal.
        () => target.removeEventListener(type, wrapped, options),
      );
    },
    /** Stop and unload one audio instance, including when stop itself fails. */
    ownAudio(audio) {
      return own(
        // Unload in finally so playback failure cannot retain decoded audio.
        () => {
          try {
            audio.stop();
          } finally {
            audio.unload();
          }
        },
      );
    },
    invalidate,
    /** Permanently dispose this owner; return sanitized cleanup issues. */
    dispose() {
      if (disposed) return [];
      disposed = true;
      return invalidate();
    },
    /** Report retained resources for diagnostics and repeated-entry tests. */
    pending() {
      return resources.size;
    },
  };
}
