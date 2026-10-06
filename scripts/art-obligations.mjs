import { variants } from "../assets/js/content/encounters.mjs";
import { symbols } from "../assets/js/content/symbols.mjs";
import { requireThat } from "./art-common.mjs";
/** Derive required delivery rows from frozen originals and authored catalog identities.
 * @param {object} baseline Immutable art baseline. @returns {object[]} Required rows, independent of candidate manifest.
 * @throws {Error} If the original asset inventory is incomplete.
 */
export function artObligations(baseline) {
  requireThat(baseline.assets.length === 55, "Expected 55 original assets");
  const rows = [];
  for (const original of baseline.assets) {
    // Match exact paths rather than guessing identity from names.
    const variant = variants.find((item) => item.path === original.path);
    requireThat(
      variant ||
        original.path === "assets/icon/favicon.png" ||
        original.path === "assets/icon/favicon.ico",
      "Unknown original path",
    );
    rows.push({
      id:
        variant?.assetId ??
        (original.path.endsWith(".ico") ? "favicon-ico" : "favicon-png"),
      kind: variant ? "sprite" : "favicon",
      identityId: variant?.id ?? "quay-emblem",
      legacySource: original.path,
      aliases: [variant?.legacyImage.name ?? original.path],
      unusedButRequired: variant?.unusedButRequired ?? false,
      contextIds: variant?.unusedButRequired
        ? []
        : [variant ? "encounter/portrait" : "browser/favicon"],
      path: original.path,
      width: original.width,
      height: original.height,
      baseline: original,
    });
  }
  for (const symbol of symbols)
    rows.push({
      id: symbol.assetId,
      kind: "symbol",
      identityId: symbol.id,
      legacySource: null,
      aliases: [symbol.legacyRole],
      unusedButRequired: false,
      contextIds: symbol.contextIds,
      path: symbol.path,
      width: null,
      height: null,
      baseline: null,
    });
  rows.push({
    id: "missing-art",
    kind: "fallback",
    identityId: "missing-art",
    legacySource: null,
    aliases: [],
    unusedButRequired: false,
    contextIds: ["missing-art/portrait", "missing-art/symbol"],
    path: "assets/art/missing-art.png",
    width: null,
    height: null,
    baseline: null,
  });
  return rows;
}
