# Contract: Player Journeys and Presentation

The existing title, character creation, dungeon, combat, inventory, and modal organization stays intact. This contract specifies changes needed for the theme, compatibility, and applicable WCAG 2.2 AA requirements; it does not add gameplay systems.

## Startup and navigation

Initialization loads the ES services and validates state before enabling actions. A loading state is perceivable. Module/state failure replaces the loader with an actionable error in the existing screen/modal structure; it never leaves a blank screen. The title action has semantic button behavior and works with Enter/Space and touch. Existing player names remain unchanged and render as text.

Every changed clickable element becomes a semantic control or receives equivalent semantics only where a native control cannot express it. Close, inventory, equip, sale, menu and title actions have accessible names and visible focus. Opening a modal moves focus to an appropriate heading/control; closing restores the invoking control when it exists. Background interaction is blocked while a modal requires a decision; Escape cancels dismissible dialogs without confirming destructive actions. No keyboard trap is permitted.

## Exploration, combat, and loot

- Names, event messages, art, alt text, and logs resolve through the same catalog. Ordinary encounters, both mimics, guardians, and special bosses retain their selection and numerical behavior.
- Blessing/curse, doors/treasure, uneventful rooms, level-up options/rerolls, run outcomes and voluntary abandonment retain actual effects. Themed wording cannot obscure cost, choice, reward, or reset consequences.
- Enemy portraits retain their display widths and reserved aspect ratio. Image loading may show a themed fallback; actions remain usable. A late image response cannot replace the portrait of a newer encounter.
- Loot retains all 14 categories, six rarity levels, capacity six, effects, sale proceeds and filters. Display the same themed identity in rewards, inventory, equipment, details, confirmations and logs. Preserve duplicate items as separate holdings.
- Rarity/danger/stat meaning is available through labels and structure, not color or sound alone. Decorative repeated artwork has empty alternatives; meaningful unique art has concise text equivalents without redundant announcements.
- Claim closes an already-resolved encounter; presentation rerendering cannot grant rewards. Re-entry starts one timer sequence and cannot trigger a stale attack from a previous battle.

## Error, empty, and recovery states

| State                               | Required player-visible behavior                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Empty inventory                     | Clear empty-state text, reachable menu/close controls, no dead sale/equip action                                  |
| Full loadout                        | Explain six-item capacity and allow normal unequip; no lost or duplicated item                                    |
| Long name / enlarged text           | Wrap or provide full accessible text; no obscured price/stat/control or horizontal overflow                       |
| Missing/corrupt art                 | Stable themed fallback plus readable identity; no blocked combat, inventory action, or recursive fallback failure |
| Invalid/unsupported save or import  | Text explanation and retry/recovery/cancel options; raw/recoverable progress preserved; no silent reset           |
| Storage unavailable/quota           | Visible unsaved state and recovery export; successful persistence never falsely reported                          |
| Import cancellation                 | Original character/run/preferences unchanged; focus returns sensibly                                              |
| Clipboard denied                    | Explain copy failure and keep selectable export text/local download available                                     |
| External font/analytics unavailable | Local fallback font and core play remain usable; no new dependency for art or saves                               |
| Unknown historical log              | Neutral recoverable-history notice; no raw HTML insertion or arbitrary player-name rewriting                      |

Recovery controls live in existing modal/screen regions; no general interface redesign is needed. Destructive reset/replacement still needs its existing explicit player confirmation.

## Motion, audio, responsive behavior

Respect reduced-motion preferences for title/combat/loading/damage motion while preserving visible outcome feedback. Keep mute/volume controls and user-gesture audio startup; reuse/dispose Howler instances so repeated entry and settings changes do not stack playback. Essential information is present when audio is blocked or muted.

Acceptance covers 360 × 800, 768 × 1024, and 1440 × 900 with 100%/200% text, keyboard/pointer and applicable touch. Preserve readable contrast for text, focus and essential symbols. Browser zoom/reflow and manual keyboard checks accompany automation. The [validation plan](../validation-plan.md) defines the real-browser/device matrix; engine emulation alone does not fulfill native acceptance.

## Required journey evidence

New-character entry/allocation; title and continued run; every event type and encounter/variant; every relic category/rarity; claim, inspect, equip, unequip, sell, bulk sale, full loadout; level-up/reroll; defeat/abandon/restart; both local combat continuation and legacy character import; all recovery states above. Automated and manual outcomes are recorded separately with fixture, browser/device, steps, expected/actual result, evidence path, reviewer/date, and PASS/FAIL/BLOCKED/N/A status.
