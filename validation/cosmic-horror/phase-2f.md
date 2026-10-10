# Phase 2F — Matched performance harness and baseline

Date: 2026-10-06. Owner/reviewer: implementation agent. Scope: T040–T042 only.
Runtime: selected nvm Node 24.21.0/npm 12.2.0 and pinned Playwright Chromium.

## Measurement contract

The harness prepares a new static root from the frozen original revision
`3cfaf54babae978c7388c023f5df5ebe6282259b`, checking every runtime asset against the
independent baseline manifest before copying. Existing roots and evidence are never
overwritten. The performance-only index transform removes Google analytics and the
external title font and fixes the title fallback to Arial/Helvetica/sans-serif.
Original/transformed index hashes, transform source hash and each asset's bytes/hash
are recorded. Gameplay source is unchanged.

A single Chromium worker uses real wall-clock browser timestamps, DPR 1, localhost,
no CPU/network throttling, no routing/HAR interception, no trace/video, and muted
real Howler audio. The physical host uses AC power (observed at capture start);
power profiles, CPU, RAM, OS and browser executable/version are recorded in the raw
report. Baseline/candidate comparison requires matching environment/fixture metadata.

Each viewport (1440 × 900 and 360 × 800) has five cold first visits; five cold and
five warm resting-title and title-to-dungeon samples; and five cold/five warm samples
for normal, special boss, largest spider dragon, both Skeleton Mage variants, chest
mimic and door mimic. First visit is cold by definition. Warm contexts preserve HTTP
cache while navigation resets synthetic state and disposes the previous document's
timers. A warm-up precedes each warm series and is excluded by design, not based on
its duration. Measured samples are never filtered for speed.

Entry waits for an enabled control hit-testable above the loader. Encounter timing
starts before the original generation/battle entry points, checks the exact oracle
identity and complete RNG tape, awaits the correct portrait's successful decode and
two animation frames, and verifies active combat presentation. Legacy combat is
automatic; there is no manual attack button. Fallback/incorrect/hidden/undecoded art
cannot pass. Warm rows require zero transfer bytes with positive decoded resource
bytes for the portrait (or shared CSS for entry), not merely a warm-cache label.

Long-name/six-equipped-item inventory captures are separate layout diagnostics,
not manual accessibility or native-device acceptance.

## Invalid development attempts

- First root preparation lacked the ignored `.cache` parent; failed before serving.
  Created the parent and prepared a fresh root. No source/baseline bytes changed.
- The sandbox denied binding localhost; the authorized local server and Chromium
  runner ran with reviewed execution access.
- First browser preflight rejected the transform hash before any sample. Function
  stringification differed under Playwright transformation. Added a failing unit
  regression and changed the identity to exact helper-source bytes.
- That preflight also exposed worker configuration reloading without the original
  command arguments. Added a failing worker-config regression; `PERF_STAGE` now
  preserves one-worker/no-trace/no-managed-server settings in workers.

## Verification and handoff

PASS: 38 required workload/cache/viewport rows and 190 valid raw samples; five
samples per row. [Raw baseline](performance/baseline.json),
[medians and future thresholds](performance/baseline-summary.json),
[archived diagnostic index](performance/baseline-diagnostics.json), and
[Playwright result](reports/phase-2f-performance.json).

The raw baseline SHA-256 is
`9f9e71a166850763aefb0fe417428e6986622892c89abfe68b476219b077ce82`.
The raw file is unchanged; its original temporary screenshot paths are mapped to
durable copies by the diagnostic index. Screenshots were visually inspected at
both viewports: six equipment slots and the long player name are visible, with no
document-level horizontal overflow. This is baseline diagnosis, not WCAG acceptance.

| Measurement                                  | 1440 × 900 median | 360 × 800 median |
| -------------------------------------------- | ----------------: | ---------------: |
| Cold first visit                             |         1034.4 ms |        1032.3 ms |
| Cold returning title                         |           24.0 ms |          23.7 ms |
| Cold title to dungeon                        |         1019.5 ms |        1020.3 ms |
| Cold decoded encounter art (seven workloads) |      27.8–28.6 ms |     28.0–28.3 ms |
| Warm decoded encounter art (seven workloads) |      29.7–30.2 ms |     29.9–30.9 ms |

Existing one-second loaders count. A warm median slightly above a cold median is
retained as observed; frame scheduling is part of this endpoint. No slow samples
were discarded. Candidate thresholds are baseline median plus max(10%, 100 ms).

| Check                                                                         | Result                                                                                                |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `PERF_STAGE=baseline BASE_URL=http://127.0.0.1:4174 npm run test:performance` | PASS; one worker, 3.6 minutes, 190 samples                                                            |
| `npm run test:unit`                                                           | PASS; 1,247 tests ([output](reports/phase-2f-unit.txt))                                               |
| `npm run test:browser`                                                        | PASS; 18 checks across three engines ([output](reports/phase-2f-browser.txt))                         |
| Scoped Prettier                                                               | PASS ([output](reports/phase-2f-format.txt))                                                          |
| Repository lint                                                               | FAIL; 318 pre-existing legacy errors ([output](reports/phase-2f-lint-all.txt))                        |
| Repository format                                                             | FAIL; 20 pre-existing files after formatting this package ([output](reports/phase-2f-format-all.txt)) |
| Scoped ESLint                                                                 | PASS ([output](reports/phase-2f-lint.txt))                                                            |

Ignore verification: existing Git/ESLint/Prettier exclusions cover installed Node
tools, generated reports and runtime cache. Private npm package; no publishing,
Docker, Terraform or Helm ignore file applies. No dependency/runtime application
change or production build (N/A). Next package: Phase 2G (T043–T046), guarded bridge and completed-transition integration. No later package has started. Native
baselines, candidate comparison, art, manual accessibility and release enforcement
remain OPEN/BLOCKED. No optional commit hook was executed.
