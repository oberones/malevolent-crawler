# Existing lint and formatting debt

Recorded 2026-10-06; owner T005 inventory, T046 remediation after characterization. No gameplay source was changed or rule blanket-disabled to obtain a green result.

`npm run lint` currently fails on the following existing classic-script findings. The explicit declaration inventory models cross-tag dependencies while keeping undeclared writes, local unused variables, equality, empty catches and const suggestions visible. Every file/line/rule/message is preserved in [eslint.json](reports/eslint.json).

| File                   | Errors | Rule counts                                                                                                 |
| ---------------------- | -----: | ----------------------------------------------------------------------------------------------------------- |
| assets/js/combat.js    |     30 | no-implicit-globals: 5, no-undef: 11, prefer-const: 14                                                      |
| assets/js/dungeon.js   |     37 | eqeqeq: 18, no-implicit-globals: 2, no-undef: 2, no-unused-vars: 1, prefer-const: 14                        |
| assets/js/enemy.js     |     28 | eqeqeq: 24, no-useless-assignment: 1, prefer-const: 3                                                       |
| assets/js/equipment.js |    102 | eqeqeq: 44, no-implicit-globals: 10, no-undef: 22, prefer-const: 26                                         |
| assets/js/main.js      |     95 | eqeqeq: 17, no-implicit-globals: 1, no-undef: 19, no-unused-vars: 1, no-useless-escape: 2, prefer-const: 55 |
| assets/js/music.js     |      3 | eqeqeq: 1, no-implicit-globals: 1, no-undef: 1                                                              |
| assets/js/player.js    |     20 | eqeqeq: 1, no-empty: 1, no-unused-vars: 1, prefer-const: 17                                                 |
| assets/js/utility.js   |      3 | prefer-const: 3                                                                                             |

Total: **318 errors**. New setup config and tests have no lint findings. The owner-declaration false positives were removed by correct scopes and a regression test, not suppressed. Runtime implicit globals/timers, coercive comparisons and silent catch paths require T015–T017/T043 characterization or regression tests before T046 fixes. Do not apply an uncharacterized auto-fix to legacy behavior.

`npm run format:check` is also currently FAIL. The following untouched files differ from the configured format; vendor/minified code, Spec Kit/tool directories, immutable source fixtures and raw reports are excluded. Modified/new setup files and edited setup documentation have been formatted. Full source/design normalization belongs to T046 and must remain distinguishable from behavioral edits.

| Formatting finding                                                | Owner |
| ----------------------------------------------------------------- | ----- |
| `AGENTS.md`                                                       | T046  |
| `assets/css/style.css`                                            | T046  |
| `assets/js/combat.js`                                             | T046  |
| `assets/js/dungeon.js`                                            | T046  |
| `assets/js/elements.js`                                           | T046  |
| `assets/js/enemy.js`                                              | T046  |
| `assets/js/equipment.js`                                          | T046  |
| `assets/js/main.js`                                               | T046  |
| `assets/js/music.js`                                              | T046  |
| `assets/js/player.js`                                             | T046  |
| `assets/js/utility.js`                                            | T046  |
| `index.html`                                                      | T046  |
| `specs/001-cosmic-horror-refactor/art-inventory.md`               | T046  |
| `specs/001-cosmic-horror-refactor/checklists/requirements.md`     | T046  |
| `specs/001-cosmic-horror-refactor/contracts/content-and-art.md`   | T046  |
| `specs/001-cosmic-horror-refactor/contracts/persistence.md`       | T046  |
| `specs/001-cosmic-horror-refactor/contracts/player-experience.md` | T046  |
| `specs/001-cosmic-horror-refactor/data-model.md`                  | T046  |
| `specs/001-cosmic-horror-refactor/plan.md`                        | T046  |
| `specs/001-cosmic-horror-refactor/spec.md`                        | T046  |

Ignore verification: Git repository confirmed. `.gitignore` now covers dependencies, build/test/cache output, secrets/environment files and editor/OS noise. Flat ESLint ignores and Prettier ignores cover owned-tool/vendor/generated-evidence exclusions. `package.json` is private, so `.npmignore` is N/A. No Docker build context/Dockerfile, Terraform files or Helm chart exists; their ignore files are N/A. CI uses a prebuilt container, not a Docker build.
