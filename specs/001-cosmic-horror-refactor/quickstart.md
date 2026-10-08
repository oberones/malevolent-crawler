# Quickstart: Planned Implementation and Verification

## Current state

Phase 1 setup and Phase 2A–2G foundations are implemented; [Phase 2G evidence](../../validation/cosmic-horror/foundation.md) records guarded startup, completed-transition persistence and current-rule replay. [Phase 2E evidence](../../validation/cosmic-horror/phase-2e.md) records tested art preparation, the 80-obligation OPEN manifest, and release-evidence validation. [Phase 2D evidence](../../validation/cosmic-horror/phase-2d.md) records independently tested save validation, safe rendering, snapshots, lifecycle/transitions and dialogs; the storage/transition bridge is now integrated by Phase 2G; full story integration remains open. [Phase 2C evidence](../../validation/cosmic-horror/phase-2c.md) records the original setting guide and tested immutable catalogs; Phase 3B now connects narrative and current display labels to gameplay; art delivery and full story qualification remain open. [Phase 2B evidence](../../validation/cosmic-horror/phase-2b.md) records protected-rule characterization and 1,998 automated symbol measurements; native baseline rows remain BLOCKED. [Phase 2A evidence](../../validation/cosmic-horror/phase-2a.md) records the frozen source, 19 synthetic saves, four exports and passing replay checks. Node 24.21.0/npm 12.2.0 and the exact dependency pins below were installed and verified through nvm, leaving its default alias unchanged. `npm ci` succeeds with install scripts disabled. All three matching Playwright engines are installed. The static-server, module-MIME, three-viewport/input smoke checks and tooling-scope unit tests pass; these do not certify gameplay or native acceptance.

The complete unit suite passes 2,452 tests after Phase 5A. Phase 3B integrates the narrative catalogs, and the Phase 4C combined integration/browser suite passed 393 checks across all three pinned engines. Phase 5A adds eight relic acceptance journeys (24 engine cases): 18 pass and six intentionally fail on visible capacity feedback and stale/repeated sale handling until T089 connects the new boundary. The complete browser gate is currently red; see [Phase 5A evidence](../../validation/cosmic-horror/phase-5a.md). Lint, formatting, and the dependency audit pass locally. Phase 4A adds reserved encounter geometry and all-variant/rule browser coverage; see [Phase 4A evidence](../../validation/cosmic-horror/phase-4a.md) and [US1 evidence](../../validation/cosmic-horror/us1.md); remote CI and full native/manual acceptance are not claimed.

Repository-wide lint and formatting pass after Phase 2G resolved the [inventoried legacy debt](../../validation/cosmic-horror/legacy-debt.md). Art preparation and both validators are implemented. The real art/evidence validators exit nonzero because generation and release qualification remain incomplete. [Phase 2F evidence](../../validation/cosmic-horror/phase-2f.md) records the tested harness and 190 immutable baseline timing samples; candidate comparison remains OPEN. The complete [execution record](../../validation/cosmic-horror/phase-1.md) distinguishes setup PASS from OPEN/BLOCKED release obligations.
Run implementation commands from the repository root. Read the [plan](plan.md), [validation plan](validation-plan.md), and constitution first. The baseline application revision is `3cfaf54babae978c7388c023f5df5ebe6282259b`; preserve source/asset hashes and representative saves before replacing content.

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

| Package                           | Verified metadata / top-level license                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Playwright 1.63.0                 | [Registry metadata](https://registry.npmjs.org/@playwright%2ftest/1.63.0), Apache-2.0                                   |
| axe Playwright 4.13.0             | [Registry metadata](https://registry.npmjs.org/@axe-core%2fplaywright/4.13.0), MPL-2.0                                  |
| ESLint 10.12.0 / JS config 10.0.1 | [ESLint](https://registry.npmjs.org/eslint/10.12.0), [JS config](https://registry.npmjs.org/@eslint%2fjs/10.0.1), MIT   |
| globals 17.13.0                   | [Registry metadata](https://registry.npmjs.org/globals/17.13.0), MIT                                                    |
| Prettier 3.9.9                    | [Registry metadata](https://registry.npmjs.org/prettier/3.9.9), MIT                                                     |
| http-server 14.1.1                | [Registry metadata](https://registry.npmjs.org/http-server/14.1.1), MIT                                                 |
| Sharp 0.35.5                      | [Registry metadata](https://registry.npmjs.org/sharp/0.35.5), Apache-2.0; review bundled/native dependencies separately |
| npm 12.2.0                        | [Registry metadata](https://registry.npmjs.org/npm/12.2.0), Artistic-2.0                                                |

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
  "art:prepare": "node scripts/prepare-art.mjs",
  "validate:art": "node scripts/validate-art.mjs",
  "validate:evidence": "node scripts/validate-evidence.mjs",
  "serve:performance": "http-server . -a 127.0.0.1 -p 4174 -c3600 --silent"
}
```

`playwright.config.mjs` configures engine projects named `chromium`, `firefox`, `webkit`; suites cover viewport/input combinations as fixtures rather than inventing branded-browser qualification. Its managed `webServer` runs the matching static server and tears it down. `test:performance` validates required `PERF_STAGE=baseline|candidate`, loopback `BASE_URL`, served source/transform hashes and revision before measurement. Candidate mode also requires `PERF_REVISION` and compares matching environment/fixture metadata against the frozen baseline. The configuration separates the external performance server and disables retries/trace/video in both the coordinator and worker. Output creation is exclusive; an existing baseline or candidate report is never overwritten.

`npm run art:prepare -- <manifest-asset-id>` consumes one recorded master and explicit delivered dimensions from the manifest, writes its runtime output, and prints the delivered hash/transform JSON for recording in that row. Missing masters/dimensions fail before writing. It never updates reviews or the baseline. `validate:art` checks full decoding, dimensions, alpha, mapping, ICO and manifest integrity. `validate:evidence` checks that required automated/manual entries and art-review records contain real results and evidence files; it fails on OPEN/FAIL/BLOCKED required release gates. These development utilities have independent positive fixtures and red–green tests for malformed inputs and missing artifacts. `validation/cosmic-horror/required-gates.json` retains the separate gate/requirement inventory; reviewed scope changes must update it deliberately. Validators verify record completeness and file existence, not human authenticity or artistic originality.

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
npm run validate:art
npm audit --audit-level=high
```

A failed audit requires dependency remediation or the constitution's explicit exception process before merge; an audit alone does not prove security. Required build command: **N/A**, because the selected application has no production build. Static `.mjs`/image/font/audio loading still requires browser checks.

For focused TDD, run a newly written relevant `.test.mjs` through `node --test` or a Playwright file through `npx playwright test <file>`, record failure for the intended missing behavior, implement, rerun green, and refactor. A broken import/test setup does not satisfy red. Full required automated checks follow integration; avoid substituting an empty suite or blanket snapshot update for validation.

For interactive development use `npm run dev` and `http://127.0.0.1:4173`. This local server is not production hosting. Keep runtime assets local; functional suites stub external analytics/fonts consistently and exercise their failure behavior. The normal performance suite uses the identical recorded served-fixture transform in the validation plan, with no Playwright request/HAR routing and verified HTTP cache hits.

## Performance and manual qualification

Phase 1 created the evidence directory and seeded manual/release obligations. T013/T014 captured immutable source/assets and synthetic save fixtures; T018/T019 captured the automated rendered-context baseline in `art/cosmic-horror/review/baseline/capture-04/`, indexed with screenshot hashes in `art/cosmic-horror/baseline.json`; earlier unindexed captures are diagnostic only. Native context measurements remain BLOCKED. T040–T042 captured the automated Chromium performance baseline in `validation/cosmic-horror/performance/baseline.json`; native qualification and candidate comparison remain separate. Serve the immutable baseline from an isolated local snapshot and the candidate separately, both with the same static server/cache policy. Against each server, use:

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

Use a new output-root name for each preparation. Candidate reports are named by source hash and cannot be overwritten. Preserve the baseline and its diagnostic sidecars. The baseline preparation used `baseline tests/fixtures/legacy/source .cache/performance-baseline-03 3cfaf54babae978c7388c023f5df5ebe6282259b` as the helper arguments. These are sequential runs against the matching served revision, not simultaneous commands against an unchanged server. The runner verifies expected revision/hash metadata. Record five or more samples per workload, browser/device/network, cold/warm cache, raw durations, asset bytes and the threshold calculation. Follow [validation-plan.md](validation-plan.md) for exact boundaries.

Complete the seeded `validation/cosmic-horror/manual.md` and `gates.json` records with PASS/FAIL/BLOCKED/OPEN/N/A results, expected/actual results and evidence for native browsers/touch, keyboard/focus, art, text and the horror boundary. Record exact target versions before baseline collection; unavailable physical devices/native browsers remain BLOCKED. Then run `npm run validate:evidence`. Automation never invents manual reviewer results.

## CI contract

The configured `.github/workflows/validate.yml` selects the pinned Node/npm toolchain and runs eight independent required jobs: unit, integration, browser, lint, format, art, audit and evidence. Integration/browser jobs run `npx playwright install --with-deps chromium firefox webkit`. All jobs use `mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`; the digest was resolved from Microsoft's registry. The first CI run must record actual runner OS metadata; no remote execution is claimed yet. Reports upload on failure, and incomplete art/evidence checks are not skipped.

GitHub inspection found main unprotected with no repository rulesets. Required-check enforcement is BLOCKED until T138 configures it and verifies actual emitted contexts. See [ci.md](../../validation/cosmic-horror/ci.md). Release qualification additionally requires the completed manual/native/art index and matched performance results.

## Next workflow command

Continue with Phase 7D (T122–T128), the next independent implementation package
in [tasks.md](tasks.md). Phase 7A completes pure legacy presentation migration,
exact portrait mapping, safe historical logs and persistent raw-history recovery.
The [Phase 7A evidence](../../validation/cosmic-horror/phase-7a.md) records 2,547
unit passes and 81 scoped browser/integration passes across all three engines,
plus passing lint and formatting. Phase 7B now completes strict Latin-1/MC1 Unicode character exchange and transactional
import; see [Phase 7B evidence](../../validation/cosmic-horror/phase-7b.md):
2,554 unit passes and 96 scoped browser/integration passes across three engines.
Preview/cancel are read-only; failed commits retain the current session; explicit
session-only imports remain unsaved until reload and can be exported. Import
cancels owned delayed screen/combat work. Phase 7C completes saved-combat continuation and scoped timer/audio/listener
ownership; see [Phase 7C evidence](../../validation/cosmic-horror/phase-7c.md):
2,554 unit passes, 342 broad browser/integration passes, and 51 final scoped
passes across three engines. The report also preserves an intermediate
249-pass run with three corrected test-ordering failures. Complete recovery,
clipboard/conflict workflows and US5 native acceptance remain unfinished.

Phase 6D connects image recovery, joins all 80 delivered
art assets and corrects recorded stat/allocation reflow findings. The
[US4 evidence](../../validation/cosmic-horror/us4.md) records 2,539 unit passes,
583 full-run browser/integration passes plus two timing/setup failures, and
51 final scoped passes covering both affected cases and the final layout.
All 24 recovery journeys and 486 final remaining-symbol captures pass.
`validate:art` and `validate:evidence` still fail for incomplete context/native
and release qualification; implementation completion does not waive those gates.
Earlier status paragraphs describe historical increments.

Preserve the immutable baseline. Routine integration runs omit
`CAPTURE_BASELINE_DIR`; new capture directories use exclusive writes. The maintainer has [approved all 80 delivered artworks](../../validation/cosmic-horror/art-approval-2026-10-07-complete.md), closing T107 human artwork review. Native/manual, full-page coordinate, performance and release gates remain OPEN/BLOCKED. Optional `/speckit.git.commit` hooks were not executed.
