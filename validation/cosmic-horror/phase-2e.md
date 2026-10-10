# Phase 2E — Art preparation and evidence validation

Date: 2026-10-06. Owner/reviewer: implementation agent. Scope: T035–T039 only.
Runtime: selected nvm Node 24.21.0/npm 12.2.0; existing pinned Sharp 0.35.5.

## Outcome

PASS for independently tested development tools. Preparation uses proportional
contain, transparent padding and recorded deterministic PNG settings, with the
exact 199 × 200 PNG and one-entry 127 × 128 PNG-backed ICO contracts. Unsafe paths,
symlink indirection, blank/opaque/corrupt art and inconsistent records fail explicitly.

The manifest contains 80 OPEN obligations: 53 sprites, two separate favicons,
24 symbol roles and one fallback. No original runtime art, baseline capture or
application behavior was changed. Glyph source dimensions remain null; candidate
pixel dimensions require the icon pilot. Every baseline symbol tuple must have a
matched candidate and individual visual review before art validation can pass.

Release evidence uses a separate 316-gate requirement inventory so omitted records,
changed kinds and reduced coverage cannot silently pass. Manual and automated
records require different execution evidence. Missing files, placeholder reviewers,
unresolved findings and required OPEN/FAIL/BLOCKED results fail. N/A requires a
scope reason and cannot hide unresolved findings. Completeness checks cannot
verify a human identity, originality, or whether an asserted observation is true.

## Verification

| Command                                                                                   | Actual result                                                        | Evidence                                              |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| `node --test tests/unit/art-tools.test.mjs tests/unit/evidence-validator.test.mjs`        | PASS: 13 tests/subtests after review fixes                           | [Focused green](reports/phase-2e-review-green.txt)    |
| `npm run test:unit`                                                                       | PASS: 1,240 tests, including immutable baselines and protected rules | [Full unit](reports/phase-2e-unit.txt)                |
| `npx eslint scripts tests/unit/art-tools.test.mjs tests/unit/evidence-validator.test.mjs` | PASS                                                                 | [Scoped lint](reports/phase-2e-lint.txt)              |
| Scoped Prettier check, including manifest and evidence JSON/Markdown                      | PASS                                                                 | [Scoped format](reports/phase-2e-format.txt)          |
| `npm run lint`                                                                            | FAIL: 318 existing legacy errors                                     | [Repository lint](reports/phase-2e-lint-all.txt)      |
| `npm run format:check`                                                                    | FAIL: 20 existing files before scoped documentation formatting       | [Repository format](reports/phase-2e-format-all.txt)  |
| `npm run validate:art`                                                                    | Exit 1: real delivered metadata/art/reviews incomplete               | [Art diagnostics](reports/phase-2e-art.txt)           |
| `npm run validate:evidence`                                                               | Exit 1: real required gates and art incomplete                       | [Evidence diagnostics](reports/phase-2e-evidence.txt) |

Red, green and review-regression details: [TDD record](tdd.md#t035t039--phase-2e-art-and-evidence-tools).
Browser suites were not rerun for this development-only package: no player journey,
DOM, CSS or runtime module changed. No dependency change; no new clean-install or
audit result claimed. Production build remains N/A.

## Handoff

Next package: Phase 2F, T040–T042, matched performance harness and frozen baseline.
No Phase 2G integration or later story work started. Native baselines, visual reviews,
manual accessibility, full art, performance and release enforcement remain separate
OPEN/BLOCKED obligations. No commits or optional hooks executed.

Prepare one authored row with `npm run art:prepare -- <manifest-asset-id>` after
recording its master and exact output dimensions. Copy the printed delivered hash
and transform metadata into the row; preparation deliberately does not approve art
or alter the manifest/review fields. Keep actual returned generation provenance;
unknown metadata stays null. The validators never infer visual acceptance from hashes.
