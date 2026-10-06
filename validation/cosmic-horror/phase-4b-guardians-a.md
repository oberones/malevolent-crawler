# Phase 4B first guardian-alias batch — T071

Date: 2026-10-07. Scope: five original creature replacements after T062/T063.
Reviewer: implementation agent. Node 24.21.0/npm 12.2.0.

Delivered The Lantern Without Flame (603 × 616), The Brood Bell (469 × 479),
The Salt Regent (375 × 251), The Threefold Watch (588 × 410), and Cinderwake
Prowler (373 × 323) at their existing sprite paths. Updated the factual generated
art credit. One Salt Regent framing edit preserves its full crown and cloak.

- [Selected and initial masters](../../art/cosmic-horror/masters/guardians-a/)
- [Exact generation/edit prompts](../../art/cosmic-horror/prompts/guardians-a/)
- [Provenance and transforms](../../art/cosmic-horror/batches/guardians-a/generation.json)
- [Individual visual review](../../art/cosmic-horror/batches/guardians-a/review.md)
- [Intrinsic-size comparison](../../art/cosmic-horror/batches/guardians-a/actual-size.png)
- [Decode/alpha/dimensions/re-export results](../../art/cosmic-horror/batches/guardians-a/validation.json)
- [30 decoded Chromium captures and hashes](../../art/cosmic-horror/batches/guardians-a/browser-captures.json)

## Verification

- Existing tested `prepareArt` API: full decode, exact immutable dimensions,
  visible/transparent pixels and identical repeat-export hashes PASS for all five.
- `npm run test:unit`: 2,382 passed, zero failures or skips after the credit update.
- `npx playwright test tests/integration/encounter-view.spec.mjs tests/browser/encounters.spec.mjs tests/browser/narrative-integration.spec.mjs --workers=3 --trace=off`:
  36 passed across Chromium, Firefox and WebKit. These verify layout, identities,
  narrative and rule contracts. Separate decoded Chromium captures review final art.
  Initial invocation could not start because the local art-capture server occupied
  the managed port; stopped that server and reran successfully. Both reports retained.
- `npm run lint`, `npm run format:check` and `git diff --check`: PASS.
- Reports: `validation/cosmic-horror/reports/t071-*.txt`.

Art/copy authoring requires relevant validation, not artificial failing tests, under
the constitution and task execution contract. No production function, behavior,
preparation algorithm, catalog identity, rule or portrait container changed.
Existing ignore files cover this private static application; publishing and Docker
ignore files are N/A. Immutable baseline files remain unchanged.

T071 is complete as this session's bounded delivery; T072 is next. Common-manifest
integration remains assigned to T076. Full-collection validators are not claimed
as passed. Human/native review, collection acceptance, matched performance, remote
CI and release gates remain OPEN/BLOCKED. Optional pre/post Git commit hooks were
not executed; no commit was made.
