# Phase 2A completion record

**Scope:** T009–T014, deterministic test harness and immutable inputs. **Status:** PASS for this package's exit. Recorded 2026-10-06 by the implementation agent. Phase 2B is next; Phase 2 as a whole and release qualification remain OPEN. No production application code, numerical rule, player save or runtime asset changed.

## Delivered evidence

| Task | Result                                                                                                                                                              | Evidence                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T009 | Five intended assertion failures before helper implementation                                                                                                       | [red](reports/t009-red.txt), [TDD record](tdd.md)                                                                                                             |
| T010 | Ordered finite random tapes; simulated cancellable timers; fault-injectable string storage; disposable audio; independent case ownership                            | `tests/helpers/`, [green](reports/t010-green.txt), [final unit run](reports/phase-2a-unit.txt)                                                                |
| T011 | Trusted-script execution, missing DOM stubs, fresh globals, timer disposal, inert data and independently known calculations fail through documented interface seams | [unit red](reports/t011-red.txt), [real-browser red](reports/t011-browser-red.txt)                                                                            |
| T012 | Isolated classic VM and owned real-browser context; explicit stubs; cloned value transfer; strict random consumption; real frozen-page boot and teardown            | [unit green](reports/t012-green.txt), [integration](reports/phase-2a-integration.json)                                                                        |
| T013 | 105 files / 62,224,531 bytes from local Git revision `3cfaf54babae978c7388c023f5df5ebe6282259b`; all 53 sprites and both favicons retained byte-for-byte            | `tests/fixtures/legacy/source/`, `tests/fixtures/legacy/baseline.json`, `art/cosmic-horror/baseline.json`, [verification](reports/t013-t014-verification.txt) |
| T014 | 19 synthetic save cases, four Latin-1 character exports, explicit authoritative outcomes and reset/retention matrix                                                 | `tests/fixtures/legacy/saves.json`, `exports.json`, `expected-state.json`, [replay verification](reports/t013-t014-verification.txt)                          |

The source-tree aggregate SHA-256 is `57707f49243750a7410eb6c98329c9624c6bf5f2119ac6f867f3837a7321637a`. It hashes sorted `path + NUL + sha256 + newline` entries. Capture used local `git ls-tree` and `git show` with exclusive file creation, selecting `index.html`, `LICENSE` and every `assets/` blob. It did not copy candidate files, download a remote baseline, or alter source text. Tests compare all captured bytes independently to the named Git blobs and decode all PNGs. The original ICO directory/DIB header retains one 127 × 128, 32-bit entry. The unit CI checkout now fetches history so the original revision is available; remote CI execution remains unverified.

## Corpus and oracle limits

The cases cover early/unallocated and early-player-only records, allocated resting state, normal/guardian/boss/chest-mimic/door-mimic encounters, both Skeleton Mage branches, six equipped objects and duplicate encoded inventory entries, optional/null/derived fields, real fractional enemy EXP (`924691.3578`), completed victory/death, and interrupted terminal/missing-enemy/malformed-item tuples. Exports preserve the Latin-1 name `Márin ÿ`. All data is synthetic.

Generation recipes record initial state, trusted calls, exact consumed random draws and explicit synthetic active-state flags. Replay asserts complete state equality and exhausts the tape. Starting HP/ATK/DEF/speed, duplicate counts, variant paths, guardian progression, victory reward amounts, fractional EXP and reset retention have independent assertions. Early creation uses the real original submit handler; generated items and encounters use the immutable rules. Completed death/victory execute the original `hpValidation`. Reset fixtures execute `progressReset`; full import confirmation/recovery journeys remain owned by later tasks.

The lightweight DOM inventory is explicit in `dom-selectors.json`; missing selectors throw instead of silently fabricating nodes. Stubs keep markup inert and provide no layout, parsing, focus or accessibility oracle. The VM is for trusted repository source only, not a security sandbox for arbitrary code. Player values cross as cloned data, never interpolated source. The browser fixture owns and closes its context, seeds localStorage, optionally installs a finite random tape, and blocks external requests. Its request routing is functional-test-only and must not be used for matched performance measurement.

## Verification and review

Commands run with Node 24.21.0/npm 12.2.0 selected through the existing nvm installation:

| Check                                                                                           | Result                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`                                                                             | PASS, 36 tests, no skips; [output](reports/phase-2a-unit.txt)                                                                                                         |
| `npm run test:integration`                                                                      | PASS, 12 tests across Chromium/Firefox/WebKit; includes two independent frozen-page boots per engine and context teardown; [output](reports/phase-2a-integration.txt) |
| Scoped ESLint on configuration, helpers, unit tests, browser fixture and trusted fixture script | PASS; [output](reports/phase-2a-lint.txt)                                                                                                                             |
| Scoped formatting of all Phase 2A additions/edits                                               | PASS; [output](reports/phase-2a-format-check.txt)                                                                                                                     |
| `npm run test:browser`                                                                          | PASS, 18 existing smoke cases across three engines/viewports; [output](reports/phase-2a-browser.txt)                                                                  |
| `npm run lint`                                                                                  | FAIL, 318 existing findings in untouched classic code; T046 owns remediation; [output](reports/phase-2a-full-lint.txt)                                                |
| `npm run format:check`                                                                          | FAIL, 20 untouched legacy/design files; [output](reports/phase-2a-full-format.txt)                                                                                    |
| `git diff --check`                                                                              | PASS                                                                                                                                                                  |
| Production build                                                                                | N/A; static delivery with no build pipeline                                                                                                                           |

The first sandboxed browser attempt could not bind loopback port 4173. It was rerun with the permitted local-server execution context; the recorded red is a genuine storage/randomness assertion failure, not that environment failure. The subsequent three-engine runs passed.

Self-review checked explicit dependency ownership, no live network/timer dependency in unit tests, complete RNG consumption, storage byte preservation, adjacent purpose comments, original image bytes, fixture multiplicity, late-bound classic state, and honest separation of stub/automated/native evidence. A narrow lint scope was added for the trusted classic test fixture after a failing scope test; undeclared writes remain errors. The corpus is an input foundation, not exhaustive protected-rule characterization.

Repository-wide lint/format debt, final art, geometry, performance, native/manual acceptance, remote CI and merge enforcement remain open; their exact current command results are in the companion reports. No manual checkbox or art review was marked passed. Source dimensions are recorded; glyph contexts remain empty/OPEN for T018/T019.

## Handoff

Only T009–T014 are completed by this package. Continue with **Phase 2B, T015–T019**: exhaustive encounter/equipment/progression characterization and original rendered symbol measurements. Do not regenerate the frozen source from the candidate. Fetch the original Git history if running verification from a shallow checkout. Phase 2G integration remains gated on the preceding foundation packages.

Optional before/after hook `/speckit.git.commit` was not executed. Changes remain reviewable in the working tree.
