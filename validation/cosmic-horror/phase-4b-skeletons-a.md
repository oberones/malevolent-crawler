# Phase 4B first skeleton-alias batch — T069

Date: 2026-10-06. Scope: four original creature replacements following T062/T063.
Reviewer: implementation agent. Node 24.21.0/npm 12.2.0.

Delivered Ossuary Signalman (299 × 218), Reliquary Warden (371 × 212),
Splinterblade Usher (248 × 215) and Pierbound Husk (254 × 188) at their existing
sprite paths. Updated the factual generated-art credit.

- [Selected and initial masters](../../art/cosmic-horror/masters/skeletons-a/)
- [Exact generation/edit prompts](../../art/cosmic-horror/prompts/skeletons-a/)
- [Provenance and transforms](../../art/cosmic-horror/batches/skeletons-a/generation.json)
- [Individual visual review](../../art/cosmic-horror/batches/skeletons-a/review.md)
- [Decode/alpha/dimensions/re-export results](../../art/cosmic-horror/batches/skeletons-a/validation.json)
- [24 decoded Chromium captures and hashes](../../art/cosmic-horror/batches/skeletons-a/browser-captures.json)

## Verification

- Existing tested `prepareArt` API: full decode, exact immutable dimensions,
  visible/transparent pixels and identical repeat-export hashes PASS for all four.
- `npm run test:unit`: 2,382 passed, zero failures or skips.
- `npx playwright test tests/integration/encounter-view.spec.mjs tests/browser/encounters.spec.mjs tests/browser/narrative-integration.spec.mjs --workers=3 --trace=off`:
  36 passed across Chromium, Firefox and WebKit. Initial launch found the capture
  server occupying port 4173; stopped that owned server, then reran successfully.
- Reports: `validation/cosmic-horror/reports/t069-*.txt`.
- `npm run lint`, `npm run format:check` and `git diff --check`: PASS.

Art/copy authoring requires relevant validation, not artificial failing tests,
under the constitution and execution contract. No production function, behavior
or preparation algorithm changed. Existing ignore files cover this private static
application; publishing/Docker ignore files are N/A. Baselines, catalog identities,
rules and portrait containers remain unchanged.

T069 is complete as the bounded delivery for this session; T070 is next. Common-manifest
integration remains assigned to T076. Human/native review, collection acceptance,
matched performance, remote CI and release gates remain OPEN/BLOCKED.
Optional Git pre/post commit hooks were not executed; no commit was made.
