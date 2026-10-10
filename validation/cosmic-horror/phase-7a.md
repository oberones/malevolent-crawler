# Phase 7A — Legacy presentation migration and history

Date: 2026-10-07 (America/New_York). Owner/reviewer: implementation agent.
Tasks T110–T113: PASS for the automated development environment. Native/manual,
physical-device and release acceptance are not claimed. Next package: Phase 7B,
T114–T117; no character exchange or continuation work was started.

## Delivered behavior

- `legacy-migration.mjs` validates detached legacy/current candidates and derives
  catalog encounter/variant references without changing authoritative aliases,
  HP, stats, inventory sequence, duplicate holdings, progression or rewards.
  Migration consumes no RNG and performs no reset or writes.
- `legacy-history.mjs` recognizes all 30 persisted dungeon event templates,
  including seven blessing outcomes, and complete reward panels across all
  14 categories and six rarities. Patterns match the complete frozen template;
  no HTML parser, evaluation, broad replacement or arbitrary URL is involved.
  Existing valid typed messages preserve player text exactly. Combat timer/log
  reconstruction is out of scope because legacy combat logs were not persisted.
- Historical amounts such as `1.23k` remain displayed text rather than invented
  precision. Reward panels carry displayed rarity/category/level/tier/stat values,
  without inventing a sale value or constructing/awarding an equipment instance.
- All history stays in sequence; the existing UI still displays the last 50.
  Unknown strings or unknown typed records become neutral `history.unavailable`
  notices with opaque references. A keyboard-operable recovery button reveals
  the exact original entry as selectable text and never interprets its markup.
- Both four-key reads and earlier canonical snapshots receive pure mapping.
  Legacy source bytes are untouched. Optional `historyRecovery` metadata is
  carried in the v1 envelope outside engine state, so original entries survive
  more than one backup rotation. Unsupported canonical versions still stop
  loading/autosave rather than falling back to older legacy keys.
- A red regression exposed incomplete early-shaped tuples with evidence of an
  existing run. Defaulting now requires supplied dungeon/enemy sections to match
  known initial sections before either missing run section can be invented.
  Legitimate early defaults, inactive victory/death, active-terminal recovery,
  and exact mage variant mapping remain covered by the frozen 19-case corpus.

## Verification and evidence

Environment: Node 24.21.0/npm 12.2.0, local macOS, pinned Playwright 1.63.0
Chromium/Firefox/WebKit. Functional browser checks used offline fixtures and the
managed local server. The sandbox denied localhost listening (`listen EPERM`);
these checks then ran successfully in the permitted execution context. That
setup failure is not TDD red.

| Check                                  | Result                                     | Evidence                                                      |
| -------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| Requirements checklist                 | 16/16 PASS                                 | `specs/001-cosmic-horror-refactor/checklists/requirements.md` |
| T110/T111 initial assertions           | 6 intended failures, 1 existing guard pass | [unit red](reports/phase-7a/unit-red.txt)                     |
| Partial early tuple regression         | Intended assertion failure                 | [defaults red](reports/phase-7a/partial-defaults-red.txt)     |
| Live recovery control regression       | 1 intended failure, 1 renderer pass        | [browser red](reports/phase-7a/browser-red.txt)               |
| Focused migration/history/store/schema | 55 PASS                                    | [scoped green](reports/phase-7a/unit-scoped-green.txt)        |
| Complete unit suite                    | 2,547 PASS                                 | [unit green](reports/phase-7a/unit-green.txt)                 |
| History/narrative/safe renderer        | 24 PASS, three engines                     | [browser green](reports/phase-7a/browser-green.txt)           |
| Boot/transitions/narrative integration | 57 PASS, three engines                     | [integration green](reports/phase-7a/integration-green.txt)   |
| Repository lint                        | PASS                                       | [lint](reports/phase-7a/lint-green.txt)                       |
| Repository formatting                  | PASS                                       | [format](reports/phase-7a/format-green.txt)                   |
| Production build                       | N/A                                        | Static delivery; no configured build                          |

Commands, with the pinned runtime on PATH:

```sh
node --test tests/unit/legacy-migration.test.mjs tests/unit/legacy-history.test.mjs
node --test tests/unit/legacy-migration.test.mjs tests/unit/legacy-history.test.mjs tests/unit/snapshot-store.test.mjs tests/unit/save-validation.test.mjs
npm run test:unit
npx playwright test tests/browser/legacy-history.spec.mjs tests/browser/narrative-integration.spec.mjs tests/integration/safe-render.spec.mjs --workers=2
npx playwright test tests/integration/bootstrap.spec.mjs tests/integration/transition-commits.spec.mjs tests/integration/narrative-render.spec.mjs --workers=2
npm run lint
npm run format:check
git diff --check
```

The first green diagnostic found an incorrectly abbreviated boss alias in the new
fixture; the frozen catalog establishes `Nameless Fallen King`. Correcting that
fixture resolved the mismatch. Initial lint found one redundant test global
annotation; removing it resolved lint. Both diagnostic outputs are retained.
Reward coverage was expanded to 84 independently generated panels before the
final complete unit run.

## Review and limits

Self-review checked function-purpose comments/JSDoc, exact template anchoring,
text-only rendering, stage defaults, idempotence, raw source preservation through
successful and failed writes, zero RNG, and unchanged legacy rule comparisons.
No dependencies, art assets, baseline captures, numerical rules or intervals were
changed. Existing Git/ESLint/Prettier ignores cover this work; this private static
package needs no npm publication ignore. No Docker, Terraform or Helm setup is
introduced. Optional commit hooks were not run; no commit was created.

The full browser suite, candidate performance, remote CI, native desktop/mobile
and later US5 acceptance were not rerun or claimed by this bounded package.
Raw recovery metadata uses the existing snapshot resource budgets; oversized
commits remain unsaved with originals retained, rather than silently truncating
history. Full recovery/import/resume qualification belongs to T114–T128.
