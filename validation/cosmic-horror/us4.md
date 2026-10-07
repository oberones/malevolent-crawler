# US4 — Collection integration and qualification

Date: 2026-10-07. Owner/reviewer: implementation agent. Package: Phase 6D,
T104–T109. Environment: local macOS with Node 24.21.0/npm 12.2.0 and the pinned
Playwright Chromium, Firefox and WebKit engines. Automated engine execution is
separate from native desktop and physical-device acceptance.

## Implementation and resource ownership

Encounter and symbol renderers now use the catalog-only image loader. Relic
inventory, equipped, detail, sale and reward images share the same symbol path.
Primary decode failure makes one authored fallback attempt; a second failure
shows a local diamond while adjacent identity and controls remain available.
Portrait width, intrinsic dimensions and aspect ratio remain catalog-owned.
Symbol images and terminal markers overlay the existing font-metric footprint.
No image response consumes gameplay RNG or changes rewards, holdings or saves.

Item/detail/log owners dispose old slots before replacement. A document removal
observer also releases symbol slots removed by classic allocation/history code;
weak ownership avoids retaining detached lists. Moving a node within the mounted
DOM does not dispose it. Service teardown releases the observers, portrait,
relic and narrative image owners, and remains usable as an unbound callback.
The loader now populates terminal text only on terminal failure, so an invisible
diamond cannot contaminate successful narrative text.

The common manifest joins all 80 deliveries: 53 sprites, two separate favicon
outputs, 24 distinct symbol roles and one fallback. Every file retains its
master, prompt, actual provenance, delivered hash and deterministic transform.
The fallback obligation now names `assets/art/fallback.png`, matching T098.
No artwork or immutable source/baseline bytes were regenerated or changed.
The manifest retains blocked native tuples explicitly. Context-key comparison
now includes the target ID so absent native browser metadata cannot collapse
separate blocked targets into duplicate tuples.

## Context corrections and limits

The Phase 6C stat clipping and allocation-label findings were reproduced with
text-range regressions at 360 px and 200% text. Stat text wraps rather than being
clipped; stat cards wrap into a column when text needs the space. Allocation
controls can move below an intact label. The allocation heading also wraps
between words, with its close control on another row when needed. These are text-accessibility layout
changes, not container enlargement to accommodate artwork. Portrait framing,
inline artwork dimensions and existing control sizes remain intact. Literal
pre-theme absolute page positions are still not certified.

The first wrapping iteration stopped clipping but split abbreviations. Agent
review identified that problem, a stronger text-range regression reproduced it,
and the card-wrap correction addresses it. A WebKit original-glyph comparison
also exposed fragmented allocation inline geometry; keeping the icon/label
line together resolves that finding without changing the image footprint.

## Verification

- T104 red: eight Chromium T100 cases failed for absent recovery states and
  fallback requests. [Red](reports/phase-6d/red-browser.txt).
- T104 early green: all 24 T100 journeys passed across the three engines.
  The same run exposed old relative-URL/initial-alt test assumptions; updated
  expectations require the loader's application-root URL and hidden decorative
  alternative. [Diagnostic run](reports/phase-6d/first-green.txt).
- T105 file/provenance checks: 81 checks pass (80 deliveries plus the corrected
  fallback obligation). [Red](reports/phase-6d/manifest-red.txt),
  [green](reports/phase-6d/manifest-green.txt),
  [decoded per-file audit](art-automated.json).
- Text reflow: intended failures for clipping/split labels/heading words, followed by green
  assertions. [Initial red](reports/phase-6d/reflow-red.txt),
  [stronger label red](reports/phase-6d/reflow-label-red.txt),
  [heading red](reports/phase-6d/heading-red.txt),
  [six heading/reflow passes](reports/phase-6d/heading-green.txt).
- Native tuple identity: intended key-collision failure, then 11 art-tool checks
  pass. [Red](reports/phase-6d/context-key-red.txt),
  [green](reports/phase-6d/context-key-green.txt).
- Unbound teardown: intended receiver error before refactoring to explicit
  owners. [Red](reports/phase-6d/teardown-red.txt).
- Unit: 2,539 PASS, no failures/skips. Includes protected numerical/random-tape
  comparisons and complete collection delivery checks.
  [Output](reports/phase-6d/unit-final.txt).
- Full browser/integration: 583 PASS, two failures, zero skips. The failures
  were a Firefox modal-lifecycle timeout and a WebKit 768/100% geometry clock
  setup error (“Cannot fast-forward to the past”). This command exited 1;
  it is not recorded as a single green full-suite run.
  [Full output](reports/phase-6d/full-final.txt).
- Final affected-scope rerun: 51 PASS, zero failures/skips, across all three
  engines. It includes both earlier failed cases, final heading/reflow checks,
  narrative/navigation, and 486 current captures. [Output](reports/phase-6d/layout-final.txt),
  [capture index](../../art/cosmic-horror/review/collection-symbols-04/index.json).
  Maximum intrinsic-baseline delta: 0.000031 CSS px; maximum same-anchor edge
  delta: 0 CSS px. Both meet the 0.5 CSS px tolerance. The final heading change
  occurred during the broad run; this later scoped run verifies all affected
  narrative/navigation/reflow/geometry paths on the final source.
- Existing relic and encounter context suites passed in the broad run, covering
  1,512 relic contexts and all 52 active portrait variants across declared
  viewports/text scales. The file audit additionally covers unused art/favicons.
- `npm run lint`, `npm run format:check`, `git diff --check`: PASS; see
  [lint](reports/phase-6d/lint-final-review.txt),
  [format](reports/phase-6d/format-final.txt), [whitespace](reports/phase-6d/whitespace.txt).
- Full `npm run validate:art`: FAIL for incomplete context qualification, not
  missing delivered files. [Output](reports/phase-6d/art-validator-promoted.txt).
- `npm run validate:evidence`: FAIL for remaining story/native/performance/CI
  and release obligations. [Output](reports/phase-6d/evidence-validator.txt).
- Production build: N/A; the application remains static.

Diagnostics are preserved. The first attempt was blocked by sandbox localhost
permissions, then rerun with local-server permission. An initial capture attempt
lacked its exclusive parent directory. Overlapping diagnostic runs briefly
shared a temporary trace directory, causing missing trace files; a later run
outlived its borrowed server. These are test-environment errors, not application
red or acceptance evidence. A separate capture configuration initially served its temporary config directory;
that run was stopped and the server root corrected explicitly. Final runs own
their server and output directory.
The initial full run also retained the now-corrected hidden-diamond and WebKit
allocation findings. No expected-failure or skip markers were introduced.

The final scoped command used `SYMBOL_CAPTURE_DIR=art/cosmic-horror/review/collection-symbols-04`
with `npx playwright test -c /tmp/phase6d-final-geometry.config.mjs tests/browser/symbol-geometry.spec.mjs tests/browser/collection-reflow.spec.mjs tests/browser/navigation-accessibility.spec.mjs tests/browser/narrative-integration.spec.mjs --workers=3`.
The [executed configuration](reports/phase-6d/layout.config.mjs) is retained;
it differs from the repository config only in explicit local paths, an isolated
4175 server/output directory and the list reporter. Reproduction must use a
fresh capture directory; existing captures use exclusive writes.

## Acceptance and handoff

The maintainer's [approval of all 80 artwork files](art-approval-2026-10-07-complete.md)
remains PASS. No artwork regeneration was requested or required. Sampled agent
capture review (Chromium 360/200% stats/allocation and WebKit 768/200% allocation)
supplements that approval and does not imply native execution.
Native browser/device baselines, exact pre-theme page coordinates, browser-tab
favicon appearance, target-specific fallback review, matched performance,
remote CI/enforcement and final release acceptance remain OPEN/BLOCKED.
The art/evidence validators remain failing until their requirements are met.

Purpose comments and public contracts were reviewed. Existing ignores cover the
private static Node project; raw hash-indexed captures are excluded from
formatting. Docker/Terraform/Helm/npm-publishing ignores are not applicable.
No dependencies, gameplay formulas, save formats or baseline files changed.
Optional pre/post `/speckit.git.commit` hooks remain unrun; no commit was made.
Stop at this package's handoff. Phase 7A (T110–T113) is the next independent
implementation package; outstanding native/release gates are not waived.
