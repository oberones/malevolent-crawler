import { isDeepStrictEqual } from "node:util";
import sharp from "sharp";
import {
  readNonempty,
  requireThat,
  sha256,
  validateReview,
  isMain,
} from "./art-common.mjs";
import { inspectPng } from "./image-inspection.mjs";
import { inspectIco } from "./pack-ico.mjs";
import { artObligations } from "./art-obligations.mjs";
export { inspectPng } from "./image-inspection.mjs";
/** Identify a measurement tuple so a different browser or scale cannot substitute.
 * @param {object} row Geometry measurement. @returns {string} Stable tuple key.
 */
export function contextKey(row) {
  return JSON.stringify([
    row.id,
    row.browser,
    row.viewport,
    row.textScale,
    row.dpr,
  ]);
}
// Compare numeric CSS values with the contract tolerance, rejecting NaN and units other than pixels.
function near(actual, expected) {
  const numeric =
    typeof actual === "number"
      ? actual
      : typeof actual === "string" && /^-?[\d.]+px$/.test(actual)
        ? Number.parseFloat(actual)
        : NaN;
  const target =
    typeof expected === "number"
      ? expected
      : typeof expected === "string" && /^-?[\d.]+px$/.test(expected)
        ? Number.parseFloat(expected)
        : NaN;
  return (
    Number.isFinite(numeric) &&
    Number.isFinite(target) &&
    Math.abs(numeric - target) <= 0.5
  );
}
// Validate every matched baseline tuple; blocked native tuples cannot become invented passes.
async function validateContexts(root, entry, baseline) {
  requireThat(Array.isArray(entry.contexts), "Missing contexts");
  const seen = new Set();
  for (const row of entry.contexts) {
    const key = contextKey(row);
    requireThat(!seen.has(key), "Duplicate context tuple");
    seen.add(key);
  }
  if (entry.kind === "symbol") {
    // Only this role's authoritative measurements are relevant.
    const originals = baseline.contexts.filter((row) =>
      entry.contextIds.includes(row.id),
    );
    requireThat(
      originals.length > 0 && entry.contexts.length === originals.length,
      "Missing or extra geometry tuples",
    );
    for (const original of originals) {
      // Match the complete environment tuple, not just the context name.
      const row = entry.contexts.find(
        (candidate) => contextKey(candidate) === contextKey(original),
      );
      requireThat(
        original.status === "PASS" && row?.status === "PASS",
        "Unqualified baseline/candidate geometry",
      );
      requireThat(row.fontStatus === "loaded", "Font readiness missing");
      for (const field of ["x", "y", "width", "height"])
        requireThat(
          near(row.box?.[field], original.box[field]),
          "Geometry exceeds 0.5px tolerance",
        );
      for (const field of [
        "baselineOffset",
        "marginLeft",
        "marginRight",
        "paddingLeft",
        "paddingRight",
        "lineHeight",
      ])
        requireThat(
          near(row[field], original[field]),
          "Spacing/baseline exceeds 0.5px tolerance",
        );
      requireThat(
        row.verticalAlign === original.verticalAlign,
        "Vertical alignment mismatch",
      );
      await readNonempty(root, row.screenshot);
      await validateReview(root, row.review);
    }
  } else {
    for (const id of entry.contextIds) {
      // Non-glyph contexts still need individual visual records, but no invented glyph dimensions.
      const rows = entry.contexts.filter((row) => row.id === id);
      requireThat(rows.length > 0, "Missing display context");
      for (const row of rows) {
        requireThat(row.status === "PASS", "Display context incomplete");
        await readNonempty(root, row.screenshot);
        await validateReview(root, row.review);
      }
    }
  }
}
// Check each asset and truthful provenance without hiding other collection gaps.
async function validateEntry(root, entry, required, baseline) {
  for (const key of [
    "id",
    "kind",
    "identityId",
    "legacySource",
    "aliases",
    "unusedButRequired",
    "contextIds",
    "baseline",
  ])
    requireThat(
      isDeepStrictEqual(entry[key], required[key]),
      `Mapping mismatch: ${key}`,
    );
  requireThat(
    entry.delivered?.path === required.path,
    "Delivered path mismatch",
  );
  requireThat(!/placeholder/i.test(entry.delivered.path), "Placeholder path");
  const width = required.width ?? entry.delivered.width,
    height = required.height ?? entry.delivered.height;
  requireThat(
    Number.isInteger(width) &&
      width > 0 &&
      Number.isInteger(height) &&
      height > 0,
    "Missing exact dimensions",
  );
  requireThat(
    entry.delivered.width === width && entry.delivered.height === height,
    "Delivered dimensions mismatch",
  );
  const bytes = await readNonempty(root, entry.delivered.path);
  const decoded = entry.delivered.path.endsWith(".ico")
    ? await inspectIco(bytes)
    : await inspectPng(bytes, { width, height });
  requireThat(
    decoded.sha256 === entry.delivered.sha256 && entry.delivered.alpha === true,
    "Delivered hash mismatch",
  );
  if (required.baseline) {
    const original = await readNonempty(root, required.baseline.snapshotPath);
    requireThat(
      sha256(original) === required.baseline.sha256,
      "Immutable baseline hash mismatch",
    );
    requireThat(
      decoded.sha256 !== required.baseline.sha256,
      "Unchanged original artwork",
    );
  }
  const generation = entry.generation;
  requireThat(
    generation &&
      ((typeof generation.timestamp === "string" &&
        Number.isFinite(Date.parse(generation.timestamp))) ||
        (generation.timestamp === null &&
          generation.timestampUnavailableReason === "not-returned-by-tool" &&
          generation.provenance?.generatedAt === null)),
    "Missing/invalid generation timestamp or explicit tool-absence record",
  );
  requireThat(
    generation.provenance &&
      typeof generation.provenance.tool === "string" &&
      generation.provenance.tool.trim() &&
      Object.entries(generation.provenance).some(
        // Unknown metadata stays null; at least one actual returned reference is required.
        ([key, value]) =>
          key !== "tool" &&
          typeof value === "string" &&
          value.trim().length > 0,
      ),
    "Missing actual generation provenance",
  );
  await readNonempty(root, generation.promptPath);
  const master = await readNonempty(root, generation.masterPath);
  requireThat(
    sha256(master) === generation.masterSha256,
    "Master hash mismatch",
  );
  const metadata = await sharp(master).metadata();
  await inspectPng(master, { width: metadata.width, height: metadata.height });
  requireThat(
    entry.transform?.processor === "sharp" &&
      entry.transform.version === sharp.versions.sharp &&
      entry.transform.fit === "contain" &&
      entry.transform.padding === "transparent" &&
      isDeepStrictEqual(entry.transform.options, {
        compressionLevel: 9,
        adaptiveFiltering: false,
        palette: false,
      }),
    "Missing deterministic transform",
  );
  await validateReview(root, entry.review);
  await validateContexts(root, entry, baseline);
}
/** Validate a full collection against independently supplied baseline/catalog obligations.
 * @param {object} options Root, manifest, baseline and optional independent fixture obligations.
 * @returns {Promise<{ok:boolean,issues:string[]}>} Diagnostics; no writes or manual approval inference.
 */
export async function validateArt({ root, manifest, baseline, obligations }) {
  const issues = [];
  try {
    const required = obligations ?? artObligations(baseline);
    requireThat(
      manifest?.schemaVersion === 1 && Array.isArray(manifest.entries),
      "Invalid manifest schema",
    );
    requireThat(
      manifest.entries.length === required.length,
      "Missing/extra asset obligations",
    );
    const ids = new Set(),
      paths = new Set(),
      aliases = new Set();
    for (const entry of manifest.entries) {
      requireThat(
        !ids.has(entry.id) && !paths.has(entry.delivered?.path),
        "Duplicate asset ID/path",
      );
      ids.add(entry.id);
      paths.add(entry.delivered?.path);
      requireThat(Array.isArray(entry.aliases), "Missing aliases");
      for (const alias of entry.aliases) {
        requireThat(
          typeof alias === "string" && !aliases.has(alias),
          "Duplicate/invalid alias",
        );
        aliases.add(alias);
      }
    }
    for (const requirement of required) {
      try {
        // Locate the candidate row while keeping the authoritative scope independent.
        const entry = manifest.entries.find((row) => row.id === requirement.id);
        requireThat(entry, "Missing required asset");
        await validateEntry(root, entry, requirement, baseline);
      } catch (error) {
        issues.push(`${requirement.id}: ${error.message}`);
      }
    }
  } catch (error) {
    issues.push(error.message);
  }
  return { ok: issues.length === 0, issues };
}
if (isMain(import.meta.url)) {
  try {
    const root = process.cwd();
    const manifest = JSON.parse(
      await readNonempty(root, "art/cosmic-horror/manifest.json"),
    );
    const baseline = JSON.parse(
      await readNonempty(root, "art/cosmic-horror/baseline.json"),
    );
    const result = await validateArt({ root, manifest, baseline });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
