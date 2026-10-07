# T085 — relic ward batch

Date: 2026-10-07. Status: PASS for this bounded art-production assignment. Phase 5B, US3 and release acceptance remain OPEN.

## Delivered

- `assets/art/relic-tower.png` — Breakwater Slab.
- `assets/art/relic-kite.png` — Pilgrim Keel.
- `assets/art/relic-buckler.png` — Tidepool Disc.

All three are new 128 × 128 transparent PNGs prepared proportionally from separate built-in imagegen masters using accepted T082 guidance. Twelve of fourteen relic roles now have prepared artwork. Catalog IDs/names, gameplay, production rendering and shared manifest are unchanged; T087–T093 own integration. The [batch review](../../art/cosmic-horror/batches/relic-wards/review.md) records the exact visual-review scope and small-size findings. [Generation records](../../art/cosmic-horror/batches/relic-wards/generation.json) retain prompts and provenance.

## Verification

Clean starting revision: `e2aa429a5051b87e19f813e1fa85ea07dd8cb948`. Commands used `/Users/oberon/.nvm/versions/node/v24.21.0/bin` first on PATH and existing pinned dependencies.

| Check                                        | Result              | Evidence                                                                                                                                         |
| -------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prerequisite checklist                       | PASS, 16/16         | Feature `checklists/requirements.md`                                                                                                             |
| Ignore configuration                         | PASS                | Existing Git/ESLint/Prettier exclusions cover dependencies, build outputs and generated evidence; private package, no publishing ignore required |
| PNG decode, alpha, dimensions, repeat export | PASS, all three     | Batch `validation.json`; existing `prepareArt()` and `inspectPng()`                                                                              |
| Isolated measured-size browser proofs        | PASS, 324 tuples    | Batch `context-proofs.json`; 18 captured sheets; `reports/t085/proofs.txt`                                                                       |
| Agent visual review                          | PASS, bounded scope | Three masters and three named sheets in batch `review.md`                                                                                        |
| `npm run test:unit`                          | PASS, 2,452 tests   | `reports/t085/unit.txt`                                                                                                                          |
| `npm run lint`                               | PASS                | `reports/t085/lint.txt`                                                                                                                          |
| `npm run format:check`                       | PASS                | `reports/t085/format.txt`                                                                                                                        |
| Live symbol geometry and item journeys       | OPEN                | T087–T093; Phase 5A's intentional browser failures remain unresolved                                                                             |
| Native baseline/device review                | BLOCKED             | Existing unmatched native baseline tuples                                                                                                        |
| Maintainer artwork acceptance                | OPEN                | Earlier creature acceptance does not cover these relics                                                                                          |
| Full art/evidence/release qualification      | OPEN                | Remaining assets, manifest integration and release gates                                                                                         |

Browser proof command: `node art/cosmic-horror/batches/relic-wards/capture-proofs.mjs relic-wards relic-tower relic-kite relic-buckler`. Reproduction must supply a fresh output directory to preserve immutable evidence. Each output was prepared with `prepareArt({root, master, output, width:128, height:128})`, fully decoded, and prepared again to confirm equal hashes.

Art authoring requires relevant validation rather than artificial red tests; no application behavior changed. The existing evidence-capture script was reused unchanged. No full browser-suite, native/manual keyboard, performance or release pass is claimed. No commit or optional Git hook was executed. Stop at T085 under the separate-art-assignment rule; T086 is next.
