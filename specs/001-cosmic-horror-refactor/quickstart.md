# Quickstart: Planned Implementation and Verification

## Current state

This is a planning artifact. The repository currently has no test/lint/format/build scripts, test directory, or installed `node_modules`. Only the existing Howler dependency is declared. Commands below that reference new packages, scripts, fixtures, configuration, or art are **proposed setup/check contracts** and become runnable only when the foundation tasks implement them. No application checks are claimed passed by planning.

Run implementation commands from the repository root. Read the [plan](plan.md), [validation plan](validation-plan.md), and constitution first. The baseline application revision is `3cfaf54babae978c7388c023f5df5ebe6282259b`; preserve source/asset hashes and representative saves before replacing content.

## Toolchain and dependency setup (foundation task)

Select Node.js **24.21.0** and npm **12.2.0**; record these in `.nvmrc`, package `engines`, and `packageManager`. Local observation was Node 20.20.2/npm 10.8.2, so do not assume the selected versions are installed. Verify `node --version` and `npm --version` before setup. Choose/install the runtime using the user's normal runtime manager; this plan does not silently change global tooling.

After the runtime is selected, the proposed exact dependency installation is:

```sh
npm install --save-dev --save-exact @playwright/test@1.63.0 @axe-core/playwright@4.13.0 eslint@10.12.0 @eslint/js@10.0.1 globals@17.13.0 prettier@3.9.9 http-server@14.1.1 sharp@0.35.5
```

Retain Howler 2.2.3, synchronize package/lockfile, and pin installs through the committed lockfile. Review necessary dependency lifecycle scripts individually, especially native image tooling; do not enable arbitrary install scripts globally. Record top-level and transitive/native licenses, maintenance/advisory findings, and browser cost. New dependencies are development-only and must not be referenced by production scripts.

| Package | Verified metadata / top-level license |
| --- | --- |
| Playwright 1.63.0 | [Registry metadata](https://registry.npmjs.org/@playwright%2ftest/1.63.0), Apache-2.0 |
| axe Playwright 4.13.0 | [Registry metadata](https://registry.npmjs.org/@axe-core%2fplaywright/4.13.0), MPL-2.0 |
| ESLint 10.12.0 / JS config 10.0.1 | [ESLint](https://registry.npmjs.org/eslint/10.12.0), [JS config](https://registry.npmjs.org/@eslint%2fjs/10.0.1), MIT |
| globals 17.13.0 | [Registry metadata](https://registry.npmjs.org/globals/17.13.0), MIT |
| Prettier 3.9.9 | [Registry metadata](https://registry.npmjs.org/prettier/3.9.9), MIT |
| http-server 14.1.1 | [Registry metadata](https://registry.npmjs.org/http-server/14.1.1), MIT |
| Sharp 0.35.5 | [Registry metadata](https://registry.npmjs.org/sharp/0.35.5), Apache-2.0; review bundled/native dependencies separately |
| npm 12.2.0 | [Registry metadata](https://registry.npmjs.org/npm/12.2.0), Artistic-2.0 |

Version/metadata checks are research evidence, not an executed clean-install or security pass.

## Package-script contract (to implement)

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

Implement `playwright.config.mjs` with engine projects named `chromium`, `firefox`, `webkit`; suites cover viewport/input combinations as fixtures rather than inventing branded-browser qualification. Its managed `webServer` runs the matching static server and tears it down. `test:performance` reads required `PERF_STAGE=baseline|candidate` and `BASE_URL`; it fails with an actionable error if the baseline manifest or target metadata is missing. Never overwrite baseline evidence in candidate mode.

`art:prepare` consumes generation masters and the manifest without modifying the baseline. `validate:art` checks full decoding, dimensions, alpha, mapping, ICO and manifest integrity. `validate:evidence` checks that required automated/manual entries and art-review records contain real results and evidence files; it fails on OPEN/FAIL/BLOCKED required release gates. These development utilities have red–green tests for malformed inputs and missing artifacts before their implementation.

ESLint uses explicit browser/classic-script globals for legacy files and module/Node scopes for new files; no accidental global write is introduced. Do not blanket-disable rules to make legacy errors disappear. Capture existing findings, characterize before corrections, and fix scoped violations. Prettier and ESLint exclude vendored/minified assets, `.agents`, `.specify`, generation masters, and raw evidence; include owned application/tool/test files, README, AGENTS, and feature documentation. Document every touched/new function, including test callbacks; public/non-obvious interfaces use JSDoc.

## Repeatable local checks (after setup)

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

The foundation task creates the evidence directory and baseline workload fixtures. Serve the immutable baseline from an isolated local snapshot and the candidate separately, both with the same static server/cache policy. Against each server, use:

```sh
PERF_STAGE=baseline BASE_URL=http://127.0.0.1:4174 npm run test:performance
PERF_STAGE=candidate BASE_URL=http://127.0.0.1:4174 npm run test:performance
```

These are sequential runs against the matching served revision, not simultaneous commands against an unchanged server. The runner verifies expected revision/hash metadata. Record five or more samples per workload, browser/device/network, cold/warm cache, raw durations, asset bytes and the threshold calculation. Follow [validation-plan.md](validation-plan.md) for exact boundaries.

Complete `validation/cosmic-horror/manual.md` with checkbox-driven PASS/FAIL/BLOCKED/N/A records, expected/actual results and evidence for native browsers/touch, keyboard/focus, art, text and the horror boundary. Record exact target versions before baseline collection; unavailable physical devices/native browsers remain BLOCKED. Then run `npm run validate:evidence`. Automation never invents manual reviewer results.

## CI contract

The future `.github/workflows/validate.yml` selects the pinned Node/npm toolchain, runs `npm ci`, installs Playwright engines with `npx playwright install --with-deps chromium firefox webkit`, and runs the automated sequence above on pull requests. Use the planned Ubuntu 24.04 `mcr.microsoft.com/playwright:v1.63.0-noble` container and record/pin its resolved digest and OS image metadata during foundation setup; do not assume its bundled Node/npm match the selected toolchain. Cache only by lockfile/engine revision; upload test reports and raw evidence even on failure. Enforce these jobs as required merge checks. Release qualification additionally requires the completed evidence index/manual gates and matched performance result. Record configuration or unavailable-runner/device blockers explicitly.

## Next workflow command

The dependency-ordered [task backlog](tasks.md) is complete. Run `$speckit-implement` to begin with Phase 1 setup, following the backlog's package entry/exit gates. After later spec/plan/task edits, rerun `$speckit-analyze` to check consistency. Planning and task generation have not generated replacement artwork, installed dependencies, changed gameplay, or satisfied implementation/acceptance gates.
