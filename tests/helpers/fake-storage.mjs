/**
 * Construct isolated Web Storage-like string data with one-shot faults.
 * @param {Record<string,string>} [initial={}] Exact starting bytes by key.
 * @returns {object} Storage operations, calls, fail(method,key), entries().
 */
export function createFakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  const faults = [];
  const calls = [];
  // Record attempted operations, then fail before any data mutation.
  function check(method, key, value) {
    calls.push({ method, key, ...(value === undefined ? {} : { value }) });
    const index = faults.findIndex(
      // A wildcard key can fail the next operation regardless of its target.
      (fault) =>
        fault.method === method &&
        (fault.key === undefined || fault.key === key),
    );
    if (index !== -1) {
      faults.splice(index, 1);
      throw new Error(`Injected ${method} failure`);
    }
  }
  return {
    calls,
    // Missing keys return null, distinct from stored JSON null or empty strings.
    getItem(key) {
      key = String(key);
      check("getItem", key);
      return data.get(key) ?? null;
    },
    // Browser storage coerces both keys and values to strings.
    setItem(key, value) {
      key = String(key);
      value = String(value);
      check("setItem", key, value);
      data.set(key, value);
    },
    // Deletions are observable and can fail before removing bytes.
    removeItem(key) {
      key = String(key);
      check("removeItem", key);
      data.delete(key);
    },
    // Queue a single failure so retries can be tested explicitly.
    fail(method, key) {
      faults.push({ method, key });
    },
    // Return a detached snapshot, without triggering injected read failures.
    entries() {
      return Object.fromEntries(data);
    },
  };
}
