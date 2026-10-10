import { validateCandidate } from "./save-validation.mjs";
import { resolveEncounter } from "../content/catalog.mjs";
import { migrateLegacyMessages } from "./legacy-history.mjs";
/** Validate and map a detached local candidate without RNG, reset, reward application or writes.
 * Authoritative legacy aliases/numerics remain unchanged; catalog references are presentation-only.
 * @param {unknown} input Legacy tuple or complete current state.
 * @param {object} [options] sourceKind ('legacy'|'state') and source ('legacy'|'canonical').
 * @returns {object} Validation result with candidate, presentation references and raw history recovery.
 */
export function migrateLegacyState(
  input,
  { sourceKind = "legacy", source = "legacy" } = {},
) {
  if (!["legacy", "state"].includes(sourceKind))
    return {
      ok: false,
      issues: [{ code: "unsupported-source", path: "sourceKind" }],
    };
  const result = validateCandidate(input, sourceKind);
  if (!result.ok) return result;
  const candidate = result.candidate;
  const history = migrateLegacyMessages(candidate.dungeon.backlog, { source });
  candidate.dungeon.backlog = history.records;
  const mapped =
    candidate.enemy.name === null
      ? null
      : resolveEncounter(candidate.enemy.name, candidate.enemy.image).value;
  return {
    ok: true,
    candidate,
    presentation: {
      encounter: mapped
        ? { id: mapped.encounter.id, variantId: mapped.variant.id }
        : null,
    },
    recovery: history.recovery,
  };
}
