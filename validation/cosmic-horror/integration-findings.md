# Phase 8 integration findings

Date: 2026-10-08. Owners: T129/T130. Candidate: working tree based on
`ea372b73418ddd6af4461b510b9942f073a2f458`; exact runtime hashes accompany performance preparation.

| Finding                          | Reproduction and affected path                                                                                                                       | Resolution                                                                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate terminal rewards       | Resume a legacy encounter, resolve victory, then deliver another terminal check before Claim. `hpValidation` awarded gold and kills again.           | RESOLVED: `assets/js/combat.js` rejects terminal checks once the encounter is inactive. Existing first-resolution formulas and RNG remain unchanged. |
| Stale allocation                 | Retain Confirm, then invoke it twice or after cancel/import. The callback duplicated a passive or mutated the replacement character before throwing. | RESOLVED: `assets/js/main.js` accepts each allocation once and requires its original Confirm node to remain the current control.                     |
| Recovery notice blocks inventory | At 360×800, recover prior-good combat with failed art, Claim and try inventory. The fixed unsaved notice intercepts the button.                      | RESOLVED: `assets/css/style.css` reserves a separate notice row and allows the game region to scroll.                                                |

`tests/browser/full-journeys.spec.mjs` joins fresh creation → allocation → reward
→ equip → save/reload; legacy combat → repeated terminal check → Claim → reload;
import → allocation → abandonment/restart; and unsaved prior-good recovery →
failed portrait → Claim → character export. It checks catalog agreement and no
legacy encounter label on the active combat surface. Existing exhaustive suites
own every identity/variant/category/rarity and all numerical/RNG comparisons.

[Initial intended red](reports/phase-8/red-browser.txt) reproduced the initial three
findings (four failing cases). The fresh-character test initially assumed omitted
zero/default fields were absent from canonical saves; its comparison now allows
the documented canonical defaults while checking every existing field. An invalid
assumption that title copy contains the player's name was also removed. Neither
fixture correction is counted as behavioral red.

The first guard used DOM `isConnected` and a preallocated-state check. The immutable
allocation replay exposed its mismatch with the classic control contract. The
final guard uses one-shot ownership and current-node identity; all 2,554 unit
comparisons pass. [Targeted green](reports/phase-8/green-final.txt): 38 PASS,
one unsupported Firefox touch case SKIPPED across three engines.

A sandbox localhost bind denial in [red.txt](reports/phase-8/red.txt) was an
environment failure; permitted browser execution supplied the actual red/green.
No source baseline or accepted gameplay values were changed.

Full-suite symbol measurement exposed a fixture defect: `renderContext` supplied
a resting player to `hpValidation` to manufacture a victory. Its missing
`player.inCombat = true` now models the active terminal boundary for both the
immutable and candidate engines. This preserves the original geometry oracle and
allows the intentional inactive-combat guard to remain intact.

## Delivered-size review follow-up

The first performance run passed all budgets, but its 360-pixel full-inventory
capture split the short Sell action across two lines. A new line-box assertion
in `full-journeys.spec.mjs` reproduced two lines instead of one
([red](reports/phase-8/sale-label-red.txt)). `#sell-all` now retains its text's
minimum width and does not shrink or wrap beside the rarity filter. This changes
text readability, not art canvas or symbol dimensions. Cross-story, relic
accessibility and collection reflow suites cover the final layout. The final
runtime is measured again; the initial passing performance capture is retained.
