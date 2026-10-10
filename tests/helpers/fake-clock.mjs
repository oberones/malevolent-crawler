/**
 * Own deterministic timers ordered by due time then registration order.
 * @param {number} [start=0] Initial time in milliseconds.
 * @returns {object} Timer API, advance(milliseconds), pending(), now(), dispose().
 * @throws {RangeError} On invalid time, zero-period intervals, or runaway callbacks.
 */
export function createFakeClock(start = 0) {
  if (!Number.isFinite(start)) throw new RangeError("Invalid start time");
  let time = start;
  let nextId = 1;
  const timers = new Map();
  // Store callbacks without scheduling any host event-loop resources.
  function schedule(callback, delay, repeat, args) {
    if (typeof callback !== "function")
      throw new TypeError("Timer requires a callback");
    if (!Number.isFinite(delay) || delay < 0 || (repeat && delay === 0))
      throw new RangeError("Invalid timer delay");
    const id = nextId++;
    timers.set(id, {
      id,
      callback,
      due: time + delay,
      period: repeat ? delay : 0,
      args,
    });
    return id;
  }
  return {
    // Report elapsed simulated milliseconds without consulting the wall clock.
    now() {
      return time;
    },
    // Match native timer argument forwarding for classic application callbacks.
    setTimeout(callback, delay = 0, ...args) {
      return schedule(callback, delay, false, args);
    },
    // Remove a pending one-shot timer; clearing unknown IDs is harmless.
    clearTimeout(id) {
      timers.delete(id);
    },
    // Require positive periods so a repeated callback cannot stall simulated time.
    setInterval(callback, delay, ...args) {
      return schedule(callback, delay, true, args);
    },
    // Removal also cancels the next occurrence from inside its own callback.
    clearInterval(id) {
      timers.delete(id);
    },
    // Execute every due callback, including newly scheduled callbacks, up to target.
    advance(milliseconds) {
      if (!Number.isFinite(milliseconds) || milliseconds < 0)
        throw new RangeError("Invalid advance");
      const target = time + milliseconds;
      let count = 0;
      while (true) {
        const next = [...timers.values()]
          .filter(
            // Ignore timers scheduled after the requested boundary.
            (timer) => timer.due <= target,
          )
          .sort(
            // Preserve registration order for ties, independent of host scheduling.
            (a, b) => a.due - b.due || a.id - b.id,
          )[0];
        if (!next) break;
        if (++count > 100_000)
          throw new RangeError("Runaway fake timer callbacks");
        time = next.due;
        if (next.period) next.due += next.period;
        else timers.delete(next.id);
        next.callback(...next.args);
      }
      time = target;
    },
    // Expose outstanding resources for setup/teardown assertions.
    pending() {
      return timers.size;
    },
    // Drop all owned callbacks; repeated teardown remains safe.
    dispose() {
      timers.clear();
    },
  };
}
