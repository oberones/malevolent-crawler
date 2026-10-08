/**
 * Latch foreign canonical changes until an explicit reread; this is not a cross-tab lock.
 * @param {object} dependencies eventTarget, storage, key and onConflict callback.
 * @returns {object} blocked getter, mark(), reset(), dispose().
 */
export function createStorageConflicts({
  eventTarget,
  storage,
  key,
  onConflict,
}) {
  let blocked = false;
  // Notify once per ownership loss, including changes detected immediately before commit.
  function mark() {
    if (blocked) return;
    blocked = true;
    onConflict?.({
      status: "conflict",
      issue: { code: "foreign-change", path: key },
    });
  }
  // Ignore unrelated keys and sessionStorage events; localStorage.clear also loses ownership.
  function observe(event) {
    if (
      (!event.storageArea || event.storageArea === storage) &&
      (event.key === key || event.key === null)
    )
      mark();
  }
  eventTarget?.addEventListener("storage", observe);
  return {
    // Expose the latched state without permitting mutation.
    get blocked() {
      return blocked;
    },
    mark,
    // Explicit read establishes a new observed revision.
    reset() {
      blocked = false;
    },
    // Release this tab's observer.
    dispose() {
      eventTarget?.removeEventListener("storage", observe);
    },
  };
}
