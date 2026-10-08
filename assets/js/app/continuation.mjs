/**
 * Restore resting controls before deriving combat from an already validated tuple.
 * Does not generate enemies, advance rooms or apply rewards.
 * @param {object} dependencies Live state and explicit presentation callbacks.
 * @returns {void}
 */
export function continueEncounter({ player, dungeon, rest, reset, resume }) {
  if (player.stats.hp === 0) reset();
  dungeon.status = { exploring: false, paused: true, event: player.inCombat };
  rest();
  if (player.inCombat) resume();
}
