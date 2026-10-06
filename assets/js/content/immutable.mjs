/**
 * Freeze an owned, acyclic plain-data catalog recursively before publication.
 * This helper is for trusted authored literals, never imported save objects.
 * @template T
 * @param {T} value - Owned JSON-shaped data; no getters or cycles.
 * @returns {T} The same data with all nested objects and arrays frozen.
 */
export function freezeContent(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezeContent(child);
    Object.freeze(value);
  }
  return value;
}
