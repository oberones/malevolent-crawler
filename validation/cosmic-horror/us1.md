# US1 — Narrative MVP and Phase 3C verification

Date: 2026-10-06. Owner/reviewer: implementation agent. Package: T054–T058.
The narrative MVP is complete for the automated development environment. Required
native/manual, replacement-art, matched performance and release gates remain
OPEN/BLOCKED. This is not full refactor or release acceptance.

Catalog and screen-integration evidence: [Phase 3A](phase-3a.md) and
[Phase 3B](phase-3b.md).

## Delivered

- T054: Keyboard title activation, names, visible focus, initial/return focus,
  background inertness, Tab wrapping, safe Escape, validation announcements,
  repeated dismissal and service disposal have real-browser coverage.
- T055: All three required viewports exercise 200% text, a 240-character saved
  name, reduced title/loader/shake/damage motion, failed font/analytics requests,
  failed local audio requests, mute and operable volume/navigation controls.
- T056: The title now has a native full-surface button. Creation, inventory,
  allocation, import/export fields and generated close controls have semantic
  names. The existing dialog service owns focus, inert background and Escape.
- T057: Removed global focus suppression; added visible focus, text wrapping,
  viewport-bounded scrolling modal content and reduced-motion rules. Existing
  portrait width rules and game timers remain unchanged. Event and upgrade views
  already generate native buttons; no new changes to player/dungeon rules were
  necessary. Audio settings remain available.
- T058: Reviewed/refactored the adapter, ran the US1 and foundation matrix,
  performed the bounded native Firefox review below, and recorded remaining
  qualification work in the manual workbook. No later package started.

`modal-bridge.mjs` is the explicit boundary for classic screens that still change
inline display and replace their markup. Its observer reconciles after synchronous
handlers finish binding controls, so asynchronous combat and informational screens
share the same service. Only one dialog owns focus at a time. The bridge remembers
invoking controls across sibling/nested screens, prefers safe cancel/close actions,
leaves mandatory combat/upgrades non-dismissible, preserves newer visibility writes
when releasing the service snapshot, and disposes observers/listeners through the
application owner. It neither chooses outcomes nor owns persistence/RNG. If an
invoking panel has gone away, focus returns to the visible screen's entry control.

## Red–green and checks

Runtime: nvm Node 24.21.0/npm 12.2.0; pinned installed Playwright engines.

| Command                                                                                                                                                                        | Actual result                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `npx playwright test tests/browser/navigation-accessibility.spec.mjs tests/browser/entry-resilience.spec.mjs --project=chromium --workers=3 --trace=off` before implementation | Seven intended failures: absent semantic title/name/inventory controls and active reduced-motion animations |
| Same focused command after implementation                                                                                                                                      | Seven passes; repeated-disposal case then added                                                             |
| `node --test tests/unit/candidate-rules.test.mjs`                                                                                                                              | 1,118 passes; authoritative rule values and full random tapes preserved                                     |
| `npm run test:unit`                                                                                                                                                            | 2,382 passes; zero failures/skips                                                                           |
| `npx playwright test tests/integration tests/browser --workers=3 --trace=off`                                                                                                  | 345 passes across Chromium, Firefox and WebKit; zero failures/skips                                         |
| `npx playwright test tests/browser/navigation-accessibility.spec.mjs tests/browser/entry-resilience.spec.mjs --workers=3 --trace=off` after final adapter refactor             | 24 passes across three engines                                                                              |
| axe WCAG 2 A/AA, 2.1 AA and 2.2 AA tags in creation and allocation                                                                                                             | Zero violations in those checked states across three engines; not a whole-game accessibility certification  |
| `npm run lint`, `npm run format:check`, `git diff --check`                                                                                                                     | PASS                                                                                                        |
| Production build                                                                                                                                                               | N/A: static app                                                                                             |

Raw outputs: `reports/phase-3c-{red,green,unit,rules,matrix,refactor,lint,format}.txt`.
No dependency or runtime artifact changes; the previous dependency audit is not
claimed as a new audit. The art/release validators remain incomplete qualification
checks; no art, native baseline or release gate is promoted by this package.

Setup/debug findings: loopback listening initially required sandbox escalation;
that failure is not behavioral red. During green development the initial adapter
needed an empty-modal guard and the older button focus suppression needed removal.
A Help assertion was corrected to the catalog's actual “Explore” wording, and axe
uses a fixture without the gameplay RNG tape because axe itself calls Math.random.
Neither test setup correction is counted as a product regression. Reused modal
history is released when returning to its parent; repeated open/close and disposal
checks pass. New/modified function-purpose comments and the immutable-baseline
boundary were reviewed.

## Bounded manual review

Native **Firefox 157.0** was verified from installed app metadata and operated via
native UI input in a separate tab at `http://127.0.0.1:4175`. Synthetic character:
`ReviewKeeper`; fresh local origin; 2026-10-06; reviewer: implementation agent.
The temporary server and review tab were closed afterward. A synthetic save remains
only in that local review origin. This review did not measure CSS viewport/DPR or
collect matched native baselines, and does not satisfy the full native matrix.

Observed directly from native accessibility state and rendered screenshots:

1. Creation introduction and name field were readable. Enter submitted the name.
2. Tab reached the native title button. Space opened allocation; Close received
   initial focus. Shift+Tab wrapped to Confirm. Escape returned focus to the title.
3. Enter reopened allocation. Increase HP changed the preview; Confirm entered the
   resting dungeon with HP 300 and no repeated activation.
4. Tab/Enter opened inventory. Close inventory received focus; background controls
   disappeared from the accessible modal view. Shift+Tab/Enter opened the menu.
5. Help rendered readable rules/cost/reset guidance. Escape returned focus to Help.
   Abandonment initially focused Cancel; Escape returned to Abandon without reset.
6. Credits accurately identified retained authors and explicitly undelivered new
   artwork. Escape returned to the menu, then to Open inventory in the dungeon.

Source review of the complete narrative definitions and skill descriptions found
coherent Veyr Quay/observatory terminology, explicit choices/costs/reset effects,
and no explicit mutilation or graphic gore. Entry, allocation, Help, Credits and
abandonment copy were also read in the native screen. Full rendered event/combat,
all-native-device, contrast and whole-art review remain separate manual obligations.
No screenshot or automated run is labeled as physical-device acceptance.

## Handoff

Next bounded package: **Phase 4A, T059–T061**, encounter contracts and renderer.
US5 save exchange/history/recovery remains required before release. Existing raw
history/import behavior and asset replacement are not completed by this package.
The optional `/speckit.git.commit` hook was not executed; changes are uncommitted.
