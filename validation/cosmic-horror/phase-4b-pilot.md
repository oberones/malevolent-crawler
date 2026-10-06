# Phase 4B creature pilot — T062/T063

Date: 2026-10-06. Scope: the three-asset pilot and frozen creature direction.
Reviewer: implementation agent. Node 24.21.0/npm 12.2.0.

Delivered original built-in ImageGen masters, prompts, source-file references,
SHA-256 hashes and deterministic Sharp transform records for:

- Quay Scavenger: `assets/sprites/goblin.png`, 161 × 166.
- The Unrung Witness: `assets/sprites/spider_spirit.png`, 282 × 626, still unused.
- The Horizon Stitcher: `assets/sprites/spider_dragon.png`, 895 × 659.

[Batch provenance](../../art/cosmic-horror/batches/encounter-pilot/generation.json),
[individual visual findings and frozen guidance](../../art/cosmic-horror/batches/encounter-pilot/review.md),
and [decode/alpha/exact-size/re-export results](../../art/cosmic-horror/batches/encounter-pilot/validation.json)
are retained together. Model, seed, tool generation timestamp and remote source URL
were not supplied and remain null; the recorded local file modification time is
explicitly distinguished from a generation timestamp.

All three masters and delivered canvases were inspected visually. The two active
portraits were decoded and captured through production combat entry in Chromium
at 360 × 800, 768 × 1024 and 1440 × 900. All six captures were visually reviewed.
The unused Witness was inspected at its delivered size and has no fabricated
encounter context. This is an agent pilot review, not human/native release acceptance.
Initial capture setup bypassed stat refresh, then attempted audio cleanup before
initialization; those captures were replaced with successful full-entry captures.
No runtime code was changed to accommodate the capture setup.

## Verification

- Repeated calls to the existing tested `prepareArt` export produce identical
  delivered SHA-256 hashes. Full PNG decoding, exact dimensions, transparent and
  visible pixels pass for each output. Catalogs retain 52 active variants and no
  encounter for the Witness.
- `npm run test:unit`: 2,382 passed, zero failures/skips.
- `npx playwright test tests/integration/encounter-view.spec.mjs tests/browser/encounters.spec.mjs tests/browser/narrative-integration.spec.mjs --workers=3 --trace=off`:
  36 passed across Chromium, Firefox and WebKit.
- `npm run lint`: PASS.
- `npm run format:check` and `git diff --check`: PASS.
- Raw test outputs: `reports/phase-4b-pilot-*.txt`.

Art/copy authoring uses relevant validation rather than artificial failing tests,
as the constitution and task execution contract specify. No behavior or preparation
algorithm was changed; existing tested preparation and encounter contracts were
reused. Credits now distinguish these three generated replacements from remaining
original artwork, whose attribution remains intact.

T064–T075 remain open and use the frozen pilot guidance. T076 owns collection
manifest integration; this batch deliberately has its own metadata. Full art,
200%-text visual review, native/manual, matched performance and release gates remain
OPEN/BLOCKED. No collection-wide acceptance, performance pass, commit or remote CI
result is claimed. The next bounded batch is T064 (the four remaining goblin aliases).
