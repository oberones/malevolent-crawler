# Phase 4B first boss-alias batch — T073

Date: 2026-10-07. Scope: four original creature replacements after T062/T063.
Reviewer: implementation agent. Runtime: Node 24.21.0/npm 12.2.0.
Candidate: uncommitted T073 changes based on
`16a0706e39f41dea34c0d655605486938d893509`; delivered file hashes identify the reviewed art.

Delivered The Continental Sleeper (675 × 532), The Red Undertow (441 × 355),
The Eclipse Ferryman (434 × 310), and The Kiln Below (744 × 509) at their
existing sprite paths. Updated factual in-game art credits and the README's
delivered count to 47 creature replacements. No production function or gameplay
behavior changed.

- [Selected masters](../../art/cosmic-horror/masters/bosses-a/)
- [Exact generation prompts](../../art/cosmic-horror/prompts/bosses-a/)
- [Provenance and transforms](../../art/cosmic-horror/batches/bosses-a/generation.json)
- [Individual visual review](../../art/cosmic-horror/batches/bosses-a/review.md)
- [Intrinsic-size comparison](../../art/cosmic-horror/batches/bosses-a/actual-size.png)
- [Decode/alpha/dimensions/re-export results](../../art/cosmic-horror/batches/bosses-a/validation.json)
- [24 decoded Chromium captures and hashes](../../art/cosmic-horror/batches/bosses-a/browser-captures.json)

## Verification

- Existing tested `prepareArt` API: full decode, exact immutable dimensions,
  visible/transparent pixels and identical repeat-export hashes PASS for all four.
- `npm run test:unit`: 2,382 passed, zero failures or skips after the credit update.
- `npx playwright test tests/integration/encounter-view.spec.mjs tests/browser/encounters.spec.mjs tests/browser/narrative-integration.spec.mjs --workers=3 --trace=off`:
  36 passed across Chromium, Firefox and WebKit. These verify identities,
  geometry, narrative and rule contracts. Separate decoded Chromium captures
  support the final-art review.
- `npm run lint`, `npm run format:check` and `git diff --check`: PASS.
- Reports: `validation/cosmic-horror/reports/t073-*.txt`.

Art/copy authoring requires relevant validation rather than artificial failing
tests under the constitution and task execution contract. The existing tested
preparation algorithm, catalog identities, rules and portrait containers remain
unchanged. Ignore files cover this private static application; publishing and
Docker ignore files are N/A. Immutable baselines remain unchanged.

T073 is the bounded delivery for this session; T074 is next. T076 retains the
common-manifest integration task. Full-collection validators are not claimed as
passed. Human/native review, collection acceptance, matched performance, remote
CI and release gates remain OPEN/BLOCKED. Optional pre/post Git commit hooks were
not executed; no commit was made.
