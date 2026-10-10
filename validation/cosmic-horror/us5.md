# US5 — Save continuation, exchange and recovery

Date: 2026-10-08. Phase 7D scope: T122–T128, implementation-complete for the automated environment. This report joins the earlier
[7A migration](phase-7a.md), [7B exchange](phase-7b.md) and
[7C continuation](phase-7c.md) evidence. Native/manual, device, performance,
remote CI and release acceptance remain OPEN/BLOCKED.

## Delivered behavior

The existing loader now explains rejected saves and read failures, retains exact
source strings in selectable JSON, and offers a local recovery download and Retry
loading. Valid prior-good snapshots and separately validated retained characters
have explicit confirmation. Retained-character recovery uses the established
import reset; prior-good recovery preserves the saved encounter and progression.
A failed initial migration also offers its validated candidate.

These three boot recovery choices are **session-only**: they do not overwrite
malformed, unsupported, partial or inaccessible original sources. The confirmation
and persistent notice say that progress is not saved and must be exported before
closing the tab. There is no automatic promotion of a recovered session to durable
storage, silent backup fallback, reward replay, or deletion of legacy keys.

Normal gameplay write failures keep the live state and display a persistent
notice with recovery export and Retry saving. The export includes original source
strings, history metadata, diagnostics and the current memory tuple. Retry commits
the complete current tuple through the existing validate/read/backup/canonical
protocol. Failed writes do not claim Saved. Full recovery JSON is an archival
export, not a newly supported full-session import format.

Clipboard actions now await the actual promise. Denial or missing clipboard APIs
leave selectable MC1 text and a character download; Copy does not request a save.
Foreign canonical storage events immediately announce the conflict and suspend
writes. Precommit comparison detects unannounced revision changes. The recovery
modal offers reload of the newer save or export of this tab's memory, with no merge
or overwrite. This is one-tab ownership, not a race-free cross-tab lock.

Boot confirmation reuses the shared dialog service, including focus trapping,
Escape cancellation and focus return. Existing modal ownership handles recovery,
import and export. Recovery text and controls reflow at 200%; unknown source/history
text is never interpreted as markup. Sound is optional for these actions.

## Red–green and review

- Initial localhost binding failed with `listen EPERM`; it is an environment
  boundary, not behavioral red. Runs then used the permitted local execution context.
- [Initial red](reports/phase-7d/red.txt): 18 intended failures covering missing
  recovery UI, early Copy success and invisible conflict notification.
- [Accessibility red](reports/phase-7d/accessibility-red.txt): boot confirmation
  did not focus Cancel; exchange keyboard/reflow already passed. Shared dialog
  ownership and responsive recovery styles make the new case pass.
- [First green attempt](reports/phase-7d/green-first.txt): 14 passed, four recovery
  downloads timed out because the guarded boot page blocked their temporary link.
  Placing the link within the authorized recovery region fixed that interaction.
- [Initial matrix](reports/phase-7d/browser-first.txt): 105 passed across Chromium,
  Firefox and WebKit.
- [Review red](reports/phase-7d/review-red.txt): lost prior-good unknown-history
  actions and missing initial migration-write diagnostics reproduced; actual
  two-page storage notification already passed. Recovery now carries the selected
  snapshot's history metadata and migration failure issues.
- [Broad diagnostic run](reports/phase-7d/browser-broad.txt): 208 passed, one
  clipboard byte-comparison failure, one unsupported Firefox touch case skipped.
  The clipboard fixture had left the real playtime timer running. Freezing its
  clock isolates Copy's read-only assertion; no production timing change was made.

## Validation

Pinned Node 24.21.0/npm 12.2.0, Playwright 1.63.0 on local macOS. Automated engines
are Chromium, Firefox and WebKit; these are not native Chrome/Safari or physical
touch acceptance. Recovery checks use a 360×800 viewport and existing broader
continuation/boot fixtures. Browser touch checks use actual emulated touch events
in Chromium and WebKit; the unsupported Firefox hasTouch case is explicitly skipped.

- [Final unit run](reports/phase-7d/unit-final.txt): 2,554 PASS, including all
  adversarial save/codec, lossless migration, byte-preserving commit failures,
  disposal, numerical/RNG replay and budget-boundary tests.
- [Final browser matrix](reports/phase-7d/browser-final.txt): 209 PASS, one unsupported
  Firefox touch-emulation case SKIPPED. Includes recovery, clipboard, real two-tab conflict, keyboard/touch, enlarged
  text, import, boot, history, continued encounters, lifecycle/audio and commits.
- [Budget audit](reports/phase-7d/budgets.json): all 72 raw records in the captured
  legacy corpus fit existing safeguards without truncation; largest is 1,813 UTF-8
  bytes. Limits remain 16 MiB input, depth 64, 64 KiB text fields. Unit tests cover
  budget violations and large holdings without a gameplay collection cap. This
  verifies the supported synthetic corpus, not every possible historical save.
- [Lint](reports/phase-7d/lint.txt), [format](reports/phase-7d/format.txt) and
  `git diff --check`: PASS.
- Agent visual review: narrow 200% recovery captures show wrapped controls and
  selectable raw text within a scrolling region. Focus return scrolls the selected
  recovery choice into view; earlier explanatory text remains scrollable.
  [Chromium capture](reports/phase-7d/recovery-200-chromium.png),
  [Firefox capture](reports/phase-7d/recovery-200-firefox.png),
  [WebKit capture](reports/phase-7d/recovery-200-webkit.png).

Commands, with the pinned runtime selected:

```sh
npm run test:unit
npx playwright test tests/browser/save-recovery.spec.mjs tests/browser/recovery-accessibility.spec.mjs tests/integration/clipboard-conflict.spec.mjs tests/integration/character-import.spec.mjs tests/integration/bootstrap.spec.mjs tests/browser/legacy-history.spec.mjs tests/browser/continue-encounter.spec.mjs tests/integration/lifecycle-audio.spec.mjs tests/integration/transition-commits.spec.mjs --workers=3
npm run lint
npm run format:check
git diff --check
```

Self-review: new/changed functions have purpose comments; public boundaries have
JSDoc. The implementation reuses validation, reset semantics, migration, lifecycle
and dialog services. Existing save keys, numerical rules, RNG consumption, assets
and dependencies are unchanged. Git/ESLint/Prettier ignores already cover generated
output and private data; package publishing is N/A (`private: true`), and no
Docker/Terraform/Helm setup was found. Static application build is N/A.

Manual native acceptance was not performed in this package; use the existing
[manual workbook](manual.md). Screenshots, keyboard automation, emulated touch and
Howler tests do not certify physical devices, screen-reader announcements, audible
playback or release readiness. Phase 8 cross-story qualification is the next package.
No optional commit hooks were executed.
