import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { validateEvidence } from "../../scripts/validate-evidence.mjs";
const root = fileURLToPath(new URL("../fixtures/evidence/", import.meta.url));
const gates = JSON.parse(
  await readFile(new URL("../fixtures/evidence/valid.json", import.meta.url)),
);
const obligations = JSON.parse(
  await readFile(
    new URL("../fixtures/evidence/obligations.json", import.meta.url),
  ),
);
const artManifest = {
  entries: [
    {
      id: "fixture-art",
      review: {
        status: "PASS",
        reviewer: "Fixture reviewer",
        date: "2026-10-06",
        evidence: ["result.txt"],
        findings: [],
      },
    },
  ],
};
// Real files and separate required scope establish the positive fixture independently.
test("evidence accepts complete synthetic manual/automated records", async () => {
  assert.deepEqual(
    await validateEvidence({
      root,
      gates,
      obligations,
      artManifest,
      artIds: ["fixture-art"],
    }),
    { ok: true, issues: [] },
  );
});
// Check missing obligations, invalid attribution and false completion independently.
test("evidence refuses fabricated, absent, unresolved and mismatched records", async () => {
  const mutations = [
    // Scope cannot shrink or change the kind/requirements of an existing gate.
    (g) => (g.gates = []),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => g.gates.push(structuredClone(g.gates[0])),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[0].requirements = []),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[1].kind = "automated"),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[0].required = false),
    // References must exist and be confined to the evidence fixture root.
    (g) => (g.gates[0].evidence = []),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[0].evidence = ["absent.txt"]),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[0].evidence = ["../outside.txt"]),
    // Manual evidence cannot be a missing or obviously placeholder reviewer attribution.
    (g) => (g.gates[1].reviewer = null),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[1].reviewer = "TBD"),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[1].reviewer = "implementation agent"),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[1].date = null),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[1].steps = null),
    // Automatic runs require an actual command and all records need measured outcomes.
    (g) => (g.gates[0].command = null),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[0].actual = "Not performed"),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[0].sourceRevision = null),
    // Unresolved findings and unsupported statuses are not successful qualification.
    (g) =>
      (g.gates[0].findings = [{ status: "OPEN", description: "Mismatch" }]),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[0].status = "banana"),
    // Isolate this invalid record so another complete field cannot mask it.
    (g) => (g.gates[0].status = "N/A"),
  ];
  for (const status of ["OPEN", "FAIL", "BLOCKED"]) {
    // Exercise every explicitly nonpassing release state.
    mutations.push((g) => {
      g.gates[0].status = status;
    });
  }
  for (const mutate of mutations) {
    const candidate = structuredClone(gates);
    mutate(candidate);
    const result = await validateEvidence({
      root,
      gates: candidate,
      obligations,
      artManifest,
      artIds: ["fixture-art"],
    });
    assert.equal(result.ok, false, mutate.toString());
    assert.ok(result.issues.length);
  }
});
// N/A needs a scoped explanation; art review cannot be omitted from a release check.
test("evidence checks justified N/A and every art review obligation", async () => {
  const candidate = structuredClone(gates);
  candidate.gates[0].status = "N/A";
  candidate.gates[0].reason =
    "No build pipeline exists for this static fixture";
  assert.equal(
    (
      await validateEvidence({
        root,
        gates: candidate,
        obligations,
        artManifest,
        artIds: ["fixture-art"],
      })
    ).ok,
    true,
  );
  for (const status of ["OPEN", "FAIL", "BLOCKED"]) {
    const art = structuredClone(artManifest);
    art.entries[0].review.status = status;
    assert.equal(
      (
        await validateEvidence({
          root,
          gates,
          obligations,
          artManifest: art,
          artIds: ["fixture-art"],
        })
      ).ok,
      false,
    );
  }
  assert.equal(
    (
      await validateEvidence({
        root,
        gates,
        obligations,
        artManifest: { entries: [] },
        artIds: ["fixture-art"],
      })
    ).ok,
    false,
  );
});

// An exemption cannot conceal an outstanding defect.
test("N/A still rejects unresolved findings", async () => {
  const candidate = structuredClone(gates);
  candidate.gates[0].status = "N/A";
  candidate.gates[0].reason = "Scoped fixture exemption";
  candidate.gates[0].findings = [
    { status: "OPEN", description: "Still unresolved" },
  ];
  assert.equal(
    (
      await validateEvidence({
        root,
        gates: candidate,
        obligations,
        artManifest,
        artIds: ["fixture-art"],
      })
    ).ok,
    false,
  );
});
