/**
 * Own a copied, finite sequence of random draws and reject accidental extra draws.
 * @param {number[]} values Values in [0, 1), in call order.
 * @returns {{random: function(): number, calls: number[], assertConsumed: function(): void}}
 * @throws {TypeError} If any draw is outside the Math.random domain.
 */
export function createRandomTape(values = []) {
  if (
    !Array.isArray(values) ||
    values.some(
      // Reject non-finite and out-of-domain values before exposing the tape.
      (value) => !Number.isFinite(value) || value < 0 || value >= 1,
    )
  )
    throw new TypeError("Invalid random tape");
  const tape = [...values];
  const calls = [];
  return {
    calls,
    // Exhaustion is an oracle failure, never an implicit fallback random source.
    random() {
      if (calls.length === tape.length)
        throw new Error("Random tape exhausted");
      const value = tape[calls.length];
      calls.push(value);
      return value;
    },
    // Assert this at the end of each case to detect removed or reordered draws.
    assertConsumed() {
      if (calls.length !== tape.length)
        throw new Error(
          `${tape.length - calls.length} unconsumed random draws`,
        );
    },
  };
}
