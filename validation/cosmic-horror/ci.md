# CI setup and enforcement

Owner: T006; recorded 2026-10-06. Configuration is complete; remote execution and enforcement are not acceptance passes.

`.github/workflows/validate.yml` runs on pull requests, pushes to main/master/the feature branch, and manual dispatch. Eight independent matrix jobs use Node 24.21.0/npm 12.2.0, `npm ci` with lifecycle scripts disabled, and the resolved version-matched Playwright noble image digest recorded in environment.json. Integration/browser jobs explicitly install the matching engines. Shell pipefail preserves command failures through report capture; no continue-on-error, pass-with-no-tests, conditional skip of incomplete gates, or placeholder validator is present. Reports upload even when a check fails. The immutable image identifies Ubuntu 24.04; actual runner OS data will be uploaded by the first CI run.

| Required job/check name | Command                        | Current local scope/status                                                                                       |
| ----------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| unit                    | `npm run test:unit`            | PASS: tooling boundary tests only; gameplay suites begin in Phase 2                                              |
| integration             | `npm run test:integration`     | PASS: static HTTP and MIME checks only                                                                           |
| browser                 | `npm run test:browser`         | PASS: fresh entry, module evaluation, input fixtures at three viewports/engines                                  |
| lint                    | `npm run lint`                 | FAIL: inventoried legacy findings, owner T046                                                                    |
| format                  | `npm run format:check`         | FAIL: inventoried untouched source/design formatting debt, owner T046                                            |
| art                     | `npm run validate:art`         | OPEN; exits nonzero until T035/T036 implement the validator and collection is delivered                          |
| audit                   | `npm audit --audit-level=high` | PASS locally; rerun in CI and before merge                                                                       |
| evidence                | `npm run validate:evidence`    | OPEN; exits nonzero until T038/T039 implement validator; required manual/art/performance gates remain unresolved |

GitHub inspection: default branch main; repository rulesets `[]`; main `protected: false`. See [branch result](reports/branch-protection.json). Enforcement is **BLOCKED**: required checks are not configured in branch protection/rulesets. This setup does not change repository policy or claim an unpushed workflow ran. T138 must run the workflow, confirm the emitted check context names above, then enforce all eight before merge. T139 additionally requires manual/native/art and matched performance evidence. No release waiver exists.

The build gate is N/A because the app remains static. Performance execution belongs to T040–T042/T133–T134: one worker, no retries/traces/video, explicit external prepared baseline/candidate server. Its fixture/source/stage validations are not yet implemented and must precede measurements.
