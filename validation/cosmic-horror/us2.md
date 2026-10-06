# US2 — Encounter collection integration and qualification

**Acceptance update — 2026-10-07:** [Direct maintainer approval](art-approval-2026-10-07.md) marks human visual acceptance PASS for all 53 delivered creature artworks and related visual criteria. Native execution remains separate. The implementation/capture-time record below is preserved; its human-artwork OPEN statements are superseded by this approval.

Date: 2026-10-07. Owner/reviewer: implementation agent. Package: T076–T078.
**Implementation/automated qualification PASS. Human/native story acceptance and
release qualification remain OPEN/BLOCKED.**

## Delivered

T076 integrates all 53 creature records from 13 completed batches into
[manifest.json](../../art/cosmic-horror/manifest.json) and adds the complete
[replacement mapping](../../specs/001-cosmic-horror-refactor/art-inventory.md).
Each exact runtime path occurs once; outputs and masters decode with alpha and
visible/transparent content, dimensions match immutable originals, and delivered
hashes differ from originals. Catalog aliases/IDs and the unused sprite exclusion
remain exact. Both Sounding Vessel variants retain independent source/master
provenance. Full batch metadata, including rejected/edited source records where
present, is retained. No artwork or immutable baseline was regenerated.

Generation times unavailable from the tool remain null. The validator now accepts
only an explicitly recorded `not-returned-by-tool` reason with null returned
`generatedAt`; absent/malformed/inconsistent dates still fail. File modification
times remain separately labeled. Prompt/master hashes and actual source
references remain required. Human visual approval is not inferred from an agent
batch review: every creature's human `review` remains OPEN.

T077 adds actual decoded-image qualification to the existing missing-byte tests.
All 52 active variants pass 18 combinations: pinned Chromium/Firefox/WebKit,
360 × 800 / 768 × 1024 / 1440 × 900, and 100%/200% root text at DPR 1.
Checks cover correct image/alt/name, original 50%/70% framing, intrinsic dimensions,
aspect ratio, no portrait overlap, label wrapping, unchanged selected state,
zero presentation draws, and pointer/focus access to a synthetic Claim control.
[Individual visual review](../../art/cosmic-horror/review/encounters.md) and
[capture index](../../art/cosmic-horror/review/encounters/index.json) link all
936 final-candidate screenshot contexts, concrete environments and hashes.
The unused 282 × 626 Unrung Witness was inspected separately with no gameplay
selector. Contact sheets are comparison aids; original captures are retained.

T078's visual review exposed player HP text overlapping EXP in narrow WebKit at
200% text. A regression failed on glyph bounds before correction. The HP label
now occupies the full track width, while the colored fill keeps its actual
percentage; the row grows only for wrapped text. Full, half and near-zero HP pass
in all three engines. Portrait and outer container dimensions, numerical rules,
RNG, rewards, save data and dependency pins are unchanged. Modified function
purpose comments were reviewed. The established encounter service boundary needs
no additional runtime abstraction.

## Evidence and repeatability

Authoritative context capture: `art/cosmic-horror/review/encounters/capture-03/`.
The index records base revision, uncommitted candidate scope, runtime source
hashes, delivered sprite hashes and every measurement file. capture-01 is a
retained fixture diagnostic (inactive player omitted combat label refresh).
capture-02 exposes the fixed HP/EXP issue. Neither is promoted into final manifest
contexts. All 18 capture-02 overview sheets were reviewed; 931 final portrait
crops are byte-identical and five differing crops were reviewed individually.
Final full-size examples confirm the corrected layout.

The capture fixture renders selected oracle enemies without scheduling attack
or reward timers. It explicitly places the player in combat before the production
stat refresh, then exposes a synthetic terminal control for layout/actionability.
Trial clicks and programmatic focus are not native/manual interaction acceptance.
Existing trigger/attack and terminal journey suites separately verify real actions
and rewards, including 126 encounter/attack oracle cases per engine and the full
ordered-pool/random-tape candidate comparisons. External fonts/analytics are
blocked by the functional fixture; this is not performance evidence.

To repeat, use the pinned runtime, create a new empty capture root, and set
`CAPTURE_ENCOUNTERS_DIR` only for an intentional capture. Each tuple directory and
file is created exclusively; an existing capture cannot be replaced. Routine
test runs omit that environment variable.

| Executed command                                                                                                                                                                                | Actual result                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `node --test tests/unit/encounter-art-delivery.test.mjs` before integration                                                                                                                     | 54 expected missing-delivery failures; one variant-separation pass                                                                       |
| Same command after manifest integration                                                                                                                                                         | 55 passes; subsequent context check first failed at 0/18 missing links, then passed with final capture links                             |
| `npx playwright test tests/browser/encounters.spec.mjs --project=webkit --grep 'enlarged player HP' --workers=1 --trace=off` before fix                                                         | Intended HP glyph/EXP-overlap failure                                                                                                    |
| `npx playwright test tests/browser/encounters.spec.mjs --grep 'enlarged player HP' --workers=3 --trace=off` after fix                                                                           | 3 passes, each covering 500/250/1 HP                                                                                                     |
| `node --test tests/unit/art-tools.test.mjs`                                                                                                                                                     | New explicit-unknown-timestamp case failed before correction; 10 pass after correction, including malformed/missing provenance rejection |
| `CAPTURE_ENCOUNTERS_DIR=art/cosmic-horror/review/encounters/capture-03 npx playwright test tests/browser/encounters.spec.mjs tests/integration/encounter-view.spec.mjs --workers=3 --trace=off` | 48 passed; 936 decoded contexts and 936 unavailable-image geometry comparisons                                                           |
| `npm run test:unit`                                                                                                                                                                             | 2,439 passed; zero failures/skips, including 1,118 candidate rule replays                                                                |
| `npx playwright test tests/integration tests/browser --workers=3 --trace=off`                                                                                                                   | 393 passed across three engines; zero failures/skips                                                                                     |
| `npm run lint`                                                                                                                                                                                  | PASS                                                                                                                                     |
| `npm run format:check`                                                                                                                                                                          | PASS                                                                                                                                     |
| `npm audit --audit-level=high`                                                                                                                                                                  | PASS; zero reported vulnerabilities                                                                                                      |
| `npm run validate:art`                                                                                                                                                                          | FAIL as a release gate: 53 human sprite reviews OPEN, plus 27 unfinished non-creature obligations                                        |
| `npm run validate:evidence`                                                                                                                                                                     | FAIL: required manual/native/remaining-art/release records remain OPEN/BLOCKED                                                           |
| `git diff --check`                                                                                                                                                                              | PASS                                                                                                                                     |
| Production build                                                                                                                                                                                | N/A: static application                                                                                                                  |

Raw command outputs are under `reports/phase-4c-*.txt`; red, diagnostic, corrected
and final runs are labeled separately. Runtime: Node 24.21.0/npm 12.2.0;
actual browser/OS versions are recorded per capture, rather than inferred from
product names. No dependency/install change was needed. Git/ESLint/Prettier
ignore coverage was verified; npm publishing ignores are N/A for this private
package, and Docker/Terraform/Helm configuration is absent.

## Handoff

T076–T078 are complete for the automated development environment and agent visual
review; no observed creature-art finding remains unresolved. Human originality,
art-direction/boundary acceptance and native desktop/mobile encounter rows retain
their existing OPEN/BLOCKED statuses. Matched candidate performance, missing-image
fallback integration, whole-collection review and release/CI enforcement belong
to later packages. No full US2 acceptance or release readiness is claimed.

The next bounded package is **Phase 5A, T079–T081** (item boundary and stale-action
protection). Optional pre/post `speckit.git.commit` hooks were left unexecuted.
