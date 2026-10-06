# Implementation Plan: Lovecraftian Cosmic Horror Refactor

**Branch**: `001-cosmic-horror-refactor` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)
**Input**: `specs/001-cosmic-horror-refactor/spec.md`
**Status**: Design and task generation complete; implementation and acceptance evidence OPEN.

## Summary

Transform the existing dungeon crawler into an original coastal cosmic-horror world while preserving its numerical gameplay, saved progress, screen organization, and art dimensions. Generate all 53 replacement monster illustrations, both exact-size favicon outputs, and 24 themed symbol roles. Apply the accepted horror boundary to art and narrative: mutations, exposed anatomy, and restrained blood are permitted; explicit mutilation and graphic gore are excluded.

Retain the static application and its existing game rules. Add native ES-module content, rendering, persistence, and lifecycle services behind a small explicit adapter in the classic application. Establish automated checks first, characterize preserved behavior, then implement each change through red–green–refactor. [Research](research.md) records the inspected code, decisions, alternatives, and primary sources.

## Technical Context

**Language/Version**: Browser JavaScript with standard ES modules for all new modules; existing classic scripts remain behind an explicit bridge. Toolchain target Node.js 24.21.0 LTS / npm 12.2.0. Local Node 20.20.2 / npm 10.8.2 are observed, not the selected implementation runtime.

**Primary Dependencies**: Retain Howler 2.2.3 and current audio assets. Proposed exact dev dependencies: `@playwright/test@1.63.0`, `@axe-core/playwright@4.13.0`, `eslint@10.12.0`, `@eslint/js@10.0.1`, `globals@17.13.0`, `prettier@3.9.9`, `http-server@14.1.1`, and `sharp@0.35.5`. They provide browser tests/accessibility, static checks, local serving, and deterministic image preparation; none ships in application JS. Built-in `node:test` supplies pure unit tests. Review dependency licenses, advisories, native components, and lifecycle scripts before installation approval/adoption as applicable to the execution environment; keep package/lockfile synchronized.

**Storage**: Browser localStorage, versioned complete local snapshot plus a prior-good snapshot; retain read-only legacy four-key source records for recovery. Legacy/new character-only Base64 imports remain supported. No backend or new save-data transmission. Exact shapes and failure/commit semantics: [data model](data-model.md), [persistence contract](contracts/persistence.md).

**Testing**: Node unit tests for catalogs, deterministic rules/adapters, save validation, encoding, and image packaging; Playwright integration tests for DOM/storage/audio boundaries and browser tests for journeys. Inject random tapes, fake clocks/timers, fake storage, and an audio adapter. Use captured legacy fixtures and ordered-pool snapshots. Network calls are controlled. Meaningful red tests precede foundational behavior too.

**Target Platform**: Static HTTP(S) application. Automated Chromium 153.0.8010.12/rev1243, Firefox 155.0/rev1543, and WebKit 26.6/rev2359 from Playwright 1.63.0 on macOS 26.6.2 arm64 and Linux CI. Native desktop Chrome 154.0.8037.98, Firefox 157.0, Safari 26.6.2 on macOS 26.6.2; Android 17 Chrome 154.0.8037.126 and Firefox 157.0; iOS/iPadOS 26.6.2 Safari 26.6 family. Required viewport fixtures: 360 × 800, 768 × 1024, 1440 × 900. Exact mobile engine/build and physical model must be recorded before implementation baseline capture; currently unavailable targets are BLOCKED, not inferred from emulation. [Validation plan](validation-plan.md) defines required combinations and inputs.

**Project Type**: Static browser application; no framework, backend, bundler, or production-build step introduced. Serve `.mjs` with JavaScript MIME types; file-URL launch is not a supported module-loading path.

**Performance Goals**: For initial playable entry and encounter-art readiness, each candidate median must be at most baseline median plus `max(10% of baseline median, 100 ms)`, using at least five matched samples per workload. Record cold starts and warm repeat encounters separately. Preserve input responsiveness during delayed/missing images. Workloads and measurement boundaries are fixed in the validation plan before implementation.

**Constraints**: WCAG 2.2 AA for changed journeys, semantic controls, visible focus, keyboard/touch operation, text equivalents, color-independent rarity/danger, 200% text and reduced-motion support. Exact raster sizes plus measured symbol footprints; no container resizing solely for new art. Untrusted saves/logs never become executable markup, image URLs, or arbitrary CSS. Core gameplay survives external font/analytics and art-load failure. Original art provenance and manual review are required.

**Scale/Scope**: One local player; 51 encounter identities, 52 referenced sprite variants plus one unused required sprite; 14 equipment categories, six rarities, six equipped slots; 24 symbol roles; two favicon files. Inventory/backlog have no new gameplay cap. Boundary parsing has explicit resource safeguards with recoverable errors. All affected event, combat, inventory, level-up, reset, import, and continuation paths are in scope.

**Verification Commands**: [Quickstart](quickstart.md) defines exact proposed install, unit/integration/browser, lint, format, art, audit, and performance commands. At planning time `package.json` has no scripts; these are implementation deliverables, not presently runnable checks. Production build: N/A. Static asset loading and browser smoke remain required.

## Constitution Check

Pre-research review and post-design review use constitution v1.0.0. PASS here means the design schedules and specifies compliance; no row certifies an unperformed runtime check.

| Gate                  | Pre-research | Post-design | Evidence / implementation owner                                                                                                                                                                                                                                     |
| --------------------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I — TDD               | PASS         | PASS        | Tooling and deterministic harness first; characterization before legacy edits; failing boundary/UI tests before services and integration; refactor with green tests. Implementation owner for every work package records red/green commands in validation evidence. |
| II — Modularity       | PASS         | PASS        | Existing numerical rules and runtime object ownership retained; new pure catalogs and adapters separated from DOM/storage/audio; one documented `gameServices` bridge; no framework or new runtime dependency.                                                      |
| III — Comments        | PASS         | PASS        | Every new/modified function, method, callback, and arrow function receives an adjacent purpose comment; public/non-obvious contracts use JSDoc. Code author and reviewer check comments together with code.                                                         |
| IV — Data safety      | PASS         | PASS        | Candidate validation, single-key snapshots, prior-good and raw recovery, strict catalog resolution, structured logs, safe text rendering, adversarial fixtures; persistence work owns transaction/failure tests.                                                    |
| V — Browser usability | PASS         | PASS        | Declared engine/native matrix, viewport/text-scale fixtures, manual keyboard/focus/visual checks and recovery journeys. Missing native targets remain BLOCKED in execution evidence.                                                                                |
| VI — Delivery         | PASS         | PASS        | Runtime/tool pins, synchronized lockfile, clean npm ci, CI lint/format/unit/integration/browser/art gates, audit review, lifecycle cleanup tests and matched performance measurements. Build N/A for static delivery.                                               |
| Governance            | PASS         | PASS        | Tooling gaps and touched legacy debt scheduled before dependent behavior; no waiver or exception. Required manual release gates remain open until recorded.                                                                                                         |

Known debt addressed within scope: eager unguarded storage reads; weak import validation; untrusted values interpolated into HTML; clickable non-controls and suppressed focus; image/glyph spacing; combat-load event-flag ordering; untracked/stale timers and repeated audio initialization; saves issued midway through attacks/rewards. Commit only completed transitions and make default validation pure. Unrelated balance and architectural changes remain outside scope. CI configuration is required; if repository branch protection cannot be configured, its required-check enforcement remains BLOCKED before merge rather than being called complete.

## Project Structure

### Documentation (this feature)

```text
specs/001-cosmic-horror-refactor/
├── spec.md                       # Existing; includes accepted clarification
├── art-inventory.md              # Existing original dimensions and role baseline
├── plan.md                       # This implementation design
├── research.md                   # Decisions, evidence, alternatives
├── data-model.md                 # Catalog, progress, messages, manifest models
├── quickstart.md                 # Tooling bootstrap and future runnable checks
├── validation-plan.md            # Workloads, matrices, evidence and gates
├── contracts/
│   ├── content-and-art.md        # Catalog, manifest and delivery interfaces
│   ├── persistence.md            # Save/export/import/recovery contract
│   └── player-experience.md      # UI, accessibility and error-state contract
└── tasks.md                      # Existing dependency-ordered implementation backlog
```

### Source Code (repository root)

```text
index.html                        # Existing; retain screen layout; fix scoped semantics
assets/
├── js/
│   ├── main.js, player.js, ...    # Existing classic rules/UI, changed only as needed
│   ├── howler.min.js              # Existing vendor, excluded from owned-source lint
│   ├── app/                      # New .mjs services, persistence, lifecycle, views
│   └── content/                  # New .mjs setting, encounters, relics, messages, symbols
├── css/style.css                 # Existing; themed symbols, focus/reflow/reduced motion
├── sprites/                      # Existing 53 paths replaced with exact-size new art
├── icon/                         # Existing two favicon outputs replaced
└── art/                          # New themed symbol images and shared fallback
art/cosmic-horror/                # New generation sources/provenance, not runtime requests
├── setting-guide.md
├── manifest.json
├── baseline.json                 # Hashes, dimensions, browser glyph measurements
├── prompts/
├── masters/
└── review/                       # Actual-size captures and individual findings
scripts/                         # New tested dev tools: prepare/validate art, evidence checks
tests/                           # New directory
├── unit/                        # node:test .test.mjs
├── integration/                 # Playwright .spec.mjs
├── browser/                     # Journey, accessibility and geometry .spec.mjs
├── performance/                 # Matched workload .spec.mjs
├── fixtures/legacy/             # Synthetic baseline saves, exports, expected transitions
└── helpers/                     # RNG/clock/storage/audio and legacy harness
validation/cosmic-horror/        # New actual execution evidence, manual workbook, gate index
playwright.config.mjs            # Proposed engine projects and static-server lifecycle
eslint.config.mjs                # Proposed explicit classic/module/tooling scopes
.prettierrc.json, .prettierignore # Proposed owned-source formatting policy
.nvmrc, .npmrc                   # Proposed exact runtime/install policy
.github/workflows/validate.yml  # Proposed clean-install and automated required gates
```

**Structure Decision**: Keep all current runtime asset paths where practical, so existing 50%/70% portrait framing and legacy image references remain stable. New art catalogs map those paths to new visible identities. Use `.mjs` for new modules/tools/tests so the package need not globally reinterpret old `.js` scripts. Generated masters are provenance, not hidden substitutes for shipped assets. The legacy baseline is the recorded Git revision plus hashed fixtures; tests never download a remote baseline.

## Design and integration sequence

### Phase 0 — Research (completed by this command)

Inspect saves, rule/selection dependencies, art and font contexts, browser/tool availability, and official tool contracts. [Research](research.md) resolves the technical questions; observed execution gaps have explicit owners and gates.

### Phase 1 — Design and contracts (completed by this command)

Define the [data model](data-model.md), three [contracts](contracts/content-and-art.md), [quickstart](quickstart.md), and [validation plan](validation-plan.md). Update only the Spec Kit block in root `AGENTS.md`. The installed `update-agent-context.sh` script is absent; update the block directly as the skill's Phase 1 instructions prescribe. Recheck every constitution gate after these artifacts agree.

### Phase 2 — Task-generation handoff (complete)

The dependency-ordered [tasks](tasks.md) now assign these work packages, function documentation, and evidence ownership. Begin implementation with the Phase 1 setup tasks, then follow each package's entry/exit gates. P1/P2 story labels sequence work; US5 compatibility is still mandatory for release. Design/task completion does not certify implementation or acceptance.

| Package             | Required ordering and outputs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Coverage                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Foundation          | Pin runtime/tools; implement repeatable scripts and CI; establish deterministic helpers with failing behavior tests, then green implementation; capture immutable source/save/pool/asset baselines and browser target metadata before application edits.                                                                                                                                                                                                                                                                                                                                            | Constitution I/III/VI, all later comparisons |
| Characterization    | Capture existing generation, battle, rarity/equipment, reset/retention, random-call order, and timing behavior. Add regression tests exposing storage/XSS/boot/timer defects. Record fixture expectations before refactoring.                                                                                                                                                                                                                                                                                                                                                                       | FR-004/005/012, SC-004/005                   |
| Content design      | Author original setting/terminology guide and exhaustive mapping for 51 encounters, both alternate illustrations, unused art, 14 relic categories, 24 symbols, and all event/message templates. Enforce the accepted content boundary.                                                                                                                                                                                                                                                                                                                                                              | FR-001/002/003/005/006/010/015, SC-001/008   |
| Boundary foundation | Red tests for catalog validation, encoding, stable-transition commit failures, exact variant migration, safe messages, gated eager listeners/boot order, cleanup, and no-extra-RNG; implement ES services/bridge; fix scoped defects; refactor green.                                                                                                                                                                                                                                                                                                                                               | FR-006/012/013, QR-003, US5                  |
| Art production      | Measure legacy glyph contexts; generate original transparent masters in batches; prepare exact outputs; test packer/validator with wrong-size, corrupt, opaque and missing fixtures first; complete per-file provenance and visual review. Qualify the small/tall/boss creature pilot in T062–T063 before remaining creatures, and the small-icon pilot in T082 before remaining relic/themed-symbol batches T083–T086 and T095–T097. Refine each pilot's prompt/framing guidance without making the creature and icon tracks depend on one another; favicons and fallback retain separate reviews. | FR-007–011, SC-002/003/008                   |
| Journey integration | Add failing end-to-end expectations then re-theme entry/events/combat/loot/menus/credits, route safe rendering, scoped semantic/focus/reduced-motion fixes, and missing-image recovery. Preserve formulas and frame sizes.                                                                                                                                                                                                                                                                                                                                                                          | US1–US4, FR-014/015, QR-001/002              |
| Qualification       | Run all automated checks and before/after performance; complete native browser/touch/keyboard and every-asset actual-size review. Resolve findings; record blockers honestly; update README, manifest, manual workbook and gate index.                                                                                                                                                                                                                                                                                                                                                              | QR-004/005, SC-001–008                       |

Content catalog authoring and master generation may proceed independently after their baseline/contract prerequisites; integrating art, migration, and acceptance depends on the shared IDs and validated services. Each acceptance obligation must have a concrete task owner in `tasks.md`, including unused art, both favicons, historical logs, unsafe saves, and native devices.

## Complexity Tracking

No constitution violations or exceptions. The single explicit legacy bridge avoids a broad conversion and is covered by characterization and initialization tests. Versioned local snapshots are justified by four-key consistency failures; no database or server is added.
