# Quickstart: Planned Implementation and Verification

## Current state

Phase 1 setup is implemented. Node 24.21.0/npm 12.2.0 and the exact dependency pins below were installed and verified through nvm, leaving its default alias unchanged. `npm ci` succeeds with install scripts disabled. All three matching Playwright engines are installed. The static-server, module-MIME, three-viewport/input smoke checks and tooling-scope unit tests pass; these do not certify gameplay or native acceptance.

Repository-wide lint and formatting currently fail on [inventoried legacy debt](../../validation/cosmic-horror/legacy-debt.md). Art preparation/validation, release-evidence validation and matched performance are configured command contracts whose tools/suites belong to T035–T042; they are not implemented yet and exit nonzero. The complete [execution record](../../validation/cosmic-horror/phase-1.md) distinguishes setup PASS from OPEN/BLOCKED release obligations.
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

`playwright.config.mjs` configures engine projects named `chromium`, `firefox`, `webkit`; suites cover viewport/input combinations as fixtures rather than inventing branded-browser qualification. Its managed `webServer` runs the matching static server and tears it down. `test:performance` is reserved for T040/T041, which must validate required `PERF_STAGE=baseline|candidate`, `BASE_URL`, baseline manifests and target metadata with actionable errors before collecting any measurement. Its configuration already separates the external performance server and disables retries/trace/video; no performance suite exists yet. Never overwrite baseline evidence in candidate mode.

After T035/T036, `art:prepare` consumes generation masters and the manifest without modifying the baseline. `validate:art` checks full decoding, dimensions, alpha, mapping, ICO and manifest integrity. After T038/T039, `validate:evidence` checks that required automated/manual entries and art-review records contain real results and evidence files; it fails on OPEN/FAIL/BLOCKED required release gates. These development utilities have red–green tests for malformed inputs and missing artifacts before their implementation.

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

Phase 1 created the evidence directory and seeded manual/release obligations; T013/T014 and T040–T042 still own immutable snapshots and baseline workload fixtures. Serve the immutable baseline from an isolated local snapshot and the candidate separately, both with the same static server/cache policy. Against each server, use:

```sh
PERF_STAGE=baseline BASE_URL=http://127.0.0.1:4174 npm run test:performance
PERF_STAGE=candidate BASE_URL=http://127.0.0.1:4174 npm run test:performance
```

These are sequential runs against the matching served revision, not simultaneous commands against an unchanged server. The runner verifies expected revision/hash metadata. Record five or more samples per workload, browser/device/network, cold/warm cache, raw durations, asset bytes and the threshold calculation. Follow [validation-plan.md](validation-plan.md) for exact boundaries.

Complete the seeded `validation/cosmic-horror/manual.md` and `gates.json` records with PASS/FAIL/BLOCKED/OPEN/N/A results, expected/actual results and evidence for native browsers/touch, keyboard/focus, art, text and the horror boundary. Record exact target versions before baseline collection; unavailable physical devices/native browsers remain BLOCKED. Then run `npm run validate:evidence`. Automation never invents manual reviewer results.

## CI contract

The configured `.github/workflows/validate.yml` selects the pinned Node/npm toolchain and runs eight independent required jobs: unit, integration, browser, lint, format, art, audit and evidence. Integration/browser jobs run `npx playwright install --with-deps chromium firefox webkit`. All jobs use `mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`; the digest was resolved from Microsoft's registry. The first CI run must record actual runner OS metadata; no remote execution is claimed yet. Reports upload on failure, and incomplete art/evidence checks are not skipped.

GitHub inspection found main unprotected with no repository rulesets. Required-check enforcement is BLOCKED until T138 configures it and verifies actual emitted contexts. See [ci.md](../../validation/cosmic-horror/ci.md). Release qualification additionally requires the completed manual/native/art index and matched performance results.

## Next workflow command

Phase 1 (T001–T008) is complete as setup and evidence scaffolding. Continue with Phase 2A (T009–T014), preserving the immutable baseline and red–green ordering. No gameplay, art replacement, native acceptance or release completion is implied. Optional `/speckit.git.commit` hooks are available before/after implementation; neither was executed for Phase 1.
