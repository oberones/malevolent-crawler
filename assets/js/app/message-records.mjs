import {
  getEncounter,
  getRelic,
  getSymbol,
  getRarity,
} from "../content/catalog.mjs";
import {
  readBoundedData,
  validateEquipment,
  SAVE_LIMITS,
} from "./save-validation.mjs";
const historySchema = Object.freeze({ recoveryRef: "text" });
// Parameter types are application-authored, never supplied by saved data.
function accepts(value, type) {
  if (type === "text")
    return (
      typeof value === "string" &&
      new TextEncoder().encode(value).length <= SAVE_LIMITS.fieldBytes
    );
  if (type === "number")
    return typeof value === "number" && Number.isFinite(value);
  if (type === "item") return validateEquipment(value).ok;
  const lookups = {
    encounter: getEncounter,
    relic: getRelic,
    symbol: getSymbol,
    rarity: getRarity,
  };
  return Object.hasOwn(lookups, type) && lookups[type](value).ok;
}
/**
 * Validate a known message and exact parameters before a template sees them.
 * The built-in history notice is reserved; narrative schemas arrive with US1.
 * @param {unknown} input Untrusted {id,params} data.
 * @param {object} [schemas={}] Trusted application registry of field/type schemas.
 * @returns {{ok:boolean,record?:object,issues?:object[]}} Detached record or typed issues.
 */
export function validateMessage(input, schemas = {}) {
  try {
    const record = readBoundedData(input);
    if (
      !record ||
      Array.isArray(record) ||
      Object.keys(record).length !== 2 ||
      typeof record.id !== "string" ||
      !record.params ||
      typeof record.params !== "object" ||
      Array.isArray(record.params)
    )
      throw new TypeError();
    const schema =
      record.id === "history.unavailable"
        ? historySchema
        : Object.hasOwn(schemas, record.id)
          ? schemas[record.id]
          : null;
    if (
      !schema ||
      Object.keys(record.params).length !== Object.keys(schema).length
    )
      throw new TypeError();
    for (const [key, type] of Object.entries(schema))
      if (
        !Object.hasOwn(record.params, key) ||
        !accepts(record.params[key], type)
      )
        throw new TypeError();
    return { ok: true, record };
  } catch {
    return {
      ok: false,
      issues: [{ code: "invalid-message", path: "message" }],
    };
  }
}
