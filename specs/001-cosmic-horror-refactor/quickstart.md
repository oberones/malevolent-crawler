# Quickstart: Planned Implementation and Verification

## Current state

Phases 1–7 are implemented, including all five player stories. All 80 delivered
artworks have [maintainer approval](../../validation/cosmic-horror/art-approval-2026-10-07-complete.md).
Phase 8 runs the integrated candidate through automated, performance, native,
manual and merge-enforcement checks. See the current
[release record](../../validation/cosmic-horror/release.md) and
[automated record](../../validation/cosmic-horror/automated.json) for actual outcomes.
Historical package reports describe their dated scope and do not supersede that record.

Use the pinned runtime below. Preserve the immutable baseline revision
`3cfaf54babae978c7388c023f5df5ebe6282259b` and its source/asset hashes. The app has no
production build. Missing native/device evidence or failing art/evidence validators
remains a release blocker even when gameplay tests pass.

## Toolchain and dependency setup

Select Node.js **24.21.0** and npm **12.2.0**; record these in `.nvmrc`, package `engines`, and `packageManager`. The initial shell used Node 20.20.2/npm 10.8.2; the project pin is now installed in nvm alongside it. Verify `node --version` and `npm --version` before setup. Choose/install the runtime using the user's normal runtime manager; this plan does not silently change global tooling.

For an existing checkout, use the committed lockfile:

```sh
nvm install
nvm use
# If the selected nvm version has a different npm, update that version only:
npm install --global npm@12.2.0 --ignore-scripts
npm ci
npx playwright install chromium firefox webkit
```

The exact dependency pins installed during setup are:

```sh
npm install --save-dev --save-exact @playwright/test@1.63.0 @axe-core/playwright@4.13.0 eslint@10.12.0 @eslint/js@10.0.1 globals@17.13.0 prettier@3.9.9 http-server@14.1.1 sharp@0.35.5
```

Retain Howler 2.2.3, synchronize package/lockfile, and pin installs through the committed lockfile. Review necessary dependency lifecycle scripts individually, especially native image tooling; do not enable arbitrary install scripts globally. Record top-level and transitive/native licenses, maintenance/advisory findings, and browser cost. New dependencies are development-only and must not be referenced by production scripts.

| Package                           | Verified metadata / top-level license                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Playwright 1.63.0                 | [Registry metadata](https://registry.npmjs.org/@playwright%2ftest/1.63.0), Apache-2.0                                 |
| axe Playwright 4.13.0             | [Registry metadata](https://registry.npmjs.org/@axe-core%2fplaywright/4.13.0), MPL-2.0                                |
| ESLint 10.12.0 / JS config 10.0.1 | [ESLint](https://registry.npmjs.org/eslint/10.12.0), [JS config](https://registry.npmjs.org/@eslint%2fjs/10.0.1), MIT |
| globals 17.13.0                   | [Registry metadata](https://registry.npmjs.org/globals/17.13.0), MIT                                                  |
| Prettier 3.9.9                    | [Registry metadata](https://registry.npmjs.org/prettier/3.9.9), MIT                                                   |
| http-server 14.1.1                | [Registry metadata](https://registry.npmjs.org/http-server/14.1.1), MIT                                               |
| npm 12.2.0                        | [Registry metadata](https://registry.npmjs.org/npm/12.2.0), Artistic-2.0                                              |

The [dependency review](../../validation/cosmic-horror/dependencies.md) records the executed clean install, full license inventory, native components, disabled lifecycle scripts, maintenance caveats and dated zero-known-vulnerability audit. Registry metadata alone is not a security pass.

## Configured package scripts

```json
{
  "dev": "http-server . -a 127.0.0.1 -p 4173 -c-1 --silent",
  "test:unit": "node --test \"tests/unit/**/*.test.mjs\"",
  "test:integration": "playwright test tests/integration",
  "test:browser": "playwright test tests/browser",
  "test:performance": "playwright test tests/performance --project=chromium --workers=1",
  "lint": "eslint .",
  "format:check": "prettier --check .",
  "validate:evidence": "node scripts/validate-evidence.mjs",
  "serve:performance": "http-server . -a 127.0.0.1 -p 4174 -c3600 --silent"
}
```

`playwright.config.mjs` configures engine projects named `chromium`, `firefox`, `webkit`; suites cover viewport/input combinations as fixtures rather than inventing branded-browser qualification. Its managed `webServer` runs the matching static server and tears it down. `test:performance` validates required `PERF_STAGE=baseline|candidate`, loopback `BASE_URL`, served source/transform hashes and revision before measurement. Candidate mode also requires `PERF_REVISION` and compares matching environment/fixture metadata against the frozen baseline. The configuration separates the external performance server and disables retries/trace/video in both the coordinator and worker. Output creation is exclusive; an existing baseline or candidate report is never overwritten.

`npm run validate:evidence` checks the remaining non-art qualification records
against `validation/cosmic-horror/required-gates.json`. It fails on unresolved
required gates; it does not require generation masters, old raster art, screenshot
collections or art-review records. Artwork provenance and approval are retained as
review documents rather than revalidated by CI. See the
[cleanup record](../../validation/cosmic-horror/review-cleanup.md).

ESLint uses explicit browser/classic-script globals for legacy files and module/Node scopes for new files; no accidental global write is introduced. Do not blanket-disable rules to make legacy errors disappear. Capture existing findings, characterize before corrections, and fix scoped violations. Prettier and ESLint exclude vendored/minified assets, `.agents`, `.specify`, generation masters, and raw evidence; include owned application/tool/test files, README, AGENTS, and feature documentation. Document every touched/new function, including test callbacks; public/non-obvious interfaces use JSDoc.

## Repeatable local checks

```sh
npm ci
npx playwright install chromium firefox webkit
npm run test:unit
npm run test:integration
npm run test:browser
npm run lint
npm run format:check
npm audit --audit-level=high
```

A failed audit requires dependency remediation or the constitution's explicit exception process before merge; an audit alone does not prove security. Required build command: **N/A**, because the selected application has no production build. Static `.mjs`/image/font/audio loading still requires browser checks.

For focused TDD, run a newly written relevant `.test.mjs` through `node --test` or a Playwright file through `npx playwright test <file>`, record failure for the intended missing behavior, implement, rerun green, and refactor. A broken import/test setup does not satisfy red. Full required automated checks follow integration; avoid substituting an empty suite or blanket snapshot update for validation.

For interactive development use `npm run dev` and `http://127.0.0.1:4173`. This local server is not production hosting. Keep runtime assets local; functional suites stub external analytics/fonts consistently and exercise their failure behavior. The normal performance suite uses the identical recorded served-fixture transform in the validation plan, with no Playwright request/HAR routing and verified HTTP cache hits.

## Performance and manual qualification

The one-time art baseline/captures have been retired. Numeric layout expectations
remain under `tests/fixtures/layout/`; gameplay/save fixtures remain under
`tests/fixtures/legacy/`. Recorded performance results remain available. Serve the immutable baseline from an isolated local snapshot and the candidate separately, both with the same static server/cache policy. Against each server, use:

```sh
PERF_STAGE=baseline BASE_URL=http://127.0.0.1:4174 npm run test:performance
PERF_STAGE=candidate PERF_REVISION=<candidate-revision> BASE_URL=http://127.0.0.1:4174 npm run test:performance
```

The baseline command above describes the completed capture; it now refuses to overwrite the accepted file. Prepare a new candidate root and serve it explicitly (replace `<candidate-revision>` with the full Git revision):

```sh
mkdir -p .cache
node tests/helpers/performance-fixture.mjs candidate . .cache/performance-candidate-01 <candidate-revision>
node node_modules/http-server/bin/http-server .cache/performance-candidate-01 -a 127.0.0.1 -p 4174 -c3600 --silent
# In a second terminal with the pinned runtime selected:
PERF_STAGE=candidate PERF_REVISION=<candidate-revision> BASE_URL=http://127.0.0.1:4174 npm run test:performance
```

Use a new output-root name for each preparation. Candidate reports are named by source hash and cannot be overwritten. Preserve the baseline and its diagnostic sidecars. The original full performance baseline must now be reconstructed from Git history,
because the retained gameplay fixture no longer includes original raster art:

```sh
mkdir .cache/performance-original-01
git archive 3cfaf54babae978c7388c023f5df5ebe6282259b index.html assets | tar -x -C .cache/performance-original-01
node tests/helpers/performance-fixture.mjs baseline .cache/performance-original-01 .cache/performance-baseline-new 3cfaf54babae978c7388c023f5df5ebe6282259b
```

These optional historical performance inputs are not required by ordinary CI. These are sequential runs against the matching served revision, not simultaneous commands against an unchanged server. The runner verifies expected revision/hash metadata. Record five or more samples per workload, browser/device/network, cold/warm cache, raw durations, asset bytes and the threshold calculation. Follow [validation-plan.md](validation-plan.md) for exact boundaries.

Complete the seeded `validation/cosmic-horror/manual.md` and `gates.json` records with PASS/FAIL/BLOCKED/OPEN/N/A results, expected/actual results and evidence for native browsers/touch, keyboard/focus, text and the horror boundary. Record exact target versions before baseline collection; unavailable physical devices/native browsers remain BLOCKED. Then run `npm run validate:evidence`. Automation never invents manual reviewer results.

## CI contract

The configured `.github/workflows/validate.yml` selects the pinned Node/npm toolchain and runs seven independent required jobs: unit, integration, browser, lint, format, audit and evidence. Integration/browser jobs run `npx playwright install --with-deps chromium firefox webkit`. All jobs use `mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`; the digest was resolved from Microsoft's registry. The first CI run must record actual runner OS metadata; no remote execution is claimed yet. Reports upload on failure, and incomplete non-art evidence checks are not skipped.

GitHub inspection found main unprotected with no repository rulesets. Required-check enforcement remains BLOCKED: the 2026-10-08 inspection found no CI runs, no rulesets and an unprotected main branch. See [ci.md](../../validation/cosmic-horror/ci.md). Release qualification additionally requires the completed non-art manual/native index and matched performance results.

## Qualification handoff

Continue the unchecked Phase 8 tasks in [tasks.md](tasks.md), using the
[release record](../../validation/cosmic-horror/release.md) to distinguish
completed local checks from unavailable native/device and remote CI work.

Preserve the immutable baseline. Routine integration runs omit
`CAPTURE_BASELINE_DIR`; new captures and performance reports use exclusive writes.
Record native review separately from browser automation and emulated touch.
Optional `/speckit.git.commit` hooks require an explicit request.
