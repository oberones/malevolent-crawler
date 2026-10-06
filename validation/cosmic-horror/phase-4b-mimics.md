# Phase 4B mimic batch — T075

Date: 2026-10-07. Scope: two original creature replacements after T062/T063.
Reviewer: implementation agent. Runtime: Node 24.21.0/npm 12.2.0.
Candidate: uncommitted T075 changes based on
`5ec9ef981535769acd9e10ad5941973643f85c2d`, preserving the existing uncommitted
T074 package. Delivered hashes identify the reviewed art.

Delivered Coffer of Listening Teeth (227 × 174, chest trigger) and Threshold That
Breathes (317 × 230, door trigger) at their existing sprite paths. Updated factual
in-game art credits and the README to 53 creature replacements, including both
Sounding Vessel variants and the unused sprite. All 53 separate batch records
match current runtime hashes. No production function or gameplay rule changed.

- [Selected masters](../../art/cosmic-horror/masters/mimics/)
- [Exact generation prompts](../../art/cosmic-horror/prompts/mimics/)
- [Separate trigger/identity provenance and transforms](../../art/cosmic-horror/batches/mimics/generation.json)
- [Individual visual review](../../art/cosmic-horror/batches/mimics/review.md)
- [Intrinsic-size comparison](../../art/cosmic-horror/batches/mimics/actual-size.png)
- [Decode/alpha/dimensions/re-export results](../../art/cosmic-horror/batches/mimics/validation.json)
- [12 decoded Chromium captures and hashes](../../art/cosmic-horror/batches/mimics/browser-captures.json)

## Verification

- Existing tested `prepareArt` API: full decode, exact immutable dimensions,
  visible/transparent pixels and identical repeat-export hashes PASS for both.
- `npm run test:unit`: 2,382 passed, zero failures or skips after the credit update.
- `npx playwright test tests/integration/encounter-view.spec.mjs tests/browser/encounters.spec.mjs tests/browser/narrative-integration.spec.mjs --workers=3 --trace=off`:
  36 passed across Chromium, Firefox and WebKit. These verify identities,
  geometry, narrative and rule contracts. Separate decoded Chromium captures
  support the final-art review.
- `node .cache/capture-mimics.mjs`: 12 decoded captures after invoking production
  chest/door triggers, with matching authoritative enemy values and complete
  11-draw tapes. Captures used the local static server on port 4175.
- Initial capture assertion stopped on derived `hpPercent` string/number form
  before creating screenshots. The capture comparison now follows the existing
  browser test's numeric comparison for that one derived field. The diagnostic
  is retained in `reports/t075-capture-diagnostic.txt`; no application fix was needed.
- `npm run lint`, `npm run format:check` and `git diff --check`: PASS.
- Reports: `validation/cosmic-horror/reports/t075-*.txt`.

Art/copy authoring requires relevant validation rather than artificial failing
tests under the constitution and task execution contract. The tested preparation
algorithm, catalog identities, rules and portrait containers remain unchanged.
Ignore files cover this private static application; publishing, Docker, Terraform
and Helm ignore files are N/A. Immutable baselines and the common manifest remain
unchanged.

T075 is the bounded delivery for this session. Phase 4C (T076–T078), beginning with
common-manifest integration, is next. Full-collection validators are not claimed
as passed. Human/native review, collection acceptance, matched performance,
remote CI and release gates remain OPEN/BLOCKED. Optional pre/post Git commit
hooks were not executed; no commit was made.
