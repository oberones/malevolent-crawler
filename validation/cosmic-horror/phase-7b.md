# Phase 7B — Character exchange and transactional import

Date: 2026-10-07 (America/New_York). Owner/reviewer: Codex agent.
Scope: T114–T117; implementation and automated development qualification PASS.

## Delivered behavior

- Strict historical Latin-1 Base64 imports and `MC1:` UTF-8 character envelopes
  share the existing detached player validator. Unicode names round-trip;
  exports exclude run/enemy/preferences. Invalid transport, UTF-8, versions,
  shapes, prototype keys, references, fields and resource budgets are rejected.
  Historical combat flags do not require an exported enemy.
- Preview and cancellation change neither runtime values nor storage bytes.
  Confirmation describes character replacement and dungeon reset. A detached
  candidate applies the established reset while preserving holdings, lifetime
  values, base/temporary stats, local preferences and existing run limits/rating.
  The imported character cannot resume an encounter; its enemy is idle.
- Persistence precedes old-session cleanup and live replacement. Backup/canonical
  failures retain the current session and canonical bytes. Retry, Cancel and
  explicit session-only use are available. Session-only play cannot silently
  overwrite the durable character; its visible unsaved status persists, and
  character export remains available. Reload returns to durable data.
- Repeated confirmation cannot commit or clean up twice. Import invalidates
  owned delayed loader/combat work and clears existing interval/audio playback
  handles once. This small ownership connection does not complete T119/T121's
  broader lifecycle/audio reuse and disposal qualification.
- The existing modal bridge supplies cancellation/focus behavior. A real
  360-pixel exchange-form journey verifies safe Unicode/hostile-looking text,
  Escape cancellation, focus return and successful MC1 import on all engines.

## Red–green evidence

Observed in this implementation session (initial red outputs were tool results,
not retained raw report files):

1. `node --test tests/unit/character-codec.test.mjs`: four intended failures
   against documented rejecting seams; one existing rejection guard passed.
   Historical acceptance, Unicode envelope output, version diagnostics and
   budget diagnostics then passed after implementation.
2. `node --test tests/unit/character-import.test.mjs`: two intended failures
   against the importer seam; both passed after transaction orchestration.
3. Chromium import tests exposed a Cancel write/revision change, premature live
   replacement during durable writes, and replacement after backup failure.
   An earlier diagnostic stopped on confirmation wording before these assertions;
   the wording assertion was broadened to accept the old equivalent warning.
4. A clock-controlled regression showed an old loader callback reopening the
   dungeon after import. Routing delayed work through lifecycle ownership and
   invalidating it on import made the regression pass.
5. Refactor reuses save validation, snapshot commit, dialog and lifecycle services.
   The numerical replay adapter now injects the real import service and lifecycle;
   frozen expected values and RNG tapes remain unchanged. Its original two import
   adapter failures were test wiring failures, not additional behavioral red.

## Verification

Node 24.21.0/npm 12.2.0, local macOS, pinned Playwright 1.63.0 engines.
The sandbox initially denied localhost listening; browser checks passed in the
permitted local-server execution context. That denial is not TDD red.

| Check                                                         | Result                       | Evidence                                               |
| ------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------ |
| Requirements checklist                                        | 16/16 PASS                   | Feature checklist                                      |
| Codec and importer unit tests                                 | 7 PASS                       | Included in complete unit report                       |
| Complete unit suite, including frozen numerical replay        | 2,554 PASS                   | [Unit report](reports/phase-7b/unit-green.txt)         |
| Import, delayed cleanup, boot, commits, history and narrative | 93 PASS across three engines | [Browser report](reports/phase-7b/browser-green.txt)   |
| Reachable MC1 exchange form and keyboard cancellation         | 3 PASS across three engines  | [Keyboard report](reports/phase-7b/keyboard-green.txt) |
| Repository lint                                               | PASS                         | [Lint report](reports/phase-7b/lint-green.txt)         |
| Repository formatting                                         | PASS                         | [Format report](reports/phase-7b/format-final.txt)     |
| Whitespace validation                                         | PASS                         | `git diff --check`                                     |
| Build                                                         | N/A                          | Static application, no production build                |

Commands with the pinned runtime on PATH:

```sh
node --test tests/unit/character-codec.test.mjs tests/unit/character-import.test.mjs
npm run test:unit
npx playwright test tests/integration/character-import.spec.mjs tests/integration/transition-commits.spec.mjs tests/integration/bootstrap.spec.mjs tests/browser/legacy-history.spec.mjs tests/browser/narrative-integration.spec.mjs --workers=3
npx playwright test tests/integration/character-import.spec.mjs --grep 'exchange form' --workers=3
npm run lint
npm run format:check
git diff --check
```

The 93-case run preceded the additive exchange-form test; its separate three-engine
run makes 96 scoped passes. No full browser-suite or remote-CI pass is claimed.
Ignore files already cover the static/private Node setup; no new dependency,
Docker, publishing, Terraform or Helm configuration was introduced.

## Handoff

Next: Phase 7C, T118–T121. Complete encounter continuation and lifecycle/audio
ownership remain outstanding, followed by Phase 7D recovery/clipboard/conflicts
and full US5 qualification. Native/manual, physical-device, performance and
release gates remain OPEN/BLOCKED. No manual acceptance checkbox was promoted.
Optional pre/post `speckit.git.commit` hooks were not executed; no commit made.
