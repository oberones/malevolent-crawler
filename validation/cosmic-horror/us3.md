# US3 — Phase 5C item presentation

Date: 2026-10-07. Scope: T087–T093; automated development and agent review,
not native-device or maintainer artwork acceptance.

## Implementation

`symbol-view.mjs` resolves only catalog role/context pairs, overlays the delivered
image on a hidden local RPGAwesome metric strut, and resets image margins. The
strut preserves each engine's original fractional line-box rounding and baseline;
there is no visible legacy glyph. Equipped spacing remains 0.4rem on both sides;
other relic contexts retain the original 0.3rem trailing spacing. Repeated art is
decorative beside text or a fully named button. Runtime image-failure integration
remains T099–T104. Remaining non-relic glyph metrics are qualified in T102–T103.

`item-view.mjs` renders validated holdings with text nodes and catalog artwork.
Inventory rows are native buttons. Equipped controls retain their original icon
footprint and expose full accessible names. Details show category, rarity,
level/tier, complete statistics and exact sale proceeds. The existing modal bridge
continues to use `dialogs.mjs` for focus, Escape, inert backgrounds and focus return.
Six-slot refusal has visible status text. Item and bulk confirmations retain the
render revision and collection/index binding; stale and repeated callbacks cannot
sell another holding or pay twice. Existing encoded inventory strings, equipped
objects, ordering, rarity filters and numerical rules remain authoritative.

## Measurement correction

Two frozen WebKit 360px/200% combat-reward measurements (Dagger and Flail) had a
baseline offset of 31.692138671875px. Replaying the untouched legacy source showed
that adding the probe reflows the centered panel after the helper's first box
read. Reading both coordinates from the settled layout yields 29.989013671875px.
The regression fails before the helper repair and passes afterward. Original
baseline bytes and captures remain unchanged. The separate
[correction record](../../art/cosmic-horror/review/relic-baseline-corrections.json)
identifies only those tuples and links the original-source reproduction.
Candidate tests also compare against an independently rendered original glyph.
This is a measurement repair, not a tolerance increase or candidate-based baseline.

## Verification and boundaries

Phase 5C (T087–T093) is implementation-complete for the automated environment.
The full-collection art/evidence validators remain release gates, including native
baselines and later symbol/fallback assets; they are not replaced by this package.
Repository setup was verified: existing Git, ESLint and Prettier ignores cover
configured outputs/dependencies; the package is private and no publishing ignore
or production build is required. No dependency or lockfile changed.

The broad browser/integration run completed **480 passes and three failures**;
all three were the new sale dialog's accidental `gold` wording instead of the
shared `Quay Marks`. The wording was repaired from the setting catalog and is
included in the final focused rerun. This broad run is not reported as all green.
Additional empty/filter action availability and enlarged-inventory findings were
handled with focused regressions. The initial capture attempt lacked combat-panel
setup; capture-02 also experienced a concurrent runner's report-directory cleanup.
Those diagnostic outputs remain retained. Only the final indexed captures count
as acceptance evidence. No infrastructure/setup failure is presented as TDD red.

## Final results

Selected runtime: Node 24.21.0 / npm 12.2.0; branch
`001-cosmic-horror-refactor`. All commands ran from the repository root using the
pinned runtime. No native performance or physical-device claim is made.

| Check                                                                                                    | Result                                                                                                                                                             | Evidence                                                                                   |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `npm run test:unit`                                                                                      | PASS, 2,452 tests; all ordered rules/RNG and item-boundary comparisons                                                                                             | [unit output](reports/phase-5c-unit-post-manifest.txt)                                     |
| `npx playwright test tests/browser/relic-accessibility.spec.mjs --workers=3`                             | PASS, 33 checks in all three engines; keyboard, cancel/focus return, rarity labels, long values, 200% text, empty/filter state, bulk staleness and WCAG automation | [accessibility output](reports/phase-5c-accessibility-final-02.txt)                        |
| Final context, relic, narrative, navigation, symbol and measurement regression selection (`--workers=3`) | PASS, 108 checks; all 84 category/rarity fixtures and 1,512 decoded live art contexts                                                                              | [capture/regression output](reports/phase-5c-final-capture-and-regression.txt)             |
| Shipped relic PNG/master/prompt verification                                                             | PASS, 14 complete matching records; transparent 128 × 128 PNGs                                                                                                     | [file checks](reports/phase-5c-art-files.json)                                             |
| Repository lint and formatting                                                                           | PASS; repository-wide checks                                                                                                                                       | [lint](reports/phase-5c-lint-complete.txt), [format](reports/phase-5c-format-complete.txt) |
| Native devices, human keyboard/art approval, performance, CI/release                                     | OPEN/BLOCKED, not executed by this package                                                                                                                         | [manual workbook](manual.md)                                                               |
| Full `validate:art` / `validate:evidence`                                                                | FAIL as incomplete release gates; no waiver                                                                                                                        | [art](reports/phase-5c-art-full.txt), [evidence](reports/phase-5c-evidence-full.txt)       |

Final context evidence is exclusively written under
`art/cosmic-horror/review/relic-contexts-04/`. Every role has six context types ×
three engines × three viewports × two text scales. Screenshot hashes and actual
coordinates remain recorded. Glyph-relative size, spacing and baseline checks
pass. Literal old page x/y coordinates differ where theme text, accessible targets
and scrolling change layout; the common validator's full-coordinate gate remains
OPEN for US4, alongside missing native measurements. Manifest context `status`
therefore stays OPEN while its narrower `footprintStatus` is PASS. This package
makes no assertion that the full art validator passes.

Self-review covered purpose comments, safe text/catalog paths, no added runtime
randomness/dependencies, duplicate identity and single-use callbacks, unchanged
item representation/formulas, meaningful labels, existing container dimensions,
and honest separation of automated and manual evidence. A single render now
refreshes both item collections, avoiding duplicate list work during stat updates.

The next bounded implementation package is **Phase 6A, T094–T098** (favicons,
remaining ten symbols, fallback). No next-package work, commits or pushes were
performed. The optional `/speckit.git.commit` hook remains unrun.
