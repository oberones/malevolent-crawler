# CI setup and enforcement

## Current policy — 2026-10-08

The maintainer approved six ongoing PR jobs: **unit, integration, browser, lint,
format and audit**. Their purpose is to detect code regressions and dependency
issues. Accepted art and refactor qualification do not require continuous approval.
The strict evidence validator remains available locally and through the manual-only
`release-evidence.yml` workflow. It is not a required merge check. This supersedes
the seven-job requirements in the historical sections below and in T138 guidance.
Existing qualification statuses are retained as historical evidence, not rewritten
as passes. Future code changes retain the constitution's testing obligations.

PR #1 at `3b755d2c31062a226119b1b46c13968ec3fff33c` exposed two container setup
failures: Git rejected checkout ownership (2,402 unit passes, one failure), and
Firefox refused a home directory owned by another user (194 integration passes,
94 Firefox launch failures). The workflow now assigns home-directory ownership
to the executing container user and adds only `$GITHUB_WORKSPACE` to Git's trusted
directories in the shell environment. Browser assertions remain enabled.

Remote evidence: [PR workflow run](https://github.com/oberones/malevolent-crawler/actions/runs/37861771189).
The fixes require a new remote run for Linux/Firefox confirmation; local macOS
checks cannot establish that result. No branch-protection change is included.

Local verification with Node 24.21.0/npm 12.2.0: all 2,403 unit tests, lint,
formatting and whitespace checks pass. An isolated Git config with
`GIT_TEST_ASSUME_DIFFERENT_OWNER=1` reproduces the ownership error; executing the
exact workflow trust command then passes the retained-source comparison test.
YAML parsing confirms six routine jobs and a manual-dispatch-only evidence
workflow. The local Docker daemon is unavailable, so the container ownership fix
for Firefox remains pending remote verification.

## Historical setup

Owner: T006; recorded 2026-10-06. Configuration is complete; remote execution and enforcement are not acceptance passes.

`.github/workflows/validate.yml` runs on pull requests, pushes to main/master/the feature branch, and manual dispatch. Seven independent matrix jobs use Node 24.21.0/npm 12.2.0, `npm ci` with lifecycle scripts disabled, and the resolved version-matched Playwright noble image digest recorded in environment.json. Integration/browser jobs explicitly install the matching engines. Shell pipefail preserves command failures through report capture; no continue-on-error, pass-with-no-tests, conditional skip of incomplete gates, or placeholder validator is present. Reports upload even when a check fails. The immutable image identifies Ubuntu 24.04; actual runner OS data will be uploaded by the first CI run.

| Required job/check name | Command                        | Current local scope/status                                                                                           |
| ----------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| unit                    | `npm run test:unit`            | PASS: tooling boundary tests only; gameplay suites begin in Phase 2                                                  |
| integration             | `npm run test:integration`     | PASS: static HTTP and MIME checks only                                                                               |
| browser                 | `npm run test:browser`         | PASS: fresh entry, module evaluation, input fixtures at three viewports/engines                                      |
| lint                    | `npm run lint`                 | FAIL: inventoried legacy findings, owner T046                                                                        |
| format                  | `npm run format:check`         | FAIL: inventoried untouched source/design formatting debt, owner T046                                                |
| audit                   | `npm audit --audit-level=high` | PASS locally; rerun in CI and before merge                                                                           |
| evidence                | `npm run validate:evidence`    | OPEN; exits nonzero until T038/T039 implement validator; required non-art manual/performance gates remain unresolved |

GitHub inspection: default branch main; repository rulesets `[]`; main `protected: false`. See [branch result](reports/branch-protection.json). Enforcement is **BLOCKED**: required checks are not configured in branch protection/rulesets. This setup does not change repository policy or claim an unpushed workflow ran. T138 must run the workflow, confirm the emitted check context names above, then enforce all seven before merge. T139 additionally requires manual/native and matched performance evidence. No release waiver exists.

The build gate is N/A because the app remains static. Performance execution belongs to T040–T042/T133–T134: one worker, no retries/traces/video, explicit external prepared baseline/candidate server. Its fixture/source/stage validations are not yet implemented and must precede measurements.

## Art CI retirement — 2026-10-08

The maintainer removed the ongoing art matrix job and art dependencies from the
evidence validator. Seven jobs remain. Masters, legacy raster art and screenshot
collections are not required for a fresh checkout. This scope change does not
mark unresolved non-art gates as passed or assert remote CI execution.

## Phase 8 verification — 2026-10-08

Read-only live GitHub inspection found `main.protected: false`, no repository
rulesets and no workflow runs returned. Evidence:
[branch](reports/phase-8/branch-protection.json),
[rulesets](reports/phase-8/rulesets.json),
[runs](reports/phase-8/ci-runs.json).
The candidate remains an uncommitted local working tree based on
`ea372b73418ddd6af4461b510b9942f073a2f458`; no final-candidate job URLs exist.
No optional commit, push or policy mutation was performed.

The local Docker client is installed but its configured Rancher Desktop daemon
socket `/Users/oberon/.rd/docker.sock` does not exist. The pinned Linux CI image
therefore could not execute locally. Actual remote CI and merge enforcement are
BLOCKED; local macOS checks are recorded separately in `automated.json`.

The seven configured jobs still require successful final-candidate execution,
verified emitted context names and protected-branch enforcement before merge.
The historical table above records Phase 1 outcomes; current local lint, formatting,
unit, browser, audit and validator results are in the Phase 8 record. Performance
fixture/hash validation is now implemented and must remain enabled.
