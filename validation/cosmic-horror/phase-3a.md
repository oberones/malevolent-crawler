# Phase 3A — Narrative catalog and coverage

Date: 2026-10-06. Owner/reviewer: implementation agent. Scope: T047–T049.
Environment: nvm Node 24.21.0/npm 12.2.0 and the installed pinned Playwright engines.

## Delivered boundary

`assets/js/content/messages.mjs` supplies 104 immutable message definitions,
exact parameter schemas, validated text formatting and safe-renderer templates.
The setting guide now records all seven skill aliases and their unchanged effects;
Rampager remains historical compatibility vocabulary, not an added selectable skill.
The registry covers entry, events/choices, combat/rewards, upgrades, resets,
inventory, menus, help, descriptions and accurate current third-party credits.
Costs and consequences stay explicit; player names and fractional rewards are
preserved. Unknown IDs, extra/missing fields and invalid identities are rejected.
Templates produce text descriptors, never HTML, and consume no gameplay randomness.

No classic application script, HTML, CSS, asset, dependency, lockfile or baseline
was changed. The private package's ignore files and ESLint ignore scope remain
adequate; no publishing, Docker, Terraform or Helm ignore file applies.

## Verification and expected red handoff

- T047: the importable empty registry seam produced 14 intended assertion failures
  and one passing rejection check. The failures were missing narrative coverage,
  skill effects, formatting and immutability coverage, not missing imports.
- T049: the completed registry passes 17 focused unit tests. The complete unit
  suite passes 2,382 tests, including the existing candidate/frozen rule replays.
- T048: 46 deterministic browser cases cover entry/allocation, event branches and
  choices, offerings, both mimic triggers, guardian floor transition, the deep
  presence, five uneventful outcomes, seven stat bonuses, victory/defeat return,
  two rerolls, inventory/menu/abandonment and help/credits access.
  These are acceptance tests for Phase 3B and remain actively failing on old copy
  and absent informational controls. They are not skipped or expected-failure
  annotated. Full browser/CI success is not claimed at this package boundary.
- Event cases compare the complete player/dungeon/enemy outcome and consumed RNG
  tape against frozen fixtures before asserting theme. Only narrative backlog and
  derived display percentages are excluded from state comparison. Internal rule
  aliases, numeric values, inventories and event flags remain compared.
- Real-DOM narrative rendering checks hostile player text, catalog identities,
  fractional values and rejection of invalid references through the existing
  safe renderer. Native/manual narrative acceptance remains OPEN.

Final command: `npx playwright test tests/browser/setting-journeys.spec.mjs
tests/integration/narrative-render.spec.mjs --workers=3 --trace=off`.
Result: **138 intended narrative failures** (46 in each engine), **3 safe-renderer
passes**, and **zero unexpected errors**. All reached numerical/RNG assertions
passed. [Case-by-case results](phase-3a-browser.json) record the outcomes;
`reports/phase-3a-browser.txt` retains the full output. `npm run lint`,
`npm run format:check` and `git diff --check` pass. Build remains N/A.

The first browser attempt was blocked by localhost sandbox EPERM; it is not a
behavioral red. The initial journey draft also had two test setup mistakes:
allocation starts at five points per stat (one HP increment shows six), and the
terminal combat fixture must explicitly display its panel before clicking. Those
were corrected without changing application behavior. The terminal fixture also
needed the frozen resting dungeon instead of active-save generation multipliers.
A cross-engine test-clock race was removed using a fixed clock and future pause
point, and terminal controls use native Enter activation. The final run contains
no timeouts, trace errors or numerical mismatches. A broad positive text check
was tightened so the old phrase “treasure chamber” cannot satisfy the new theme.

## Handoff

Phase 3B (T050–T053) must wire these catalogs into existing screens and make the
setting journeys green. Preserve the exact skill/rule tokens and use text nodes or
`createSafeRenderer`; never insert `messageText` output into HTML. Costs come from
the existing engine rather than a second formula in the catalog. The credits/art
status currently describe retained originals and unfinished replacement art; update
only when corresponding delivery evidence exists.

Phase 3A is a catalog/test package, not a completed narrative MVP or accepted
release. Accessibility, full history migration, replacement art, native/device
review, candidate performance and required CI enforcement remain OPEN/BLOCKED.
No optional commit hook or commit was executed.
