# T082 — small-icon pilot and first relic batch

Date: 2026-10-07. Status: PASS for this bounded art-production assignment. Phase 5B, US3 and release acceptance remain OPEN.

## Delivered

- `assets/art/relic-sword.png` — Tideglass Edge.
- `assets/art/relic-axe.png` — Keelcleaver.
- `assets/art/relic-hammer.png` — Sounding Maul.

Each file is a new 128 × 128 transparent PNG, proportionally contained from its separately generated master. Original glyph dimensions are not applicable. Catalog IDs/names, gameplay, production rendering and shared manifest remain unchanged; T087–T093 own integration and the manifest join. Three of fourteen relic roles now have prepared artwork.

The sword was generated and inspected first. Its 108 isolated browser proofs covered every recorded reward/list/detail/equipped/sale footprint, three engines, three viewports and 100%/200% text sizes. The setting guide was then updated with the accepted prompt/framing guidance before generating axe and hammer. The completed batch has 324 isolated context proofs. Direct agent visual review is limited to the masters and named sheets in the [batch review](../../art/cosmic-horror/batches/relic-weapons-a/review.md); other sheets are retained automated captures.

## Verification

Runtime: Node 24.21.0, project-pinned dependencies. The clean starting checkout was `019fe6f7f11244c311eac5fcae8ef86e937ae55b`.

| Check                                      | Result                       | Evidence                                                                                                                                            |
| ------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checklist prerequisite                     | PASS, 16/16                  | `specs/001-cosmic-horror-refactor/checklists/requirements.md`                                                                                       |
| Ignore configuration                       | PASS                         | Existing Git/ESLint/Prettier exclusions cover generated evidence, dependencies and build outputs; private package requires no npm publishing ignore |
| PNG decode, alpha and deterministic export | PASS, all three              | Batch `validation.json`; same output hashes on second `prepareArt()` call                                                                           |
| Isolated measured-size proofs              | PASS, 324 + 108 pilot tuples | Batch `context-proofs.json` and `pilot-context-proofs.json`                                                                                         |
| `npm run test:unit`                        | PASS, 2,452 tests            | `reports/t082/unit.txt`                                                                                                                             |
| `npm run lint`                             | PASS                         | `reports/t082/lint.txt`                                                                                                                             |
| `npm run format:check`                     | PASS                         | `reports/t082/format.txt`                                                                                                                           |
| Integrated symbol geometry / item journeys | OPEN                         | T087–T093; existing Phase 5A browser acceptance failures remain intentionally unresolved                                                            |
| Native baseline / device review            | BLOCKED                      | Existing baseline tuples lack matching native measurements                                                                                          |
| Maintainer art acceptance                  | OPEN                         | The earlier 53-sprite acceptance does not cover these new relics                                                                                    |
| Full art/evidence/release gates            | OPEN                         | Remaining assets, manifest integration and qualification tasks are incomplete                                                                       |

Commands ran with `/Users/oberon/.nvm/versions/node/v24.21.0/bin` prepended to PATH. Preparation invoked the existing `prepareArt({root, master, output, width:128, height:128})` interface and `inspectPng()` for each delivered file. Browser proof capture initially ran `node .cache/review-relics.mjs relic-weapons-a relic-sword`, then `node .cache/review-relics.mjs relic-weapons-a relic-sword relic-axe relic-hammer`. That exact capture source is retained as batch `capture-proofs.mjs`. Reproduction must use a new batch output directory to preserve immutable captures.

Generation used the built-in imagegen tool, one request per asset. [Generation records](../../art/cosmic-horror/batches/relic-weapons-a/generation.json) link the exact saved prompts and masters. Generation time/model/seed were not returned and are not invented. Source file timestamps are separately labeled.

Art authoring needs relevant validation, not an artificial red test. No application behavior changed. No native, manual keyboard, performance, full browser-suite or release pass is claimed. No commit or optional Git hook was executed. Stop at T082 under the plan's separate-art-assignment rule; T083 is next.
