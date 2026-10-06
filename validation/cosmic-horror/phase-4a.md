# Phase 4A — Encounter contract and renderer

Date: 2026-10-06. Owner/reviewer: implementation agent. Scope: T059–T061.
Environment: Node 24.21.0/npm 12.2.0 and the installed pinned Playwright engines.

## Delivered

- T059: Real-DOM tests cover all 51 identities and 52 active variants, including
  both Skeleton Mage illustrations. Names and logs resolve to the same catalog;
  alt text and paths match the selected variant. Repeated rendering leaves the
  enemy unchanged and consumes zero RNG. Unknown, mismatched, unsafe and unused
  references fail without partially changing the existing view.
- T060: Browser tests render all 52 variants at 360 × 800, 768 × 1024 and
  1440 × 900 with 100%/200% root text sizing. Unavailable image bytes expose
  reserved geometry independently of decoding. Tests check long-name wrapping,
  original 50%/70% content widths and aspect ratios within 0.5 CSS pixels.
  Another test replays all 126 encounter/attack oracle cases per engine through
  actual generation, ordinary/special-boss/both-mimic entry, guardian progression
  and attack functions, comparing full random tapes, stats, reward values and
  captured player/dungeon outcomes.
- T061: `encounter-view.mjs` resolves the selected identity/variant before DOM
  mutation, supplies intrinsic width/height and reserves the catalog aspect ratio
  while retaining the original percentage width. `outcome-view.mjs` delegates its
  existing encounter interface to this module. The established
  `enemy.js` generation → `dungeon.js` entry → `combat.js` `showCombatInfo` →
  `gameServices.narrative.encounter` path requires no redundant classic edits.
  Selection, image-variant draws, enemy objects and numerical formulas stay owned
  by the existing engine. The renderer owns no timers or load callbacks.

## Red–green–refactor

The initial Chromium run had seven intended layout failures: six viewport/text
cases observed collapsed portraits and the integration case observed missing
intrinsic dimensions/aspect ratios. Invalid-reference preservation already passed.
The eighth initial failure was test setup (assignment to a constant backlog),
not behavioral red. That was corrected to clear the existing array. Replay also
exposed two test assumptions, corrected without changing runtime behavior:
percentage widths use the panel content box excluding padding, and entry formats
its derived HP percentage as a string. Replay normalizes only that percentage's
representation; authoritative HP, stats, rewards and all RNG draws remain exact.
Loopback EPERM before browser startup was a sandbox setup failure, not red.

The minimal geometry implementation passed all 27 focused checks across three
engines. Refactoring extracted the presentation responsibility behind the existing
service interface. Purpose comments and public JSDoc were reviewed. Original
fixture/catalog/baseline data, dependencies, asset bytes and percentage framing
were not changed.

## Verification

| Command                                                                                                                                                | Result                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `npx playwright test tests/integration/encounter-view.spec.mjs tests/browser/encounters.spec.mjs --project=chromium --workers=2` before implementation | Seven intended layout failures; one test setup failure; one pass          |
| `npx playwright test tests/integration/encounter-view.spec.mjs tests/browser/encounters.spec.mjs --workers=3`                                          | 27 passed                                                                 |
| `npm run test:unit`                                                                                                                                    | 2,382 passed, zero failures/skips, including 1,118 candidate rule replays |
| `npx playwright test tests/integration tests/browser --workers=3 --trace=off`                                                                          | 372 passed across all three engines, zero failures/skips                  |
| `npm run lint`                                                                                                                                         | PASS                                                                      |
| `npm run format:check`                                                                                                                                 | PASS                                                                      |
| `git diff --check`                                                                                                                                     | PASS                                                                      |
| `npm run validate:art`                                                                                                                                 | FAIL: replacement assets/metadata remain unfinished                       |
| `npm run validate:evidence`                                                                                                                            | FAIL: required art/native/release obligations remain OPEN/BLOCKED         |
| Production build                                                                                                                                       | N/A: static application                                                   |

Raw executed outputs are under `reports/phase-4a-*.txt`. Existing terminal
victory/claim browser cases verify awarded rewards and no replay; existing
characterization/candidate suites retain full ordered-pool comparisons.

## Remaining gates

This completes the renderer package only. Creature assets still show the original
art; generated replacements, actual-size artistic review and missing-art fallback
integration are later packages. No native/manual acceptance, matched performance,
full US2 acceptance, remote CI or release readiness is claimed. Existing required
native baseline and release gates remain OPEN/BLOCKED. Art and evidence validators
remain release gates; they cannot pass until their later obligations are delivered.
The next bounded package is Phase 4B, beginning with T062–T063's creature pilot.
