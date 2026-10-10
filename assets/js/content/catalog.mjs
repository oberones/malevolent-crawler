import { encounters, variants } from "./encounters.mjs";
import { relics, rarities } from "./relics.mjs";
import { symbols } from "./symbols.mjs";
import { freezeContent } from "./immutable.mjs";

/**
 * @typedef {{ok: true, value: object} | {ok: false, error: {
 * code: 'unknown-reference' | 'identity-mismatch', kind: string}}} CatalogResult
 * Frozen result; diagnostics never echo untrusted input. Unknown state identity
 * is an error, not a request for fallback art or random selection.
 */

// Construct a lookup over authored records only; private maps never escape consumers.
function index(rows, alias) {
  const result = new Map();
  for (const row of rows) {
    result.set(row.id, row);
    if (alias) result.set(alias(row), row);
  }
  return result;
}
const encounterIndex = index(
  encounters,
  // Legacy names remain compatibility aliases rather than visible names.
  (row) => row.legacyName,
);
const variantIndex = index(
  variants,
  // Preserve each saved image key, especially the two mage variants.
  (row) => row.legacyImage.name,
);
const relicIndex = index(
  relics,
  // Category tokens continue to drive legacy equipment calculations.
  (row) => row.legacyCategory,
);
const symbolIndex = index(
  symbols,
  // Semantic baseline roles join independently of old font classes.
  (row) => row.legacyRole,
);
const rarityIndex = index(rarities);

// Keep error data small, typed, immutable and independent of player input.
function issue(code, kind) {
  return freezeContent({ ok: false, error: { code, kind } });
}

// Share immutable records rather than making mutable presentation copies.
function success(value) {
  return freezeContent({ ok: true, value });
}

// Reject non-string references without coercion, inherited properties or URL construction.
function lookup(table, key, kind) {
  const value = typeof key === "string" ? table.get(key) : undefined;
  return value ? success(value) : issue("unknown-reference", kind);
}

/**
 * Resolve an active encounter without selecting a variant or consuming randomness.
 * @param {unknown} key - Exact stable ID or legacy encounter name.
 * @returns {CatalogResult} Immutable identity or typed unknown-reference failure.
 */
export function getEncounter(key) {
  return lookup(encounterIndex, key, "encounter");
}

/**
 * Resolve an art obligation, including the unused sprite for authoring tools.
 * @param {unknown} key - Exact stable variant ID or legacy image name (no extension).
 * @returns {CatalogResult} Immutable allowlisted path/dimensions or typed failure.
 */
export function getVariant(key) {
  return lookup(variantIndex, key, "variant");
}

/**
 * Resolve an already-selected encounter and image together; never guess a variant.
 * Legacy image objects must match name, type and width exactly; extra properties
 * are ignored and never returned. Callers parse save JSON before using this API.
 * @param {unknown} identity - Stable encounter ID or exact legacy name.
 * @param {unknown} image - Variant ID/image key or parsed legacy {name,type,size}.
 * @returns {CatalogResult} Frozen {encounter,variant} or typed reference/mismatch error.
 */
export function resolveEncounter(identity, image) {
  const encounter = getEncounter(identity);
  if (!encounter.ok) return encounter;
  const isRecord =
    image !== null && typeof image === "object" && !Array.isArray(image);
  const variant = getVariant(isRecord ? image.name : image);
  if (!variant.ok) return variant;
  const expected = variant.value.legacyImage;
  if (
    variant.value.encounterId !== encounter.value.id ||
    (isRecord && (image.type !== expected.type || image.size !== expected.size))
  ) {
    return issue("identity-mismatch", "encounter-variant");
  }
  return success({ encounter: encounter.value, variant: variant.value });
}

/**
 * Resolve a relic's display identity without changing category or statistics.
 * @param {unknown} key - Stable relic ID or exact legacy category.
 * @returns {CatalogResult} Immutable identity with symbol reference or typed failure.
 */
export function getRelic(key) {
  return lookup(relicIndex, key, "relic");
}

/**
 * Validate the category/attribute/type relationship used by an existing item.
 * This does not validate item values, roll stats, deduplicate or mutate holdings.
 * @param {unknown} key - Stable relic ID or exact legacy category.
 * @param {unknown} attribute - Existing Damage/Defense token.
 * @param {unknown} type - Existing Weapon/Armor/Shield/Helmet token.
 * @returns {CatalogResult} Immutable identity or typed unknown/mismatched reference.
 */
export function resolveRelic(key, attribute, type) {
  const relic = getRelic(key);
  if (!relic.ok) return relic;
  if (relic.value.attribute !== attribute || relic.value.type !== type) {
    return issue("identity-mismatch", "relic");
  }
  return relic;
}

/**
 * Resolve a symbol and optionally validate its measured rendering context.
 * Paths reserve future artwork; they do not assert delivered files or glyph sizes.
 * @param {unknown} key - Stable symbol ID or exact legacy semantic role.
 * @param {unknown} [contextId] - Exact baseline context ID when rendering in context.
 * @returns {CatalogResult} Immutable local asset reference/label or typed failure.
 */
export function getSymbol(key, contextId) {
  const symbol = lookup(symbolIndex, key, "symbol");
  if (!symbol.ok) return symbol;
  if (contextId !== undefined && !symbol.value.contextIds.includes(contextId)) {
    return issue("identity-mismatch", "symbol-context");
  }
  return symbol;
}

/**
 * Allowlist a rarity label and CSS token without interpreting arbitrary classes.
 * @param {unknown} key - Exact legacy rarity token, Common through Heirloom.
 * @returns {CatalogResult} Immutable {id,label,className} or typed failure.
 */
export function getRarity(key) {
  return lookup(rarityIndex, key, "rarity");
}
