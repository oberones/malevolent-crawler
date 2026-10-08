import { decodeCharacter } from "./character-codec.mjs";
import {
  validateCandidate,
  initialStateSections,
  readBoundedData,
} from "./save-validation.mjs";
/** Build a detached established run reset, retaining character holdings and local preferences.
 * @param {object} player Validated character.
 * @param {object} current Current or initial local state.
 * @returns {object} Validated reset candidate or issues; never writes or mutates inputs.
 */
export function resetCandidate(player, current) {
  const state = readBoundedData(current);
  state.player = readBoundedData(player);
  const next = state.player;
  next.stats.hp = next.stats.hpMax;
  next.lvl = 1;
  next.blessing = 1;
  next.exp = {
    expCurr: 0,
    expMax: 100,
    expCurrLvl: 0,
    expMaxLvl: 100,
    lvlGained: 0,
  };
  next.bonusStats = {
    hp: 0,
    atk: 0,
    def: 0,
    atkSpd: 0,
    vamp: 0,
    critRate: 0,
    critDmg: 0,
  };
  next.skills = [];
  next.inCombat = false;
  delete next.allocated;
  const initial = initialStateSections();
  state.dungeon.progress.floor = 1;
  state.dungeon.progress.room = 1;
  state.dungeon.statistics = initial.dungeon.statistics;
  state.dungeon.status = initial.dungeon.status;
  state.dungeon.settings = initial.dungeon.settings;
  state.dungeon.backlog = [];
  state.dungeon.action = 0;
  delete state.dungeon.enemyMultipliers;
  state.enemy = initial.enemy;
  return validateCandidate(state, "state");
}
/**
 * Own one detached preview and an explicit persist-before-replace transaction.
 * @param {object} dependencies capture(), commit(state), cleanup(), replace(state,result).
 * Cleanup/replace are synchronous host adapters invoked once after success/explicit session-only.
 * @returns {object} preview(text), cancel(), confirm({sessionOnly?}); typed outcomes.
 */
export function createCharacterImport({ capture, commit, cleanup, replace }) {
  let pending = null,
    failed = false;
  return {
    /** Validate without writes; a rejected preview invalidates any older pending import. */
    preview(text) {
      pending = null;
      failed = false;
      const decoded = decodeCharacter(text);
      if (decoded.ok) pending = decoded.player;
      return decoded.ok
        ? { ok: true, player: readBoundedData(pending) }
        : decoded;
    },
    /** Cancel only the pending preview; runtime and storage remain untouched. */
    cancel() {
      pending = null;
      failed = false;
    },
    /** Reset and validate against current local preferences, then persist before replacement. */
    confirm({ sessionOnly = false } = {}) {
      if (!pending) return { status: "no-preview" };
      if (sessionOnly && !failed) return { status: "confirmation-required" };
      let checked;
      try {
        checked = resetCandidate(pending, capture());
      } catch {
        return {
          status: "unsaved",
          issue: { code: "invalid-current-state", path: "import" },
        };
      }
      if (!checked.ok) return { status: "unsaved", issue: checked.issues[0] };
      const result = sessionOnly
        ? { status: "session-only" }
        : commit(checked.candidate);
      if (!["saved", "session-only"].includes(result.status)) {
        failed = true;
        return result;
      }
      pending = null;
      failed = false;
      cleanup();
      replace(checked.candidate, result);
      return result;
    },
  };
}
