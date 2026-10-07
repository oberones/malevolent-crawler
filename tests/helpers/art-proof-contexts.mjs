/** Resolve one symbol's measured proof cases without guessing role aliases.
 * @param {object} options Catalog symbol, baseline contexts and browser tuple.
 * @returns {object[]} Recorded cases for the selected tuple.
 * @throws {Error} When a required context is missing, duplicated or malformed.
 */
export function artProofContexts({
  symbol,
  contexts,
  browser,
  viewport,
  textScale,
}) {
  return symbol.contextIds.map(
    /* Require one qualified measurement for every catalog context. */ (id) => {
      const matches = contexts.filter(
        /* Exclude unrelated, blocked and mismatched measurements. */ (row) =>
          row.id === id &&
          row.status === "PASS" &&
          row.browser?.name === browser &&
          row.viewport?.width === viewport.width &&
          row.viewport?.height === viewport.height &&
          row.textScale === textScale,
      );
      if (matches.length !== 1)
        throw new Error(
          `Expected one measured context: ${id}; found ${matches.length}`,
        );
      const row = matches[0];
      if (
        !Number.isFinite(row.box?.width) ||
        row.box.width <= 0 ||
        !Number.isFinite(row.box?.height) ||
        row.box.height <= 0
      )
        throw new Error(`Invalid measured geometry: ${id}`);
      return row;
    },
  );
}
