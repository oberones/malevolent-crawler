# Visible terminology update — 2026-10-08

Applied the maintainer-approved vocabulary: relic seeker, descent/exploring,
Expedition Journal, Deepening Curse, The Final Descent, Tolling Maul, guide rope,
and dredging hook. Updated narrative sentences, help, credits, accessible text,
static entry markup, the current-run curse display, README, and current setting
and art-inventory documentation.

Preserved Sounding Vessel and both variant names, sounding bell, sounding bowl,
and sounding cord. Internal identifiers, message keys, save formats, gameplay,
artwork, generation prompts, and historical validation records were not changed.

## Verification

- Red: `node --test tests/unit/visible-terminology.test.mjs` failed all three
  tests on the intended old player, curse, and boss wording before application edits.
- Green: the same focused command passed all three tests after the copy changes.
- `npm run test:unit`: 2,403 passed using the installed Node 24.21.0 runtime.
- `npx playwright test tests/browser/entry-resilience.spec.mjs tests/browser/navigation-accessibility.spec.mjs tests/browser/setting-journeys.spec.mjs tests/browser/legacy-history.spec.mjs --workers=3`:
  177 passed across Chromium, Firefox, and WebKit (1.7 minutes).
- `npm run lint`, `npm run format:check`, and `git diff --check`: passed.
- Reviewed remaining application occurrences of `sounding`: retained names and
  descriptions or unchanged internal identifiers only.

The initial full-unit invocation used the shell's Node 20 runtime, which could
not expand the configured test glob; the successful rerun used Node 24.21.0.
The initial browser invocation could not bind localhost in the sandbox; the
successful rerun used approved local-server access.

These are automated regression and browser results. Native/device manual
acceptance and performance qualification were not performed for this copy change.
