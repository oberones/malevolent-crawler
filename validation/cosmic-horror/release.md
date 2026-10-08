# Phase 8 release qualification

Date: 2026-10-08. **Release: BLOCKED.** This is a qualification decision, not
acceptance of delivery or a waiver of incomplete requirements.

## Completed work

T129–T131: cross-story tests, duplicate reward/stale allocation guards, nonoverlapping
unsaved feedback, readable narrow Sell control, delivered-art credits and current
operator/developer documentation. All first-resolution formulas, randomness,
retained save values and art paths/dimensions remain unchanged.

T133/T134: matched local performance qualification (see `performance/findings.md`).
T139: requirement/constitution reconciliation and an explicitly blocked release
decision. T132 and T135–T138 remain incomplete where their full gates are unmet.

## Evidence

- Clean locked install, matching engines, 2,554 unit tests and zero reported audit
  vulnerabilities pass. Lint/format results are in `automated.json`.
- Broad integration/browser run: **737 passed, 18 failed, one skipped**. All 18
  failures came from the invalid resting-player victory fixture; after correction,
  its full symbol matrix plus recovery checks passed **29**, with one unsupported
  Firefox touch case skipped. This is composed evidence, not a single all-green run.
- Final narrow-label change: **57 passed** across cross-story, relic accessibility
  and collection reflow. Final credits browser check: **6 passed**. Original
  red/diagnostic reports remain available in `reports/phase-8/`.
- Static-server checks cover executable module MIME/evaluation and nonempty
  HTML/CSS/JS/font/art/audio responses. Audible playback is not certified.
- Both performance candidates passed **190 samples / 38 comparisons** each.
  The final maximum median increase was **30.7 ms**, within its 100 ms allowance.
  Final timing and exact source hash are recorded in `performance/comparison.json`.
  Both captures remain retained; none replaced the immutable baseline.
- Native Firefox 157.0.1 and Safari 26.6.2 had bounded direct keyboard/pointer
  checks, with focus return observed. Firefox exchange controls were inspected at
  actual 200% page zoom. See `native-desktop.md` for the precise scope and omissions.
- All **80 artwork reviews remain PASS** under existing maintainer approval.
  The art validator still reports **27** incomplete context/geometry obligations.
- GitHub live inspection returned no CI runs, no rulesets and an unprotected main
  branch. The pinned Linux environment could not run locally: its Docker daemon
  socket is absent. No commit, push or merge-protection mutation was performed.
- Final `npm run validate:evidence`: **FAIL**, 332 unresolved obligations
  (185 OPEN, 118 BLOCKED and 2 FAIL required gates, plus 27 art context/geometry
  issues). No unexpected evidence-structure errors. Exact output:
  [evidence-final.txt](reports/phase-8/evidence-final.txt).
- Production build: **N/A**, because delivery remains static.

## Release blockers and handoff

1. T132: close technical art validation and run the final candidate in the pinned
   Linux CI environment. Local composed green checks do not substitute for remote CI.
2. T135/T136: complete all required native desktop and physical Android/iPhone/iPad
   journeys, actual viewport/DPR/build records, text/contrast/motion/mute and touch
   qualification. Required Chrome and mobile devices were unavailable; remaining
   available-browser matrix cases are OPEN.
3. T137: reconcile every baseline/candidate context and narrative/native review.
   Approvals for artwork content do not certify page-coordinate or native geometry.
4. T138: execute the final committed candidate in CI, record emitted job contexts
   and enforce the required checks before merge.
5. Rerun the final evidence validator after those records are complete; it must
   reject the current missing requirements. No required gate was deleted or waived.

## Requirement reconciliation

The table joins the unchanged independent requirement inventory to `gates.json`.
PASS rows describe their evidence scope; any required OPEN/FAIL/BLOCKED child
prevents whole-requirement release acceptance. Detailed evidence links and owners
remain in the gate index and story reports.

| Requirement | Indexed outcomes                        | Release disposition |
| ----------- | --------------------------------------- | ------------------- |
| FR-001      | BLOCKED: 10, OPEN: 4, PASS: 1           | BLOCKED             |
| FR-002      | BLOCKED: 10, OPEN: 4, PASS: 1           | BLOCKED             |
| FR-003      | BLOCKED: 10, OPEN: 4, PASS: 1           | BLOCKED             |
| FR-004      | BLOCKED: 20, OPEN: 8, PASS: 1           | BLOCKED             |
| FR-005      | BLOCKED: 15, OPEN: 6, PASS: 1           | BLOCKED             |
| FR-006      | BLOCKED: 15, OPEN: 6, PASS: 1           | BLOCKED             |
| FR-007      | BLOCKED: 1, FAIL: 1, OPEN: 139          | BLOCKED             |
| FR-008      | FAIL: 1, OPEN: 139                      | BLOCKED             |
| FR-009      | FAIL: 1, OPEN: 139                      | BLOCKED             |
| FR-010      | BLOCKED: 5, OPEN: 141                   | BLOCKED             |
| FR-011      | FAIL: 1, OPEN: 139                      | BLOCKED             |
| FR-012      | BLOCKED: 25, OPEN: 10, PASS: 1          | BLOCKED             |
| FR-013      | BLOCKED: 45, OPEN: 18, PASS: 1          | BLOCKED             |
| FR-014      | BLOCKED: 21, OPEN: 147                  | BLOCKED             |
| FR-015      | BLOCKED: 5, OPEN: 2, PASS: 1            | BLOCKED             |
| QR-001      | BLOCKED: 30, OPEN: 12, PASS: 1          | BLOCKED             |
| QR-002      | BLOCKED: 35, OPEN: 14, PASS: 1          | BLOCKED             |
| QR-003      | BLOCKED: 30, OPEN: 12, PASS: 1          | BLOCKED             |
| QR-004      | PASS: 1                                 | PASS                |
| QR-005      | FAIL: 1                                 | BLOCKED             |
| SC-001      | FAIL: 1, PASS: 1                        | BLOCKED             |
| SC-002      | FAIL: 2, OPEN: 139                      | BLOCKED             |
| SC-003      | FAIL: 1, PASS: 1                        | BLOCKED             |
| SC-004      | FAIL: 1, PASS: 1                        | BLOCKED             |
| SC-005      | FAIL: 1, PASS: 1                        | BLOCKED             |
| SC-006      | FAIL: 1, PASS: 1                        | BLOCKED             |
| SC-007      | BLOCKED: 1, FAIL: 2, OPEN: 139, PASS: 1 | BLOCKED             |
| SC-008      | BLOCKED: 5, FAIL: 1, OPEN: 141          | BLOCKED             |

## Constitution disposition

TDD and unchanged rules: `tdd.md`, `integration-findings.md`, full unit and browser
reports. Modularity, comments, validation and lossless recovery: `review.md` and
US5. Accessibility: automated checks plus bounded native evidence, with full
manual/device requirements still open. Reproducibility: pinned clean install,
audit and source-hashed measurements; CI/enforcement remains blocked. No exception
or release waiver exists. The evidence validator's nonzero result is expected
from these unresolved obligations and remains a failing release check.

Optional pre/post `speckit.git.commit` hooks were not executed.
