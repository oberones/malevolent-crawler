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

## T009–T010 — deterministic injected dependencies

- Owner/reviewer: implementation agent; 2026-10-06; Node 24.21.0/npm 12.2.0, environment.json.
- Requirements: Constitution I/II/III/VI; Phase 2A oracle isolation and cleanup.
- Fixture: finite random values; simulated time; private storage strings/faults; local audio counters; no real clock, network or playback.
- Red command: `node --test tests/unit/test-harness.test.mjs`. Five intended assertions failed against minimal no-op interface seams: ordered draw value, executed/canceled timer outcomes, initial stored bytes, owned sound count and isolated pending timer count. [Output](reports/t009-red.txt).
- Green implementation: four independent dependency factories under `tests/helpers/`; copied tape with explicit exhaustion, stable timer ordering/cancellation, one-shot key-specific faults, idempotent audio disposal. Five tests passed. [Output](reports/t010-green.txt).
- Refactor/review: documented callbacks and public contracts; additional argument-forwarding/nested-timer assertions; combined final suite passes with six helper cases. [Final output](reports/phase-2a-unit.txt).
- Status: PASS.

## T011–T012 — trusted classic and real-browser fixture harnesses

- Owner/reviewer: implementation agent; 2026-10-06; same pinned environment.
- Fixture: `tests/fixtures/harness/trusted.js`, explicit `#probe` node and exact random tape; original `utility.js` arithmetic; isolated browser storage and the frozen original HTML.
- Red command: `node --test tests/unit/legacy-harness.test.mjs`. Five assertions failed through the minimal interface seam: return value, missing-selector rejection, fresh-state counters, value transfer and known integer result. The final red record uses complete interface seams, not missing-method/import/syntax failures. [Output](reports/t011-red.txt).
- Browser red command: `npx playwright test tests/integration/legacy-browser-fixtures.spec.mjs --project=chromium`. Observed native random values and absent storage rather than the requested tape/seed; genuine assertion failure. [Output](reports/t011-browser-red.txt). A prior sandbox bind failure is environment setup, not red evidence.
- Green implementation: fresh VM per case, explicit trusted paths/stubs, identifier-only operations, cloned data, injected dependencies and teardown; browser contexts seed data before page load, fail on tape exhaustion and close all owned resources. Five unit cases passed; seeded-context checks passed in all three engines. [Unit output](reports/t012-green.txt), [browser output](reports/t012-browser-green.txt).
- Review regression: trusted fixture code needed an explicit classic lint scope. A new scope assertion failed before the config change, then passed while continuing to reject implicit writes. [Scope red](reports/t012-fixture-scope-red.txt), [scope green](reports/t012-fixture-scope-green.txt).
- Refactor: purpose comments and native Latin-1 encoding; added repeatable frozen-page title boot with page-error and double-teardown assertions. Final unit/integration runs passed: [unit](reports/phase-2a-unit.txt), [integration](reports/phase-2a-integration.json).
- Status: PASS. No claim of DOM layout, player journey, security sandbox or native acceptance.

## T013–T014 — immutable input capture and characterization

- Owner/reviewer: implementation agent; 2026-10-06; original revision `3cfaf54babae978c7388c023f5df5ebe6282259b`.
- These tasks capture unchanged source/assets and characterize existing outcomes; no intentional application behavior change and no artificial failing test is required.
- Capture: local Git blobs into an exclusively created snapshot; 19 synthetic save tuples and four Latin-1 exports; exact recipes and authoritative reset outcomes. No actual user saves used.
- Command: `node --test tests/unit/legacy-baseline.test.mjs tests/unit/legacy-fixtures.test.mjs` — 19 passed. [Output](reports/t013-t014-verification.txt).
- Review: complete source/asset hash comparison to Git, PNG decode, ICO header/dimensions, exact RNG consumption, independent initial stats/reward/guardian/duplicate/fractional assertions and reset-retention checks. The fractional fixture was corrected during capture to use a non-midpoint EXP draw, producing the genuine fractional value rather than an integer cap result.
- Refactor: final unit suite remains green. [Phase 2A record](phase-2a.md) states limitations and next package.
- Status: PASS for immutable inputs. Exhaustive rule and rendered-context characterization remains T015–T019.

## T015–T017 — Protected-rule characterization

- Owner/reviewer: implementation agent; 2026-10-06; frozen revision `3cfaf54babae978c7388c023f5df5ebe6282259b`; pinned environment.json.
- Requirements: FR-003/004/005/012, SC-003/004; Constitution I/III/VI.
- These are passing characterization tests against unchanged original rules, not intentional behavior changes. Cases retain exact state expectations and finite complete RNG tapes: 126 encounter, 858 equipment, 134 progression cases.
- Helper extension: `node --test tests/unit/legacy-audio-pause.test.mjs` initially failed the expected `pause` interface assertion. The fake sound now pauses without unloading and can replay; [red](reports/t015-audio-red.txt), [green](reports/t015-audio-green.txt).
- Review corrected supplemental rarity/cap expectations against the frozen source and existing snapshots; no source or expected-state snapshot was changed to satisfy them. [Initial review](reports/phase-2b-unit-initial.txt), [cap review](reports/phase-2b-unit-cap-review.txt). These test corrections are not claimed as application red–green cycles.
- Real-DOM characterization adds seven upgrade bonuses, three choices/two rerolls, denied third reroll, replenished next-level choices and actual abandonment confirm/cancel. Initial missing combat-panel setup was corrected; that setup error is not red evidence. [Control review](reports/t017-t019-review.txt), [final integration](reports/phase-2b-integration.json).
- Final/refactor command: `npm run test:unit`; [output](reports/phase-2b-unit.txt). Scoped lint/function-purpose comments reviewed; no production edits. Status: PASS for protected-rule characterization.

## T018–T019 — Static geometry, capture isolation and evidence integrity

- Owner/reviewer: implementation agent; 2026-10-06; same frozen source; 111 role/context fixtures and independently sized CSS geometry.
- Initial command: `npx playwright test tests/integration/measure-symbols.spec.mjs --workers=1`. No-op seams returned no geometry, accepted missing selectors/fonts and failed to create evidence. [Red](reports/t018-red.txt); original [green](reports/t019-green.txt). The missing output file is the unimplemented writer's observable failure, not a missing import or runner.
- Implemented awaited/verified fonts, exact selector checks, box/typography metadata, removable baseline probes and exclusive evidence writes.
- Review regression command: `npx playwright test tests/integration/measure-symbols.spec.mjs --project=chromium --workers=1`. Flex-column glyph baseline disagreed with an independent inline reference; transparent ancestors were incorrectly accepted. [Red](reports/t019-review-red.txt). Probe placement now follows the formatting context and ancestor opacity is checked. All 18 cases pass across three engines: [green](reports/t019-review-green.txt).
- Capture isolation regression: `npx playwright test tests/integration/legacy-symbol-contexts.spec.mjs --project=chromium --workers=1 -g 'original symbol contexts 360 text 1'`. Repeated `setVolume()` accumulated sound objects: [red](reports/t019-audio-red.txt). One muted setup per owned context fixes this; clocks are frozen, contexts always close, and the persistent sound-count assertion passes.
- Screenshot review found repeated 200% sizing sampled intermediate CSS transitions. A font-size sentinel without screenshots did not reproduce it; the capture-enabled case failed with 31.7367px versus required 32px: [red](reports/t019-scale-capture-red.txt). Disabling transitions/animations before scaling removes intermediate measurements. Native text-zoom qualification remains separate.
- A second isolation assertion found the prior inventory modal left exploration at brightness 0.5 instead of 1: [red](reports/t019-context-reset-red.txt). Restoring container filters before each original renderer fixes the contamination.
- Final green/refactor: `CAPTURE_BASELINE_DIR=art/cosmic-horror/review/baseline/capture-04 npx playwright test tests/integration/legacy-symbol-contexts.spec.mjs --workers=3` — 18 passing matrices, 1,998 measurements/screenshots; [output](reports/t019-accepted-capture.txt), [JSON](reports/t019-accepted-capture.json). Exclusive creation preserves accepted bytes. Earlier failed/partial attempts remain unindexed.
- Evidence-only unit checks verify all 24 roles/111 contexts, 1,998 screenshot hashes and engine versions, plus 4,662 BLOCKED native tuples; this validation does not need artificial behavioral red. Full integration, unit and scoped lint/format outputs are recorded in phase-2b.md.
- Status: PASS for automated static baseline and capture tooling; native/device baseline rows remain BLOCKED. No performance, accessibility, art-quality or release pass is implied.

## T020–T024 — Shared setting and immutable identity catalogs

- Owner/reviewer: implementation agent; 2026-10-06; Node 24.21.0/npm 12.2.0. Requirements: FR-001/002/003/005/006/015; Constitution I/II/III/IV.
- T020: authored the original Veyr Quay setting, names, silhouettes, copy surfaces, credits and horror boundary. Guide lists every stable encounter/variant/relic/symbol ID. Authoring is nonbehavioral; consistency is verified by the catalog tests.
- T021 red command: `node --test tests/unit/catalogs.test.mjs`. Ten assertions failed against importable empty data/no-op lookup seams: setting identity, counts, eligibility coverage, saved variant resolution, relic relations, symbol contexts, aliases, nested freezing, typed failures and fresh-process resolution. No missing import or syntax failure is used as red evidence. [Red output](reports/t021-red.txt).
- T022/T023: populated literal ES-module records for 51 encounters, 52 active variants and one unused art record, 14 relics, six unchanged rarity labels/classes and 24 symbol roles joining all 111 frozen context IDs. Eligibility is metadata; no selection pools, probabilities or numerical formulas are copied. A shared trusted-data freezer protects nested records and arrays.
- T024: added documented exact-key lookups and typed `unknown-reference` / `identity-mismatch` results. Saved name/image pairs must agree; no variant guessing or RNG. Paths/classes come only from authored records. Extra input image properties are ignored, not forwarded; player input is not mutated or echoed into error data.
- Initial review caught an overstrict test requiring every label to exceed three characters, incorrectly rejecting the permitted `HP` label. Changed that expectation to nonempty plain text; no content rule was weakened. [Initial review](reports/t024-initial-review.txt). Ten tests then passed: [green](reports/t024-green.txt).
- Refactor/review: formatted owned additions, reviewed purpose comments/JSDoc and added unmodified-input/extra-property isolation assertions. Replaced a test control-character regex flagged by ESLint with explicit code-point checks; no blanket suppression. Fresh-process tripwires cover import and lookup without RNG, DOM, storage, audio, timers or fetch.
- Final checks and pre-existing lint/format limits: [Phase 2C evidence](phase-2c.md). Full unit suite remains green (1,171 tests); immutable baseline and protected gameplay characterization remain intact. Status: PASS for the catalog package only; no UI, art, native or release acceptance implied.

## T025–T034 — Phase 2D boundary services

- Owner/reviewer: implementation agent; 2026-10-06; Node 24.21.0/npm 12.2.0. Requirements: FR-006/012/013, QR-001/003, SC-005, Constitution I–VI. Inputs: frozen `saves.json`, new `adversarial/saves.json`, fake storage/clock, and isolated real-DOM `services.html`. No live player data or external dependencies.
- T025 red: `node --test tests/unit/save-validation.test.mjs`, with an importable typed-result seam. Valid legacy acceptance, defaults, envelopes and budget assertions failed as intended. [Red](reports/t025-red.txt). T026 pure schema/default implementation initially rejected absent zero-valued equipped fields in the captured settled-victory fixture; inspection confirmed legacy `applyEquipmentStats` omits them. Added explicit zero defaults; 36 tests passed. [Green](reports/t026-green.txt).
- T027 red: `npx playwright test tests/integration/safe-render.spec.mjs --project=chromium --workers=1`; inert interface seams reached content, unsafe-descriptor refusal and typed-message assertions. [Red](reports/t027-red.txt). The first sandbox bind failure did not count as red. Corrected the test's proposed `hp` symbol alias to the existing `stat-hp` catalog ID. T028 implemented validated message parameters and text/structured DOM composition; `--workers=3` over all three projects passed nine cases. [Green](reports/t028-green.txt).
- T029 red: `node --test tests/unit/snapshot-store.test.mjs`; typed no-write seam failed six behavior groups. [Red](reports/t029-red.txt). T030 implemented complete canonical/legacy reads and commit protocol. The tests explicitly distinguish C/P, C/C and N/C outcomes, failed first commit, exact-byte backup, every read/write fault, retry, foreign revision/bytes and listener disposal. Six groups passed. [Green](reports/t030-green.txt). Live-state installation is deliberately absent from this store API; candidate/input objects remain unchanged. Real application import/migration integration is not claimed.
- T031 red: `node --test tests/unit/lifecycle.test.mjs tests/unit/transitions.test.mjs`; six intended assertion failures using callable seams. [Red](reports/t031-red.txt). T032 implemented generation/resource ownership and synchronous outer-transition persistence. Six cases passed. [Green](reports/t032-green.txt).
- T033 red: `npx playwright test tests/integration/dialog-service.spec.mjs --project=chromium --workers=1`; initial focus, visibility and teardown assertions failed. [Red](reports/t033-red.txt). Consumer restoration ownership also failed before adding `ownCleanup`: [cleanup red](reports/t033-cleanup-red.txt). T034 implemented focus/Tab/Escape/inert restoration with explicit document/lifecycle dependencies. WebKit exposed the caller fixture's assumption that pointer activation focuses its button; passed the actual invoking control through the existing `invoker` option and documented that integration requirement. Four cases per engine now pass, including lifecycle invalidation: [green](reports/t034-green.txt).
- Review regression red: structured-history text bounds and caught nested async errors, [output](reports/phase-2d-review-red.txt); explicit null tier independently exposed, [output](reports/phase-2d-review-validation-red.txt). Apply field budgets throughout parsed values, distinguish absent tier from null, and poison nested unsupported operations. [Green](reports/phase-2d-review-green.txt).
- Review regression red: a valid 1.1 MiB wide array was incorrectly rejected by inflated size estimates. [Red](reports/phase-2d-budget-red.txt). Exact JSON byte accounting now preserves the documented budget and accepts 64 levels: [green](reports/phase-2d-budget-green.txt). This is a resource safeguard test, not an inventory gameplay cap.
- Review regression red: returning a rejected Promise leaked an unhandled rejection despite the synchronous boundary error. [Red](reports/phase-2d-promise-red.txt). Consume that later rejection while still rejecting the operation to its caller and refusing persistence. Known catalog display IDs also had to be rejected in engine-facing legacy category/name/image fields: [red](reports/phase-2d-rule-tokens-red.txt).
- Refactor/final: shared validators, typed diagnostics, resource ownership, purpose comments and public contracts reviewed; scoped format/lint pass. Final service unit run: 56 passed, [output](reports/phase-2d-services-final.txt). Full unit run: 1,227 passed, [output](reports/phase-2d-unit.txt). Full integration/browser run: 117 passed, [output](reports/phase-2d-browser-integration.txt). The final engine-token constraint was followed by the complete unit suite; browser service fixtures retain the same legacy item tokens.
- Status: PASS for independent Phase 2D services. Unchanged repository lint/format debt and all native/manual/art/performance/release obligations remain explicit in [package evidence](phase-2d.md). No classic UI/runtime integration or commit occurred. Next package: 2E.

## T035–T039 — Phase 2E art and evidence tools

- Owner/reviewer: implementation agent; 2026-10-06; Node 24.21.0/npm 12.2.0. Requirements: FR-007–011, SC-002/003/007/008, QR-005; Constitution I/III/IV/VI.
- T035 red: `node --test tests/unit/art-tools.test.mjs`; five intended assertion failures against callable no-op seams, covering absent preparation results, unsafe writes accepted, absent pixel inspection, empty ICO packing and omitted manifest mappings accepted. [Red](reports/t035-red.txt). Independent PNG/ICO fixture bytes use standard-library scanline/header encoding, not the production Sharp/ICO implementations.
- T036 green: transparent proportional contain, exact odd favicon dimensions, strict one-entry PNG ICO, complete PNG decoding, visible/transparent pixels, path/symlink protection, hashes/provenance, catalog obligations, tuple geometry and separate visual review checks. Five groups passed: [green](reports/t036-green.txt).
- T037: initialized 80 manifest obligations (53 sprite paths including unused art, two favicons, 24 symbols, one fallback), exact original metadata, null unknown generated metadata, empty candidate context arrays and OPEN reviews. Nonbehavioral catalog/inventory authoring; no generated assets or acceptance fabricated.
- T038 red: `node --test tests/unit/evidence-validator.test.mjs`; missing gate and nonpassing art acceptance assertions failed against the permissive seam. [Red](reports/t038-red.txt). Independent valid synthetic manual/automatic evidence plus a separate obligation list establish the positive path.
- T039 green: gate inventory/requirement/kind consistency, files, dates, source revisions, actual outcomes, commands versus manual steps, human reviewer attribution, statuses, justified N/A and individual art reviews. Three groups passed: [green](reports/t039-green.txt). The CLI also calls complete art validation; it never writes gate statuses.
- Review regressions: empty provenance metadata, altered transform options, false alpha metadata, and N/A concealing unresolved findings failed independently before fixes. [Red](reports/phase-2e-review-red.txt). Tightened those contracts and confirmed immutable-baseline byte corruption rejection. Thirteen tests/subtests pass: [green](reports/phase-2e-review-green.txt).
- Refactor: separated shared file/hash/review boundaries and image inspection; formatted all new sources, reviewed function comments, made new fixtures/manifest/evidence visible through scoped ignore exceptions. No new dependency or runtime application change. Full unit suite: 1,240 pass; scoped lint/format pass. Real collection/release CLI runs return exit 1, as expected for incomplete real inputs; no synthetic fixture is substituted for release evidence.
- Limits: evidence checks establish recorded completeness, not reviewer authenticity or artistic originality. Native/manual/art/performance and release acceptance remain OPEN/BLOCKED. Package handoff: [Phase 2E](phase-2e.md), next Phase 2F; no commit hook executed.

## T040–T042 — Phase 2F performance harness

- Owner/reviewer: implementation agent; 2026-10-06; Node 24.21.0/npm 12.2.0. Requirements: QR-004, SC-007; Constitution I/III/VI.
- T040 red: `node --test tests/unit/performance-harness.test.mjs` — five assertion failures against callable permissive seams: stage/revision mismatch accepted, analytics/font transform absent, incomplete/fallback art accepted, known median 300 reported as 0, and existing evidence overwritten. Initial seam-only missing-file/undefined-result failures were corrected to executable contracts and the five intended assertion failures rerun before implementation.
- T041 green: the same command passed five tests after implementing explicit metadata checks, shared idempotent HTML transform, sample/endpoint validation, matched medians and exclusive writes. Preparation checks frozen source hashes and creates a separate static root; browser measurements retain real clocks/cache and compare known encounter tapes.
- Review red: the same command with two new regressions produced five passes/two failures: performance worker configuration incorrectly restored a managed functional server and trace; transform identity depended on function stringification rather than exact source bytes. Fixes use explicit PERF_STAGE in worker config and hash the saved helper source. Seven tests then passed.
- Final refactor/checks: shared metadata/endpoint/report boundaries, function-purpose comments and public contracts reviewed; 1,247 unit tests, 18 browser smoke checks and scoped lint/format pass. T042 captured five samples in each of 38 combinations (190 total) with verified warm-cache evidence and decoded expected portraits. See [Phase 2F evidence](phase-2f.md). Baseline capture does not pass the future candidate/native/release gates.

## T043–T046 — Phase 2G guarded bridge

- Owner/reviewer: implementation agent; 2026-10-06; pinned Node/npm and Playwright.
- T043 red: Chromium bootstrap/transition regressions exposed missing retry/gating,
  no once-only bridge, legacy-key writes instead of canonical snapshots, and impure
  default validation. The initial terminal reward/death probes omitted the legacy
  combat-timer setup; those setup errors are not counted as behavioral red. An
  independent replay against the unchanged frozen engine supplied that timer and
  confirmed completed reward/death still produced zero canonical writes instead of
  one. Raw output is retained in `reports/phase-2g-terminal-red.txt`.
- T044/T045 green: connected the tested snapshot/transition services through one
  lexical bridge, removed eager/repeated raw reads, gated input/audio, and wrapped
  synchronous actions so nested requests commit only completed state. The initial
  ten regressions passed after correcting assertions to compare validated state:
  canonical normalization intentionally fills optional legacy stat fields.
- T046 review red: an injected upgrade-button creation failure was swallowed by
  the old empty catch. Removed that catch and iterated over the actual three
  choices; the same assertion now receives the intended error. A viewport assertion
  then proved the new unsaved notice was below the full-height game surface; scoped
  fixed positioning makes the same notice visible without resizing game frames.
- Additional coverage: delayed module completion, fresh character/allocation,
  equip/unequip, upgrade choice and blessing event commits. The delayed-module test
  originally waited for `load` while holding a request that Firefox/WebKit include
  in that event; it now observes DOM readiness before releasing the request. The
  first blessing probe incorrectly used active-combat input without its battle DOM;
  the corrected resting fixture tests the actual exploration context. Neither
  setup failure is attributed to application behavior or counted as TDD red.
- Refactor: purpose comments, strict comparisons preserving nullish defaults,
  explicit formerly implicit locals and legacy state ownership, repository format
  normalization. All 1,118 current-rule replays preserve captured outcomes and RNG
  tapes; the full unit suite passes 2,365 tests. Browser, lint and format outcomes
  are recorded in [foundation evidence](foundation.md). Native/release gates remain
  separate OPEN/BLOCKED obligations.

## Phase 3A — T047–T049 narrative catalog and acceptance expectations

Date: 2026-10-06. Node 24.21.0/npm 12.2.0. No application screen integration.

- **T047 red:** `node --test tests/unit/narrative.test.mjs` against the documented,
  importable empty registry seam: 14 intended failures, one rejection check passed.
  Missing coverage/skills/text behavior caused failure, not broken imports or syntax.
  Raw record: `reports/phase-3a-unit-red.txt`.
- **T049 green/refactor:** 104 immutable templates and seven preserved skill aliases;
  exact parameter validation and inert text descriptors reuse the shared renderer.
  Expanded validation covers every authored schema, direct template calls, unchanged
  inputs, no RNG, fractional rewards, hostile names, credit exceptions and costs.
  `npm run test:unit`: 2,382 pass including 17 narrative tests;
  `reports/phase-3a-unit.txt`. No changed gameplay formulas or runtime bootstrap.
- **T048 red:** `npx playwright test tests/browser/setting-journeys.spec.mjs
tests/integration/narrative-render.spec.mjs --workers=3 --trace=off` exercises
  Chromium/Firefox/WebKit. The 46 screen expectations per engine intentionally
  precede T050–T053, while the separate safe-template DOM case passes per engine.
  Numerical/RNG assertions precede the theme assertions. The report and final
  counts are indexed in `phase-3a.md`; no skip or expected-failure suppresses them.
- **Invalid setup attempts:** localhost EPERM required sandbox escalation; allocation
  fixture initially expected one instead of six after an HP increment; terminal
  fixtures needed a visible combat panel and the frozen resting dungeon rather
  than the active-save generation multipliers. One trace artifact was truncated;
  final runs disable tracing. A cross-engine wall-clock race was removed by using
  a fixed installed clock and future pause point; terminal controls use native
  Enter activation. None of these count as intended application red.
- **Refactor/review:** checked schema-placeholder parity, immutable exports,
  purpose comments, public formatter contract, safe DOM composition, and accurate
  unchanged skill effects. Screen behavior, native text review and full release
  checks remain separate obligations. No exception or release pass is requested.

## Phase 3B — T050–T053 existing-screen integration

Date: 2026-10-06. Node 24.21.0/npm 12.2.0.

- **Red:** Reran `npx playwright test tests/browser/setting-journeys.spec.mjs
--project=chromium --workers=3 --trace=off`: 46 intended failures on old copy,
  absent Help/Credits and narrative identities. Original state/RNG comparisons
  remain ahead of theme assertions. Added browser regressions reproduced HTML
  interpretation of player names, old skill labels and old relic labels; the
  corrected nonempty-inventory test failed on `Common Sword` versus its catalog name.
- **Green:** Connected three small ES view modules through the existing services
  bridge. Current messages use detached validated records, inert nodes and catalog
  identities; choices remain transient. Costs/rewards and skill selection stay in
  the engine. Claim has no reward mutation. Help/Credits are informational only.
- **Refactor:** Kept the VM replay explicitly rule-only, with typed formatters and
  inert presentation stubs; removed only the intentionally changed histories from
  its comparisons. Retained exact comparison of all authoritative state and full
  random tapes. Reviewed purpose comments, public contracts and unchanged baselines.
- **Verification:** 1,118 candidate rule replays and all 2,382 unit tests pass.
  `npx playwright test tests/integration tests/browser --workers=3 --trace=off`
  passes 321 checks across three engines. Lint, formatting, whitespace and audit
  pass. Art/evidence validators remain failing on incomplete release obligations.
- **Setup corrections, not red:** sandbox loopback denial, empty-pack item fixture,
  idle-enemy battle probe and cross-realm formatter input. Final runs are clean.
  Detailed boundaries, commands and raw-report pointers: [Phase 3B evidence](phase-3b.md).

## Phase 3C — T054–T058 navigation and resilience

Date: 2026-10-06. Node 24.21.0/npm 12.2.0.

- **Red (T054/T055):** The two new browser files produced seven intended Chromium
  failures on absent accessible title/name/inventory controls and unsuppressed
  reduced-motion animations. Loopback permission failure was setup, not red.
- **Green (T056/T057):** Native title/close controls, names and alerts, the shared
  dialog adapter, focus restoration, safe cancellation, reflow and reduced motion
  made all seven pass. A repeated open/close/disposal regression was added.
- **Refactor (T058):** Kept classic visibility/confirmation ownership explicit,
  preserved current styles during service cleanup, discarded returned child
  history and used rendered controls for fallback focus. All 24 focused checks
  pass across three engines after refactoring. Purpose comments reviewed.
- **Broader checks:** 2,382 unit tests (including 1,118 candidate rule replays) and
  345 integration/browser checks pass. Scoped axe, lint, format and whitespace
  checks pass. Native Firefox review is partial, not full native acceptance.
- **Test setup corrections:** Help uses the actual catalog wording; axe runs
  without the gameplay tape because the audit itself consumes randomness.
  Details, raw outputs and remaining gates: [US1 evidence](us1.md).

## Phase 4A — T059–T061 encounter presentation

Date: 2026-10-06. Node 24.21.0/npm 12.2.0.

- **Red:** New integration/browser tests produced seven intended Chromium
  failures: missing intrinsic dimensions/aspect ratios and zero-height portraits
  with unavailable image bytes. The preexisting unknown-identity refusal passed.
  Sandbox loopback denial, a constant-backlog assignment and padding/derived
  percentage assumptions were test setup corrections, not behavioral red.
- **Green:** Extracted `encounter-view.mjs` behind the existing narrative interface;
  catalog dimensions reserve portrait space before loading, while original 50%/70%
  framing and selected identity/variant remain unchanged. All 27 focused checks
  pass across Chromium, Firefox and WebKit.
- **Refactor:** Kept classic generation/entry/combat call sites and their complete
  random tapes intact. Real-browser replay covers 126 captured encounter/attack
  cases per engine. All 2,382 unit tests pass, including the existing 1,118 candidate
  rule comparisons. Purpose comments, public contracts and immutable inputs reviewed.
- Full regression results and art/native/release limitations are recorded in
  [Phase 4A evidence](phase-4a.md); this package does not deliver new creature art.

## Phase 4B pilot — T062/T063 art and credit copy

Date: 2026-10-06. Art and copy authoring only; no new behavioral implementation.
Used the existing tested preparation/inspection tools without changes. Three
transparent exact-size outputs reproduce identical hashes; 2,382 unit tests and
36 focused encounter/narrative browser checks pass. Six decoded Chromium captures
and all delivered assets were visually reviewed by the implementation agent.
The [pilot evidence](phase-4b-pilot.md) separates this review from native/manual,
performance and collection acceptance. No artificial red test was introduced for
art authoring or factual credit copy, consistent with the task execution contract.

## Phase 4B goblin-alias batch — T064 art and credit copy

Date: 2026-10-06. Art/copy authoring only, using the unchanged tested preparation
and inspection tools. Four transparent outputs match the immutable canvases and
re-export to identical hashes. All 2,382 unit tests and 36 focused three-engine
browser checks pass. The implementation agent inspected all four delivered files
and 24 decoded Chromium captures across three viewports and two text scales.
One Foreman master was rejected for hook framing and regenerated. See
[batch evidence](phase-4b-goblins.md) for provenance and qualification limits.
No artificial red test was introduced for art authoring or factual credit copy.

## Phase 4B slime-alias batch — T066 art and credit copy

Date: 2026-10-06. Art/copy authoring only, using unchanged tested preparation and
inspection tools. Five transparent outputs match immutable dimensions and repeat
exports produce identical hashes. All 2,382 unit tests and 36 focused three-engine
browser checks pass. The implementation agent reviewed the five delivered PNGs
at native size and 30 decoded Chromium captures at three viewports/two text scales.
See [batch evidence](phase-4b-slimes.md) for exact prompts, masters, provenance,
review findings and qualification limits. No artificial red test was added for
art/copy authoring; production behavior and functions were unchanged.

## Phase 4B second guardian-alias batch — T072 art and credit copy

Date: 2026-10-07. Art/copy authoring only, using unchanged tested preparation and
inspection tools. Four transparent outputs match immutable dimensions and repeat
exports produce identical hashes. All 2,382 unit tests and 36 focused three-engine
browser checks pass. The implementation agent reviewed the four delivered PNGs
at intrinsic size and 24 decoded Chromium captures at three viewports/two text
scales. See [batch evidence](phase-4b-guardians-b.md) for exact prompts, masters,
provenance, individual findings and qualification limits. No artificial red test
was added for art/copy authoring; production functions and behavior were unchanged.

## Phase 4B first boss-alias batch — T073 art and credit copy

Date: 2026-10-07. Art/copy authoring only, using unchanged tested preparation and
inspection tools. Four transparent outputs match immutable dimensions and repeat
exports produce identical hashes. All 2,382 unit tests and 36 focused three-engine
browser checks pass. The implementation agent reviewed the four delivered PNGs
at intrinsic size and 24 decoded Chromium captures at three viewports/two text
scales. See [batch evidence](phase-4b-bosses-a.md) for exact prompts, masters,
provenance, individual findings and qualification limits. No artificial red test
was added for art/copy authoring; production functions and behavior were unchanged.

## Phase 4B second boss-alias batch — T074 art and credit copy

Date: 2026-10-07. Art/copy authoring only, using unchanged tested preparation and
inspection tools. Four transparent outputs match immutable dimensions and repeat
exports produce identical hashes. All 2,382 unit tests and 36 focused three-engine
browser checks pass. The implementation agent reviewed the four delivered PNGs
at intrinsic size and 24 decoded Chromium captures at three viewports/two text
scales. See [batch evidence](phase-4b-bosses-b.md) for exact prompts, masters,
provenance, individual findings and qualification limits. No artificial red test
was added for art/copy authoring; production functions and behavior were unchanged.

## Phase 4B mimic batch — T075 art and credit copy

Date: 2026-10-07. Art/copy authoring only, using unchanged tested preparation and
inspection tools. Two transparent outputs match immutable dimensions and repeat
exports produce identical hashes. All 2,382 unit tests and 36 focused three-engine
browser checks pass. The implementation agent reviewed both delivered PNGs at
intrinsic size and 12 decoded Chromium captures at three viewports/two text scales.
Production chest/door triggers preserve authoritative enemy values and the complete
11-draw tapes. The capture-only derived HP-percentage comparison was aligned with
the existing browser test; its initial diagnostic is retained. See
[batch evidence](phase-4b-mimics.md) for prompts, masters, provenance, individual
findings and qualification limits. No artificial red test was added for art/copy
authoring; production functions and gameplay rules were unchanged.

## Phase 4C — T076–T078 encounter integration and qualification

Date: 2026-10-07. See [US2 evidence](us2.md) for exact commands and raw reports.

- **Manifest data integration:** the new independent delivery checks reached
  real assertions against the existing manifest: 54 failed on missing hashes/
  delivered metadata and one independent-variant test passed. Merging 53 batch
  records produced 55 passes. The added context assertion then failed at 0/18
  contexts and passes after linking all 936 final screenshots. This is delivery
  data validation, not a claim of changed gameplay behavior.
- **Capture fixture correction:** screenshot review exposed inactive-player
  refresh in capture-01. A fixture assertion reproduced empty player name and
  undefined HP text, then passed after matching active-state-before-refresh order.
  This diagnostic is not counted as application TDD red.
- **Production HP reflow:** WebKit at 360px/200% exposed glyphs overlapping EXP.
  The focused regression failed on `aboveExp` and `linesFit`; a full-track-width
  text span and automatic row height made all three engine checks green at full,
  half and near-zero HP. Refactor/comment review retained percentage fills and
  existing portrait/container widths. Final capture-03 supersedes diagnostics
  without overwriting them.
- **Provenance validator:** a complete synthetic asset with a genuinely unreturned
  timestamp failed the old non-null-date rule. Explicit null plus the recorded
  tool-absence reason now passes; missing/malformed/inconsistent dates continue
  to fail. All 10 art-tool tests pass; required human reviews are unchanged.
- **Final checks:** 2,439 unit tests, 48 focused encounter checks, and all 393
  integration/browser checks pass. Lint/format/audit pass. Human/native art,
  performance, remaining collection and release evidence remain OPEN/BLOCKED;
  full art/evidence validators correctly remain nonzero.

## Phase 5A — T079–T081 (2026-10-07)

- **Red:** `node --test tests/unit/item-actions.test.mjs` against a documented
  interface seam produced 13 intended assertion failures: binding revision,
  duplicate transfers, stale rejection, capacity, exact 84-item preservation,
  bulk order/filtering and invalid-data atomicity. Imports and runner worked.
- **Green/refactor:** implementing `item-actions.mjs` passed all 13 tests;
  formatting/comment review and the full unit run passed 2,452 tests.
- **Browser acceptance red:** `npx playwright test tests/browser/relics.spec.mjs
--workers=3 --trace=off` produced 18 passes and six intended failures: missing
  visible full-loadout feedback and unsafe stale/repeated sale callbacks in each
  engine. The 84-roll identity/transaction/RNG matrix passes. Claim, duplicate/bulk
  operations, filters/cancellation/empty states and reset retention pass. Expanded
  title/allocation new-run retention separately passed all three engines.
- T080 supplies acceptance tests for T089; these remain real failures until that
  later UI package connects the green action boundary. Neither T081 nor the unit
  pass is claimed to fix the existing classic handlers. Setup/expectation
  corrections, commands, API ownership and raw outputs are detailed in
  [phase-5a.md](phase-5a.md). No native/manual/release gate is closed.

## T082 — small-icon art pilot (2026-10-07)

Art/copy authoring and documentation only: no new application behavior and no artificial red test. Reused the tested `prepareArt()`/`inspectPng()` pipeline. All three transparent 128 × 128 assets decode, preserve visible/transparent pixels and reproduce identical hashes. The full unit suite passes 2,452 tests. Isolated browser proofs cover 324 measured-size tuples plus 108 prior sword-pilot tuples; these do not establish integrated geometry or native acceptance. See [batch evidence](phase-5b-weapons-a.md) for exact commands and review scope.

## T087–T093 — relic presentation (2026-10-07)

- T087 red: `npx playwright test tests/integration/symbol-view.spec.mjs tests/browser/relics.spec.mjs --project=chromium --workers=2`; the temporary DOM seam returned a span, so assertions failed on missing catalog image/alternatives; existing UI tests also exposed capacity and stale sale defects. [Output](reports/phase-5c-red.txt).
- T088/T089: replaced the seam with measured inline symbols and integrated the real `createItemActions` boundary into detail/list/equipped and bulk handlers. Generation RNG/formulas remain in the classic engine.
- T090/T091: the first keyboard/wrapping checks were already green. Adding the required equipped-control footprint assertion exposed a 149.2px expansion; [red](reports/phase-5c-accessibility-red-02.txt). Restored the original icon-only button footprint with a complete accessible name; preserved text names in inventory/details/confirmation. Wrapped action rows support enlarged text.
- Review regression: [probe red](reports/phase-5c-probe-red-02.txt) reproduces the stale baseline coordinate on immutable legacy source. `measureSymbols()` now rereads the box after probe insertion; [original-source correction](reports/phase-5c-probe-corrected.txt) confirms both affected tuples. Frozen evidence is preserved.
- The rule-only candidate harness now delegates item mutations to the actual item-action service. It still omits DOM presentation; actual controls are exercised in browser tests. The unit run passes all 2,452 tests, including exact generation, sale, capacity, stats, duplicates and random tapes; [output](reports/phase-5c-unit.txt).
- Full regression and final scoped results are linked from [US3 evidence](us3.md). Art provenance joins and documentation do not require artificial failing behavior tests. No manual/native result is inferred from automation.
- Final visual/accessibility review added a 200% inventory regression: all three engines failed because the list collapsed between controls; [red](reports/phase-5c-inventory-scale-red.txt). The unchanged-size modal now scrolls, with sufficient list height for one whole multiline row. Automated WCAG checks then exposed undersized row targets; native inventory buttons now have a 24px minimum. [Final accessibility run](reports/phase-5c-accessibility-final-02.txt): 33/33 PASS, including all three engines. Axe initially timed out because its fixture clock was frozen; that setup failure is not behavioral red.
- Empty/unmatched bulk actions: [red](reports/phase-5c-empty-red.txt) preceded disabling unavailable transactions and refreshing availability after rarity changes; the final accessibility run includes the green cases.

## Phase 6A — proof-context selection (T095–T097)

2026-10-07: Art generation/preparation itself needs relevant validation, not artificial red tests. The reusable context selector added for remaining-symbol proofs follows TDD. `node --test tests/unit/art-proof-contexts.test.mjs` first reached five intended assertion failures with a pass-through seam: unrelated tuples were returned and missing/duplicate/mismatched/invalid contexts were not rejected. After catalog-ID and complete-tuple selection with required geometry checks, all five pass; the formatted refactor also passes. Exact red/green/refactor logs are in `reports/phase-6a/`. The full unit suite passes 2,457 tests. No runtime application behavior changed. See [Phase 6A evidence](phase-6a.md).

## Phase 6B — T099–T101 image failure boundary (2026-10-07)

- Owner/reviewer: implementation agent. Requirements: US4 load-failure acceptance,
  FR-013/FR-014, QR-001/QR-002 and Constitution I/III/IV/V. Environment:
  Node 24.21.0/npm 12.2.0, pinned Playwright engines on the local macOS host.
- T099 red: `npx playwright test tests/integration/image-loader.spec.mjs --project=chromium --workers=2`
  against a no-op public interface reached nine intended assertion failures.
  Missing loading/recovery, decode/disposal behavior and catalog validation were
  observed; no missing import or syntax error counted as red.
  [Initial red](reports/phase-6b/loader-red.txt).
- T101 implementation: catalog-only URLs; decode before display; one fallback
  attempt; safe local terminal symbol; generation tokens and explicit disposal.
  Initial cross-engine checks exposed real terminal-geometry defects, retained
  in [first green attempt](reports/phase-6b/loader-green-first.txt) and subsequent
  `loader-green*.txt` diagnostics. Preserving the failed catalog src, using
  inline-block for originally inline slots and retaining a hidden alternative
  for decorative failures resolved the engine-specific collapse/text sizing.
- Green: all original nine cases pass in all three engines (27 checks);
  [green](reports/phase-6b/loader-green-combined.txt). Expanded coverage also
  verifies stale primary and fallback success/rejection and accessibility on
  reuse after a terminal failure. Final integration run:
  `npx playwright test tests/integration --workers=3` — 222 passed, including
  all 36 image-loader cases; [output](reports/phase-6b/integration.txt).
- T100 adds eight real creature/relic journeys across delayed, missing, corrupt
  and unavailable fallback conditions. They assert exact combat rewards, Claim,
  keyboard item opening, equip/unequip/sale and random tapes as well as image
  recovery. Recovery assertions remain ordinary failures until T104 consumer
  integration. The diagnostic comparison of animated portrait rectangles
  was corrected to compare untransformed computed layout size; that test assumption is not counted
  as application red. See [Phase 6B evidence](phase-6b.md) for final full-suite
  results and the consumer lifecycle contract.
- `npm run test:unit` — 2,457 passed. Repository lint/format and whitespace
  results are recorded in the handoff report. No native/manual/performance,
  collection-wide art or release acceptance is inferred from these checks.

- Final T100 verification: `npx playwright test tests/browser/art-failure.spec.mjs --workers=3`
  reaches 24 intended recovery failures after the geometry fixture correction.
  Structured error inspection confirms only missing recovery states/fallback
  requests; all identity, action, random-tape and layout assertions pass.
  [Final output](reports/phase-6b/journey-final.txt),
  [error summary](reports/phase-6b/journey-summary.json). The full browser run
  separately passed all 306 existing cases. T104 remains unchecked and owns the
  live recovery fix. T099–T101 are complete for this bounded package.

## Phase 6C — Remaining symbol integration (T102–T103), 2026-10-07

- Red: `npx playwright test tests/browser/symbol-geometry.spec.mjs --project=chromium --workers=3`
  reached seven intended failures: six missing live `health/main` contexts and
  the incorrectly declared favicon media type. No missing import or syntax
  error counted as red. [Output](reports/phase-6c/red.txt).
- Implementation: catalog-only static/dynamic symbol mounting, message and sale
  currency icons, Font Awesome metric struts for its four roles, and corrected
  ICO media type. The first matrix exposed the real 200% HP width collision
  with `.row span`; a symbol-scoped width reset resolves it without resizing
  containers. [Diagnostic](reports/phase-6c/geometry-first.txt).
- Refactor: shared outcome rendering owns dynamic dungeon/combat symbols;
  static/bonus/allocation slots reuse `createSymbolView`. Original numerical
  rules and random tapes are unchanged. The rule-only DOM seam gained inert
  symbol operations; all 2,457 unit tests pass.
- Geometry measurement distinguishes an intrinsic inline baseline from a
  sibling probe wrapping or reflowing its parent. Both candidate and immutable
  original are remeasured with the same internal probe; frozen measurements
  remain intact. Intermittent clock-pause setup failures were corrected and
  are retained as diagnostics, not application red.
- Final three-engine results, capture scope, remaining T100 failures and review
  limits are recorded in [Phase 6C evidence](phase-6c.md).

## Phase 6D — T104–T109 collection integration (2026-10-07)

- T104: reran T100 before wiring consumers; eight Chromium failures reached
  missing loader-state/fallback assertions. Real controls still ran. Wiring
  encounter and symbol owners made all 24 image-failure journeys pass in the
  three engines. Cleanup uses explicit pre-replacement disposal plus weak
  removal observation; repeated removal/move/teardown is covered.
- T105: 81 independent file/provenance assertions first exposed incomplete
  final-delivery metadata and the stale fallback obligation. Joining the 13
  remaining records and correcting the path made all 81 pass.
- T108: two text-range regressions reproduced clipped stats and split allocation
  labels. Wrapping controls/text fixed those; visual review and a stronger
  failing assertion then drove stat-card wrapping to preserve abbreviations.
- T109: a failing unbound-dispose regression drove explicit service owner
  closures. A failing context-key collision test drove target-aware keys for
  unmeasured native tuples; all 11 art-tool checks pass afterward.
- Existing narrative and WebKit geometry checks exposed integration findings:
  hidden terminal text polluted log textContent, and the original allocation
  glyph fragmented across lines. Populate terminal text only on actual terminal
  failure and keep the allocation icon/label together. Original rule/state/RNG
  expectations and frozen geometry inputs remain unchanged.
- Full evidence, exact command outputs, diagnostic limits and final green
  results: [US4](us4.md), [reports](reports/phase-6d/),
  [file/context audit](art-automated.json). Sandbox/setup/trace-directory failures
  are not counted as meaningful red. Art/native/release gates remain separate.

- Final visual follow-up: a focused heading-word regression reproduced the
  split “Preparation” at 200% text. Allowing the allocation heading and close
  control to wrap as a flex row made all six reflow cases pass; the final
  scoped narrative/navigation/geometry rerun covers the changed layout.

## Phase 7A — T110–T113 legacy migration/history (2026-10-07)

- T110/T111: minimal documented module seams let assertions reach missing
  migration/history behavior. Six assertions failed; the existing partial-run
  guard passed. No import/syntax failure counted as red.
- T112: pure candidate mapping and snapshot integration preserve the frozen
  corpus, exact variants, all authoritative values and zero RNG. A separate red
  early-shaped/advanced-run regression drove stricter stage defaulting.
- T113: full-template parsing maps all 30 dungeon event templates and reward
  panels into typed records. The frozen equipment printer supplies 84 independent
  category/rarity panels. Unknown content retains raw recovery references;
  preexisting typed player strings are unchanged. A live missing-button red drove
  safe, keyboard-operable original-text recovery in the existing log region.
- Refactor: reuse the validator/catalog/message renderer; keep recovery metadata
  outside engine state and preserve it across repeated canonical backup rotations.
  Complete unit suite: 2,547 PASS. Scoped three-engine browser/integration: 81 PASS.
  Lint and format PASS. [Commands, outputs, diagnostics and limits](phase-7a.md).

## Phase 7B — T114–T117 character exchange/import (2026-10-07)

- T114: rejecting codec seams produced four intended red assertions, then five
  green tests for historical/Unicode exchange and adversarial transport/data.
- T115: browser assertions reproduced Cancel writing a new revision, replacement
  before durable persistence and failure replacing the current session.
- T116: strict Latin-1/MC1 codecs reuse bounded character validation and preserve
  Unicode and character-only semantics; optional old combat flags are accepted.
- T117: two orchestration tests went red–green for pure preview and exactly-once
  persist/cleanup/replace ordering, with explicit session-only recovery. A separate
  delayed-loader red drove import lifecycle invalidation. Existing numerical
  import reset expectations remain unchanged in the real-service replay adapter.
- Complete unit suite: 2,554 PASS. Scoped browser/integration: 96 PASS across
  Chromium/Firefox/WebKit. Lint/format PASS. [Evidence and limits](phase-7b.md).

## Phase 7C — T118–T121 continuation and lifecycle (2026-10-08)

- T118/T119: final tests against unchanged HEAD produced ten behavioral failures:
  eight duplicate run-timer cases, retained old audio, and an old attack crossing
  a restarted combat. Four recovery/audio/settled-death checks already passed.
- T120: explicit continuation restores resting controls before deriving combat;
  saved enemy/variant/HP/rewards remain intact and no generation RNG is consumed.
  A failing candidate settled-death loading test drove scheduling after reset.
- T121: separate run/combat/audio owners cancel pending work on their boundaries.
  Two review regressions failed for an old defeat button resetting a later run
  and two simultaneous background voices. Owned listeners and stop-before-play
  ordering made both pass. The existing import cleanup now disposes all scopes.
- Refactor: retain existing lifecycle implementation, clock intervals, formulas,
  frozen expected values and random tapes. The rule harness injects actual owners.
  Sandbox startup, display-percentage representation, missing adapter fields and
  an incorrect test assumption about actor speed order are diagnostic issues,
  not additional behavioral red.
- Complete unit suite: 2,554 PASS. Broad browser/integration run: 342 PASS.
  Post-review run: 249 PASS plus three actor-ordering test failures, corrected
  without production changes. Final new continuation/lifecycle suite: 51 PASS
  across Chromium/Firefox/WebKit. [Commands, evidence and limits](phase-7c.md).

## Phase 7D — T122–T128 recovery and tab ownership (2026-10-08)

- T122/T123: 18 intended red browser assertions for absent recovery controls,
  missing diagnostic/unsaved choices, premature clipboard success and invisible
  tab conflicts. Localhost EPERM before that run is environment evidence only.
- T124/T125: existing loader/modal recovery preserves raw source bytes; explicit
  prior-good/retained-character choices are session-only. Failed gameplay commits
  retain memory for Retry/export. Clipboard promises control success feedback;
  storage notifications and precommit comparison latch tab ownership loss.
- T126/T127: a focused accessibility red reproduced missing Cancel focus. Shared
  dialog ownership provides keyboard confirmation, Escape and focus return; raw
  text stays inert and 200% controls reflow. Chromium/WebKit touch confirmation is
  checked separately; unsupported Firefox automation remains skipped.
- Review red: prior-good unknown history was not actionable and initial migration
  failure lacked its write diagnostic. Carrying recovery metadata and the commit
  issue makes both green. Four initial download timeouts exposed boot guard
  interception; downloads now activate inside the recovery region.
- T128: full unit/adversarial/budget corpus, byte-preserving recovery, import versus
  resume, repeated entry/cleanup and three-engine browser evidence are recorded in
  [US5](us5.md). A broad clipboard comparison initially raced the ordinary playtime
  timer; the final test uses a frozen clock instead of changing gameplay timing.
