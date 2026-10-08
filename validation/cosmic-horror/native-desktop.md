# Native desktop qualification — Phase 8

Date: 2026-10-08. Reviewer: Codex agent using native macOS UI through CUA.
Overall T135 status: OPEN/BLOCKED; the limited checks below do not complete the
required matrix or establish human accessibility acceptance.

[Installed version evidence](reports/phase-8/native-environment.json): macOS
26.6.2 build 25G83; Firefox 157.0.1 build 15726.10.5; Safari 26.6.2 build
21624.5.1.11.3. Google Chrome is absent from `/Applications`. Firefox has advanced
from the planned 157.0 target; this run is explicitly on 157.0.1.

## Firefox observed checks

A new private window at `http://127.0.0.1:4173/` isolated synthetic character
`NativeKeeper` from normal profile saves. Actual keyboard and pointer actions:

1. Entered the name, Tab to Confirm, Return. The title appeared.
2. Tab/Return on the title opened Sounding Preparation with focus on Close.
3. Escape returned to the title and restored focus to its action.
4. Reopened, increased HP once and confirmed. Dungeon displayed HP 300/300.
5. Opened Inventory: explicit empty inventory/equipment and disabled sale/unequip.
6. Opened Menu → Export/Import: selectable `MC1:` text, Copy, download and import.
7. Increased browser page zoom until the actual toolbar displayed **200%**.
   UI screenshot inspection showed wrapped heading and visible controls, with no
   obscured close/import button. This is page zoom, not an isolated 200% text test.
8. Escape restored focus to Export/Import in the menu. Restored 100% and closed
   only the private test window; original browser window remained.

Observed outcomes: PASS for these bounded interactions. Evidence is the live CUA
accessibility/screenshot transcript in the implementation chat; this report records
steps/results. CSS viewport and DPR were not measured, so these results are not
promoted to any required viewport tuple. No audible playback, contrast measurement,
full encounter/relic matrix, reduced-motion or screen-reader acceptance is claimed.

## Safari observed checks

A new private window used synthetic `SafariKeeper`. Initial navigation selected
an autocomplete entry at port 4174 and showed a connection error; explicitly
pasting the verified port 4173 loaded the game. This was navigation setup, not a
product error.

Keyboard Return submitted character creation. Pointer title activation opened
allocation with focus on Close; Escape restored title focus. Return activated the
title again, Confirm entered a resting run showing HP 250/250. Inventory showed
both empty states and disabled sale/unequip controls. Escape returned focus to
Open inventory. The private window was closed, leaving the original Safari Start
Page. These bounded interactions PASS in native Safari; full target tuples,
contrast, zoom, reduced motion, all encounters and recovery remain OPEN.

## Remaining obligations

Complete matched baseline/candidate native context measurements and every target
journey in the validation plan. Required Chrome is BLOCKED by absent installation;
physical devices are tracked separately. Available-browser unperformed checks stay
OPEN. Existing baseline and manual gate statuses are not promoted by this smoke review.
