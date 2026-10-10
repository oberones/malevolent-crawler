# Phase 3B — Existing-screen narrative integration

Date: 2026-10-06. Owner/reviewer: implementation agent. Scope: T050–T053.
Environment: nvm Node 24.21.0/npm 12.2.0, installed pinned Playwright engines.

## Delivered

- **T050:** Browser/title copy, original setting introduction, allocation heading,
  preparation instructions and all selectable skill labels/descriptions use the
  shared catalog through `entry-view.mjs`. Original skill values, name validation,
  stat budget and calculations stay in the classic engine.
- **T051:** Exploration, doors/coffers/mimics, both offerings, guardians, deep
  presences, uneventful rooms and choices use typed message records and
  `event-view.mjs`. Choices remain transient controls in their original order;
  the backlog retains its sequence and displays the last 50 entries.
- **T052:** Combat logs, fractional rewards, upgrades/rerolls, defeat, abandonment
  consequences and restart copy use safe text rendering through `outcome-view.mjs`.
  Claim still only closes the already-resolved encounter. Catalog resolution uses
  the selected encounter/variant, preserving image paths and percentage widths;
  it consumes no randomness and does not replace the engine’s legacy identities.
- **T053:** Current item names agree across inventory, equipped accessible labels,
  details, sale confirmation and reward records. Informational Help/Credits controls
  open real copy in the existing modal without changing progress. README credits
  retain original art/audio/library authors and explicitly identify undelivered art.

The existing `gameServices` bridge owns the view interfaces. Authored text and
player names enter text nodes, never narrative HTML interpolation. Structural
legacy markup, original glyphs where still present, gameplay ownership and formulas
remain in place. No new dependencies, lockfile changes, generated art, baseline
changes, commits or optional Git hooks are part of this package.

Legacy string history is preserved in state/source records and shown as a neutral
unavailable-history notice. This package does **not** implement recognized-history
migration or actionable raw-history recovery; Phase 7A/7D still own those tasks.
Likewise, full encounter/art handling belongs to US2/US4 and item action protection,
icons and accessibility belong to US3. Existing-screen naming is not art acceptance.

## Red–green and verification

| Command                                                                                                                          | Result                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `npx playwright test tests/browser/setting-journeys.spec.mjs --project=chromium --workers=3 --trace=off` before integration      | 46 intended narrative failures; numeric/RNG assertions remained intact                  |
| `npx playwright test tests/browser/narrative-integration.spec.mjs --project=chromium --workers=3 --trace=off` before integration | Intended hostile-name and skill-label failures; item fixture error corrected separately |
| Same file with `--grep 'relic labels'` and a nonempty captured inventory                                                         | Intended old item-name failure                                                          |
| `node --test tests/unit/candidate-rules.test.mjs`                                                                                | 1,118 passing gameplay replays; complete random tapes unchanged                         |
| `npm run test:unit`                                                                                                              | 2,382 passed, zero failures/skips                                                       |
| `npx playwright test tests/integration tests/browser --workers=3 --trace=off`                                                    | 321 passed across Chromium/Firefox/WebKit, zero failures/skips                          |
| `npm run lint`                                                                                                                   | PASS                                                                                    |
| `npm run format:check`                                                                                                           | PASS                                                                                    |
| `git diff --check`                                                                                                               | PASS                                                                                    |
| `npm audit --audit-level=high`                                                                                                   | PASS: zero vulnerabilities                                                              |
| `npm run validate:art`                                                                                                           | FAIL: required replacement assets/metadata remain unfinished                            |
| `npm run validate:evidence`                                                                                                      | FAIL: required art/native/release gates remain OPEN/BLOCKED                             |
| Production build                                                                                                                 | N/A: static application                                                                 |

Raw test/audit/validator output is retained under `reports/phase-3b-*.txt`.
The added browser file covers literal hostile names in current logs/header/profile,
last-50 record rendering, every selectable skill’s unchanged token and description,
and consistent relic naming/costs through sale cancellation. Existing journeys
verify every exploration branch, terminal outcomes, two rerolls, abandonment,
Help/Credits and numerical/RNG parity. Existing integration checks still verify
single completed-transition saves and preservation of original legacy bytes.

The rule-only VM adapter now supplies explicit presentation stubs and uses real
record/text formatters. It excludes only intentionally changed dungeon/combat
narrative histories from frozen-output comparisons; all authoritative player,
dungeon, enemy, item values and random calls remain compared. The immutable
fixture, oracle and baseline files were not edited. Real DOM behavior is tested
separately, not claimed from the stubbed rule harness.

Invalid setup attempts are not behavioral red: the sandbox initially blocked
loopback listening; an item test initially selected the empty resting pack;
a hostile-name battle probe initially used an idle enemy; and VM parameter
objects needed cloning into the formatter’s realm. These were corrected in test
setup. The final browser matrix has no timeouts or setup failures. Formatting
was normalized and function-purpose/public-contract comments reviewed.

## Handoff

Continue with **Phase 3C, T054–T058**: keyboard/modal navigation, semantic controls,
focus/contrast/reflow/reduced-motion fixes and US1 automated/manual acceptance.
This package stops at the task plan’s bounded work-package handoff. No later task
is checked off, and no manual/native, art, performance or release gate is promoted.
The optional `/speckit.git.commit` post-hook remains available but was not executed.
