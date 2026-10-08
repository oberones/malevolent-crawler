# Review cleanup — 2026-10-08

The project maintainer authorized retiring the refactor's one-time legacy art
comparison workflow after accepting all 80 delivered artworks. This changes
artifact retention and ongoing CI requirements; it does not mark outstanding
non-art qualification as passed.

## Retained for review

- Application code and every shipped asset under `assets/` are unchanged.
- Gameplay, RNG, save migration, import/export, recovery and lifecycle regression
  fixtures and tests remain. Original source bytes are still checked against Git.
- Browser loading, image failure recovery, accessibility and layout tests remain.
  Their numeric symbol expectations now live in `tests/fixtures/layout/`, without
  screenshot or master dependencies.
- `art/cosmic-horror/manifest.json` schema 2 retains the 80 delivered hashes and
  dimensions, generation provenance, prompt references, transform settings and
  maintainer approval. Prompts and the setting guide remain.
- [Artwork approval](art-approval-2026-10-07-complete.md), non-art gate records,
  qualification summaries and performance results remain.

## Retired from the review tree

- Generation masters, batch intermediates, screenshot collections and original
  raster artwork from the legacy fixture.
- Full legacy art baseline and capture metadata; art-only phase notes/reports.
- Art preparation/comparison scripts and their one-time delivery tests.
- The Sharp development dependency and its transitive lockfile entries.
- The `art` CI job, `art:prepare` and `validate:art` commands, and the 139 art/context
  gates, art-validation gate and native-symbol-baselines gate.

The evidence job remains for non-art qualification. Its validator no longer loads
an art manifest, old artwork or art reviews. Required non-art records still fail
when OPEN, FAIL or BLOCKED. Seven CI jobs remain: unit, integration, browser,
lint, format, audit and evidence. Future artwork is reviewed against the current
game; it does not need the original artwork for comparison.

Earlier specs and qualification notes are historical records. Their references to
retired artifacts describe the original execution, not files required by a fresh
checkout. This record supersedes those art-retention/CI requirements; other
requirements remain in force. Optional historical performance reconstruction is
explained in the updated quickstart.

## Local retention and Git

Removed materials were moved to the already ignored
`.cache/retired-art-2026-10-08/` for local recovery during review. That copy is not a
repository dependency and will not be committed. This cleanup reduces the review
tree, not local disk usage or existing Git history. No history rewrite, commit,
push or remote branch-policy change was performed.

## Verification

The new evidence-validator test first failed with `Missing art review obligations`
and then passed after removing the art dependency. Invalid, missing, unresolved and
out-of-scope non-art records remain covered by the existing negative tests.

Using Node 24.21.0 / npm 12.2.0:

- `npm ci --offline --ignore-scripts`: PASS; 132 packages installed from the local cache.
- `npm run test:unit`: PASS, 2,400 tests after clean installation.
- `npm run test:integration -- --workers=1`: PASS, 288 tests across Chromium,
  Firefox and WebKit.
- `npm run lint`, `npm run format:check` and `git diff --check`: PASS.
- `npm run validate:evidence`: expected nonzero result for 164 existing non-art
  qualification blockers (46 OPEN, 117 BLOCKED, 1 FAIL); no missing-art or evidence
  structure errors. All 175 retained gate records are unchanged from before this
  cleanup. No native, performance, remote CI or release acceptance is inferred.
- One-time retention audit: all 80 delivered artwork hashes match the retained
  manifest; all prompt references exist; application code, shipped assets and
  gameplay/save fixture corpus have no diff.

The first parallel integration run exposed the removal of a synthetic loader-test
PNG; it was restored. Two clipboard timing assertions also failed in that run.
The complete serial rerun above passed without application changes.

The full browser suite ran with four workers: **476 passed, 1 skipped, 18 failed**.
All failures are the existing `relic-accessibility.spec.mjs` percentage-format
assertion at six viewport/text combinations in each engine: the test expects
`123456.789%`, while the unchanged UI renders `123457%`. Both that test and the
application code are identical to HEAD. No assertion was weakened or product
behavior changed to hide this unrelated mismatch.

The affected `relic-contexts`, `symbol-geometry`, `art-failure` and `encounters`
browser files all pass across the three engines. The Firefox touch case is the
suite's existing explicit skip. This is browser automation, not native/device
acceptance. The full suite is not claimed green.

Actual browser command (the package script already includes the entire browser directory):

```sh
npm run test:browser -- tests/browser/relic-contexts.spec.mjs tests/browser/symbol-geometry.spec.mjs tests/browser/art-failure.spec.mjs tests/browser/encounters.spec.mjs --workers=4
```

The cleanup removes 20,705 tracked paths, with approximately 1.49 GB of removed
file content preserved in the ignored local cache. The retained `art/` directory
is approximately 548 KB. These are working-tree changes ready for review; no
commit or history rewrite has been made.

## Rounded-label expectation resolved — 2026-10-08

The maintainer confirmed that UI stat values should round to the nearest integer.
The relic accessibility test now expects `Critical damage +123457%` for its
`123456.789` fixture. Application behavior and stored values are unchanged.
This resolves the 18 repeated assertion failures recorded above.

Using Node 24.21.0 / npm 12.2.0:

```sh
node node_modules/@playwright/test/cli.js test tests/browser/relic-accessibility.spec.mjs --workers=4
```

Result: **33 passed** across Chromium, Firefox and WebKit, including all 18
previously failing viewport/text cases. Scoped ESLint and Prettier checks pass.
The full browser suite was not rerun after this test-only correction; its earlier
result remains historical. Native/device, remote CI and other non-art
qualification statuses are unchanged.
