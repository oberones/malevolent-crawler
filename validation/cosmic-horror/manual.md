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

## Artwork approval

The [complete collection approval](art-approval-2026-10-07-complete.md) retains
all 80 accepted paths and hashes. The maintainer retired the 139 legacy art/context
gates on 2026-10-08. Future art does not require comparison to the old artwork.
Non-art native, accessibility, gameplay and recovery checks remain in this workbook.

## Completion rule

T136 owns native interaction; T137 retains narrative review; T138 owns CI enforcement; T139 joins the remaining automated/manual/performance evidence. Artwork acceptance is retained above and legacy art comparisons are retired. Resolve remaining findings and populate structured results before running `validate:evidence`. No row is accepted merely because this workbook exists.

> The phase notes below are historical. Their art-generation, baseline and capture
> references were retired by the [review cleanup](review-cleanup.md).

## Phase 5A item boundary handoff — 2026-10-07

[Phase 5A evidence](phase-5a.md) records automated duplicate/stale-action boundary
checks and relic browser journeys. Capacity feedback and stale/repeated sale
callbacks still fail in the live UI; T089 owns the integration. No relic-art,
manual keyboard/focus, native interaction or release row is promoted by this
package. Next authoring package: T082 small-icon pilot.

## Phase 5C relic presentation — 2026-10-07

[US3 evidence](us3.md) records the integrated item controls, all 84 category/rarity
journeys, duplicate/stale/bulk transaction safety, reset retention, 200% text,
keyboard focus/cancel/return, and automated WCAG checks. The historical relic review (retired with the art artifacts)
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

## Phase 7B automated exchange qualification — 2026-10-07

The [Phase 7B report](phase-7b.md) records safe preview/cancel, transactional
replacement, storage failure/retry/session-only choices and delayed-work cleanup.
An automated 360-pixel real-form journey covers MC1 Unicode text, Escape and focus
return in all three engines. These are automated checks; native/manual, touch,
200% exchange reflow and full US5 acceptance remain OPEN/BLOCKED. No human or
native review is claimed and no manual checkbox changes.

## Phase 7C automated continuation qualification — 2026-10-08

The [Phase 7C report](phase-7c.md) records saved-encounter continuation,
separate run/combat/audio ownership, terminal/reset/import cleanup, full attack
delays, muted gesture startup and stale-control protection. These are automated
Playwright engine checks with controlled clocks and audio observations. No native
browser/device run or audible playback review was performed in this package;
the native local-continue, settled/interrupted and motion/audio rows retain their
existing OPEN/BLOCKED status. Complete US5 recovery remains with Phase 7D.

## Phase 7D / US5 recovery handoff — 2026-10-08

T122–T128 automated evidence and source-preservation semantics are in [US5](us5.md).
Recovery, clipboard, two-tab ownership, keyboard focus/Escape, hostile text and
200% reflow have browser automation coverage. Agent review of the narrow enlarged
recovery captures is recorded there; it is not a new native/manual PASS.
Chromium/WebKit touch emulation passed the confirmation/source-preservation
journey; Firefox hasTouch is unsupported and remains explicitly skipped.

Native Chrome/Firefox/Safari keyboard/pointer and screen-reader checks, physical
Android/iPhone/iPad touch, audible feedback, matched performance and remote CI
remain OPEN/BLOCKED under their existing rows. For the recovery procedure, verify
that raw download retains exact source strings; Cancel/Escape leaves storage alone;
prior-good/retained-character recovery clearly says session-only; unknown history
remains actionable; denied Copy retains selectable/downloadable text; and a second
tab exposes reload/export without merging. Recovered sessions must be exported
before closing the tab because this recovery path does not overwrite originals.

## Phase 8 reconciliation — 2026-10-08

All 80 manifest asset reviews remain PASS under the existing maintainer approval;
this run neither regenerated art nor replaced that review. The current art
validator reports 27 unresolved technical context/geometry obligations (two
favicons, 24 relic/symbol roles and the fallback); see `reports/phase-8/art.txt`.
Earlier PASS artwork review does not close those technical/native obligations.

The integrated current-identity suites exercise all encounters, relics, symbols,
messages and safe historical rendering. Cross-story tests now cover creation,
reward/equip/reload, repeated terminal resolution, import/allocation/restart and
art failure during unsaved recovery. See `integration-findings.md` for fixes and
`automated.json` for exact local outcomes. No gameplay, art or narrative catalog
identity was renamed in this package; credits now reflect the delivered collection.

Bounded native Firefox 157.0.1 and Safari 26.6.2 interactions are recorded in
`native-desktop.md`, including actual focus-return observations. Those checks do
not qualify all required viewport/DPR/contrast/text-scale/motion/mute tuples.
Chrome and physical Android/iPhone/iPad access remain BLOCKED; available-browser
unperformed journeys remain OPEN. Human artwork approval, agent visual inspection,
keyboard automation, native interaction and physical-device acceptance retain
separate ownership. `release.md` is the current release decision.
