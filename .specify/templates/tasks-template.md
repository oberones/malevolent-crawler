---
description: "Task list template for test-driven JavaScript web implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md, spec.md, `.specify/memory/constitution.md`; available
research.md, data-model.md, contracts/, and quickstart.md

**Tests**: REQUIRED for every new or changed behavior. Schedule the red test run
before its implementation, then green verification and refactoring. Include
regression/characterization tests for legacy changes. Documentation-only changes
need relevant validation; any other exception must follow constitution governance.

**Comments**: Every new/modified function needs a concise purpose comment; public
interfaces and non-obvious contracts need applicable JSDoc details. Include this
work in implementation tasks and review comments at each story checkpoint.

**Organization**: Group tasks by user story and give every quality requirement and
validation artifact an explicit task owner. Generic optional-test examples in
installed skills do not override this project's constitution.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel only when files and prerequisites are independent.
- **[Story]**: Story identifier such as US1, US2, or US3; omit for shared setup/polish.
- Use sequential task IDs and exact file paths, including evidence destinations.
- Implementation MUST depend on its observed failing behavioral test, even if [P].

## Path Conventions

- Existing application: `index.html`, `assets/js/`, `assets/css/`.
- Proposed tests: `tests/unit/`, `tests/integration/`, `tests/browser/`.
- Feature records: `specs/[###-feature-name]/`; validation notes can use `quickstart.md`.
- Resolve all example paths against the approved plan; do not assume a framework.

<!--
Replace all sample tasks below with concrete tasks based on spec.md and plan.md.
Add or remove story phases to match the feature. Preserve test-first dependencies,
function documentation, applicable quality checks, and evidence ownership.
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish repeatable checks before application behavior changes.

- [ ] T001 Record verified layout, supported runtime/browser versions, and commands in specs/[###-feature-name]/plan.md
- [ ] T002 Configure test/lint/format checks in package.json and synchronize package-lock.json
- [ ] T003 Configure automated checks in .github/workflows/quality.yml (or plan-selected CI path); include the build only when configured

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build only the shared boundaries required by the feature; TDD also applies here.

- [ ] T004 Add deterministic clock/random/storage fixtures in tests/helpers/[name].js and run a failing boundary test in tests/unit/[boundary].test.js
- [ ] T005 Implement the tested boundary in assets/js/[boundary].js with function comments; confirm green, refactor, and rerun relevant tests
- [ ] T006 Record failure/pass evidence and initial validation setup in specs/[###-feature-name]/quickstart.md

**Checkpoint**: Required tooling and foundational tests pass before dependent story code.

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [User-observable outcome]
**Independent Test**: [Acceptance scenario and expected result]

### Tests for User Story 1 (REQUIRED)

- [ ] T007 [P] [US1] Write unit/regression tests for [rules and boundaries] in tests/unit/[name].test.js; run and record intended failures
- [ ] T008 [P] [US1] Write integration/browser tests for [changed boundary or journey] in tests/[integration-or-browser]/[name].test.js; run and record intended failures

### Implementation for User Story 1

- [ ] T009 [US1] Implement minimum passing [behavior] in assets/js/[name].js with function comments and applicable JSDoc (depends on T007/T008)
- [ ] T010 [US1] Refactor [behavior] in assets/js/[name].js with tests green; verify input/error handling and resource cleanup
- [ ] T011 [US1] Verify applicable accessibility/browser/data/performance criteria and record commands, outcomes, and manual checks in specs/[###-feature-name]/quickstart.md

**Checkpoint**: US1 passes its tests; comments and required browser checks are reviewed.

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [User-observable outcome]
**Independent Test**: [Acceptance scenario and expected result]

### Tests for User Story 2 (REQUIRED)

- [ ] T012 [US2] Write and run failing [unit/integration/browser] tests in tests/[level]/[name].test.js, including relevant failures and legacy compatibility

### Implementation for User Story 2

- [ ] T013 [US2] Implement [behavior] in assets/js/[name].js with function comments and applicable JSDoc; confirm green (depends on T012)
- [ ] T014 [US2] Refactor with tests green and record regression/browser/quality results in specs/[###-feature-name]/quickstart.md

**Checkpoint**: US1 and US2 remain independently verifiable; comments are current.

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [User-observable outcome]
**Independent Test**: [Acceptance scenario and expected result]

### Tests for User Story 3 (REQUIRED)

- [ ] T015 [US3] Write and run failing [unit/integration/browser] tests in tests/[level]/[name].test.js, including relevant failures and legacy compatibility

### Implementation for User Story 3

- [ ] T016 [US3] Implement [behavior] in assets/js/[name].js with function comments and applicable JSDoc; confirm green (depends on T015)
- [ ] T017 [US3] Refactor with tests green and record regression/browser/quality results in specs/[###-feature-name]/quickstart.md

**Checkpoint**: Each implemented story meets its acceptance criteria.

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T018 Review function comments/JSDoc in changed JavaScript files and update README.md commands/documentation
- [ ] T019 Run all required tests/lint/format checks and the build when configured; record results in specs/[###-feature-name]/quickstart.md
- [ ] T020 Complete applicable manual keyboard/focus/browser checks, dependency/security review, and performance measurements; record evidence in specs/[###-feature-name]/quickstart.md
- [ ] T021 Recheck constitution compliance and resolve or document approved exceptions in specs/[###-feature-name]/plan.md

## Dependencies & Execution Order

### Phase Dependencies

- Setup precedes foundational code; foundational prerequisites precede dependent stories.
- A story's tests must fail for the intended missing behavior before its code changes.
- Final validation depends on all in-scope story work and comment updates.

### User Story Dependencies

- Record actual dependencies from the feature plan; do not invent cross-story blockers.
- Independent stories can proceed concurrently once their shared prerequisites pass.

### Within Each User Story

1. Write an observable behavioral test and confirm the intended failure.
2. Implement the minimum passing behavior with its function comments.
3. Refactor with tests green; repeat this cycle for the next behavior.
4. Verify affected boundaries/journeys and record actual evidence before completion.

### Parallel Opportunities

- Independent test authoring and independent stories may run concurrently.
- Shared-file edits and test-to-implementation dependencies remain sequential.

## Parallel Example: User Story 1

```text
T007 and T008: independent test files can be authored concurrently.
T009: starts only after the corresponding behavioral tests have failed as expected.
T010 and T011: follow passing implementation; honor any shared-file dependencies.
```

## Implementation Strategy

### MVP First (User Story 1 Only)

Complete setup and required foundations, then deliver US1 through red–green–refactor
and its browser/quality checks before declaring the MVP ready.

### Incremental Delivery

Add one verifiable story at a time and rerun affected regression tests. Schedule
tests before code for every increment, including fixes discovered during validation.

### Parallel Team Strategy

Allocate only independent files/stories to separate contributors; each contributor
must preserve the same TDD sequence and shared quality gates.

## Notes

- Do not defer behavioral tests, error handling, or function comments to polish.
- Record PASS, FAIL, BLOCKED, or justified N/A accurately; missing evidence is not a pass.
- Manual browser acceptance and automated test results are separate evidence.
- Approved exceptions need scope, reason, risk, compensating checks, owner, and expiry.
