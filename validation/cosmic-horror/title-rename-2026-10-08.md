# Title rename — 2026-10-08

Changed the visible title to **Malevolent Gods: The Drowned Labyrinth** in the
setting catalog, HTML browser-tab title and heading, title-symbol accessible label,
README, and current setting guide. Updated title expectations in catalog and
browser tests. Stable setting IDs, artwork, saved data, historical validation
records, and original generation prompts remain unchanged.

## Verification

- Red: `node --test tests/unit/catalogs.test.mjs` reported the intended title
  mismatch before implementation (one failure, nine passes).
- Green: `npm run test:unit` passed all 2,403 tests under Node 24.21.0.
- `npx playwright test tests/browser/entry-resilience.spec.mjs tests/browser/full-journeys.spec.mjs --workers=3`:
  36 passed across Chromium, Firefox, and WebKit, including title/entry checks at
  360, 768, and 1440 pixels and enlarged-text journeys.
- `npm run lint`, `npm run format:check`, and `git diff --check`: passed.
- No old display-title occurrences remain in application assets, HTML, README,
  current feature specs, or the setting guide.

Browser results are automated checks, not native/device manual acceptance.
