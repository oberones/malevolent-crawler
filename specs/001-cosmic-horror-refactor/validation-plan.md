# Validation Plan: Cosmic Horror Refactor

> **Maintenance scope update — 2026-10-08:** The maintainer retired one-time legacy
> art comparisons, generation tooling and their CI obligations. References below
> to masters, screenshots, the old art baseline and art validators describe the
> completed feature workflow, not current checkout requirements. The retained
> delivery manifest uses schema version 2 (provenance and approval only).
> Gameplay/save regression tests and non-art qualification remain required.
> See [review cleanup](../../validation/cosmic-horror/review-cleanup.md).

## Evidence rules and baseline

Implementation produces `validation/cosmic-horror/` with `environment.json`, `tdd.md`, automated reports, performance raw samples/comparison, `manual.md`, and `gates.json`. Art-specific evidence lives in `art/cosmic-horror/review/` and is linked from the manifest/gate index. Every record names its fixture/workload, source revision, browser/device, command or manual steps, expected/actual outcome, evidence file, date, and owner/reviewer.

Use PASS/FAIL/BLOCKED/OPEN/N/A accurately. N/A requires a reason. A missing native target is BLOCKED; a planned check is OPEN. Automated success does not fill a manual checkbox. Design gate PASS in [plan.md](plan.md) is not product acceptance.

Before changing application behavior or assets, capture the baseline at Git revision `3cfaf54babae978c7388c023f5df5ebe6282259b` and hash every owned source/asset used. Baseline fixture construction reads this local revision, not a network checkout. Save synthetic representative states and expected outcomes in `tests/fixtures/legacy/`; record ordered pools and random tapes, including discarded calls. Keep baseline captures immutable. A harness must first demonstrate it runs the legacy code correctly before its observations are accepted as a comparison oracle.

## Phase 1 observed environment (2026-10-06)

[environment.json](../../validation/cosmic-horror/environment.json) records macOS 26.6.2 build 25G83, Mac14,9 / M2 Pro / 16 GiB, selected nvm Node 24.21.0/npm 12.2.0, and matching installed engine versions/revisions (Chromium 153.0.8010.12/1243, Firefox 155.0/1543, WebKit 26.6/2359). No pin drift was found. The setup smoke matrix ran at 360×800, 768×1024 and 1440×900 with emulated DPR 1, keyboard/pointer, and Chromium/WebKit tap activation; it is not a glyph/gameplay baseline or native qualification.

Native Firefox 157.0 build 15726.9.24 and Safari 26.6.2 build 21624.5.1.11.3 are installed but untested; native DPR/input/viewport remain unmeasured. Native Chrome and physical Android/iPhone/iPad access remain BLOCKED. Planned native versions/models below remain targets until measured; never infer them from Playwright. Missing-target baseline rows must remain BLOCKED in T019 and be captured on the same eventual environment as candidate rows.

The CI image digest was resolved and pinned; actual Ubuntu runner execution/OS metadata remains OPEN. [Phase 1 results](../../validation/cosmic-horror/phase-1.md) and the [manual workbook](../../validation/cosmic-horror/manual.md) separate these setup results from all release obligations.

## Phase 8 observed native update (2026-10-08)

Native Firefox is now 157.0.1 build 15726.10.5; Safari remains 26.6.2 build
21624.5.1.11.3 on macOS 26.6.2 (25G83). The
[native desktop record](../../validation/cosmic-horror/native-desktop.md) describes
bounded direct UI checks and their limits. Chrome and physical mobile access
remain unavailable. These observations do not replace historical baseline
measurements or qualify unspecified viewport/DPR tuples.

## Test design and red–green sequence

| Suite                   | Required assertions and failure cases                                                                                                                                                                                              | Red step / green evidence                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Harness/unit foundation | Controlled clocks/RNG/storage/audio; fresh state per case; teardown isolation; catalog validators reject unknown/duplicate references                                                                                              | Write expected harness/boundary behavior, observe intended failure, implement helper/service, rerun                                      |
| Legacy characterization | Ordered enemy pools/archetypes/conditions; exact RNG consumption, including Skeleton Mage/mimic draws; combat formulas; level-up/three choices/two rerolls; category/rarity rolls; level/tier caps; sale/stat/retention rules      | Capture passing legacy expectations before restructuring; changed theme/failure behavior needs separate failing tests                    |
| Catalog/presentation    | 51 identities/52 active variants/unused art; 14 categories/24 roles; new names and alt text agree; no exposed legacy world identity on defined surfaces                                                                            | New catalog/UI expectation fails on legacy theme, passes after mapping; no extra random calls                                            |
| Save/import             | All supported historical shapes, encoded inventory/object equipped distinction, both variants, fractional EXP, supported nulls/optional fields; idempotent migration; exact reset/retention; cancel read-only                      | Failing legacy recovery/validation tests, then passing boundary + browser integration                                                    |
| Adversarial boundary    | Each read/write exception, partial tuple, corrupt/unsupported version, unknown identities, HTML/path/CSS/prototype payloads, oversized/deep data, stale-tab write, clipboard rejection                                             | Failure preserves raw/current state; safe DOM/text; no unhandled error/false Saved/blank loader                                          |
| Combat/lifecycle        | Initial-load flag ordering, gated eager listeners, no guardian re-advance, no repeated rewards, stable-transition saves, one timer set, stale attacks cancelled, old image completion ignored, repeated audio init disposed/reused | Regression fails on observed defect, passes after scoped repair with the same numerical outcomes                                         |
| Image tooling           | Wrong dimensions, truncated/corrupt decode, missing alpha/blank/opaque art, wrong ICO count/size/payload, missing/duplicate mapping/provenance, unsafe path                                                                        | Negative fixtures fail for intended reason; correct independently constructed fixtures pass; generated collection subsequently validates |
| Browser journeys        | New character, all events, enemies/variants, categories/rarities, inventory/claim/sale/full loadout, level-up/reset, continue/import/recovery                                                                                      | Deterministic UI fixtures prove actual actions and resulting state; no arbitrary sleeps or screenshot-only acceptance                    |
| Accessibility/geometry  | axe + semantic labels/focus; keyboard/manual checks; 100%/200% text; reduced motion/mute; identical glyph footprints and reserved portrait size                                                                                    | Scoped failures are corrected; complete required native/manual checks separately                                                         |

The unit legacy harness can evaluate captured classic functions in an isolated `node:vm` context with explicit stubs. It is for trusted repository code only, never imported save content. Prefer pure dependency-injected services for new code. Real DOM/storage/audio integration uses Playwright rather than a second emulated-DOM dependency. Tests distinguish intended fixes from protected balance behavior.

Record each red result and reason, green command/result, and refactor check in `tdd.md`. Include concise purpose comments for all new/modified functions/callbacks and JSDoc where contracts warrant it. No coverage percentage, snapshot count, or syntax failure substitutes for meaningful acceptance.

## Browser and device matrix

Tooling research verified published engine/target versions and observed only the listed local apps. These are pinned planning targets, not executed tests. Before implementation baselines, record actual OS build, hardware model, exact browser/engine build, DPR, viewport, inputs, and font policy in `environment.json`. If a target has updated, revise this matrix and capture both baseline and candidate on the same replacement version; never mix versions in a comparison.

| Target              | Planned environment                                        | Input / coverage                                                                                                 | Current evidence state                 |
| ------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Playwright Chromium | 1.63.0: Chromium 153.0.8010.12, revision 1243              | All three viewports, keyboard/pointer; touch emulation where supported                                           | OPEN; matching engine install required |
| Playwright Firefox  | 1.63.0: Firefox 155.0, revision 1543                       | All three viewports, keyboard/pointer; no claim of Android-device qualification                                  | OPEN                                   |
| Playwright WebKit   | 1.63.0: WebKit 26.6, revision 2359 on macOS 26.6.2         | All three viewports; keyboard/pointer and touch emulation                                                        | OPEN; not branded Safari               |
| Native Chrome       | 154.0.8037.98 on macOS 26.6.2 arm64                        | Keyboard/pointer, responsive viewport checks                                                                     | BLOCKED: app not observed locally      |
| Native Firefox      | 157.0 on macOS 26.6.2 arm64                                | Keyboard/pointer, responsive viewport checks                                                                     | OPEN: app observed, no execution       |
| Native Safari       | 26.6.2 on macOS 26.6.2 arm64                               | Keyboard/pointer, responsive viewport checks                                                                     | OPEN: app observed, no execution       |
| Android Chrome      | 154.0.8037.126 on Android 17; reference Pixel 8            | Physical touch, actual viewport, portrait/landscape critical journeys                                            | BLOCKED: device not observed           |
| Android Firefox     | 157.0 on Android 17; same reference Pixel 8                | Physical touch, actual viewport, critical journeys                                                               | BLOCKED: device not observed           |
| iPhone Safari       | Safari 26.6 family on iOS 26.6.2; reference iPhone 15      | Physical touch, actual viewport, critical journeys; exact engine/build captured on device before baseline        | BLOCKED: device/build unavailable      |
| iPad Safari         | Safari 26.6 family on iPadOS 26.6.2; reference iPad Air M2 | Physical touch, actual viewport, tablet critical journeys; exact engine/build captured on device before baseline | BLOCKED: device/build unavailable      |

Reference physical models may be replaced with available supported devices by recording the concrete replacement in this plan before implementation baseline capture. Do not infer mobile Safari's exact build from the desktop Safari version. Required responsive fixtures remain exactly 360 × 800, 768 × 1024, and 1440 × 900; a physical device additionally uses its real CSS viewport.

Run automated suites locally on recorded macOS 26.6.2 arm64 and in CI on Ubuntu 24.04 using the version-matched `mcr.microsoft.com/playwright:v1.63.0-noble` image, recording its resolved digest before baseline/CI qualification. Select the pinned Node/npm within that environment rather than assuming its bundled runtime. The [official Docker guide](https://playwright.dev/docs/docker) documents this versioned image. Do not reuse older cached engine revisions as qualification. Native branded browsers remain separate from Playwright's patched engines.

## Deterministic fixture coverage

- New/unallocated and progressed/resting players, optional historical fields, six equipped items plus duplicate inventory items.
- Every enemy pool member across its existing archetypes/conditions, both illustration branches, chest and door mimics, guardian and special boss. Test exact selected identity, numerics, reward and random-tape position.
- All 14 category × six rarity combinations via controlled fixtures, plus roll-boundary tests for 70/20/4/3/2/1 percent rarity probabilities. Preserve level 100/tier 10 caps and six-slot capacity.
- Every exploration type, event choice and reset path; maximum/boundary values; repeated claim/equip/sell. Compare numeric state separately from presentation text.
- Active saved encounters with no enemy regeneration, room change or reward replay; valid inactive victory/death snapshots and interruptions at old mid-attack/mid-reward save sites retain the last completed committed outcome. Saved timer phase is not asserted because legacy saves do not contain it.
- Legacy/new character import and export, Unicode names, cancellation, supported defaulting, malformed/unknown/injected/oversized content, interrupted snapshots, quota/denied storage and copy failure.
- Slow, missing and corrupt image requests; module-load failure; blocked external analytics/fonts; audio muted/unavailable. Restore a working journey or actionable recovery, not merely absence of an exception.

## Performance procedure

The foundation task owns repeatable harnesses and baseline evidence before integration. Use a single idle worker, the same physical Mac/browser executable and viewport 1440 × 900 for the repeatable primary comparison; run a matching 360 × 800 Chromium workload as a separate viewport comparison. Physical mobile critical journeys must additionally remain responsive, but no invented desktop/mobile timing equivalence is claimed.

1. Serve baseline and candidate sequentially from immutable, revision-labelled roots using the same pinned http-server and cache policy. Fix the synthetic player/encounter data, RNG tape, font availability, mute state, OS power mode, and network conditions. For this performance harness only, apply the same recorded served-fixture transform to both index files: remove the external analytics script/inline tag and disable the external title-font link, using the same declared local fallback font. Hash the transform and both original/transformed index files; do not change gameplay code. This controls external resources without request interception or a shipped runtime change. Record CPU/RAM/OS/browser build, server flags, asset sizes and test revision.
2. Use localhost without CPU/network throttling for the primary reproducible budget; record this explicitly. Do not call `page.route`, `context.route`, or HAR routing in ordinary performance runs: routing disables HTTP cache. Keep browser caching enabled and record actual memory/disk-cache or server-request evidence for warm samples. Test delayed-image responsiveness separately with controlled intercepted responses. Do not mix throttled and unthrottled samples.
3. **Cold first visit**: fresh browser context/cache/storage for each sample; from navigation start to the first usable character-creation controls, using the same detection in both versions. Record DOM/paint and actual usable-control boundary. Existing loader time counts.
4. **Cold returning player**: fresh cache/context, inject the same valid resting legacy fixture before navigation; measure navigation-to-usable title and, separately, title activation-to-usable dungeon controls. Include save migration/persistence where applicable.
5. **Encounter art**: from the existing encounter-trigger action to the committed correct-identity portrait's successful decode and render while combat controls are usable. Fix the existing normal/special-boss/variant/mimic generation tape; measure largest sprite (`spider_dragon.png`) and each variant branch as individual workloads. A fallback cannot count as successful art readiness in the normal-load performance comparison.
6. **Warm repeats**: retain browser cache, reset only synthetic runtime state, repeat the same encounter at least five times. Capture cold encounters separately with fresh contexts. Exercise inventory with a full loadout and representative long names for responsiveness/layout diagnostics, not as a substitute for the two required timing metrics.
7. Capture at least five valid samples for each revision/workload/cache class. Report every raw sample, median, threshold `baseline + max(baseline * 0.10, 100 ms)`, delta and pass/fail. Do not silently discard slow samples. Invalid harness runs are separately logged with reasons and repeated for both sides as necessary.
8. Fail on a budget overrun; remediate and rerun only affected comparisons. Required waiver would follow constitution governance and remains a waiver, never a passing measurement.

Use Playwright's clock only for deterministic gameplay assertions, not the elapsed wall-clock performance measurement. An external performance harness waits on the same DOM/action/decoded-image conditions in both versions; do not add a faster candidate-only stop marker. Collect loading errors and ensure the expected image actually decoded.

## Manual workbook and art qualification

Implementation creates a checkbox-driven workbook with one record per required journey/browser and each art/context review. Each record includes requirement IDs, fixture/asset, environment, steps, expected result, actual result, status, evidence path, reviewer/date and findings. Required review items include:

- Keyboard through title, allocation, explore/pause, inventory/details/equip/sell, level-up, menu, import/confirmation/recovery; correct visible focus, modal focus return and cancellation.
- Touch on the physical mobile/tablet matrix; no unavailable action, occluded control or accidental double action.
- Text/essential-symbol/focus contrast, 200% text and reflow, reduced motion and muted audio; no essential color/audio-only information.
- Every replacement's originality, shared direction, distinct identity, alpha edges, framing and readability at real display sizes and all declared viewport contexts. Review the unused sprite and favicon outputs too.
- Every new narrative surface and illustration against the accepted horror boundary. Zero explicit mutilation or graphic gore; mutation, exposed anatomy and restrained blood remain permitted.
- Correct old-save local continuation and character-import reset distinction, visible save/copy failure and recoverability.

Screenshots accompany but do not replace interaction review. Automated alpha, pixel size and hash checks do not prove art quality. Final status is PASS only when every required finding is resolved; unavailable work stays OPEN/BLOCKED.

## Requirement-to-evidence mapping

| Requirements / outcomes            | Mandatory evidence                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-001/002/006/015; SC-001         | Setting/copy catalog coverage, UI journey checks, legacy-log translation, manual terminology/credits review                                      |
| FR-003/004; SC-003/004             | 51-identity/52-variant matrix, ordered pools/RNG/numerical characterization, combat/encounter review                                             |
| FR-005; SC-003/004                 | 14 × six loot matrix, rule-boundary tests, six-slot/full/duplicate item and sale operations                                                      |
| FR-007/008/009/011; SC-002/003/007 | 53 sprites + two favicons + 24 role obligations; decoded sizes/alpha/ICO; per-context glyph geometry; complete provenance and manual art records |
| FR-010; SC-008                     | Whole-collection and full-narrative manual horror-boundary review                                                                                |
| FR-012/013; QR-003; SC-005         | Old/new save/export fixtures, transaction failures, adversarial input, recovery, exact reset/retention, no reward replay                         |
| FR-014; QR-001/002; SC-006         | Existing screen/layout comparison, automated accessibility and declared engine/native keyboard/touch/reflow acceptance                           |
| QR-004; SC-007                     | Matched baseline/candidate raw timing reports and threshold calculations                                                                         |
| QR-005; SC-001–008                 | Separate automated/manual gate index with command/environment/evidence links and no unperformed check marked passed                              |
| Constitution I/III/VI              | Red/green records, function-comment review, lockfile/dependency audit, clean install/CI reports, lifecycle cleanup tests                         |

## Merge and release gate

All required automated commands in [quickstart](quickstart.md) must pass in the pinned environment. Required CI jobs must be enforced for merging. The release gate additionally requires every declared native/manual/art case, complete manifest, performance pass, recovery evidence, and all findings resolved. If branch-protection configuration or any browser/device/art review is unavailable, record BLOCKED and do not declare release acceptance. Build is N/A only while delivery remains the chosen static application.
