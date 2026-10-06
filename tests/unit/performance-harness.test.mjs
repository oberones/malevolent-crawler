import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  validateRun,
  transformIndex,
} from "../helpers/performance-fixture.mjs";
import {
  validateReport,
  compareReports,
  writeReport,
} from "../helpers/performance-report.mjs";
const revision = "a".repeat(40);
const metadata = {
  stage: "baseline",
  revision,
  transformHash: "b".repeat(64),
  sourceHash: "c".repeat(64),
};
// Construct independent raw measurements with a known median of 300 ms.
function report(stage = "baseline") {
  return {
    stage,
    revision,
    match: {
      browser: "chromium-test",
      hardware: "test",
      transformHash: metadata.transformHash,
    },
    requiredKeys: ["1440/normal/cold"],
    rows: [
      {
        key: "1440/normal/cold",
        kind: "art",
        expectedPath: "assets/sprites/goblin.png",
        samples: [100, 200, 300, 400, 500].map(
          // Independent decoded-image facts establish the accepted art endpoint.
          (durationMs) => ({
            durationMs,
            decoded: true,
            rendered: true,
            controlsUsable: true,
            actualPath: "assets/sprites/goblin.png",
          }),
        ),
      },
    ],
  };
}
// Mislabelled and remote runs must fail before any collection begins.
test("stage, localhost, revision and transform enforcement", () => {
  const valid = {
    stage: "baseline",
    baseURL: "http://127.0.0.1:4174",
    expectedRevision: revision,
    metadata,
    transformHash: metadata.transformHash,
  };
  assert.equal(validateRun(valid).stage, "baseline");
  for (const patch of [
    { stage: undefined },
    { stage: "other" },
    { baseURL: "https://example.com" },
    { expectedRevision: "d".repeat(40) },
    { transformHash: "e".repeat(64) },
    { metadata: { ...metadata, stage: "candidate" } },
  ]) {
    assert.throws(
      // Each mutation independently violates a required identity boundary.
      () => validateRun({ ...valid, ...patch }),
    );
  }
});
// Remove only the declared analytics/font blocks and select the same local title font.
test("identical source transform preserves gameplay scripts", () => {
  const html =
    '<head><script async src="https://www.googletagmanager.com/gtag/js?id=X"></script><script>window.dataLayer=[]; function gtag() {} gtag("config","X");</script><link href="https://fonts.googleapis.com/css?family=Rubik Vinyl" rel="stylesheet"><script src="./assets/js/main.js"></script></head>';
  const output = transformIndex(html);
  assert.doesNotMatch(output, /googletagmanager|dataLayer|fonts.googleapis/);
  assert.match(output, /assets\/js\/main.js/);
  assert.match(output, /Arial/);
  assert.equal(transformIndex(html), output);
  assert.equal(transformIndex(output), output);
});
// Missing or bogus samples must not silently lower the accepted median.
test("minimum samples, exact workload coverage and real art endpoint", () => {
  assert.equal(validateReport(report()).rows.length, 1);
  for (const mutate of [
    // Reject incomplete sample sets.
    (r) => r.rows[0].samples.pop(),
    // Reject substituted fallback images.
    (r) => {
      r.rows[0].samples[0].actualPath = "fallback.png";
    },
    // Reject undecoded resources.
    (r) => {
      r.rows[0].samples[0].decoded = false;
    },
    // Reject hidden portraits.
    (r) => {
      r.rows[0].samples[0].rendered = false;
    },
    // Reject non-finite elapsed time.
    (r) => {
      r.rows[0].samples[0].durationMs = NaN;
    },
    // Reject missing workload rows.
    (r) => {
      r.requiredKeys.push("360/normal/cold");
    },
    // Reject duplicate workload rows.
    (r) => {
      r.rows.push(structuredClone(r.rows[0]));
    },
  ]) {
    const r = report();
    mutate(r);
    assert.throws(
      // Validate the deliberately damaged independent fixture.
      () => validateReport(r),
    );
  }
});
// Fixed samples exercise sorting, tolerance and matching independently of browser timing.
test("matched medians and additive budget reject regressions", () => {
  const baseline = report();
  const candidate = report("candidate");
  candidate.rows[0].samples[2].durationMs = 450;
  const [comparison] = compareReports(baseline, candidate);
  assert.equal(comparison.baselineMedianMs, 300);
  assert.equal(comparison.candidateMedianMs, 400);
  assert.equal(comparison.thresholdMs, 400);
  assert.equal(comparison.pass, true);
  candidate.rows[0].samples[1].durationMs = 600;
  assert.equal(compareReports(baseline, candidate)[0].pass, false);
  candidate.match.browser = "other";
  assert.throws(
    // Cross-browser comparisons cannot claim the same-environment budget.
    () => compareReports(baseline, candidate),
  );
});
// Exclusive creation protects the original baseline, even on repeated runs.
test("evidence writer never overwrites an existing baseline", async () => {
  const root = await mkdtemp(join(tmpdir(), "performance-unit-"));
  try {
    const file = join(root, "baseline.json");
    await writeReport(file, report());
    const before = await readFile(file, "utf8");
    await assert.rejects(writeReport(file, report()));
    assert.equal(await readFile(file, "utf8"), before);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
// Worker processes reload configuration without the original CLI argument list.
test("performance configuration remains isolated in worker processes", async () => {
  const { execFileSync } = await import("node:child_process");
  const output = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import config from './playwright.config.mjs'; console.log(JSON.stringify({trace:config.use.trace,server:config.webServer,workers:config.workers}))",
    ],
    { env: { ...process.env, PERF_STAGE: "baseline" }, encoding: "utf8" },
  );
  assert.deepEqual(JSON.parse(output), { trace: "off", workers: 1 });
});
// Hash file bytes rather than function.toString, which Playwright transforms at load time.
test("transform identity derives from immutable source bytes", async () => {
  const { TRANSFORM_HASH, sha256 } =
    await import("../helpers/performance-fixture.mjs");
  assert.equal(
    TRANSFORM_HASH,
    sha256(
      await readFile(
        new URL("../helpers/performance-fixture.mjs", import.meta.url),
      ),
    ),
  );
});
