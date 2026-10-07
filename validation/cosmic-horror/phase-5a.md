# Phase 5A — Item boundary and stale-action protection

Date: 2026-10-07. Owner/reviewer: implementation agent. Scope: T079–T081.
Environment: Node 24.21.0/npm 12.2.0; pinned Playwright Chromium, Firefox and WebKit.

## Delivered

- T079: 13 unit tests cover duplicate encoded inventory and object-equipped
  holdings; collection/index/render-revision binding; changed/replaced/reordered
  state; forged and repeated handles; six-slot capacity; all 84 category/rarity
  combinations; single and filtered bulk sales; reverse-order unequip-all;
  unchanged unmatched bytes; invalid-data atomicity and empty collections.
- T080: Eight browser acceptance journeys cover all 84 deterministic item rolls
  and their full RNG tapes, reward/log/list/detail/confirmation names and equipped
  accessible names; equip/unequip/sale numerics; duplicates, unequip-all, rarity
  filters, cancellation and empty states; combat Claim without another grant;
  death, abandonment and new-run retention. New-run additionally exercises title
  entry and allocation confirmation. The 84-case matrix dispatches real DOM
  handlers programmatically; representative journeys use Playwright clicks.
  These are automated checks, not manual keyboard/touch acceptance.
- T081: `assets/js/app/item-actions.mjs` supplies an independently tested action
  boundary. It mutates only engine-owned holdings and sale gold; it owns no
  RNG, DOM, persistence, stat calculation or timers. Shared validators check
  selected items before destructive operations. It preserves duplicates,
  string/object representation, six slots, reverse unequip-all ordering and
  original-order sale arithmetic. Stale actions request a fresh view without
  changing holdings or gold.

## Integration contract and handoff

Phase 5C T089 owns wiring this boundary into the actual item controls through the
existing transition coordinator. **The live UI still uses its previous handlers.**
The module alone does not fix those handlers or close US3 acceptance.

Construct one action service per live item-view owner with `getPlayer` and
`rerender` callbacks. Call `beginRender()` once for a coherent item-view revision;
use its returned factory to bind `inventory` or `equipped` plus the original
index. A null index binds a bulk confirmation. Preserve the original handle
through details and confirmation, then call `execute(handle, action, rarity)`
inside `runGameplay`. On success refresh derived stats/views and request the
existing completed-transition save. Show `capacity`/`empty` failures in the view;
a `stale` rejection must dismiss stale controls and render current collections.

Every external holdings mutation/reset/import must invalidate the view by calling
`beginRender`, including removing and replacing identical inventory strings.
Legacy strings have no instance ID, so an identical remove/reinsert cannot be
detected from bytes alone. The boundary additionally detects current byte,
object-order, array-owner and player-owner changes without relying on a render.
No UUID or save-format change is introduced. New views and successful mutations
invalidate all older handles; capacity/invalid requests do not mutate state.

Two intended T080 failures remain assigned to T089 (with item feedback/focus
qualification in T090–T093):

1. A full loadout refuses the seventh item but supplies only sound, without
   visible capacity feedback.
2. A retained sale callback can sell the next duplicate after a list change, and
   invoking the same confirmation twice sells another holding and credits gold
   again. The boundary rejects both; the UI has not yet been connected to it.

These tests remain ordinary failing assertions, not skipped or expected-failure
markers. The full browser gate is therefore red until later integration.

## Red–green and verification

| Command                                                                                                                                          | Actual result                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `node --test tests/unit/item-actions.test.mjs` against the documented interface seam                                                             | 13 intended assertion failures; no missing import/syntax failures                          |
| Same command after implementation                                                                                                                | 13 passed                                                                                  |
| `npm run test:unit` after formatting/refactor                                                                                                    | 2,452 passed; zero failures/skips                                                          |
| `npx playwright test tests/browser/relics.spec.mjs --workers=3 --trace=off`                                                                      | 18 passed, six intended failures: capacity feedback and stale/repeated sale in each engine |
| `npx playwright test tests/browser/relics.spec.mjs --grep 'retention after new-run' --workers=3 --trace=off` after extending allocation coverage | 3 passed                                                                                   |
| `npm run lint`                                                                                                                                   | PASS                                                                                       |
| `npm run format:check`                                                                                                                           | PASS                                                                                       |
| `git diff --check`                                                                                                                               | PASS                                                                                       |
| Production build                                                                                                                                 | N/A: static application                                                                    |

Raw outputs: `reports/phase-5a-*.txt`. The initial server attempt failed with
sandbox `listen EPERM`; this was not behavioral red and the tests were rerun with
permitted loopback access. The first Chromium diagnostic also contained two test
assumptions: empty copy was asserted as “No relics” instead of the existing
“No recovered relics”, and icon-only equipped controls were incorrectly required
to contain visible label text despite already exposing the themed accessible
name. Both expectations were corrected to the existing contract; neither is
counted as application red. All 84 rolls and transaction assertions then passed.
The final red report isolates only the two genuine integration gaps above.

Self-review checked public contracts, purpose comments, mutation ordering,
invalid-data refusal, duplicates, stale callbacks and scoped task ownership.
Ignore files already cover the detected private static Node project; no publishing,
Docker, Terraform or Helm ignore file is needed. No dependency/configuration,
classic gameplay, generated art, baseline or save-format change was made.

## Remaining work

T079–T081 are complete as the independent boundary/test package. Next is Phase 5B,
starting with T082's small-icon pilot. Phase 5C connects the service and makes the
new UI assertions green. Native/manual, icon-art, performance, remote CI and
release gates remain OPEN/BLOCKED; no full US3 or release acceptance is claimed.
The optional git commit hooks were not executed.
