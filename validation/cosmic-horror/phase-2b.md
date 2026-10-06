# Phase 2B — Protected rules and rendered baseline

Date: 2026-10-06. Owner/reviewer: implementation agent. Scope: T015–T019. Runtime: Node 24.21.0/npm 12.2.0 on the recorded macOS environment. Original source revision: `3cfaf54babae978c7388c023f5df5ebe6282259b`.

This package completes automated characterization and baseline capture. It does not change shipped gameplay or art and does not establish native, accessibility, art-quality, performance or release acceptance. The initial workspace already contained partial Phase 2B fixtures and capture code; this run reviewed and completed them without replacing the frozen original source/assets.

## Protected rules

- T015: 126 captured encounter/combat cases, 15 ordered archetype/condition pools, 51 identities and 52 active variants including both Skeleton Mage draws, both mimics' discarded draws, scaled enemies, guardian advancement and attacks. Separate assertions verify initial attack delays and complete random-tape consumption.
- T016: 858 equipment cases cover every category and rarity, numeric stat/value rolls, probability boundaries, level/tier caps, six-slot refusal, duplicates, aggregation, movement, filters and sale proceeds. Every captured case replays against the frozen engine. Review corrected inaccurate supplemental assertions: exact 0.94/0.97/0.99 draws yield Rare/Epic/Legendary, and floor 20 with the minimum draw yields level 96; floors 21/100 cap at 100. The original fixtures and formulas were retained.
- T017: 134 progression cases cover exploration branches/choices, costs, blessings, curse/door/chest outcomes, allocation/skills, experience, death/victory, import cancellation/confirmation and reset/retention. Ten additional real-DOM scenarios per engine cover all seven upgrade bonuses, three visible choices, duplicate stat draws, two rerolls and denied third reroll, another earned level's refreshed rerolls, and confirmed/cancelled abandonment with six equipped items and duplicate holdings. The VM intentionally does not pretend to parse recreated controls or listeners.

Characterization protects numerical behavior. Known unsafe persistence, eager initialization, stale callbacks and lifecycle defects remain assigned to later implementation packages; they are not requirements to preserve. Browser control characterization is automated patch-engine evidence, not native/manual acceptance.

## Symbol measurements

T018/T019 provide a tested geometry helper and 111 distinct original contexts spanning 24 roles: six placements for each of 14 item categories, main/bonus/allocation stats, title, treasure, and currency in headers/rewards/offerings/sale controls. The accepted capture has **1,998 measurements and screenshots**: 111 contexts × three engines × three viewports × two text scales. Actual versions match environment.json: Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6, DPR 1.

[Baseline index](../../art/cosmic-horror/baseline.json) retains the original 55 asset records and appends accepted geometry, screenshot hashes, environment/source references and 4,662 explicitly BLOCKED native tuples. Only `art/cosmic-horror/review/baseline/capture-04/` is authoritative for automated geometry. Each measurement records its box, margins/padding, line height, alignment, inline baseline offset, font family/size/status, browser, viewport and scale. Evidence integrity tests verify complete coverage, versions, unique keys and screenshot hashes.

Required local RPGAwesome/Font Awesome faces load before measurement. External title fonts and analytics are blocked consistently, so the title uses its local fallback. The fixture doubles captured computed font sizes at unchanged viewport dimensions, freezes timers, mutes one reused audio set, resets modal dimming, and disables CSS transitions/animations before measuring. This is a static geometry policy, not browser zoom or a performance workload. Candidate comparison must use the same policy. No shipped source/CSS was changed for capture.

Review found and repaired flex-column baseline probes, invisible-symbol acceptance, repeated audio allocation, transition-driven text-scaling drift and cross-scenario dimming. Regression failures precede the fixes; see [TDD record](tdd.md). WebKit's hidden dungeon reports unscaled computed values on the title screen, so the size sentinel checks only the visible dungeon; title glyph measurement remains required. Prior interrupted/unindexed captures, `verified/`, and `capture-03/` are retained diagnostic attempts and **must not be used for comparison**. Their reports document why they were superseded; accepted baseline files use exclusive creation.

Spot review covered title, 200% main stats, offering, sale and combat reward captures across the engines. The original small-screen layout clips some enlarged text; this is recorded legacy behavior, not an accessibility pass. Later scoped UI work must address wrapping separately from symbol footprint preservation. No new-art visual review is marked complete.

## Validation

| Check                                                                            | Result                                                                                                                     |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`                                                              | PASS: 1,161 tests, no failures/skips; [output](reports/phase-2b-unit.txt)                                                  |
| `npm run test:integration -- --workers=3`                                        | PASS: 78 cases across three engines; [output](reports/phase-2b-integration.txt), [JSON](reports/phase-2b-integration.json) |
| `npm run test:browser -- --workers=3`                                            | PASS: 18 existing smoke/input cases; [output](reports/phase-2b-browser.txt)                                                |
| Capture command in tdd.md                                                        | PASS: 18 matrices / 1,998 screenshots; [output](reports/t019-accepted-capture.txt)                                         |
| Scoped ESLint (`tests/helpers tests/unit tests/integration`)                     | PASS; [output](reports/phase-2b-lint.txt)                                                                                  |
| Scoped Prettier check on all Phase 2B code, fixtures, baseline and documentation | PASS; [output](reports/phase-2b-format-check.txt)                                                                          |
| `npm run lint`                                                                   | FAIL: 318 existing classic-code findings, unchanged from Phase 2A; [output](reports/phase-2b-full-lint.txt)                |
| `npm run format:check`                                                           | FAIL: 20 existing untouched files; [output](reports/phase-2b-full-format.txt)                                              |
| `git diff --check`                                                               | PASS                                                                                                                       |
| Native baselines                                                                 | BLOCKED: 4,662 required tuples; original/candidate target matching is mandatory                                            |

Ignore-file verification found existing Git/Prettier/ESLint exclusions cover the installed Node setup and frozen/generated evidence. The package is private, so npm publication ignores are N/A; there are no Docker/Terraform/Helm deliverables in this package. No ignore file needed changing.

Final commands and results are linked in the companion reports. Required repository-wide lint/format debt remains separate from clean scoped additions. No dependency changed; Phase 1's install/audit evidence is historical, not rerun here. Production build is N/A for the static application. Native baselines require actual devices/browser builds/DPR and matched measurements before their candidate qualification; automated engine runs cannot close those rows.

## Handoff

Continue with **Phase 2C, T020–T024**, the shared setting and immutable identity catalogs. As required by the task document's package boundary, this session stops after 2B. Preserve the source, original asset hashes and accepted `capture-04` evidence. Native/device, performance, story, final art, remote CI and merge-enforcement gates remain unresolved. Optional commit hooks were not executed.
