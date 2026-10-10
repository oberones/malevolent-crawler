import { isDeepStrictEqual } from "node:util";
import { posix } from "node:path";
import {
  readNonempty,
  requireThat,
  validateReview,
  isMain,
} from "./evidence-common.mjs";
const statuses = new Set(["PASS", "FAIL", "BLOCKED", "OPEN", "N/A"]);
// Reject placeholder outcomes instead of mistaking a populated string for execution evidence.
function meaningful(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !/^(tbd|unknown|pending|none|not performed|not run|not tested|todo)\b/i.test(
      value.trim(),
    )
  );
}
// Resolve legacy evidence-relative references while keeping the final path inside the repository.
function evidencePath(base, path) {
  requireThat(
    typeof path === "string" && !posix.isAbsolute(path) && !path.includes("\\"),
    "Invalid evidence path",
  );
  return posix.normalize(posix.join(base, path));
}
// Verify record structure and references; this cannot authenticate a human's claim of review.
async function checkGate(root, gate, evidenceBase) {
  requireThat(statuses.has(gate.status), "Unknown status");
  requireThat(
    Array.isArray(gate.findings) &&
      gate.findings.every(
        // A finding is only closed when its resolution is explained.
        (finding) =>
          finding.status === "RESOLVED" && meaningful(finding.resolution),
      ),
    "Unresolved findings",
  );
  if (gate.status === "N/A") {
    requireThat(meaningful(gate.reason), "N/A requires a scoped reason");
    return;
  }
  requireThat(
    gate.status === "PASS" || gate.required === false,
    `Required gate is ${gate.status}`,
  );
  if (gate.status !== "PASS") return;
  for (const field of [
    "owner",
    "fixture",
    "environment",
    "expected",
    "actual",
    "reviewer",
  ])
    requireThat(meaningful(gate[field]), `Missing/placeholder ${field}`);
  requireThat(
    typeof gate.sourceRevision === "string" &&
      /^[a-f0-9]{40}$/.test(gate.sourceRevision),
    "Missing source revision",
  );
  requireThat(
    typeof gate.date === "string" && Number.isFinite(Date.parse(gate.date)),
    "Missing execution date",
  );

  requireThat(
    Array.isArray(gate.evidence) && gate.evidence.length > 0,
    "Missing evidence",
  );
  const evidence = [];
  for (const path of gate.evidence) {
    const normalized = evidencePath(evidenceBase, path);
    await readNonempty(root, normalized);
    evidence.push(normalized);
  }
  if (gate.kind === "manual" || gate.kind === "manual-art") {
    requireThat(meaningful(gate.steps), "Missing manual steps");
    await validateReview(root, { ...gate, evidence });
  } else
    requireThat(
      meaningful(gate.command),
      "Missing automated/configuration command",
    );
}
/** Validate non-art qualification records without writing statuses.
 * @param {object} options Root, gates document, separate obligations and evidenceBase.
 * @returns {Promise<{ok:boolean,issues:string[]}>} Completeness diagnostics, not proof of human authenticity.
 */
export async function validateEvidence({
  root,
  gates,
  obligations,
  evidenceBase = ".",
}) {
  const issues = [];
  try {
    requireThat(
      gates?.schemaVersion === 1 &&
        Array.isArray(gates.gates) &&
        Array.isArray(obligations) &&
        obligations.length > 0,
      "Invalid evidence schema/obligations",
    );
    requireThat(
      gates.gates.length === obligations.length,
      "Missing/extra required gate records",
    );
    const seen = new Set();
    for (const gate of gates.gates) {
      requireThat(!seen.has(gate.id), "Duplicate gate ID");
      seen.add(gate.id);
    }
    for (const obligation of obligations) {
      try {
        // The separate inventory prevents a candidate from deleting its own obligations.
        const gate = gates.gates.find((row) => row.id === obligation.id);
        requireThat(gate, "Missing required gate");
        for (const key of ["kind", "required", "requirements"])
          requireThat(
            isDeepStrictEqual(gate[key], obligation[key]),
            `Inconsistent requirement coverage: ${key}`,
          );
        await checkGate(root, gate, evidenceBase);
      } catch (error) {
        issues.push(`${obligation.id}: ${error.message}`);
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
    const base = "validation/cosmic-horror";
    const gates = JSON.parse(await readNonempty(root, `${base}/gates.json`));
    const obligations = JSON.parse(
      await readNonempty(root, `${base}/required-gates.json`),
    ).gates;
    const evidence = await validateEvidence({
      root,
      gates,
      obligations,
      evidenceBase: base,
    });
    console.log(JSON.stringify(evidence, null, 2));
    if (!evidence.ok) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
