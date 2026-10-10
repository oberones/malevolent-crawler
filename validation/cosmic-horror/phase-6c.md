# Phase 6C — Remaining symbol integration

Date: 2026-10-07. Owner/reviewer: implementation agent. Scope: T102–T103.
Environment: Node 24.21.0/npm 12.2.0; pinned Playwright Chromium, Firefox and
WebKit on the local macOS host. Native browser and physical-device acceptance
remain separate.

## Implementation

The ten remaining catalog roles now appear in all 27 inventoried contexts:
title; seven main and bonus stats; four allocation stats; two treasure events;
and header, reward, victory, offering, curse and sale currency. Static and
allocation/bonus slots mount through the shared symbol service. Header currency
uses an informative Gold alternative because its adjacent text is only a
number. Other symbols are decorative beside readable identity/stat text.

Typed dungeon/combat messages receive their symbols in the shared outcome view,
so repeated history rendering retains the same identity without changing the
classic event rules. Sale currency is attached by the item view. These shared
consumers own the dynamic contexts rather than duplicating rendering in
`dungeon.js`. The favicon reference now declares `image/x-icon` for its ICO.

All runtime paths and generated files are retained. Symbol-specific CSS uses
hidden local font metrics for layout and overlays the delivered image with zero
margin and proportional containment. Font Awesome metrics serve title/HP/
treasure/currency; the existing RPGAwesome strut serves the other stats. A scoped
width reset prevents the allocation row's generic span width from shrinking the
HP symbol at 200% text. Containers and button hit-area rules were not resized.

## Geometry evidence and measurement limits

The new `tests/browser/symbol-geometry.spec.mjs` visits the real application and
an isolated immutable original page in each engine, viewport and text scale.
The test exercises real event/reward/allocation/detail renderers with captured
state and finite random tapes. Missing static or dynamic contexts fail before
measurement. It checks successful image decoding, alternatives, local asset
references, global image-margin reset and ten-role/27-context coverage.

Widths, heights and spacing are checked against the frozen original measurements.
For line baseline, both original and candidate use a zero-size probe inside the
symbol. A sibling probe can wrap onto another line or reflow a centered panel;
the first diagnostic exposed that problem in enlarged allocation and header
contexts. The original frozen rows remain unchanged and are retained in each
new record alongside the intrinsic baseline remeasurement. The probe change is
verified against the immutable source, not a candidate-derived expected value.

A separate same-anchor comparison swaps only the symbol for its original glyph
in the live page and checks every symbol and parent edge within 0.5 CSS px.
This establishes the replacement's footprint without attributing narrative
wrapping changes to art dimensions. Absolute pre-theme page coordinates remain
OPEN for collection qualification, as do native baselines and manual review.

The clock fixture also needed a one-second installation-to-pause boundary to
avoid occasionally attempting to pause in the past. Those setup failures are
retained as diagnostics, not counted as application red.

## Checks

- T102 red: seven Chromium cases failed for missing `health/main` integration
  and the wrong favicon media type. [Output](reports/phase-6c/red.txt).
- Early integration: normal-size geometry passed; enlarged HP allocation
  exposed the real span-width collision. [First attempt](reports/phase-6c/geometry-first.txt).
- Rule replay: the numerical harness gained inert symbol/mount/replaceChildren
  operations; all rule expectations and random tapes remain unchanged.
- Unit: 2,457 PASS, zero failures/skips. [Output](reports/phase-6c/unit-final.txt).
- Full browser: 327 PASS, 24 failures, zero skipped/flaky cases. All failures
  are T100 recovery-state/fallback-request assertions in `art-failure.spec.mjs`;
  no new symbol or prior gameplay journey failed. [Output](reports/phase-6c/browser-final.txt),
  [structured summary](reports/phase-6c/browser-summary.json).
- Integration: 222 PASS, zero failures/skips. [Output](reports/phase-6c/integration-final.txt).
- Final capture refresh: 21 PASS, zero failures/skips; 486 measured and
  decoded contexts (27 × three engines × three viewports × two text scales).
  [Output](reports/phase-6c/geometry-final.txt),
  [hashed capture index](../../art/cosmic-horror/review/remaining-symbols-02/index.json).
  Maximum intrinsic-baseline difference is 0.000031 CSS px; same-anchor edge
  difference is 0 CSS px (both within the 0.5 CSS px tolerance). The initial 486 captures in
  `remaining-symbols-01` passed geometry but retained title dimming from a prior
  allocation scenario; they remain diagnostic evidence. Final capture setup
  restores that container's filter as well as the other scenario state.
- `npm run lint`, `npm run format:check`, `git diff --check`: final checks recorded
  in [lint](reports/phase-6c/lint-final-check.txt),
  [formatting](reports/phase-6c/format-final-check.txt) and
  [whitespace](reports/phase-6c/whitespace.txt).
- Production build: N/A; this remains a static application.

## Sampled visual review

Agent inspection covered the final Chromium 360/200% title, Firefox 768/200%
treasure/stat view and Chromium 360/100% sale detail captures. Earlier diagnostic
inspection additionally covered Chromium 360/100% main stats and allocation,
Chromium 360/200% offering and Firefox 1440/100% victory. Symbols are framed in
the reserved boxes, category/stat cues remain distinct, and title brightness is
corrected in the final fixture captures. This is a sampled agent review, not
T107 collection-wide visual acceptance.

The views also show clipped stat text in narrow/enlarged panels and awkward
allocation-label wrapping. These text-layout observations remain OPEN for
collection/cross-story reflow review (T106–T109/T129/T135); they are not treated
as art-geometry passes or corrected by enlarging containers for artwork.

## Review and handoff

No dependency, original source/asset baseline or common art manifest changed.
Ignore files cover the private static project; raw hash-indexed symbol captures
are explicitly excluded from formatting so verification does not rewrite evidence.
The first formatting run identified those raw arrays and a chain-wrap formatting
fix in `player.js`; no behavioral edit was needed. Docker, Terraform,
Helm and npm-publishing ignores are not applicable. Function-purpose comments
and public symbol-mount documentation were reviewed.

Phase 6D owns loader consumer integration (T104), manifest joining (T105) and
collection qualification (T106–T109). T100's missing-image journeys remain
ordinary failing tests until T104; no skip/expected-failure marker is added.
Native/manual, human artwork approval for these symbols, matched performance,
remote CI and release acceptance remain OPEN/BLOCKED. Optional pre/post
`/speckit.git.commit` hooks are available but unrun; no commit was made.
