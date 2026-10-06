# Red–green–refactor evidence

Statuses: PASS / FAIL / BLOCKED / OPEN / N/A. Each future behavioral task must add task/requirement ownership, fixture/environment, exact command, expected and observed failure, implementation, passing/refactor results, evidence path, reviewer and date. Missing imports, syntax errors and empty suites never count as red. Setup smoke results do not certify gameplay/native acceptance.

## T005 — lint environment boundaries

- Owner/reviewer: implementation agent; 2026-10-06; environment.json (Node 24.21.0/npm 12.2.0).
- Requirements: Constitution I/II/III/VI; fixture snippets in tests/unit/tooling-scopes.test.mjs.
- Red command: `npm run test:unit`, with a valid recommended-rules config seam before browser/Node/classic scopes existed.
- Expected/actual: three assertions failed because legitimate browser/Node/shared bindings were rejected; accidental writes were already rejected. [Red output](reports/t005-red.txt).
- Green change: explicit classic dependencies, browser-module globals and Node-tool scope, retaining no-undef and no-implicit-globals. Assertion for accidental writes accepts multiple protecting rules while requiring no-undef.
- Review regression: owner declarations were falsely treated as built-in redeclarations. Added a failing declaration snippet; [owner red](reports/t005-owner-red.txt). The original snippet also included an unnecessary assignment, removed from the fixture so both assigned values are read.
- Green implementation: an owner's declared bindings are ambient only in consuming files. A single declaration inventory drives both scopes; no rule was disabled to hide legacy findings.
- Green/refactor command: `npm run test:unit` — 5 passed, 0 failed/skipped; [green](reports/t005-green.txt), [refactor](reports/unit.txt).
- Review: adjacent purpose comments checked for all new functions/callbacks. No production function or asset changed.
- Status: PASS.

## T004 — setup verification (not a gameplay behavior change)

- Fixture: empty storage, static module probe, three viewports, all three engines; external Google fonts/analytics aborted for functional repeatability.
- `npm run test:integration`: 6 passing static-server cases, including MIME and local asset categories; reports/integration.json.
- `npm run test:browser`: 18 passing fresh-entry/module/input cases; reports/browser.json. Incorrect first test expectations were corrected after source inspection: fresh state enters character creation; WebKit touch is checked by actual tap activation, not maxTouchPoints. No application change was made to satisfy these tests.
- Subsequent server runs bind successfully and no listener remains on 4173 after teardown. This is setup evidence only, not native keyboard/touch acceptance or the immutable legacy oracle scheduled in T009–T019.
- Status: PASS. Meaningful gameplay and helper TDD starts in Phase 2.

## Future behavioral record template

- Task / requirement / owner:
- Fixture and source revision / environment:
- Red command / expected missing behavior / actual failure / evidence:
- Implementation / green command / actual result / evidence:
- Refactor / boundary and cleanup checks / evidence:
- Reviewer / date / findings / status:
