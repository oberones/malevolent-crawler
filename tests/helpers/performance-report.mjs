import { writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";

/**
 * Reject incomplete or invalid timing evidence, including fallback portraits.
 * @param {object} report Raw rows and required workload keys.
 * @returns {object} The validated report, without mutation.
 * @throws {Error} If a workload/sample does not meet the measurement contract.
 */
export function validateReport(report) {
  if (!["baseline", "candidate"].includes(report.stage))
    throw new Error("Invalid report stage");
  const keys = report.rows.map(
    // Compare exact coverage rather than accepting a partial run.
    (row) => row.key,
  );
  if (
    !report.requiredKeys.length ||
    new Set(keys).size !== keys.length ||
    !isDeepStrictEqual([...keys].sort(), [...report.requiredKeys].sort())
  )
    throw new Error("Missing or duplicate workloads");
  for (const row of report.rows) {
    if (row.samples.length < 5) throw new Error(`Missing samples: ${row.key}`);
    for (const sample of row.samples) {
      if (
        !Number.isFinite(sample.durationMs) ||
        sample.durationMs < 0 ||
        !sample.controlsUsable
      )
        throw new Error(`Invalid timing/control endpoint: ${row.key}`);
      if (
        row.kind === "art" &&
        (!sample.decoded ||
          !sample.rendered ||
          !row.expectedPath ||
          sample.actualPath !== row.expectedPath)
      )
        throw new Error(`Wrong, fallback or undecoded art: ${row.key}`);
      if (row.cache === "warm" && !sample.cacheHit)
        throw new Error(`Missing warm-cache proof: ${row.key}`);
    }
  }
  return report;
}
// Sort a copy so raw sample order remains intact for review.
function median(samples) {
  const sorted = samples
    .map(
      // Durations have already been checked for finite nonnegative values.
      (sample) => sample.durationMs,
    )
    .sort(
      // Numerical ordering avoids lexicographic medians.
      (a, b) => a - b,
    );
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
/**
 * Compare every workload under identical environment and fixture metadata.
 * @param {object} baseline Immutable baseline report.
 * @param {object} candidate Newly collected candidate report.
 * @returns {Array<object>} Raw medians, tolerance, delta and pass/fail per row.
 * @throws {Error} For incomplete or unmatched inputs.
 */
export function compareReports(baseline, candidate) {
  validateReport(baseline);
  validateReport(candidate);
  if (
    baseline.stage !== "baseline" ||
    candidate.stage !== "candidate" ||
    !isDeepStrictEqual(baseline.match, candidate.match) ||
    !isDeepStrictEqual(baseline.requiredKeys, candidate.requiredKeys)
  )
    throw new Error("Unmatched stage, environment or workloads");
  return baseline.rows.map(
    // Match by stable workload key, never incidental output order.
    (row) => {
      const next = candidate.rows.find(
        // Coverage validation guarantees exactly one candidate row.
        (entry) => entry.key === row.key,
      );
      const baselineMedianMs = median(row.samples);
      const candidateMedianMs = median(next.samples);
      const thresholdMs =
        baselineMedianMs + Math.max(baselineMedianMs * 0.1, 100);
      return {
        key: row.key,
        baselineMedianMs,
        candidateMedianMs,
        thresholdMs,
        deltaMs: candidateMedianMs - baselineMedianMs,
        pass: candidateMedianMs <= thresholdMs,
      };
    },
  );
}
/**
 * Write validated evidence once; existing baseline/candidate bytes are never replaced.
 * @param {string} file Output path in an existing directory.
 * @param {object} report Complete raw report.
 * @returns {Promise<void>} Resolves once exclusive creation succeeds.
 * @throws {Error} For invalid evidence, existing output or filesystem errors.
 */
export async function writeReport(file, report) {
  validateReport(report);
  await writeFile(file, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
}
