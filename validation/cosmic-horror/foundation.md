# Phase 2G — Guarded bridge and completed transitions

Date: 2026-10-06. Owner/reviewer: implementation agent. Scope: T043–T046.
Environment: nvm Node 24.21.0/npm 12.2.0; pinned Playwright Chromium, Firefox and WebKit.

## Implementation

`services.mjs` injects storage, clock, event target and runtime accessors into the
existing snapshot and transition services. The four classic state bindings remain
owned by their original scripts. One lexical bridge initializes once; no player or
volume storage is read while classic scripts are evaluated. The title and dungeon
controls are gated until state validation succeeds. Module/storage failures expose
an actionable retry in the existing loader, preserve source data and prevent play.
Audio construction starts on the title gesture. Re-entering the dungeon uses the
validated in-memory tuple instead of rereading legacy keys.

Legacy candidates are validated and committed before runtime replacement. Runtime
save requests are coalesced within synchronous action boundaries: attack, terminal
rewards/death, reset, allocation, upgrades, item changes and exploration events.
Nested saves cannot publish an intermediate attack or reward. `objectValidation`
returns defaulted fields without writes or input mutation; callers explicitly adopt
the result. A failed commit keeps the completed in-memory action and displays an
on-screen unsaved notice. Original four-key source bytes remain unchanged.

The scoped lint cleanup declares formerly implicit locals/timers/audio bindings,
uses strict comparisons (preserving null-or-undefined defaults explicitly), and
removes the empty upgrade-rendering catch. The upgrade renderer now iterates over
its actual three choices and propagates unexpected failures. The four mutable
state declarations have narrowly documented `prefer-const` exceptions because
replacement occurs in another classic script; lint otherwise passes without rule
relaxation. Function purpose comments accompany the changed code.

Formatting normalization accounts for HTML/CSS and design-document diffs. It does
not change the original art or immutable source, geometry or performance baselines.
Ignore coverage remains sufficient; the package is private and has no Docker,
Terraform or Helm build context. No dependencies, lockfile or runtime pins changed.

## Verification

- `npm run test:unit`: 2,365 pass, including 1,118 candidate rule replays against
  captured encounter/equipment/progression expectations and exact random tapes.
- The candidate rule adapter copies current scripts into a disposable local test
  directory, substitutes only asynchronous boot and persistence dispatch, and uses
  the existing deterministic clock/DOM/audio harness. It is rule evidence, not a
  substitute for real-browser storage or UI checks.
- `npx playwright test tests/integration tests/browser --workers=2`: 171 pass
  across all three engines; see `reports/phase-2g-browser.txt`.
- Browser regressions cover guarded/duplicate/delayed startup, module/read failure,
  title-gesture audio, fresh character/allocation, pure defaulting, one canonical
  write per complete action, retained legacy bytes, failed writes, upgrade errors
  and on-screen unsaved feedback. All three engines run the same checks.
- `npm run lint`, `npm run format:check`, and `git diff --check`: PASS. Production build: N/A for the static application.

Red/green details and invalid test setup attempts are in [the TDD record](tdd.md).
The localhost server/browser runner required sandbox escalation; the initial EPERM
server failure is not counted as a behavioral red result.

## Handoff and limits

The next bounded package is Phase 3A (T047–T049), narrative catalog and coverage.
Later art, narrative integration, historical-log rendering, full recovery/import,
continuation/lifecycle, clipboard/conflict UI and acceptance tasks remain open.
This foundation does not certify those later player journeys or make the current
legacy views safe for release. Full native/manual accessibility, physical devices,
art review, candidate performance and remote CI enforcement remain OPEN/BLOCKED.
The frozen baseline is unchanged; no release gate was promoted. No commit or
optional pre/post commit hook was executed.
