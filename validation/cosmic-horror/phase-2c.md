# Phase 2C — Shared setting and immutable identity catalogs

Date: 2026-10-06. Owner/reviewer: implementation agent. Scope: T020–T024. Verified runtime: Node 24.21.0/npm 12.2.0. Entry: completed Phase 2A/2B evidence and frozen revision `3cfaf54babae978c7388c023f5df5ebe6282259b`. Readiness checklist: requirements.md, 16/16 complete.

## Delivered contract

[Setting guide](../../art/cosmic-horror/setting-guide.md) establishes **The Bell Beneath Brine**, the coastal settlement of Veyr Quay and its drowned observatory. It defines player role, terms, palette, motifs, credits, all copy surfaces and the agreed horror boundary. Enumerated IDs/names support later story and art work without another creative decision gate. Creature and icon framing remains provisional until the scheduled pilot tasks.

`assets/js/content/` contains literal, deeply frozen setting, encounter, relic and symbol records plus documented public lookups. Counts: 51 active encounters, 52 active portrait variants, one unused required portrait, 14 relics, six unchanged rarities, 24 symbol roles and 111 measured context references. Every portrait retains its exact original path, dimensions and 50%/70% width. The unused portrait has no encounter membership or display width. Both Sounding Vessel (legacy Skeleton Mage) illustrations have independent variant IDs, descriptions and aliases.

Public lookup results are `{ok:true,value}` or `{ok:false,error:{code,kind}}`, deeply frozen. `getEncounter`, `getVariant`, `getRelic`, `getSymbol` and `getRarity` accept only exact IDs or documented legacy aliases. `resolveEncounter(identity,image)` validates the saved pair (including `.png` and display width for legacy image objects); `resolveRelic(key,attribute,type)` checks equipment relationships. `getSymbol(key,contextId)` optionally validates a measured context. Unknown references and mismatches remain explicit errors. No input becomes an arbitrary URL, CSS class or executable markup; catalog text still requires the forthcoming safe renderer.

Catalogs do not import test fixtures, legacy code, browser services or dependencies. Private lookup maps are not exposed; no gameplay draws, formulas or ordered pools move into presentation data. Symbol paths reserve future art delivery and do not claim existing assets or invented original glyph dimensions. No classic application, image, baseline, save fixture, layout or dependency was changed. Modules are ready for downstream services but are not yet loaded by the game.

## Verification

| Check                                                       | Result                                                                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| T021 catalog red                                            | Ten intended assertion failures against minimal interfaces; [output](reports/t021-red.txt)                      |
| T024 catalog green                                          | Ten passing cases; [output](reports/t024-green.txt)                                                             |
| Final `npm run test:unit`                                   | PASS: 1,171 tests, zero failures/skips; [output](reports/phase-2c-unit.txt)                                     |
| `npm run test:browser -- --workers=3`                       | PASS: 18 existing smoke/input cases across Chromium, Firefox and WebKit; [output](reports/phase-2c-browser.txt) |
| `npx eslint assets/js/content tests/unit/catalogs.test.mjs` | PASS; [output](reports/phase-2c-lint.txt)                                                                       |
| Scoped Prettier check of all package code and documentation | PASS; [output](reports/phase-2c-format-check.txt)                                                               |
| `npm run lint`                                              | FAIL: 318 pre-existing classic-code errors, unchanged from Phase 2B; [output](reports/phase-2c-full-lint.txt)   |
| `npm run format:check`                                      | FAIL: 20 untouched files; [output](reports/phase-2c-full-format.txt)                                            |
| `git diff --check`                                          | PASS                                                                                                            |

Tests compare all captured encounter/image tuples, pool eligibility, exact baseline dimensions, category relationships and 111 context IDs. They check unique IDs/aliases/names, plain text, recursive freezing, hostile/unknown references, mismatched pairs, preserved input, and rejection of arbitrary paths/classes. A separate Node process imports the modules with failing RNG/browser/storage/audio/timer/network tripwires, preventing cached imports from hiding initialization effects. Setting-guide/runtime agreement is also asserted. See [TDD record](tdd.md) for the corrected HP-label test expectation and lint review.

The first browser attempt could not bind localhost inside the sandbox; [diagnostic](reports/phase-2c-browser-sandbox.txt). The authorized run with local server access passed. These existing smoke checks establish unchanged boot/input/module serving, not integration of the new catalogs or native gameplay acceptance. Integration suites were not rerun because no DOM/storage/audio implementation or harness changed. New service/UI browser cases remain assigned to later packages. No new dependency was installed; prior install/audit evidence was not rerun. Production build is N/A.

Existing Git/ESLint/Prettier exclusions cover Node outputs, vendor files and immutable/generated evidence; no missing critical ignore pattern was found. Private package publication, Docker, Terraform and Helm ignores are N/A for the verified setup. Self-review covered function comments, public lookup contracts, immutable references, original copy and preserved legacy boundaries. Automated checks do not certify human art review.

## Handoff

T020–T024 are complete. Next is **Phase 2D, T025–T034**, beginning with failing save-validation tests. The task execution contract says to finish one lettered package and hand it off before starting another. Preserve stable IDs and source/baseline bytes. Generated art, story integration, safe save services, native/mobile acceptance, performance and release gates remain OPEN/BLOCKED as previously recorded. Optional pre/post commit hooks were not executed; no commit was made.
