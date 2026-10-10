# Phase 7C — Saved combat and lifecycle ownership

Date: 2026-10-08. Scope: T118–T121. Automated implementation and verification complete.

## Changes

Continuation restores resting exploration controls before deriving active combat
from the validated saved tuple. Saved identity, variant, HP, reward values and
room/floor are reused; encounter generators and reward resolution are not called.
Settled victory does not replay rewards. Settled death follows the existing run
reset and schedules its loading presentation after cleanup. Interrupted terminal
states stay in the existing recovery path and preserve original storage bytes.

Run intervals, combat attacks/visual callbacks, terminal-control listeners, general screen delays and audio
have separate lifecycle owners. Reentry replaces run/attack timer sets. Combat
end, reset and import invalidate the appropriate pending work. Volume changes
unload old Howler instances; import releases them and the next title gesture
creates fresh instances using retained preferences. Reentry stops an existing
background loop before starting playback, preventing overlapping voices.

## Red–green evidence

- The first attempt could not bind the sandboxed localhost test server. This is
  an environment failure, not behavioral red.
- The final regression suite run against unchanged HEAD produced ten intended
  failures: eight repeated-entry cases advanced playtime twice, audio replacement
  did not unload the previous instance, and a stale enemy attack crossed a combat
  restart. Four existing recovery/audio/settled-death cases passed.
- Earlier diagnostic enemy equality assertions stopped on the legacy display-only
  HP percentage changing from number to string; the final assertions normalize
  that field while preserving exact authoritative values.
- A candidate regression exposed reset cancelling the settled-death loading
  callback. Moving the new loading delay after reset resolves that interaction.
- Numerical replay uses the real lifecycle and continuation services with the
  existing deterministic clock; immutable expected state and random tapes are
  unchanged. Initial missing adapter fields were test wiring failures, not red.

- Review regressions reproduced a detached defeat button resetting a later run
  and repeated entry starting two background voices. Combat-owned result listeners
  and stop-before-play ordering resolve both.

## Verification and limits

Pinned Node 24.21.0/npm 12.2.0 and Playwright 1.63.0, local macOS. Browser runs
use the permitted localhost execution context and controlled clocks/network.

| Check                                                                 | Result                                           | Evidence                                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Requirements checklist                                                | 16/16 PASS                                       | Feature requirements checklist                                                       |
| Complete unit suite and protected numerical/RNG replay                | 2,554 PASS                                       | [Unit output](reports/phase-7c/unit-green.txt)                                       |
| Broad encounter, progression, narrative, boot, commits and import run | 342 PASS across three engines                    | [Broad output](reports/phase-7c/browser-342.txt)                                     |
| Post-review run, including terminal controls and audio overlap        | 249 PASS; three test-ordering assertion failures | [Diagnostic output](reports/phase-7c/review-run.txt)                                 |
| Final continuation/lifecycle suite, with corrected actor ordering     | 51 PASS across three engines                     | [Final scoped output](reports/phase-7c/final-focused.txt)                            |
| Repository lint and formatting                                        | PASS                                             | [Lint](reports/phase-7c/lint-green.txt), [format](reports/phase-7c/format-green.txt) |
| Whitespace                                                            | PASS                                             | `git diff --check`                                                                   |

The three diagnostic failures assumed the enemy attacked before the player. The
frozen normal fixture has player speed 0.6 and enemy speed 0.43000000000000005;
the corrected test observes both full first deadlines, exact draw counts, and HP
changes in that order. No production timing change was made for this correction.
The broad run preceded the final listener/music corrections; the post-review run
covers their affected terminal journeys and the final scoped run passes all new
checks. This is scoped verification, not a claim that every repository browser
suite was executed.

Commands (pinned runtime selected):

```sh
npm run test:unit
npx playwright test tests/browser/continue-encounter.spec.mjs tests/integration/lifecycle-audio.spec.mjs tests/integration/character-import.spec.mjs tests/integration/bootstrap.spec.mjs tests/integration/transition-commits.spec.mjs tests/integration/legacy-progression-controls.spec.mjs tests/browser/encounters.spec.mjs tests/browser/setting-journeys.spec.mjs tests/browser/narrative-integration.spec.mjs --workers=3
npx playwright test tests/browser/continue-encounter.spec.mjs tests/integration/lifecycle-audio.spec.mjs tests/integration/character-import.spec.mjs tests/browser/setting-journeys.spec.mjs tests/integration/transition-commits.spec.mjs --workers=3
npx playwright test tests/browser/continue-encounter.spec.mjs tests/integration/lifecycle-audio.spec.mjs --workers=3
npm run lint
npm run format:check
git diff --check
```

Setup review: existing Git/ESLint/Prettier ignores cover generated output,
dependencies and secrets. Package is private; npm publishing ignores are N/A.
No Docker, Terraform or Helm setup was found. No ignore edits were needed.

Self-review: changed functions retain adjacent purpose comments; public
continuation orchestration has JSDoc. Timer ownership reuses the tested lifecycle
service. Frozen fixtures, numerical formulas, attack periods and RNG tapes were
not changed. Recovery validation remains upstream of continuation.

Native desktop/mobile execution, audible playback, performance, complete US5
recovery/clipboard/conflict acceptance, CI and release readiness remain
OPEN/BLOCKED. Build is N/A for this static application. No dependency or art
changes. No optional Git hooks were executed.
