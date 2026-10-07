# T083 — second relic weapon batch

Date: 2026-10-07. Status: PASS for this bounded art-production assignment. Phase 5B, US3 and release acceptance remain OPEN.

## Delivered

- `assets/art/relic-dagger.png` — Whisper Shard.
- `assets/art/relic-flail.png` — Mooring Lash.
- `assets/art/relic-scythe.png` — Lowwater Reaper.

All three are new 128 × 128 transparent PNGs prepared proportionally from separate built-in imagegen masters using the accepted T082 guidance. Six of fourteen relic roles now have prepared artwork. Catalog IDs/names, gameplay, production rendering and shared manifest are unchanged; T087–T093 own integration. The [batch review](../../art/cosmic-horror/batches/relic-weapons-b/review.md) records the exact visual-review scope and small-size findings. [Generation records](../../art/cosmic-horror/batches/relic-weapons-b/generation.json) retain the full prompt set and provenance.

## Verification

Clean starting revision: `2694fa4ec6c9e2081deb85afa101d553416f308c`. Commands used `/Users/oberon/.nvm/versions/node/v24.21.0/bin` first on PATH and existing pinned dependencies.

| Check                                        | Result              | Evidence                                                                                                                                            |
| -------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prerequisite checklist                       | PASS, 16/16         | Feature `checklists/requirements.md`                                                                                                                |
| Ignore configuration                         | PASS                | Existing Git/ESLint/Prettier exclusions cover dependencies, build outputs and generated evidence; package is private, no publishing ignore required |
| PNG decode, alpha, dimensions, repeat export | PASS, all three     | Batch `validation.json`; existing `prepareArt()` and `inspectPng()`                                                                                 |
| Isolated measured-size browser proofs        | PASS, 324 tuples    | Batch `context-proofs.json`; 18 captured sheets                                                                                                     |
| Agent visual review                          | PASS, bounded scope | Three masters and three named sheets in batch `review.md`                                                                                           |
| `npm run test:unit`                          | PASS, 2,452 tests   | `reports/t083/unit.txt`                                                                                                                             |
| `npm run lint`                               | PASS                | `reports/t083/lint.txt`                                                                                                                             |
| `npm run format:check`                       | PASS                | `reports/t083/format.txt`                                                                                                                           |
| Live symbol geometry and item journeys       | OPEN                | T087–T093; Phase 5A's intentional browser failures remain unresolved                                                                                |
| Native baseline/device review                | BLOCKED             | Existing unmatched native baseline tuples                                                                                                           |
| Maintainer artwork acceptance                | OPEN                | Earlier creature acceptance does not cover these relics                                                                                             |
| Full art/evidence/release qualification      | OPEN                | Remaining assets, manifest integration and release gates                                                                                            |

Browser proof command: `node art/cosmic-horror/batches/relic-weapons-b/capture-proofs.mjs relic-weapons-b relic-dagger relic-flail relic-scythe`. Reproduction must supply a fresh output directory to preserve immutable evidence. Each output was prepared with `prepareArt({root, master, output, width:128, height:128})`, fully decoded, and prepared again to confirm equal hashes.

Art authoring requires relevant validation rather than artificial red tests; no application behavior changed. The existing evidence-capture script was reused unchanged. No full browser-suite, native/manual keyboard, performance or release pass is claimed. No commit or optional Git hook was executed. Stop at T083 under the separate-art-assignment rule; T084 is next.
