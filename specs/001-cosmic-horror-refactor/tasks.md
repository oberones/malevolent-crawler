# Tasks: Lovecraftian Cosmic Horror Refactor

**Input**: `/Users/oberon/Projects/coding/javascript/malevolent-crawler/specs/001-cosmic-horror-refactor/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [art-inventory.md](art-inventory.md), [quickstart.md](quickstart.md), [validation-plan.md](validation-plan.md), all three files in `contracts/`, and `.specify/memory/constitution.md`.
**Status**: Phase 1 setup (T001–T008), Phase 2A (T009–T014), Phase 2B (T015–T019), Phase 2C (T020–T024), Phase 2D (T025–T034), Phase 2E (T035–T039), and Phase 2F (T040–T042) completed for the automated development environment; [setup evidence](../../validation/cosmic-horror/phase-1.md), [Phase 2A evidence](../../validation/cosmic-horror/phase-2a.md), [Phase 2B evidence](../../validation/cosmic-horror/phase-2b.md), [Phase 2C evidence](../../validation/cosmic-horror/phase-2c.md), [Phase 2D evidence](../../validation/cosmic-horror/phase-2d.md). [Phase 2E evidence](../../validation/cosmic-horror/phase-2e.md). [Phase 2F evidence](../../validation/cosmic-horror/phase-2f.md). Phase 2G (T043–T046) is also complete; see [foundation evidence](../../validation/cosmic-horror/foundation.md). Phase 3A (T047–T049) is complete as a catalog/test package; see [narrative evidence](../../validation/cosmic-horror/phase-3a.md). Phase 3B (T050–T053) is complete; see [screen-integration evidence](../../validation/cosmic-horror/phase-3b.md). Phase 3C (T054–T058) is complete for the automated development environment with a bounded native Firefox review; see [US1 evidence](../../validation/cosmic-horror/us1.md). Phase 4A (T059–T061) is complete for the automated development environment; see [encounter-renderer evidence](../../validation/cosmic-horror/phase-4a.md). The Phase 4B creature-art pilot (T062–T063) is complete; see [pilot evidence](../../validation/cosmic-horror/phase-4b-pilot.md). T064 is complete; see [goblin-alias batch evidence](../../validation/cosmic-horror/phase-4b-goblins.md). T065 is complete; see [wolf-alias batch evidence](../../validation/cosmic-horror/phase-4b-wolves.md). T066 is complete; see [slime-alias batch evidence](../../validation/cosmic-horror/phase-4b-slimes.md). T067 is complete; see [orc-alias batch evidence](../../validation/cosmic-horror/phase-4b-orcs.md). T068 is complete; see [spider-alias batch evidence](../../validation/cosmic-horror/phase-4b-spiders.md). T069 is complete; see [first skeleton-alias batch evidence](../../validation/cosmic-horror/phase-4b-skeletons-a.md). T070 is complete; see [second skeleton-alias batch evidence](../../validation/cosmic-horror/phase-4b-skeletons-b.md). T071 is complete; see [first guardian-alias batch evidence](../../validation/cosmic-horror/phase-4b-guardians-a.md). T072 is complete; see [second guardian-alias batch evidence](../../validation/cosmic-horror/phase-4b-guardians-b.md). T073 is complete; see [first boss-alias batch evidence](../../validation/cosmic-horror/phase-4b-bosses-a.md). T074 is complete; see [second boss-alias batch evidence](../../validation/cosmic-horror/phase-4b-bosses-b.md). T075 is complete; see [mimic batch evidence](../../validation/cosmic-horror/phase-4b-mimics.md). All 53 creature replacements are integrated. Phase 4C (T076–T078) is complete for the automated development environment and agent visual review; see [US2 evidence](../../validation/cosmic-horror/us2.md). [Maintainer artwork acceptance](../../validation/cosmic-horror/art-approval-2026-10-07.md) is PASS for all 53 delivered sprites; native execution remains OPEN/BLOCKED. Phase 5A (T079–T081) is the next bounded package. Native baseline tuples remain explicitly BLOCKED; these passes do not certify art, native/manual acceptance or release readiness.
**Backlog**: 139 tasks (T001–T139), eight phases, 24 lettered work packages, and 46 tasks eligible for parallel execution after their prerequisites.

## Execution contract

Paths below are relative to repository root `/Users/oberon/Projects/coding/javascript/malevolent-crawler`. Proposed files are deliverables, not claims that tooling or interfaces already exist. Use the pinned stack and exact command contracts in `quickstart.md`; no production build is introduced.

**Tests are required.** For each behavioral change, write the focused test, run it and observe failure for the intended missing behavior, implement the smallest passing change, then refactor and rerun. Missing imports, syntax errors, and an unconfigured runner do not count as red; use a minimal documented interface seam where needed so an assertion reaches the intended behavior. Characterization tests first pass against the immutable legacy code; separate regression/acceptance tests provide red for intentional fixes. Record task ID, command, intended failure, green result, and refactor result in `validation/cosmic-horror/tdd.md`. This obligation includes helpers, tools, foundational services, and fixes found during review. Art/copy authoring and documentation need relevant validation rather than artificial failing tests.

**Comments are part of every implementation task.** Add or update adjacent purpose comments for every new/modified function, method, and callback, including tests/tools; use JSDoc for public interfaces and non-obvious contracts. Do not defer comments or failure handling to polish.

`[P]` identifies independent files within an explicitly listed ready batch, after its prerequisites pass. It never bypasses a red test, authorizes concurrent edits to a shared file, or means a later-phase task can start without its entry gate. Unmarked tasks execute sequentially within their work package. Contributors producing art use separate batch records; a single integration task updates the common manifest.

## Phase map and independent delivery

Each numbered phase is a story or shared deliverable. Lettered work packages are bounded stopping points for separate implementation sessions. Finish one package, record evidence, and hand it off without starting the next. Story phases can be completed independently of other stories except for the explicit collection-wide joins below; sharing prerequisites is not the same as requiring all stories at once.

| Phase   | Deliverable                                           | Entry gate                                                                           | Independently checkable exit                                                                         |
| ------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1       | Tooling and evidence scaffolding                      | Existing design                                                                      | Pinned environment/configuration and populated check inventory; execution blockers recorded          |
| 2A–2B   | Immutable baseline and deterministic oracle           | Phase 1                                                                              | Known legacy outcomes, source/asset hashes, saved fixtures, glyph contexts                           |
| 2C–2F   | Shared catalogs, boundaries, art/performance tools    | 2A–2B                                                                                | Each service/tool has its own red/green suite; matched baseline performance captured                 |
| 2G      | Guarded application bridge                            | 2C–2F                                                                                | Fresh/resting boot and completed-transition saves work through one explicit service boundary         |
| 3 / US1 | Coherent narrative MVP                                | Phase 2                                                                              | Every event/outcome and descriptive surface uses the shared setting; full art collection unnecessary |
| 4 / US2 | Encounter identity and creature art                   | Phase 2                                                                              | All 51 identities/52 active variants plus unused sprite verified; loot work unnecessary              |
| 5 / US3 | Relic art and inventory journeys                      | Phase 2                                                                              | All 14 categories × six rarities and item actions verified; creature art unnecessary                 |
| 6 / US4 | Remaining symbols, favicons, collection qualification | Phase 2 for 6A/6B; T082 for remaining-symbol generation; T088 for 6C; US2/US3 for 6D | All 55 original raster/icon files and 24 symbol roles fit and have provenance/review                 |
| 7 / US5 | Existing-player continuation/import/recovery          | Phase 2; US1 3A for themed history                                                   | Old/new save and export cases preserve expected values, distinguish resume/reset, and recover safely |
| 8       | Cross-story release qualification                     | Phases 3–7                                                                           | Automated, performance, native/manual, art, and merge-enforcement gates all satisfied                |

Phase numbers preserve spec priority, not false dependencies. US5 is mandatory before release. An early narrative MVP is an internal review increment, not acceptance of the full requested refactor. Missing required browser/device access can leave qualification BLOCKED while unrelated implementation packages proceed; no dependent release gate is waived.

## Phase 1: Setup — Reproducible tools and evidence

**Goal**: Establish the plan's commands and evidence ownership before application behavior changes.
**Independent test**: Verify selected runtime and clean installation, load the static app, and run nonempty foundation suites as they are introduced. Future art/evidence checks remain OPEN until their inputs exist.

- [x] T001 Record actual Node/npm, OS/hardware, browser builds/revisions, physical-device availability, DPR, and input methods in `validation/cosmic-horror/environment.json`; reconcile drift with `specs/001-cosmic-horror-refactor/validation-plan.md` before baseline capture, keeping unavailable required targets BLOCKED.
- [x] T002 Configure `.nvmrc`, `.npmrc`, and `package.json` for planned Node 24.21.0/npm 12.2.0 and the package scripts in `specs/001-cosmic-horror-refactor/quickstart.md`; verify availability using the normal runtime manager without silently altering global tooling.
- [x] T003 Review exact planned development dependencies, native/transitive licenses, maintenance, lifecycle scripts, advisories, and zero runtime payload in `validation/cosmic-horror/dependencies.md`; install the reviewed pins, retain Howler 2.2.3, synchronize `package-lock.json` with `package.json`, and verify `npm ci`.
- [x] T004 Configure `playwright.config.mjs` with chromium/firefox/webkit projects, managed static-server teardown, required viewport/input fixtures, and isolated performance settings; install matching engines and record actual versions in `validation/cosmic-horror/environment.json`.
- [x] T005 Configure explicit classic-browser and module/Node scopes in `eslint.config.mjs` and owned-file formatting in `.prettierrc.json`/`.prettierignore`; exclude the plan's vendor/tool/generated-evidence paths, inventory existing findings in `validation/cosmic-horror/legacy-debt.md`, and avoid blanket rule suppression or uncharacterized behavior changes.
- [x] T006 Configure `.github/workflows/validate.yml` for the selected Node/npm, clean install, pinned Playwright noble image digest, engine installation, unit/integration/browser/lint/format/art/audit jobs and report upload on failure; record required-check names and unresolved enforcement in `validation/cosmic-horror/ci.md`, leaving unfinished full-collection gates visibly failing/OPEN rather than skipping them to claim success.
- [x] T007 Create `validation/cosmic-horror/manual.md`, `validation/cosmic-horror/gates.json`, and `validation/cosmic-horror/tdd.md` with requirement/task ownership, fixture/environment, commands or steps, expected/actual results, evidence path, reviewer/date, and PASS/FAIL/BLOCKED/OPEN/N/A; seed every required native journey and art/context obligation as unperformed.
- [x] T008 Update the setup sections of `README.md` and `specs/001-cosmic-horror-refactor/quickstart.md` with verified command availability, supported runtime, static HTTP/module MIME requirements, and build N/A; distinguish configured commands from checks that await later implementations.

**Checkpoint**: Configuration and dependency findings are reviewable. Do not label empty suites, unavailable engines, final art, or branch protection as passed. Phase 2 supplies behavioral tests before application edits.

## Phase 2: Foundational — Shared prerequisites

### 2A. Deterministic test harness and immutable inputs

**Entry**: Phase 1. **Exit**: Isolated, repeatable harness with an immutable local baseline; no production behavior changed.

- [x] T009 Write and run intended failing tests for random-tape exhaustion/order, clock cancellation, storage read/write faults, audio disposal, and per-case isolation in `tests/unit/test-harness.test.mjs`.
- [x] T010 Implement the tested dependencies in `tests/helpers/random-tape.mjs`, `tests/helpers/fake-clock.mjs`, `tests/helpers/fake-storage.mjs`, and `tests/helpers/fake-audio.mjs`; verify green/refactor after T009 without live networks or arbitrary sleeps.
- [x] T011 Write and run failing assertions in `tests/unit/legacy-harness.test.mjs` for loading trusted classic source with explicit DOM stubs, recording RNG calls, restoring fresh globals, and disposing timers; never evaluate imported player data.
- [x] T012 Implement `tests/helpers/legacy-harness.mjs` and `tests/helpers/browser-fixtures.mjs` after T011; demonstrate a known legacy calculation and repeatable browser state before treating the harness as an oracle.
- [x] T013 Capture revision `3cfaf54babae978c7388c023f5df5ebe6282259b` from local Git into `tests/fixtures/legacy/source/` with `tests/fixtures/legacy/baseline.json` recording source/asset hashes and immutable snapshot roots; preserve original PNG/ICO bytes and dimensions in `art/cosmic-horror/baseline.json` without replacing source baselines with candidate measurements.
- [x] T014 Capture synthetic early/resting/normal/guardian/boss/chest-mimic/door-mimic/both-variant saves, settled victory/death, interrupted tuples, full/duplicate equipment, Latin-1 exports, optional/null fields and fractional EXP in `tests/fixtures/legacy/saves.json` and `tests/fixtures/legacy/exports.json`; record expected authoritative values and reset/retention in `tests/fixtures/legacy/expected-state.json`.

### 2B. Protected rules and rendered baseline

**Entry**: 2A. **Exit**: Existing rules and every original art context have a comparison oracle. The three characterization tasks may run in parallel with separate fixture outputs.

- [x] T015 [P] Characterize all ordered pools/archetypes/conditions, numeric enemy/combat outcomes, guardian progression, discarded mimic draws and both Skeleton Mage draws in `tests/unit/legacy-encounters.test.mjs` with `tests/fixtures/legacy/encounters.json`; assert full RNG-tape consumption against captured legacy code before edits.
- [x] T016 [P] Characterize category/stat rolls, rarity boundaries 70/20/4/3/2/1, level 100/tier 10 limits, six slots, duplicates, stat aggregation, filters and sale proceeds in `tests/unit/legacy-equipment.test.mjs` with `tests/fixtures/legacy/equipment.json`.
- [x] T017 [P] Characterize all events/choices, three level-up choices/two rerolls, allocation/skills, costs/rewards, timing, death/abandon/new-run retention and import reset in `tests/unit/legacy-progression.test.mjs` with `tests/fixtures/legacy/progression.json`; distinguish protected formulas from the explicitly planned lifecycle/storage fixes.
- [x] T018 Write and run failing tests for font readiness, missing selectors, inline baseline probes, geometry metadata and immutable capture behavior in `tests/integration/measure-symbols.spec.mjs`; use independently known fixture geometry.
- [x] T019 Implement `tests/helpers/measure-symbols.mjs` after T018 and enumerate every 24-role context in `tests/fixtures/legacy/symbol-contexts.json`; capture boxes, spacing, alignment/baseline, line height, DPR, font and screenshots at three viewports and 100%/200% text into `art/cosmic-horror/baseline.json` and `art/cosmic-horror/review/baseline/`, including reward/detail/allocation/offering/sale contexts and every available declared browser; retain missing native-context rows as BLOCKED and require their matched baseline before that target's candidate qualification.

### 2C. Shared setting and immutable identity catalogs

**Entry**: 2A–2B. **Exit**: One shared naming/identity contract supports narrative, encounters, relics and migration without waiting for finished art.

- [x] T020 Author `art/cosmic-horror/setting-guide.md` with the original coastal setting, player role, terminology, category cues, motifs/palette, copy surfaces, credits policy and accepted horror boundary; enumerate stable IDs and new names for 51 encounters, 52 active variants, the unused sprite, 14 relics and 24 symbol roles.
- [x] T021 Write and run failing coverage/immutability/alias/unknown-reference tests in `tests/unit/catalogs.test.mjs`, including 51/52/53 counts, 14 categories, 24 roles, separate Skeleton Mage variants, no new pool member for unused art, unchanged rarity/rule tokens, and zero RNG/DOM/storage effects.
- [x] T022 [P] Implement the setting and encounter exports in `assets/js/content/setting.mjs` and `assets/js/content/encounters.mjs` after T021; map legacy names/image keys to immutable IDs, distinct names/descriptions, exact existing sprite paths/dimensions and 50%/70% widths without copying or reordering numerical selection rules.
- [x] T023 [P] Implement `assets/js/content/relics.mjs` and `assets/js/content/symbols.mjs` after T021; map all category/type/attribute relations and 24 role/context IDs, retain six rarity labels, and assign new runtime symbol paths without claiming original glyph pixel dimensions.
- [x] T024 Implement validated public lookups in `assets/js/content/catalog.mjs` after T022/T023; return typed unknown/mismatched identity errors, allowlisted paths/classes and plain text, then run T021 green and refactor.

### 2D. Safe state, rendering, storage and lifecycle services

**Entry**: 2C. **Exit**: Pure validation and injectable shared services pass independently of UI/art production. Work through each red/green pair sequentially.

- [x] T025 Write and run failing schema tests in `tests/unit/save-validation.test.mjs` using `tests/fixtures/legacy/saves.json` and `tests/fixtures/adversarial/saves.json`; cover nested item strings, duplicate holdings, optional/null/derived values, idle versus active enemies, cross-record mismatches, unknown IDs, prototype/path/CSS payloads, 16 MiB input, depth 64 and 64 KiB field safeguards without gameplay caps.
- [x] T026 Implement pure `validateCandidate(input, sourceKind)` and fixture-backed defaults in `assets/js/app/save-validation.mjs` after T025; preserve sequence/numerics/player text, reject unsafe references, distinguish character-only input, and verify green/refactor with no writes/RNG/live-state mutation.
- [x] T027 Write and run failing real-DOM tests for names/messages/catalog paths, hostile text, unrecognized history notices and safe structured nodes in `tests/integration/safe-render.spec.mjs`; assert no script execution, untrusted HTML insertion or arbitrary CSS/URL use.
- [x] T028 Implement text/node composition and typed-message parameter validation in `assets/js/app/safe-render.mjs` and `assets/js/app/message-records.mjs` after T027; reserve narrative templates and legacy-history parsing for US1/US5 and verify safe boundaries green.
- [x] T029 Write and run failing tests in `tests/unit/snapshot-store.test.mjs` for complete revision reads, absent-versus-malformed canonical records, pure defaults, raw legacy retention, prior-good backup-before-write, every read/backup/canonical exception, unsaved results and revision conflicts; assert the per-stage byte-preservation matrix in `contracts/persistence.md`, including successful backup followed by failed canonical write, failed first commit, no rollback writes, and no import/migration replacement of live state after failure.
- [x] T030 Implement `readLocalState()` and `commitSnapshot(candidate)` in `assets/js/app/snapshot-store.mjs` after T029 with explicit clock/storage dependencies and canonical/previous keys from `contracts/persistence.md`; never silently downgrade malformed canonical data or claim race-free cross-tab transactions.
- [x] T031 Write and run failing tests for nested transition save coalescing, failed transitions, no intermediate reward/HP snapshots, generation invalidation and timer/listener/audio disposal in `tests/unit/lifecycle.test.mjs` and `tests/unit/transitions.test.mjs`.
- [x] T032 Implement `assets/js/app/lifecycle.mjs` and `assets/js/app/transitions.mjs` after T031; commit only validated completed outer transitions, invalidate stale callbacks, expose explicit teardown, and preserve rule calculations/RNG through green/refactor.
- [x] T033 Write and run failing real-DOM contract tests in `tests/integration/dialog-service.spec.mjs` for initial focus, invoking-control return, background blocking, Escape cancellation and repeated open/close cleanup without confirmation; use isolated existing-modal fixtures.
- [x] T034 Implement the shared `assets/js/app/dialogs.mjs` after T033 with explicit DOM/lifecycle dependencies, native control semantics and safe dismissal; verify green/refactor so every story can reuse the same focus behavior independently.

### 2E. Tested art preparation and evidence validation

**Entry**: 2B–2C. **Exit**: Tools accept independently constructed valid fixtures and reject adversarial fixtures. They may run alongside 2D because their files are separate.

- [x] T035 Write and run failing tests in `tests/unit/art-tools.test.mjs` with independent `tests/fixtures/art/` fixtures for contain/padding, wrong-size/opaque/blank/corrupt PNGs, unsafe paths, baseline overwrite, missing/duplicate aliases/provenance and malformed one-entry ICO directory/payload.
- [x] T036 Implement `scripts/prepare-art.mjs`, `scripts/pack-ico.mjs`, and `scripts/validate-art.mjs` after T035 using pinned Sharp, transparent proportional contain and exact odd favicon sizes; validate decode/alpha/nonempty pixels/hashes/mapping/contexts without claiming originality from hashes, then refactor green.
- [x] T037 Initialize `art/cosmic-horror/manifest.json` from immutable baseline/catalogs with 53 sprites, two separate favicon outputs, 24 role obligations and fallback; include prompt/master/actual provenance/transform/review fields, null unknown metadata and OPEN review status, never fake generated assets to satisfy validation.
- [x] T038 Write and run failing tests in `tests/unit/evidence-validator.test.mjs` for absent files, inconsistent requirement coverage, fabricated/missing reviewer data, unresolved findings and required OPEN/FAIL/BLOCKED states using `tests/fixtures/evidence/`; distinguish automated from manual records and require reasons for N/A.
- [x] T039 Implement `scripts/validate-evidence.mjs` after T038 against `validation/cosmic-horror/gates.json` and the art manifest; fail incomplete release gates, validate evidence references/statuses, and verify green using separate valid/invalid fixtures without filling real manual checkboxes.

### 2F. Matched performance baseline

**Entry**: 2A–2B and selected recorded environment. **Exit**: Repeatable workload harness and immutable raw baseline before integration.

- [x] T040 Write and run failing tests for revision/stage enforcement, identical external-font/analytics transforms, immutable baseline outputs, sample medians/thresholds, missing samples and rejected fallback-as-art results in `tests/unit/performance-harness.test.mjs`.
- [x] T041 Implement `tests/helpers/performance-fixture.mjs`, `tests/helpers/performance-report.mjs`, and `tests/performance/load-and-art.spec.mjs` after T040; use identical DOM/action/decode endpoints, real elapsed time, one worker, localhost/no throttling, no request/HAR routing and observed warm-cache evidence at 1440 × 900 and separately 360 × 800.
- [x] T042 Capture at least five valid baseline samples per first-visit/resting-return/title-to-dungeon/normal/special-boss/largest-spider-dragon/both-variant/mimic workload and cold/warm class in `validation/cosmic-horror/performance/baseline.json`; record raw times, cache proof, bytes, transform/source hashes, environment, invalid-run reasons and long-name/full-loadout diagnostics using `PERF_STAGE=baseline` against the immutable served root.

### 2G. Guarded bridge and completed-transition integration

**Entry**: All preceding foundation packages; original source/assets/geometry/performance are frozen. **Exit**: One bridge, safe boot and completed-transition writes; full US5 player recovery/import/resume acceptance follows separately.

- [x] T043 Write and run failing regressions in `tests/integration/bootstrap.spec.mjs` for eager storage reads/listeners, before/after-load initialization, duplicate init, denied reads/module failure, gesture-bound audio and gated actions; add `tests/integration/transition-commits.spec.mjs` failures at existing attack/reward/death/reset/item save sites.
- [x] T044 Implement `assets/js/app/services.mjs` and the once-only lexical `gameServices` bridge in `assets/js/main.js`, `assets/js/player.js`, `assets/js/music.js`, and `assets/js/dungeon.js` after T043; inject state accessors, remove eager/repeated raw reads, gate actions until validated ready/recovery, expose an actionable loading error in existing regions, and preserve classic ownership and user-gesture audio.
- [x] T045 Route save requests and complete attack/reward/death/reset/allocation/level-up/equip/sale/event transitions through the coordinator in `assets/js/main.js`, `assets/js/combat.js`, `assets/js/dungeon.js`, `assets/js/player.js`, and `assets/js/equipment.js` after T043; make `objectValidation()` pure, preserve original keys and unsaved memory, and run both bootstrap/commit regressions plus numerical characterization green before refactoring.
- [x] T046 Resolve scoped lint debt only after corresponding characterization/regression tests, review all shared-service comments and static `.mjs`/font/audio loading, and record runnable unit/integration/lint/format checks in `validation/cosmic-horror/foundation.md`; link outstanding full-art/native/release gates without calling foundation completion release acceptance.

**Checkpoint**: No story starts integration before 2G passes for the runnable automated development environment; absent native targets block their qualification, not independent code/art authoring. Foundation package failures block only their actual dependents; independent tooling/catalog work can still proceed. Each finished package has its own evidence and can be resumed without regenerating baselines.

## Phase 3: User Story 1 — Enter a Coherent Cosmic Horror World (P1, narrative MVP)

**Goal**: All current narrative surfaces express the shared setting while rules and player-authored names remain unchanged.
**Independent test**: From a new character, exercise every event choice and outcome, upgrades, menus, help and credits; review against the setting guide without requiring finished monster/relic art.
**Entry**: Phase 2. **Evidence owner**: US1 tasks; `validation/cosmic-horror/us1.md`.

### 3A. Narrative catalog and coverage

- [x] T047 [P] [US1] Write and run failing text/template coverage tests in `tests/unit/narrative.test.mjs` for title, introduction, all events/choices, skills, upgrades, combat/rewards, death/abandon/restart, menus/help and descriptive copy; exclude neutral labels, player text, historical mappings and accurate third-party credits from old-identity checks.
- [x] T048 [P] [US1] Write and run failing deterministic browser journeys in `tests/browser/setting-journeys.spec.mjs` for entry/allocation, every exploration event, victory/defeat, level-up/reroll, floor transition, abandonment, inventory/menu/help and credits; assert both setting consistency and legacy-equivalent resulting numerics.
- [x] T049 [US1] Author typed templates and parameter schemas in `assets/js/content/messages.mjs` after T047/T048 using `art/cosmic-horror/setting-guide.md`; cover skill explanations and all costs/consequences, retain the agreed horror boundary and verify unit tests green.

### 3B. Existing-screen integration

- [x] T050 [US1] Apply title/browser title, introduction, allocation/skill names and descriptions through catalogs in `index.html`, `assets/js/main.js`, and `assets/js/app/entry-view.mjs` after T048; retain screen organization, character-name rules and gameplay values.
- [x] T051 [US1] Route all exploration, treasure/door/mimic, blessing/curse, guardian/boss and uneventful-room copy and choices through message records in `assets/js/dungeon.js` and `assets/js/app/event-view.mjs`; preserve choices, costs, draw order, room/floor transitions and last-50 display behavior.
- [x] T052 [US1] Route combat logs, rewards, level-up/reroll, defeat, abandonment and restart text through safe message rendering in `assets/js/combat.js`, `assets/js/player.js`, and `assets/js/app/outcome-view.mjs`; verify Claim changes presentation without granting another reward.
- [x] T053 [US1] Route inventory/menu/help text and current item labels through safe shared catalogs in `assets/js/equipment.js` and `assets/js/main.js` after T048, leaving icon/action work to US3; update game description/credits in `README.md`, retain accurate audio/library contributions and identify generated-art work without claiming unfinished art is delivered.

### 3C. Operable entry, events and modals

- [x] T054 [P] [US1] Write and run failing keyboard/modal tests in `tests/browser/navigation-accessibility.spec.mjs` for Enter/Space title activation, meaningful names, visible focus, appropriate initial focus/return, background blocking, Escape cancellation and error announcements.
- [x] T055 [P] [US1] Write and run failing tests in `tests/browser/entry-resilience.spec.mjs` for three viewports, 200% text, long names, reduced title/loading/combat/damage motion, muted/blocked audio and external-font/analytics failure; keep core actions usable.
- [x] T056 [US1] Integrate the shared `assets/js/app/dialogs.mjs` service and scoped semantic controls/labels in `index.html` and `assets/js/main.js` after T054; preserve existing confirmation and screen structure, including focus return and non-destructive Escape.
- [x] T057 [US1] Correct scoped focus/contrast/wrapping/reduced-motion rules in `assets/css/style.css` and affected generated controls in `assets/js/player.js`/`assets/js/dungeon.js` after T055; retain portrait/container sizes and audio controls, then rerun both accessibility files green.
- [x] T058 [US1] Refactor the changed narrative/view code with tests green, run the US1 browser matrix and affected characterization/axe checks, manually review text/keyboard/focus/horror boundaries, and record command/results/findings in `validation/cosmic-horror/us1.md` and assigned rows of `validation/cosmic-horror/manual.md`.

**Checkpoint**: Narrative MVP is reviewable without the complete new art collection. Missing required native/manual rows remain OPEN/BLOCKED; do not claim full refactor release. US2 and US3 do not depend on US1 completion. US5 themed-history integration needs 3A templates only; its exchange, continuation and recovery packages can proceed earlier. Serialize shared classic-file edits.

## Phase 4: User Story 2 — Recognize Cosmic Horrors in Every Encounter (P1)

**Goal**: All creatures/variants have distinct new identities and generated art while combat and selection stay numerically equivalent.
**Independent test**: Drive every identity/variant, archetype and encounter condition with controlled random tapes; compare rules and inspect portraits independently of relic changes.
**Entry**: Phase 2. **Evidence owner**: US2 tasks; `validation/cosmic-horror/us2.md`.

### 4A. Encounter contract and renderer

- [x] T059 [P] [US2] Write and run failing identity/variant/render tests in `tests/integration/encounter-view.spec.mjs` for all 51 identities/52 active variants, consistent names/alt/log references, zero presentation RNG, reserved aspect ratios, 50%/70% widths and unchanged enemy objects.
- [x] T060 [P] [US2] Write and run failing browser cases in `tests/browser/encounters.spec.mjs` for normal/guardian/special-boss/both-mimic triggers, each variant, readable long names and attack/HP/reward/progression equivalence using `tests/fixtures/legacy/encounters.json`.
- [x] T061 [US2] Implement `assets/js/app/encounter-view.mjs` and integrate identity presentation in `assets/js/enemy.js`, `assets/js/combat.js`, and `assets/js/dungeon.js` after T059/T060; resolve already-selected legacy identities/images through catalogs, retain selection/stat formulas and their RNG draws, and verify renderer/rule assertions green before art qualification.

### 4B. Pilot and bounded original-art batches

Each generation task uses the installed imagegen skill and built-in tool during implementation, one request per distinct image/variant with transparency. Follow the setting guide; do not trace/recolor originals. Save prompts in `art/cosmic-horror/prompts/<batch>/` and masters in `art/cosmic-horror/masters/<batch>/`, where `<batch>` is the named batch directory below; save actual returned provenance/timestamps/hashes and source links in that batch's `generation.json`, prepare only listed runtime outputs with the tested tool, and record per-file actual-size/alpha/framing/horror-boundary review in its `review.md`. Fix/regenerate failed art within the batch. Unknown provenance stays null. Batch metadata is merged later; no concurrent writes to the common manifest.

- [x] T062 [US2] Generate and review the representative small/tall/large pilot replacing `assets/sprites/goblin.png`, `assets/sprites/spider_spirit.png`, and `assets/sprites/spider_dragon.png`; retain source links/provenance in `art/cosmic-horror/batches/encounter-pilot/`, match each exact baseline canvas, and keep the unused sprite outside encounter pools.
- [x] T063 [US2] Refine framing/prompt guidance from T062 in `art/cosmic-horror/setting-guide.md` and `art/cosmic-horror/batches/encounter-pilot/review.md`; freeze the creature batch direction before the remaining parallel batches without changing shared IDs or names.
- [x] T064 [P] [US2] Generate, prepare and individually review `assets/sprites/goblin_archer.png`, `assets/sprites/goblin_mage.png`, `assets/sprites/goblin_rogue.png`, and `assets/sprites/goblin_boss.png` after T063; save batch records in `art/cosmic-horror/batches/goblins/`.
- [x] T065 [P] [US2] Generate, prepare and individually review `assets/sprites/wolf.png`, `assets/sprites/wolf_black.png`, `assets/sprites/wolf_winter.png`, and `assets/sprites/wolf_boss.png` after T063; save batch records in `art/cosmic-horror/batches/wolves/`.
- [x] T066 [P] [US2] Generate, prepare and individually review `assets/sprites/slime.png`, `assets/sprites/slime_angel.png`, `assets/sprites/slime_crusader.png`, `assets/sprites/slime_knight.png`, and `assets/sprites/slime_boss.png` after T063; save batch records in `art/cosmic-horror/batches/slimes/`.
- [x] T067 [P] [US2] Generate, prepare and individually review `assets/sprites/orc_archer.png`, `assets/sprites/orc_axe.png`, `assets/sprites/orc_mage.png`, and `assets/sprites/orc_swordsmaster.png` after T063; save batch records in `art/cosmic-horror/batches/orcs/`.
- [x] T068 [P] [US2] Generate, prepare and individually review `assets/sprites/spider.png`, `assets/sprites/spider_red.png`, `assets/sprites/spider_green.png`, `assets/sprites/spider_fire.png`, and `assets/sprites/spider_boss.png` after T063; save batch records in `art/cosmic-horror/batches/spiders/` without regenerating the pilot's two spider outputs.
- [x] T069 [P] [US2] Generate, prepare and individually review `assets/sprites/skeleton_archer.png`, `assets/sprites/skeleton_knight.png`, `assets/sprites/skeleton_swordsmaster.png`, and `assets/sprites/skeleton_warrior.png` after T063; save batch records in `art/cosmic-horror/batches/skeletons-a/`.
- [x] T070 [P] [US2] Generate separate original variants for `assets/sprites/skeleton_mage1.png` and `assets/sprites/skeleton_mage2.png` plus `assets/sprites/skeleton_pirate.png`, `assets/sprites/skeleton_samurai.png`, and `assets/sprites/skeleton_boss.png` after T063; prepare/review each and save records in `art/cosmic-horror/batches/skeletons-b/`.
- [x] T071 [P] [US2] Generate, prepare and individually review `assets/sprites/alfadriel.png`, `assets/sprites/ant_queen.png`, `assets/sprites/berthelot.png`, `assets/sprites/cerberus_ptolemaios.png`, and `assets/sprites/hellhound.png` after T063; save records in `art/cosmic-horror/batches/guardians-a/`.
- [x] T072 [P] [US2] Generate, prepare and individually review `assets/sprites/fallen_king.png`, `assets/sprites/tiamat.png`, `assets/sprites/zodiac_aries.png`, and `assets/sprites/zodiac_cancer.png` after T063; save records in `art/cosmic-horror/batches/guardians-b/`.
- [x] T073 [P] [US2] Generate, prepare and individually review `assets/sprites/behemoth.png`, `assets/sprites/bm-feral.png`, `assets/sprites/da-reaper.png`, and `assets/sprites/firelord.png` after T063; save records in `art/cosmic-horror/batches/bosses-a/`.
- [x] T074 [P] [US2] Generate, prepare and individually review `assets/sprites/icemaiden.png`, `assets/sprites/skeleton_dragon.png`, `assets/sprites/thanatos.png`, and `assets/sprites/zalaras.png` after T063; save records in `art/cosmic-horror/batches/bosses-b/`.
- [x] T075 [P] [US2] Generate, prepare and individually review `assets/sprites/mimic.png` and `assets/sprites/mimic_door.png` after T063; save separate trigger/identity records in `art/cosmic-horror/batches/mimics/`.

### 4C. Encounter-only qualification

- [x] T076 [US2] Merge all 53 delivered creature records into `art/cosmic-horror/manifest.json` and update the replacement mapping in `specs/001-cosmic-horror-refactor/art-inventory.md`; verify every listed file exactly once, separate variant provenance, exact dimensions/alpha, valid catalog references and no phantom encounter for unused art.
- [x] T077 [US2] Exercise all identities/variants at 360 × 800, 768 × 1024 and 1440 × 900, including enlarged text and extreme aspect ratios, using `tests/browser/encounters.spec.mjs`; record actual-size screenshots and individual silhouette/controls/originality/direction/boundary findings in `art/cosmic-horror/review/encounters.md` with manifest links.
- [x] T078 [US2] Refactor encounter integration with tests green, rerun ordered-pool/full-RNG/combat/reward comparisons and encounter browser checks, and record automated versus manual status in `validation/cosmic-horror/us2.md`; resolve every creature-art finding before declaring this story accepted.

**Checkpoint**: 53 creature outputs are complete, 52 active variants remain selectable and numerics match. US2 can be reviewed without completing relic or remaining-symbol production. Final missing-image integration and whole-collection acceptance join in US4.

## Phase 5: User Story 3 — Collect and Manage Forbidden Relics (P1)

**Goal**: All relics share the setting while item identity, capacity, rarity, statistics and transactions remain reliable.
**Independent test**: Exercise all 14 categories × six rarities; claim, inspect, equip, unequip, sell, bulk sell, full loadout and retained equipment after reset.
**Entry**: Phase 2. **Evidence owner**: US3 tasks; `validation/cosmic-horror/us3.md`.

### 5A. Item boundary and stale-action protection

- [ ] T079 [P] [US3] Write and run failing tests in `tests/unit/item-actions.test.mjs` for duplicate encoded inventory/object-equipped holdings, collection/index/render-revision binding, stale/repeated actions, six-slot capacity and unchanged category/rarity/stat/value behavior.
- [ ] T080 [P] [US3] Write and run failing tests in `tests/browser/relics.spec.mjs` for all 84 category/rarity fixtures, reward/list/equipped/detail/confirmation/log identity consistency, claim/equip/unequip/unequip-all/sale/filter operations, empty/full states and death/abandon/new-run retention.
- [ ] T081 [US3] Implement `assets/js/app/item-actions.mjs` after T079 to validate current collection/index/render revision and reject stale actions by rerendering; preserve separate identical items, original representation/order, six slots and legacy transaction numerics, then refactor green.

### 5B. Small-icon pilot and relic batches

Use the same per-request generation, transparent preparation, exact measured-context and batch-provenance rules as 4B. These batches depend on Phase 2 catalogs/measurements/tools, not on finished creature art. T082 first qualifies a representative small icon and freezes icon guidance before the rest of its batch; completion gates T083–T086 and the remaining themed-symbol batches T095–T097. Each named runtime file represents its own category role even where original glyphs were shared.

- [ ] T082 [US3] Generate `assets/art/relic-sword.png` first as the small-icon pilot; prepare and review it at every measured reward/list/detail/equipped size, including the smallest context and 100%/200% text across declared viewports. Resolve silhouette/category-cue/contrast/alpha/framing findings and record pilot acceptance in `art/cosmic-horror/batches/relic-weapons-a/review.md`; freeze icon prompt/framing guidance in `art/cosmic-horror/setting-guide.md` before generating, preparing and reviewing `assets/art/relic-axe.png` and `assets/art/relic-hammer.png`. Retain prompts/masters/provenance for all three in `art/cosmic-horror/batches/relic-weapons-a/`; do not change shared IDs/names or require completed creature art/UI integration for the pilot.
- [ ] T083 [P] [US3] Generate, prepare and review `assets/art/relic-dagger.png`, `assets/art/relic-flail.png`, and `assets/art/relic-scythe.png` after T082 using the accepted icon guidance; save measured-context reviews and generation records in `art/cosmic-horror/batches/relic-weapons-b/`.
- [ ] T084 [P] [US3] Generate, prepare and review separate `assets/art/relic-plate.png`, `assets/art/relic-chain.png`, and `assets/art/relic-leather.png` after T082 using the accepted icon guidance despite their shared legacy glyph; save records in `art/cosmic-horror/batches/relic-armor/`.
- [ ] T085 [P] [US3] Generate, prepare and review `assets/art/relic-tower.png`, `assets/art/relic-kite.png`, and `assets/art/relic-buckler.png` after T082 using the accepted icon guidance; save measured-context and generation records in `art/cosmic-horror/batches/relic-wards/`.
- [ ] T086 [P] [US3] Generate, prepare and review `assets/art/relic-great-helm.png` and `assets/art/relic-horned-helm.png` after T082 using the accepted icon guidance; save measured-context and generation records in `art/cosmic-horror/batches/relic-helms/`.

### 5C. Safe, accessible item presentation

- [ ] T087 [US3] Write and run failing DOM/geometry tests in `tests/integration/symbol-view.spec.mjs` for role/context resolution, measured boxes/baseline/spacing within 0.5 CSS px, reset image margins, decorative/informative alternatives and no essential color-only meaning; use fixture images independently of generation results.
- [ ] T088 [US3] Implement reusable `assets/js/app/symbol-view.mjs` after T087 with explicit context metrics and safe catalog-only image resolution, plus narrowly scoped inline-symbol rules in `assets/css/style.css`; keep original control/container footprints and refactor green.
- [ ] T089 [US3] Implement `assets/js/app/item-view.mjs` and integrate `assets/js/equipment.js`, `assets/js/player.js`, and equipment controls in `assets/js/main.js` after T080/T088; safely render themed names/icons across all surfaces, meaningful buttons, labels/full-loadout feedback and transactional item actions without changing loot generation.
- [ ] T090 [US3] Write and run failing tests in `tests/browser/relic-accessibility.spec.mjs` for item/detail/sale keyboard focus and return, cancellation, full long names/prices/stats, six visible rarity labels, 200% text and no overlap at the three required viewports.
- [ ] T091 [US3] Correct item-specific semantics/focus/wrapping in `assets/js/app/item-view.mjs` and `assets/css/style.css` after T090, reusing the foundation's `assets/js/app/dialogs.mjs`; verify green without blocking US3 on US1.
- [ ] T092 [US3] Merge all 14 relic-role generation/transform/context/review records into `art/cosmic-horror/manifest.json` and `specs/001-cosmic-horror-refactor/art-inventory.md`; record per-context actual-size acceptance in `art/cosmic-horror/review/relics.md`, retaining baseline glyph dimensions as not applicable.
- [ ] T093 [US3] Refactor item code with tests green and run all 84 presentation fixtures, generation probability/capacity/stat/sale comparisons, duplicate/stale-action and reset retention cases; record automated/manual keyboard/geometry results in `validation/cosmic-horror/us3.md` and `validation/cosmic-horror/manual.md`.

**Checkpoint**: Every relic category has original art and functional parity independent of creature replacement. Shared `symbol-view.mjs` is ready for US4; all item dialogs reuse the tested foundation service.

## Phase 6: User Story 4 — Complete Art Collection and Dimensional Fit (P1)

**Goal**: Finish non-creature/non-relic art, handle failed images, and qualify the entire collection without resizing the interface for art.
**Independent test**: Validate the inventory and every actual-size context independently of numerical game-balance comparisons.
**Entry**: Phase 2 for 6A/6B, with T082 additionally required for remaining-symbol generation T095–T097; shared symbol service from T088 for 6C; US2/US3 deliverables for 6D. Generation can start before those integrations finish.
**Evidence owner**: US4 tasks; `validation/cosmic-horror/us4.md`.

### 6A. Favicons and the remaining ten symbol roles

- [ ] T094 [P] [US4] Generate one original emblem master and prepare `assets/icon/favicon.png` at exactly 199 × 200 plus `assets/icon/favicon.ico` with one decoded 127 × 128 image; validate both separately and retain prompts/masters/provenance/actual-size review in `art/cosmic-horror/batches/favicons/`.
- [ ] T095 [P] [US4] Generate separate original `assets/art/title.png`, `assets/art/treasure.png`, and `assets/art/currency.png` after T082 using the accepted icon guidance; prepare for measured title/event/player/reward/offering/sale contexts and save generation/review records in `art/cosmic-horror/batches/world-symbols/`.
- [ ] T096 [P] [US4] Generate original `assets/art/stat-hp.png`, `assets/art/stat-attack.png`, `assets/art/stat-defense.png`, and `assets/art/stat-attack-speed.png` after T082 using the accepted icon guidance; prepare/review main/bonus/allocation contexts and save records in `art/cosmic-horror/batches/stats-a/`.
- [ ] T097 [P] [US4] Generate original `assets/art/stat-vampirism.png`, `assets/art/stat-critical-rate.png`, and `assets/art/stat-critical-damage.png` after T082 using the accepted icon guidance; prepare/review all inventoried contexts and save records in `art/cosmic-horror/batches/stats-b/`.
- [ ] T098 [P] [US4] Generate and prepare the new transparent `assets/art/fallback.png` to work inside reserved portrait/symbol boxes with readable adjacent identity; keep prompts/masters/provenance and small/large-context review in `art/cosmic-horror/batches/fallback/`.

### 6B. Missing, corrupt and late-image behavior

- [ ] T099 [P] [US4] Write and run failing integration tests in `tests/integration/image-loader.spec.mjs` for loading/error/decode failure, fallback failure without recursion, stale completion after identity change, cleanup and stable reserved geometry; require usable controls during loading.
- [ ] T100 [P] [US4] Write and run failing journey tests in `tests/browser/art-failure.spec.mjs` for delayed/missing/corrupt creature and relic images, fallback unavailability, identity text and successful combat/inventory actions; isolate intercepted failure runs from normal performance timing.
- [ ] T101 [US4] Implement `assets/js/app/image-loader.mjs` after T099 with generation tokens/disposal, safe terminal text/local-symbol fallback and catalog-only URLs; verify failures/late completions green using independent fixtures before consumer integration.

### 6C. Remaining symbol integration

- [ ] T102 [US4] Write and run failing role/context tests in `tests/browser/symbol-geometry.spec.mjs` for all ten remaining roles at 100%/200% text and three viewports, using original measurements and at most 0.5 CSS px edge/baseline tolerance; detect global image margins and absent dynamic contexts.
- [ ] T103 [US4] Integrate the ten new symbols and corrected favicon media reference in `index.html`, `assets/js/player.js`, `assets/js/dungeon.js`, and `assets/js/main.js` after T102/T088; use `assets/js/app/symbol-view.mjs`, preserve semantic meanings and existing hit areas, and adjust only symbol-specific rules in `assets/css/style.css`.

### 6D. Collection join and complete visual acceptance

- [ ] T104 [US4] Connect `assets/js/app/image-loader.mjs` to `assets/js/app/encounter-view.mjs`, `assets/js/app/item-view.mjs`, and `assets/js/app/symbol-view.mjs` after their story implementations; run T100 green with real controls and resolve shared-file integration sequentially.
- [ ] T105 [US4] Merge favicon/ten-symbol/fallback records with US2/US3 into `art/cosmic-horror/manifest.json` and complete `specs/001-cosmic-horror-refactor/art-inventory.md`; verify 53 sprites, two favicon outputs, 24 distinct role obligations and fallback, every master/prompt/hash/transform/context, unused art and both variants, and zero unresolved placeholder assets.
- [ ] T106 [US4] Run `npm run validate:art` and `tests/browser/symbol-geometry.spec.mjs` against the entire shipped collection; record decoded sizes/alpha/ICO payload, exact references, immutable baseline hashes and all context comparisons in `validation/cosmic-horror/art-automated.json` with actual command/output links.
- [ ] T107 [US4] Review every file and distinct display context at actual sizes across declared viewports, including unused sprite, favicons and 200% text; record originality, coherence, identity distinctions, contrast/readability, transparent edges, framing and horror-boundary findings in `art/cosmic-horror/review/collection.md` and per-entry manifest reviews.
- [ ] T108 [US4] Regenerate/reprepare failed art and correct failed context integration in the exact paths recorded by `art/cosmic-horror/review/collection.md`; update affected batch provenance/manifests, rerun affected checks and obtain resolved per-entry review before marking required collection rows PASS.
- [ ] T109 [US4] Refactor image/symbol integration with green tests and record full art, geometry, load-failure, manual visual and no-container-resize outcomes in `validation/cosmic-horror/us4.md`; keep unavailable required native/context review OPEN/BLOCKED and final evidence validation failing until satisfied.

**Checkpoint**: Complete art is independently auditable. Hash/size/alpha checks establish file properties; human review establishes originality/readability/content suitability. Neither replaces the other.

## Phase 7: User Story 5 — Continue Existing Progress (P2, required for release)

**Goal**: Safely continue local encounters, import/export characters with established reset semantics, and preserve recoverable data on failure.
**Independent test**: Load the legacy corpus, resume all encounter kinds/variants, import old/new characters, cancel imports and inject storage/clipboard/adversarial failures without relying on finished art.
**Entry**: Phase 2 for 7B–7D; US1 3A templates (T049) additionally required for 7A themed-history integration. US5 does not require completed US1 UI, creature art or relic art; coordinate shared-file edits.
**Evidence owner**: US5 tasks; `validation/cosmic-horror/us5.md`.

### 7A. Legacy presentation migration and history

- [ ] T110 [P] [US5] Write and run failing tests in `tests/unit/legacy-migration.test.mjs` for stage-specific defaults, exact variant mapping, idempotence, raw-source retention, field preservation, zero RNG and no reset/reward regeneration; include interrupted active-terminal versus legitimate inactive terminal states.
- [ ] T111 [P] [US5] Write and run failing tests in `tests/unit/legacy-history.test.mjs` for full recognized templates/reward panels, preserved sequence and last-50 display, player names containing legacy terms, hostile markup and unknown-history recovery notices with retained raw bytes.
- [ ] T112 [US5] Implement `assets/js/app/legacy-migration.mjs` after T110 and connect pure candidate mapping in `assets/js/app/snapshot-store.mjs`; preserve authoritative legacy tokens/numerics and distinguish unsupported canonical records, partial active-run tuples and legitimate early defaults.
- [ ] T113 [US5] Implement template-aware migration in `assets/js/app/legacy-history.mjs` after T111, using US1 3A templates, typed records and raw recovery references; map known history to catalogs without broad string replacement or HTML evaluation, and verify green with safe renderer integration.

### 7B. Character exchange and transactional import

- [ ] T114 [P] [US5] Write and run failing tests in `tests/unit/character-codec.test.mjs` for strict historical Latin-1 Base64 and new `MC1:` UTF-8 envelopes, Unicode round trips, malformed Base64/UTF-8, unsupported versions/shapes, prototype keys and resource budgets; exclude dungeon/enemy/volume from new exports.
- [ ] T115 [P] [US5] Write and run failing tests in `tests/integration/character-import.spec.mjs` for read-only preview/cancel, explicit replace/reset confirmation, exact legacy retention/reset and local preferences, persist-before-runtime replacement, failed commit keeping current session, and explicit candidate session-only choice.
- [ ] T116 [US5] Implement `encodeCharacter(player)`/`decodeCharacter(text)` in `assets/js/app/character-codec.mjs` after T114 using validated character-only shapes and size/depth safeguards; accept an old combat flag without requiring an exported enemy, then verify green/refactor.
- [ ] T117 [US5] Implement off-to-the-side reset/commit orchestration in `assets/js/app/character-import.mjs` and wire `assets/js/main.js` after T115/T116; preserve imported retained values/current audio, replace runtime only after save or explicit unsaved-session choice, and clean up the previous lifecycle exactly once.

### 7C. Combat continuation and lifecycle correction

- [ ] T118 [P] [US5] Write and run failing browser regressions in `tests/browser/continue-encounter.spec.mjs` for saved normal/guardian/boss/both-mimic/both-variant encounters, same HP/stats/rewards, paused exploration/event flag, no guardian re-advance, no reroll/reward replay and one fresh full attack delay per actor.
- [ ] T119 [P] [US5] Write and run failing integration tests in `tests/integration/lifecycle-audio.spec.mjs` for repeated title/dungeon entry, combat end/death/reset/import, cancelled stale attacks/UI callbacks, single timer sets, user-gesture audio, retained mute/volume and stopped/disposed old Howler instances.
- [ ] T120 [US5] Implement continuation orchestration in `assets/js/app/continuation.mjs` and integrate `assets/js/main.js`, `assets/js/dungeon.js`, and `assets/js/combat.js` after T118; restore resting state before deriving active combat, reuse the saved enemy/variant, retain completed rewards and reject interrupted inconsistencies into recovery.
- [ ] T121 [US5] Apply lifecycle ownership to attack/UI/dungeon/play timers, listeners and Howler resources in `assets/js/combat.js`, `assets/js/dungeon.js`, and `assets/js/music.js` after T119; preserve numerical intervals and first-delay semantics, verify green and rerun protected gameplay comparisons.

### 7D. Recovery, clipboard and single-tab ownership

- [ ] T122 [P] [US5] Write and run failing browser tests in `tests/browser/save-recovery.spec.mjs` for every read/backup/canonical exception, invalid/partial/unsupported/unsafe state, unknown history, prior-good selection, explicit retained-character recovery, Retry/raw download/selectable text, unsaved indicators and no silent reset/overwrite.
- [ ] T123 [P] [US5] Write and run failing tests in `tests/integration/clipboard-conflict.spec.mjs` for clipboard resolve/reject/unavailable states, foreign canonical storage events and stale revision before commit; require autosave suspension, reload-or-export choice and no merging or false Copied/Saved claims.
- [ ] T124 [US5] Implement `assets/js/app/recovery-view.mjs` and integrate existing loader/menu/modal regions in `assets/js/main.js` after T122; preserve raw source/current memory, offer explicit prior-good/retained-character recovery, actionable errors, Retry/export and persistent visible unsaved status without introducing new screens.
- [ ] T125 [US5] Implement `assets/js/app/character-exchange-view.mjs` and `assets/js/app/storage-conflicts.mjs` after T123 and wire them into `assets/js/app/services.mjs`/`assets/js/main.js`; keep selectable/downloadable text on copy failure, announce success only after fulfilled promises, listen for foreign revisions, suspend autosave and require reload/export instead of silent overwrite.
- [ ] T126 [US5] Write and run failing tests in `tests/browser/recovery-accessibility.spec.mjs` for keyboard/touch confirmation, focus return, Escape cancel, error announcements, long hostile text and 200% reflow across recovery/import/export states.
- [ ] T127 [US5] Correct recovery/exchange controls and focus behavior in `assets/js/app/recovery-view.mjs`, `assets/js/app/character-exchange-view.mjs`, and `assets/css/style.css` after T126; reuse the foundation's `assets/js/app/dialogs.mjs` and keep sound optional.
- [ ] T128 [US5] Run legacy/new save/export, full adversarial corpus, repeated migration/entry/teardown and import-versus-resume acceptance with tests green; validate parsing budgets against supported legacy fixtures without truncation, review comments and record automated/manual evidence and source-byte preservation in `validation/cosmic-horror/us5.md` and `validation/cosmic-horror/manual.md`.

**Checkpoint**: Valid continuation/import retain expected values; unsafe/unsupported data and persistence failures preserve recovery paths. No completion claim relies on regeneration of enemy state, silent reset, fabricated saved timer phase or erased old keys.

## Phase 8: Polish and cross-cutting release qualification

**Entry**: All story implementations integrated. **Independent test**: Execute the full acceptance matrix against the final candidate and immutable baseline. Every required evidence row has an actual outcome.

- [ ] T129 Write and run failing cross-story tests in `tests/browser/full-journeys.spec.mjs` for new-character-to-reward-to-inventory, legacy combat-to-claim-to-save/reload, import-to-allocation/restart, art failure during recovery and final no-old-current-identity checks; include cross-view consistency and duplicated-action boundaries not already covered, and record affected paths/failures in `validation/cosmic-horror/integration-findings.md`.
- [ ] T130 Resolve integration findings in `assets/js/app/services.mjs` and the concrete classic/view paths identified by `validation/cosmic-horror/integration-findings.md` after T129; verify shared dialog/symbol/lifecycle ownership and refactor with all affected story suites green.
- [ ] T131 Finalize description, generated-art/retained-third-party credits and verified operator/developer commands in `README.md`, `specs/001-cosmic-horror-refactor/quickstart.md`, and `art/cosmic-horror/setting-guide.md`; review every modified function/comment and record constitution/legacy-debt disposition in `validation/cosmic-horror/review.md`.
- [ ] T132 Run `npm ci`, matching Playwright installs, unit/integration/browser suites, lint, format, art validation and `npm audit --audit-level=high` locally and in the pinned CI environment; record actual command outputs and `.mjs`/asset/font/audio loading in `validation/cosmic-horror/automated.json`, remediate failures through scoped red/green cycles, and keep build N/A while delivery is static.
- [ ] T133 Run `PERF_STAGE=candidate BASE_URL=http://127.0.0.1:4174 npm run test:performance` against the matching candidate root; store every sample and per-workload/cache/viewport median comparison in `validation/cosmic-horror/performance/candidate.json` and `validation/cosmic-horror/performance/comparison.json`, enforcing baseline + max(10%, 100 ms), unchanged stop conditions and verified warm caching; record findings or an explicit none in `validation/cosmic-horror/performance/findings.md`.
- [ ] T134 Resolve any timing/input-responsiveness findings listed in `validation/cosmic-horror/performance/findings.md` with behavioral regression tests where code changes, rerun affected matched comparisons and update `validation/cosmic-horror/performance/comparison.json`; never discard slow samples, substitute fallback timing or overwrite baseline evidence to pass.
- [ ] T135 [P] Complete actual native Chrome/Firefox/Safari desktop keyboard/pointer, modal/focus, contrast, 200% text, reduced-motion/mute and all critical journeys from `specs/001-cosmic-horror-refactor/validation-plan.md`; record concrete versions and separate results/evidence in `validation/cosmic-horror/native-desktop.md`, leaving unavailable targets BLOCKED.
- [ ] T136 [P] Complete physical Android Chrome/Firefox and iPhone/iPad Safari touch journeys, portrait/landscape, actual viewport, enlarged text and control responsiveness; record device/OS/browser builds and results in `validation/cosmic-horror/native-mobile.md`, without treating emulation as native qualification.
- [ ] T137 Reconcile every narrative/creature/relic/symbol/context review and native result into `validation/cosmic-horror/manual.md` and `art/cosmic-horror/manifest.json`; resolve findings, verify zero unmapped current identities and prohibited gore across the complete collection/text, and retain separate automated/manual ownership and statuses.
- [ ] T138 Verify configured required jobs in `.github/workflows/validate.yml` actually run on the final candidate and are enforced by repository merge protection; record job URLs/revision and enforcement evidence or a BLOCKED configuration gate in `validation/cosmic-horror/ci.md`.
- [ ] T139 Review all FR-001–015, QR-001–005, SC-001–008 and constitution evidence in `validation/cosmic-horror/gates.json`, run `npm run validate:evidence`, and record the final PASS/FAIL/BLOCKED result in `validation/cosmic-horror/release.md`; do not mark delivery accepted with missing manual/device/art/performance/required-check evidence or unresolved findings.

## Dependencies and execution order

```text
Phase 1
  -> 2A harness/baseline -> 2B characterization/geometry -> 2C setting/catalogs
       -> 2D safe state/storage/lifecycle -------+
       -> 2E art/evidence tools ----------------+-> 2G guarded bridge
       -> 2F performance baseline --------------+        |
                                                         +-> US1 narrative
                                                         +-> US2 encounters/art --+
                                                         +-> US3 relics/art ------+-> US4 collection join
                                                         +-> US4 independent art-+
                                                         +-> US5 compatibility (history also needs US1 3A)
All five completed stories -> Phase 8 integrated/native/performance/release gates
```

The diagram summarizes prerequisites; each package's explicit entry condition is authoritative. 2D, 2E and 2F have separate owned files and can progress independently once their own inputs exist. No baseline measurement may capture already replaced application assets or gameplay code. Run captures against the immutable revision, with pinned identical environments.

### Story dependencies and shared-file ownership

- US1, US2 and US3 depend only on Phase 2. US5 7B–7D also depend only on Phase 2; 7A additionally consumes US1 3A message templates. US5 never needs the completed US1 UI or replacement art. Fixture-based story tests use the shared catalogs and original or generated local art as appropriate; US2/US3 final story acceptance still requires their own generated art.
- US4 6A/6B can run after Phase 2, except that remaining-symbol generation T095–T097 also needs the accepted T082 icon pilot/batch. Favicons (T094), fallback (T098) and image-loader work remain independent of that pilot. 6C needs US3's shared symbol renderer (T088), not the whole inventory story. 6D needs the US2/US3 renderer/art outputs and joins the collection. Do not call US4 complete from standalone masters alone.
- Shared `assets/js/main.js`, `assets/js/player.js`, `assets/js/combat.js`, `assets/js/dungeon.js`, `assets/js/equipment.js`, `index.html`, `assets/css/style.css`, `art/cosmic-horror/manifest.json`, `art-inventory.md`, `tdd.md` and `manual.md` require sequential integration or separately prepared evidence fragments. `[P]` applies to distinct tests, asset batches and dedicated reports, not concurrent edits to those files.
- `setting-guide.md` and catalog IDs/names are shared contracts. Serialize the creature-pilot (T063) and icon-pilot (T082) guide edits; they refine their respective framing/prompts only. A later identity change must update consumers/tests/migration deliberately before dependent integration.
- All story focus behavior uses the shared `dialogs.mjs` from 2D; no temporary duplicate dialog implementation is required. Full automated merge/release checks remain required even when earlier work packages use only scoped tests.

### Within every behavioral work package

1. Load the named fixtures/contracts and verify its prerequisite evidence.
2. Run the task's new behavioral/regression assertion red for the intended reason.
3. Implement with function comments, verify green, refactor, and rerun affected legacy comparisons.
4. Record scoped automated results and separate manual status with exact paths.
5. Stop cleanly at the package exit if delivering this increment; leave dependent/unperformed tasks unchecked.

### Parallel execution examples per story

| Story | Ready parallel work                                                      | Required sequential join                                                                                               |
| ----- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| US1   | T047 + T048; later T054 + T055                                           | Catalog before view integration; shared HTML/CSS/classic edits serialized; T058 closes evidence                        |
| US2   | T059 + T060; after T063, creature batches T064–T075 own disjoint outputs | Pilot first; T076 merges batch records after all creature files pass                                                   |
| US3   | T079 + T080; after T082, T083–T086 own disjoint category icons           | Accepted small-icon pilot before remaining icons; T087 -> T088; item integration after its red tests; T092 merges once |
| US4   | T094 + T098; after T082, T095–T097; T099 + T100                          | Icon pilot before themed-symbol batches; T101 before consumers; 6D joins US2/US3 and shared manifest sequentially      |
| US5   | T110 + T111; T114 + T115; T118 + T119; T122 + T123                       | Each green depends on its red; snapshot/main/combat edits and final recovery acceptance serialized                     |

These are execution opportunities, not a requirement to use multiple agents. One implementer can complete the same packages sequentially.

## Requirement ownership

| Obligations                        | Primary task owners / evidence                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| FR-001/002/006/015; SC-001         | T020–T024, US1, T111/T113, T131, T137; setting guide, narrative suites, US1/history review                                            |
| FR-003/004; SC-003/004             | T015/T017, US2, T118–T121; full pools/RNG/numerics and encounter evidence                                                             |
| FR-005; SC-003/004                 | T016, US3; 84-fixture matrix, six slots, caps/rarity boundaries, duplicates/sales/retention                                           |
| FR-007/008/009/011; SC-002/003/007 | T013, T018/T019, T035–T037, US2/US3 generation, US4; per-file dimensions/provenance/contexts and individual reviews                   |
| FR-010; SC-008                     | T020, every generation batch, T058, T107/T108, T137; complete narrative and art boundary review                                       |
| FR-012/013; QR-003; SC-005         | T014, 2D/2G, US5, US4 image-failure work; safe completed snapshots, raw recovery, no replay, all import/reset cases                   |
| FR-014; QR-001/002; SC-006         | T019, US1/US3/US4/US5 scoped UI tests, T135/T136/T137; original layout, accessible actions, manual native checks                      |
| QR-004; SC-007                     | 2F, T133/T134; matched raw baseline/candidate timing and usable slow-image controls                                                   |
| QR-005; all SC outcomes            | T007, T038/T039, all story checkpoints, Phase 8; separate automated/manual evidence index and final gate                              |
| Constitution I/III/VI              | All red/green pairs and comment reviews, Phase 1, T046, T132, T138, T139; reproducible tools, clean install, CI and truthful blockers |

## Implementation strategy

**MVP first**: Complete Phase 1 and the lettered Phase 2 packages, then US1 for an internal narrative/playability review. It is intentionally not a release of the full feature: complete new art and old-save compatibility remain mandatory.

**Incremental delivery**: Treat each lettered package as one bounded assignment with the listed entry/exit. For art, each batch is a separate assignment with its own provenance and acceptance: the creature pilot has three illustrations, T082 qualifies one small icon before completing its three-icon batch, and favicon/fallback batches have their own listed outputs. Resume from task/evidence state; never regenerate completed baselines or falsely close unfinished checks. A package can be implementation-complete while its required native acceptance remains explicitly BLOCKED.

**Independent work after foundations**: Narrative, encounter, relic and compatibility modules/tests may proceed independently, and remaining-symbol/favicons can be produced while story integration continues. Use separate asset/evidence batch paths, then serialize shared code/manifest integration. No new feature, gameplay system, framework, backend, art service dependency, or global runtime change is implied.

**Qualification**: Run scoped checks at each package boundary. After all stories join, run the complete configured automated sequence, matched performance and required real native/manual reviews. Missing access is a recorded blocker, not a pass; release acceptance requires T139. Updating only this task document is documentation work and does not itself run or certify these future implementation checks.
