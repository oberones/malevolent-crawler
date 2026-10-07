# Manual acceptance workbook

Owner: T007 scaffolding; execution owners listed per row. Created 2026-10-06. **Maintainer visual acceptance of all 80 delivered art assets: PASS on 2026-10-07; native execution remains separately recorded below.**

Use PASS / FAIL / BLOCKED / OPEN / N/A. Check a box only after the expected result is observed, findings resolved, and evidence/reviewer/date recorded. N/A requires a specific reason. Screenshots and engine emulation do not replace real native interaction. `gates.json` contains the full structured steps, expected/actual results and target references for each ID below; update both records together.

For every execution record supply: source revision, fixture and concrete selector, OS/browser build/device, viewport/DPR/input/text scale, steps/command, expected/actual result, evidence file, reviewer/date, status and findings. Current actual result is **Not performed**, evidence/reviewer/date are **unset**, unless a row explicitly reports an availability blocker.

Desktop rows cover 360×800, 768×1024 and 1440×900 at 100%/200% text. Physical mobile rows additionally use actual viewport and both orientations. Record keyboard/pointer on desktop and physical touch on mobile; missing hardware is BLOCKED. See [environment](environment.json) and [validation plan](../../specs/001-cosmic-horror-refactor/validation-plan.md).

## Native journey procedures

| Procedure           | Fixture / steps                                                                                                                                                                    | Expected result                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| entry               | New character, allocation, title and enter. Create a character, allocate stats, activate title using the target input.                                                             | Original screen organization; readable setting; one action per activation.                              |
| events              | Every exploration event and choice. Drive door/treasure/mimic/blessing/curse/uneventful fixtures and every choice.                                                                 | Correct cost, reward, room/floor change, narrative and controls.                                        |
| encounters          | 51 identities, 52 variants, all archetypes/conditions. Drive every deterministic encounter including guardians, bosses and both mimics.                                            | Correct identity/portrait/numerics; no extra random draws or hidden controls.                           |
| relics              | 14 categories × 6 rarities. Inspect reward/list/equipped/detail/confirmation/log contexts for all 84 fixtures.                                                                     | Correct identities, category cues, rarity labels and unchanged statistics.                              |
| item-actions        | Empty/full/duplicate holdings. Claim, inspect, equip, unequip, unequip all, sell/filter/bulk sale; repeat actions.                                                                 | Six-slot capacity; separate duplicates; correct proceeds; no loss or duplicate action.                  |
| progression         | Level-up, 3 choices, 2 rerolls. Exercise every upgrade choice, rerolls, floor progression and rewards.                                                                             | Protected formulas and counters; clear choices and costs.                                               |
| reset               | Defeat/abandon/restart. Run each reset path with equipped/inventory items and accumulated progress.                                                                                | Established retention/reset semantics; no duplicate rewards.                                            |
| menu-copy           | Menus/help/credits and every narrative surface. Review system copy and credits across title/events/combat/upgrades/items/resets.                                                   | Coherent original setting; neutral labels preserved; accurate retained contributions.                   |
| keyboard-focus      | Every keyboard-reachable control and modal. Use Tab/Shift+Tab/Enter/Space/Escape through title, allocation, explore/pause, inventory/details/sale, level-up, menu/import/recovery. | Visible focus, correct initial/return focus, no trap, background blocked, cancellation non-destructive. |
| touch               | Touch targets and orientation. On physical mobile/tablet use every critical journey in portrait and landscape; desktop uses pointer.                                               | No occluded/unavailable control or accidental double action; correct target activation.                 |
| text-reflow         | Long text, 100%/200% text, required viewports. Exercise long names/prices/stats, three desktop viewports and actual mobile viewport at both scales.                                | Readable text, no obscured controls or horizontal overflow; art container size preserved.               |
| contrast            | Text, essential symbols and focus. Review contrast and labels in every changed state including six rarities and danger.                                                            | Applicable WCAG 2.2 AA; no essential color/audio-only information.                                      |
| motion-audio        | Reduced motion, muted/blocked audio. Enable reduced motion and mute; deny audio; repeat entry/settings/combat.                                                                     | Perceivable outcomes, working controls, no duplicate playback/listeners.                                |
| local-continue      | Early/resting/normal/guardian/boss/chest-mimic/door-mimic/both variants. Load old and new local saves, resume once and reload.                                                     | Same HP/stats/rewards; no reroll, guardian re-advance or reward replay; one fresh timer set.            |
| settled-interrupted | Settled victory/death and interrupted tuples. Load inactive terminal outcomes and old active mid-attack/mid-reward fixtures.                                                       | Settled outcomes preserved; inconsistent tuples enter recovery without guessed rewards.                 |
| character-exchange  | Latin-1 legacy and MC1 Unicode exports/imports. Export/copy/import both formats; preview, confirm, cancel; include optional/null fields, fractional EXP, duplicate/full items.     | Character-only reset distinct from local continuation; retention exact; cancellation read-only.         |
| storage-recovery    | Read/backup/canonical write failures, quota/denied. Inject each failure, retry; inspect raw data and prior-good recovery; choose session-only explicitly.                          | No false Saved, silent reset, lost raw bytes or partial live replacement.                               |
| hostile-import      | Malformed/unknown/unsupported/prototype/HTML/path/CSS/oversized/deep. Import adversarial fixtures and unsafe nested items/logs.                                                    | Actionable safe text; no code/markup execution; original state retained.                                |
| clipboard-conflict  | Clipboard denied/unavailable and stale tabs. Reject copy promise; change canonical record in another tab and attempt save.                                                         | No false Copied; selectable text/download; suspend autosave and offer reload/export.                    |
| history             | Recognized/unknown/hostile history; player names containing old terms. Load historical logs and compare player-authored names, order and last-50 view.                             | Safe themed known history; raw unknown retained with neutral recovery notice.                           |
| image-failure       | Slow/missing/corrupt/late images and failed fallback. Delay/fail images, change encounter, exercise combat/inventory controls.                                                     | Stable boxes, correct current identity, usable actions, no recursive fallback.                          |
| external-boot       | Module, external font/analytics failures. Block each dependency separately at startup.                                                                                             | Working core journey or actionable recovery; never a blank loader.                                      |
| horror-boundary     | Every new narrative and illustration. Review all system-authored narrative and each art record.                                                                                    | Mutation/exposed anatomy/restrained blood allowed; zero explicit mutilation/graphic gore.               |

## Native Chrome

Environment ID: `chrome-desktop`. Google Chrome.app not observed in /Applications; Chrome for Testing is separate. Actual DPR/viewport/input and reviewer/date remain unset.

| Done | Gate / procedure                          | Owner | Requirements                   | Status  | Actual / evidence / reviewer / date |
| ---- | ----------------------------------------- | ----- | ------------------------------ | ------- | ----------------------------------- |
| [ ]  | native-chrome-desktop-entry               | T058  | FR-001, FR-002, QR-001, QR-002 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-events              | T058  | FR-003, FR-004, FR-006         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-encounters          | T078  | FR-003, FR-004                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-relics              | T093  | FR-005, FR-006                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-item-actions        | T093  | FR-005, FR-014                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-progression         | T058  | FR-004                         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-reset               | T093  | FR-004, FR-005, FR-012         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-menu-copy           | T058  | FR-001, FR-002, FR-015         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-keyboard-focus      | T136  | FR-014, QR-001, QR-002         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-touch               | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-text-reflow         | T136  | FR-014, QR-001, QR-002         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-contrast            | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-motion-audio        | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-local-continue      | T127  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-settled-interrupted | T127  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-character-exchange  | T126  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-storage-recovery    | T127  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-hostile-import      | T126  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-clipboard-conflict  | T127  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-history             | T126  | FR-006, FR-012, FR-013         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-image-failure       | T109  | FR-013, FR-014                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-external-boot       | T058  | FR-013, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-desktop-horror-boundary     | T137  | FR-010, SC-008                 | BLOCKED | Not performed / — / — / —           |

## Native Firefox

Environment ID: `firefox-desktop`. Firefox 157.0: bounded native keyboard/pointer review on 2026-10-06 by implementation agent; see [US1 evidence](us1.md). CSS viewport/DPR and complete native matrix remain unmeasured/open.

| Done | Gate / procedure                           | Owner | Requirements                   | Status | Actual / evidence / reviewer / date                                                         |
| ---- | ------------------------------------------ | ----- | ------------------------------ | ------ | ------------------------------------------------------------------------------------------- |
| [ ]  | native-firefox-desktop-entry               | T058  | FR-001, FR-002, QR-001, QR-002 | OPEN   | Partial native review; full matrix OPEN / [US1](us1.md) / implementation agent / 2026-10-06 |
| [ ]  | native-firefox-desktop-events              | T058  | FR-003, FR-004, FR-006         | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-encounters          | T078  | FR-003, FR-004                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-relics              | T093  | FR-005, FR-006                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-item-actions        | T093  | FR-005, FR-014                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-progression         | T058  | FR-004                         | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-reset               | T093  | FR-004, FR-005, FR-012         | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-menu-copy           | T058  | FR-001, FR-002, FR-015         | OPEN   | Partial native review; full matrix OPEN / [US1](us1.md) / implementation agent / 2026-10-06 |
| [ ]  | native-firefox-desktop-keyboard-focus      | T136  | FR-014, QR-001, QR-002         | OPEN   | Partial native review; full matrix OPEN / [US1](us1.md) / implementation agent / 2026-10-06 |
| [ ]  | native-firefox-desktop-touch               | T136  | QR-001, QR-002                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-text-reflow         | T136  | FR-014, QR-001, QR-002         | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-contrast            | T136  | QR-001, QR-002                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-motion-audio        | T136  | QR-001, QR-002                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-local-continue      | T127  | FR-012, FR-013, QR-003         | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-settled-interrupted | T127  | FR-012, FR-013, QR-003         | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-character-exchange  | T126  | FR-012, FR-013, QR-003         | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-storage-recovery    | T127  | FR-013, QR-003                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-hostile-import      | T126  | FR-013, QR-003                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-clipboard-conflict  | T127  | FR-013, QR-003                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-history             | T126  | FR-006, FR-012, FR-013         | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-image-failure       | T109  | FR-013, FR-014                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-external-boot       | T058  | FR-013, QR-002                 | OPEN   | Not performed / — / — / —                                                                   |
| [ ]  | native-firefox-desktop-horror-boundary     | T137  | FR-010, SC-008                 | OPEN   | Not performed / — / — / —                                                                   |

## Native Safari

Environment ID: `safari-desktop`. Installed app metadata read; native interaction not performed. Actual DPR/viewport/input and reviewer/date remain unset.

| Done | Gate / procedure                          | Owner | Requirements                   | Status | Actual / evidence / reviewer / date |
| ---- | ----------------------------------------- | ----- | ------------------------------ | ------ | ----------------------------------- |
| [ ]  | native-safari-desktop-entry               | T058  | FR-001, FR-002, QR-001, QR-002 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-events              | T058  | FR-003, FR-004, FR-006         | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-encounters          | T078  | FR-003, FR-004                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-relics              | T093  | FR-005, FR-006                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-item-actions        | T093  | FR-005, FR-014                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-progression         | T058  | FR-004                         | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-reset               | T093  | FR-004, FR-005, FR-012         | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-menu-copy           | T058  | FR-001, FR-002, FR-015         | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-keyboard-focus      | T136  | FR-014, QR-001, QR-002         | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-touch               | T136  | QR-001, QR-002                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-text-reflow         | T136  | FR-014, QR-001, QR-002         | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-contrast            | T136  | QR-001, QR-002                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-motion-audio        | T136  | QR-001, QR-002                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-local-continue      | T127  | FR-012, FR-013, QR-003         | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-settled-interrupted | T127  | FR-012, FR-013, QR-003         | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-character-exchange  | T126  | FR-012, FR-013, QR-003         | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-storage-recovery    | T127  | FR-013, QR-003                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-hostile-import      | T126  | FR-013, QR-003                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-clipboard-conflict  | T127  | FR-013, QR-003                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-history             | T126  | FR-006, FR-012, FR-013         | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-image-failure       | T109  | FR-013, FR-014                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-external-boot       | T058  | FR-013, QR-002                 | OPEN   | Not performed / — / — / —           |
| [ ]  | native-safari-desktop-horror-boundary     | T137  | FR-010, SC-008                 | OPEN   | Not performed / — / — / —           |

## Android Chrome

Environment ID: `chrome-android`. Physical device and exact build not established. Actual DPR/viewport/input and reviewer/date remain unset.

| Done | Gate / procedure                          | Owner | Requirements                   | Status  | Actual / evidence / reviewer / date |
| ---- | ----------------------------------------- | ----- | ------------------------------ | ------- | ----------------------------------- |
| [ ]  | native-chrome-android-entry               | T058  | FR-001, FR-002, QR-001, QR-002 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-events              | T058  | FR-003, FR-004, FR-006         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-encounters          | T078  | FR-003, FR-004                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-relics              | T093  | FR-005, FR-006                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-item-actions        | T093  | FR-005, FR-014                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-progression         | T058  | FR-004                         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-reset               | T093  | FR-004, FR-005, FR-012         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-menu-copy           | T058  | FR-001, FR-002, FR-015         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-keyboard-focus      | T136  | FR-014, QR-001, QR-002         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-touch               | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-text-reflow         | T136  | FR-014, QR-001, QR-002         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-contrast            | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-motion-audio        | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-local-continue      | T127  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-settled-interrupted | T127  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-character-exchange  | T126  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-storage-recovery    | T127  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-hostile-import      | T126  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-clipboard-conflict  | T127  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-history             | T126  | FR-006, FR-012, FR-013         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-image-failure       | T109  | FR-013, FR-014                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-external-boot       | T058  | FR-013, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-chrome-android-horror-boundary     | T137  | FR-010, SC-008                 | BLOCKED | Not performed / — / — / —           |

## Android Firefox

Environment ID: `firefox-android`. Physical device and exact build not established. Actual DPR/viewport/input and reviewer/date remain unset.

| Done | Gate / procedure                           | Owner | Requirements                   | Status  | Actual / evidence / reviewer / date |
| ---- | ------------------------------------------ | ----- | ------------------------------ | ------- | ----------------------------------- |
| [ ]  | native-firefox-android-entry               | T058  | FR-001, FR-002, QR-001, QR-002 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-events              | T058  | FR-003, FR-004, FR-006         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-encounters          | T078  | FR-003, FR-004                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-relics              | T093  | FR-005, FR-006                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-item-actions        | T093  | FR-005, FR-014                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-progression         | T058  | FR-004                         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-reset               | T093  | FR-004, FR-005, FR-012         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-menu-copy           | T058  | FR-001, FR-002, FR-015         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-keyboard-focus      | T136  | FR-014, QR-001, QR-002         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-touch               | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-text-reflow         | T136  | FR-014, QR-001, QR-002         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-contrast            | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-motion-audio        | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-local-continue      | T127  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-settled-interrupted | T127  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-character-exchange  | T126  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-storage-recovery    | T127  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-hostile-import      | T126  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-clipboard-conflict  | T127  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-history             | T126  | FR-006, FR-012, FR-013         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-image-failure       | T109  | FR-013, FR-014                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-external-boot       | T058  | FR-013, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-firefox-android-horror-boundary     | T137  | FR-010, SC-008                 | BLOCKED | Not performed / — / — / —           |

## iPhone Safari

Environment ID: `safari-iphone`. Physical device and exact engine/build not established. Actual DPR/viewport/input and reviewer/date remain unset.

| Done | Gate / procedure                         | Owner | Requirements                   | Status  | Actual / evidence / reviewer / date |
| ---- | ---------------------------------------- | ----- | ------------------------------ | ------- | ----------------------------------- |
| [ ]  | native-safari-iphone-entry               | T058  | FR-001, FR-002, QR-001, QR-002 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-events              | T058  | FR-003, FR-004, FR-006         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-encounters          | T078  | FR-003, FR-004                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-relics              | T093  | FR-005, FR-006                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-item-actions        | T093  | FR-005, FR-014                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-progression         | T058  | FR-004                         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-reset               | T093  | FR-004, FR-005, FR-012         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-menu-copy           | T058  | FR-001, FR-002, FR-015         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-keyboard-focus      | T136  | FR-014, QR-001, QR-002         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-touch               | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-text-reflow         | T136  | FR-014, QR-001, QR-002         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-contrast            | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-motion-audio        | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-local-continue      | T127  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-settled-interrupted | T127  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-character-exchange  | T126  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-storage-recovery    | T127  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-hostile-import      | T126  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-clipboard-conflict  | T127  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-history             | T126  | FR-006, FR-012, FR-013         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-image-failure       | T109  | FR-013, FR-014                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-external-boot       | T058  | FR-013, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-iphone-horror-boundary     | T137  | FR-010, SC-008                 | BLOCKED | Not performed / — / — / —           |

## iPad Safari

Environment ID: `safari-ipad`. Physical device and exact engine/build not established. Actual DPR/viewport/input and reviewer/date remain unset.

| Done | Gate / procedure                       | Owner | Requirements                   | Status  | Actual / evidence / reviewer / date |
| ---- | -------------------------------------- | ----- | ------------------------------ | ------- | ----------------------------------- |
| [ ]  | native-safari-ipad-entry               | T058  | FR-001, FR-002, QR-001, QR-002 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-events              | T058  | FR-003, FR-004, FR-006         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-encounters          | T078  | FR-003, FR-004                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-relics              | T093  | FR-005, FR-006                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-item-actions        | T093  | FR-005, FR-014                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-progression         | T058  | FR-004                         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-reset               | T093  | FR-004, FR-005, FR-012         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-menu-copy           | T058  | FR-001, FR-002, FR-015         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-keyboard-focus      | T136  | FR-014, QR-001, QR-002         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-touch               | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-text-reflow         | T136  | FR-014, QR-001, QR-002         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-contrast            | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-motion-audio        | T136  | QR-001, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-local-continue      | T127  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-settled-interrupted | T127  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-character-exchange  | T126  | FR-012, FR-013, QR-003         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-storage-recovery    | T127  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-hostile-import      | T126  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-clipboard-conflict  | T127  | FR-013, QR-003                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-history             | T126  | FR-006, FR-012, FR-013         | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-image-failure       | T109  | FR-013, FR-014                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-external-boot       | T058  | FR-013, QR-002                 | BLOCKED | Not performed / — / — / —           |
| [ ]  | native-safari-ipad-horror-boundary     | T137  | FR-010, SC-008                 | BLOCKED | Not performed / — / — / —           |

## Individual art and context obligations

Each row requires the full applicable art-review-matrix from gates.json: all three automated engines and seven native targets, required viewports, 100%/200% text, plus physical viewport/orientations. Attach a separate result for every tuple; no aggregate PASS with missing targets. Known unavailable targets remain BLOCKED. Glyph selectors/measurements are owned by T019; retain null measurements until captured from the immutable baseline. Review originality, coherent direction, identity distinctions, alpha edges, framing, actual-size readability, no container resize, and the accepted horror boundary. Exact PNG/ICO dimensions are in the art inventory. Unused art gets provenance/visual review without a fabricated in-game context.

| Done | Gate | Asset / role | Context | Owner | Status | Actual / evidence / reviewer / date |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [ ] | art-context-001 | `assets/sprites/alfadriel.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-002 | `assets/sprites/ant_queen.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-003 | `assets/sprites/behemoth.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-004 | `assets/sprites/berthelot.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-005 | `assets/sprites/bm-feral.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-006 | `assets/sprites/cerberus_ptolemaios.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-007 | `assets/sprites/da-reaper.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-008 | `assets/sprites/fallen_king.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-009 | `assets/sprites/firelord.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-010 | `assets/sprites/goblin.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-011 | `assets/sprites/goblin_archer.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-012 | `assets/sprites/goblin_boss.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-013 | `assets/sprites/goblin_mage.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-014 | `assets/sprites/goblin_rogue.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-015 | `assets/sprites/hellhound.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-016 | `assets/sprites/icemaiden.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-017 | `assets/sprites/mimic.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-018 | `assets/sprites/mimic_door.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-019 | `assets/sprites/orc_archer.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-020 | `assets/sprites/orc_axe.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-021 | `assets/sprites/orc_mage.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-022 | `assets/sprites/orc_swordsmaster.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-023 | `assets/sprites/skeleton_archer.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-024 | `assets/sprites/skeleton_boss.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-025 | `assets/sprites/skeleton_dragon.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-026 | `assets/sprites/skeleton_knight.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-027 | `assets/sprites/skeleton_mage1.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-028 | `assets/sprites/skeleton_mage2.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-029 | `assets/sprites/skeleton_pirate.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-030 | `assets/sprites/skeleton_samurai.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-031 | `assets/sprites/skeleton_swordsmaster.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-032 | `assets/sprites/skeleton_warrior.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-033 | `assets/sprites/slime.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-034 | `assets/sprites/slime_angel.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-035 | `assets/sprites/slime_boss.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-036 | `assets/sprites/slime_crusader.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-037 | `assets/sprites/slime_knight.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-038 | `assets/sprites/spider.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-039 | `assets/sprites/spider_boss.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-040 | `assets/sprites/spider_dragon.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-041 | `assets/sprites/spider_fire.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-042 | `assets/sprites/spider_green.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-043 | `assets/sprites/spider_red.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-044 | `assets/sprites/spider_spirit.png` | provenance-only, unused | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-045 | `assets/sprites/thanatos.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-046 | `assets/sprites/tiamat.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-047 | `assets/sprites/wolf.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-048 | `assets/sprites/wolf_black.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-049 | `assets/sprites/wolf_boss.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-050 | `assets/sprites/wolf_winter.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-051 | `assets/sprites/zalaras.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-052 | `assets/sprites/zodiac_aries.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-053 | `assets/sprites/zodiac_cancer.png` | combat portrait | T077/T107 | OPEN | Visual acceptance PASS; native matrix execution OPEN / [approval](art-approval-2026-10-07.md) / Project maintainer / 2026-10-07 |
| [ ] | art-context-054 | `assets/icon/favicon.png` | favicon actual decoded size and browser-icon context | T094/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-055 | `assets/icon/favicon.ico` | favicon actual decoded size and browser-icon context | T094/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-056 | `relic:Sword` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-057 | `relic:Sword` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-058 | `relic:Sword` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-059 | `relic:Sword` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-060 | `relic:Axe` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-061 | `relic:Axe` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-062 | `relic:Axe` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-063 | `relic:Axe` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-064 | `relic:Hammer` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-065 | `relic:Hammer` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-066 | `relic:Hammer` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-067 | `relic:Hammer` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-068 | `relic:Dagger` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-069 | `relic:Dagger` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-070 | `relic:Dagger` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-071 | `relic:Dagger` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-072 | `relic:Flail` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-073 | `relic:Flail` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-074 | `relic:Flail` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-075 | `relic:Flail` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-076 | `relic:Scythe` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-077 | `relic:Scythe` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-078 | `relic:Scythe` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-079 | `relic:Scythe` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-080 | `relic:Plate` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-081 | `relic:Plate` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-082 | `relic:Plate` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-083 | `relic:Plate` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-084 | `relic:Chain` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-085 | `relic:Chain` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-086 | `relic:Chain` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-087 | `relic:Chain` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-088 | `relic:Leather` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-089 | `relic:Leather` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-090 | `relic:Leather` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-091 | `relic:Leather` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-092 | `relic:Tower` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-093 | `relic:Tower` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-094 | `relic:Tower` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-095 | `relic:Tower` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-096 | `relic:Kite` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-097 | `relic:Kite` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-098 | `relic:Kite` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-099 | `relic:Kite` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-100 | `relic:Buckler` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-101 | `relic:Buckler` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-102 | `relic:Buckler` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-103 | `relic:Buckler` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-104 | `relic:Great Helm` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-105 | `relic:Great Helm` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-106 | `relic:Great Helm` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-107 | `relic:Great Helm` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-108 | `relic:Horned Helm` | reward | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-109 | `relic:Horned Helm` | inventory list | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-110 | `relic:Horned Helm` | equipped button | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-111 | `relic:Horned Helm` | item detail | T092/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-112 | `symbol:title` | title screen | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-113 | `symbol:HP` | main stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-114 | `symbol:HP` | bonus stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-115 | `symbol:HP` | allocation | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-116 | `symbol:attack` | main stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-117 | `symbol:attack` | bonus stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-118 | `symbol:attack` | allocation | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-119 | `symbol:defense` | main stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-120 | `symbol:defense` | bonus stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-121 | `symbol:defense` | allocation | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-122 | `symbol:attack speed` | main stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-123 | `symbol:attack speed` | bonus stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-124 | `symbol:attack speed` | allocation | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-125 | `symbol:vampirism` | main stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-126 | `symbol:vampirism` | bonus stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-127 | `symbol:critical rate` | main stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-128 | `symbol:critical rate` | bonus stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-129 | `symbol:critical damage` | main stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-130 | `symbol:critical damage` | bonus stats | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-131 | `symbol:treasure` | treasure chamber | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-132 | `symbol:treasure` | chest event | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-133 | `symbol:currency` | player header | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-134 | `symbol:currency` | combat reward | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-135 | `symbol:currency` | exploration reward | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-136 | `symbol:currency` | offering | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-137 | `symbol:currency` | sale controls | T019/T102/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-138 | `fallback` | portrait box | T098/T107 | OPEN | Not performed / — / — / — |
| [ ] | art-context-139 | `fallback` | small symbol box | T098/T107 | OPEN | Not performed / — / — / — |

## Completion rule

T136 owns native interaction; T137 owns final narrative/art review; T138 owns CI enforcement; T139 joins automated/manual/art/performance evidence. Resolve every finding and populate structured results before running the later `validate:evidence` tool. No row is accepted merely because this workbook exists.

## Phase 4C encounter evidence handoff — 2026-10-07

T076–T078 automated development/agent review is recorded in [us2.md](us2.md).
The [individual creature review](../../art/cosmic-horror/review/encounters.md)
and [final capture index](../../art/cosmic-horror/review/encounters/index.json)
cover all 53 sprites and 936 active portrait contexts. They retain explicit agent
ownership. No human review or native encounter gate above is promoted by these
results; every existing manual/native OPEN/BLOCKED status remains unchanged.
The narrow enlarged-text HP/EXP overlap found during review is fixed with a
red–green regression and recaptured in capture-03. No unresolved agent-observed
creature-art finding remains. Human originality, direction, horror-boundary,
keyboard/touch and native acceptance still require their named execution rows.

## Maintainer artwork approval — 2026-10-07

The [direct maintainer approval](art-approval-2026-10-07.md) supersedes the earlier Phase 4C human-artwork OPEN status for all 53 delivered sprites. Manifest human reviews and existing visual contexts are PASS. Combined art-context rows retain their outstanding native execution status; their human visual acceptance is PASS in both this workbook and `gates.json`. Historical capture and batch records are preserved.

## Phase 5A item boundary handoff — 2026-10-07

[Phase 5A evidence](phase-5a.md) records automated duplicate/stale-action boundary
checks and relic browser journeys. Capacity feedback and stale/repeated sale
callbacks still fail in the live UI; T089 owns the integration. No relic-art,
manual keyboard/focus, native interaction or release row is promoted by this
package. Next authoring package: T082 small-icon pilot.

## Phase 5C relic presentation — 2026-10-07

[US3 evidence](us3.md) records the integrated item controls, all 84 category/rarity
journeys, duplicate/stale/bulk transaction safety, reset retention, 200% text,
keyboard focus/cancel/return, and automated WCAG checks. [Relic review](../../art/cosmic-horror/review/relics.md)
records the agent's actual-size assessment and exact inspected scope. These are
automated browser/agent visual results. Human artwork approval, human manual
keyboard review and native/physical-device execution remain OPEN/BLOCKED; the
2026-10-07 maintainer approval for 53 creature sprites does not cover these relics.
Full-collection absolute-coordinate comparison and native baselines remain OPEN
for US4 qualification. No release, timing, CI or native gate is promoted here.

## Phase 6A art-production review — 2026-10-07

Implementation-agent review PASS for T094–T098 only: twelve original masters, thirteen delivered files, isolated measured symbol sizes and small/large fallback proofs. [Phase 6A evidence](phase-6a.md) and five batch reviews identify the actual inspected sheets and findings. The automated matrix covers 486 symbol tuples; favicon/fallback fixtures have three engine captures each. This is not maintainer artwork acceptance, native browser-tab behavior, live symbol geometry, image-error control testing, physical-device or release acceptance. Those obligations retain their existing OPEN/BLOCKED status. No human approval was inferred from prior creature acceptance.

## Phase 6C integration review — 2026-10-07

[Phase 6C evidence](phase-6c.md) owns the ten-role/27-context symbol integration,
geometry comparisons and automated engine captures. Agent screenshot inspection
is limited to the named samples in that report; it does not establish human
artwork approval or manual keyboard/device acceptance. Narrow-view stat text
clipping and awkward allocation-label wrapping remain visible in fixture
captures and require full-journey reflow review; symbol footprint checks do not
certify those text layouts. No human/native, performance, manifest or release
gate is promoted by this package.

## Complete artwork approval — 2026-10-07

The maintainer's [complete collection approval](art-approval-2026-10-07-complete.md)
closes human visual acceptance for all 80 delivered art files, including the
relics, remaining symbols, favicons and fallback. T107 is complete; all per-entry
manifest human reviews and all 139 art-context human acceptance fields are PASS.
This supersedes earlier human-artwork OPEN statements in this workbook and the
historical package reports. It does not assert native/device execution, approve
narrative text, resolve technical context findings or close release gates.
T108's artwork-regeneration portion needs no action; context fixes remain open.

## Phase 6D automated integration and sampled review — 2026-10-07

Image-failure journeys now exercise actual combat, Claim, inventory, equip,
unequip and sale with delayed/missing/corrupt art and unavailable fallback.
Agent visual review found and corrected stat clipping/split abbreviations and
allocation wrapping at enlarged text. These are automated engine checks and
sampled agent review, not execution of the native procedures above.

All 80 artwork approvals remain unchanged. No regeneration was required.
[US4](us4.md) and [decoded/context audit](art-automated.json) record automated
outcomes and capture links. Exact pre-theme absolute positions, native targets,
favicon browser chrome, target-specific fallback review and release gates stay
OPEN/BLOCKED. No native/manual checkbox is closed by this package.
