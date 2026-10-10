<!--
Sync Impact Report
Version change: unratified template -> 1.0.0 (initial adoption)
Modified principles: all five unnamed template slots replaced by:
  I. Test-Driven Development
  II. Simple, Modular JavaScript
  III. Clear Function Documentation
  IV. Safe Data and Explicit Failures
  V. Accessible, Compatible Web Experiences
Added principle: VI. Reproducible Delivery and Measured Performance
Added sections: Web Application Standards; Development Workflow and Quality Gates;
  concrete Governance rules (replacing template placeholders).
Removed sections: none; illustrative template comments removed.
Synchronization:
  ✅ updated .specify/templates/plan-template.md
  ✅ updated .specify/templates/spec-template.md
  ✅ updated .specify/templates/tasks-template.md
  ✅ updated README.md
  ✅ updated AGENTS.md (constitution precedence over generic optional-test guidance)
  ✅ reviewed .specify/templates/checklist-template.md; no changes required
  ✅ reviewed .specify/templates/constitution-template.md; reusable scaffold retained
  ✅ command audit: .specify/templates/commands/ is absent; installed task, plan,
     and implementation skills reviewed. Project rules in AGENTS.md override
     generic optional-test examples without modifying installed skills.
  ✅ current feature plan/spec/tasks and docs/quickstart.md are absent;
     no existing feature artifacts require migration.
Deferred placeholders: none.
Implementation follow-up: the first behavior-changing implementation MUST establish
  the missing automated test/lint/format checks; this documentation change does not
  claim that the existing application already complies.
-->
# Malevolent Crawler Constitution

## Core Principles

### I. Test-Driven Development

- Every new or changed application behavior MUST follow red–green–refactor: write a
  focused automated test, run it and observe failure for the intended missing behavior,
  implement the minimum solution, then refactor while the relevant tests remain green.
  A syntax error or broken test setup does not satisfy the red step.
- Bug fixes MUST begin with a regression test that reproduces the defect. Before
  restructuring untested legacy behavior, add characterization tests for behavior
  that must remain stable; intentional changes need failing acceptance tests.
- Tests MUST assert observable outcomes and meaningful boundaries, including failure
  cases. Use unit tests for game rules, integration tests for DOM/storage/audio
  boundaries, and browser tests for changed critical player journeys as applicable.
  Coverage numbers alone do not establish correctness.
- Tests MUST be isolated and repeatable. Control randomness, clocks, timers, storage,
  and external services; do not depend on live networks or arbitrary sleep durations.
- Documentation-only and nonbehavioral formatting changes need relevant validation,
  not artificial failing tests. Other exceptions require the Governance process.

Rationale: tests guide interfaces and preserve behavior while refactoring.
See [Martin Fowler's TDD description](https://martinfowler.com/bliki/TestDrivenDevelopment.html).

### II. Simple, Modular JavaScript

- Functions and modules MUST have one coherent responsibility. Keep game rules and
  state transitions separate from DOM rendering, persistence, audio, and networking.
  Pass dependencies explicitly so core rules can run without a browser.
- New modules MUST use standard ES modules. Changes to existing global scripts MUST
  avoid new implicit globals and isolate unavoidable legacy integration behind an
  explicit, documented boundary. Large migrations require a plan and regression tests.
- Use descriptive names, `const` by default, `let` for reassignment, and strict equality
  unless intentional coercion is documented and tested. Shared mutable state MUST have
  a clear owner; duplicated rules MUST have a single authoritative implementation.
- New abstractions, frameworks, and dependencies MUST solve a current requirement.
  Document why existing code or browser APIs are insufficient before adding them.

Rationale: small, explicit boundaries make behavior easier to test and change.
See [MDN's JavaScript module guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

### III. Clear Function Documentation

- Every new or modified function, method, and arrow function MUST have a clear, concise
  comment explaining its purpose. Put it immediately above the declaration or inline
  callback; a one-line purpose comment is sufficient for a simple private helper.
- Exported/public functions and functions with non-obvious contracts MUST use JSDoc
  with applicable parameter and return types, units or constraints, side effects,
  and thrown errors or promise rejection behavior. Omit tags that do not apply.
- Comments MUST explain intent, assumptions, or reasons that names and code alone do
  not convey. Do not narrate each statement or repeat the function name as its comment.
- Function comments MUST be reviewed and updated in the same change as the function.
  Generated and vendored third-party code is exempt; wrappers remain in scope.

Rationale: accurate local documentation makes contracts understandable at the call site.
Use the [JSDoc documentation format](https://jsdoc.app/about-getting-started).

### IV. Safe Data and Explicit Failures

- Treat form input, URLs, imported saves, browser storage, and network responses as
  untrusted. Validate shape, type, size, and domain constraints before using them.
  Parse data without executing it; never evaluate strings as application code.
- Render untrusted text with safe DOM APIs such as `textContent`. Inserting untrusted
  HTML requires a reviewed sanitizer and adversarial tests; escaping for one context
  MUST NOT be assumed safe in another. Keep secrets out of client assets and logs.
- Storage parsing, writes, migrations, and asynchronous operations MUST handle
  failure explicitly. Preserve recoverable player data, provide actionable feedback,
  and record useful diagnostic context without exposing private data. Empty catches
  and unhandled promise rejections are unacceptable.
- Save-format changes MUST define compatibility or migration behavior and test it
  with representative old, malformed, and unsupported-version data. Client-side
  validation MUST NOT serve as authorization if a backend is introduced.

Rationale: boundary checks protect both users and the integrity of game state.
See [OWASP's DOM XSS prevention guidance](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html).

### V. Accessible, Compatible Web Experiences

- New and changed UI MUST meet applicable WCAG 2.2 Level AA criteria. Use semantic
  HTML, labeled controls, keyboard operation, visible focus, sufficient contrast,
  and perceivable state/error feedback. Do not convey essential information only
  through color, sound, or pointer interaction.
- UI MUST remain usable across the viewport sizes and browser versions declared in
  the feature plan. Respect reduced-motion preferences and provide audio controls
  when motion or audio is introduced. Unsupported browser capabilities need a
  defined fallback or a clear explanation to the user.
- Changes to player journeys MUST include real-browser checks. Accessibility checks
  MUST combine appropriate automation with manual keyboard/focus verification;
  screenshots and unit tests alone cannot establish interactive usability.

Rationale: a feature is complete only when its intended users can operate it.
See [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### VI. Reproducible Delivery and Measured Performance

- Dependency changes MUST keep `package.json` and its lockfile synchronized. Document
  supported Node.js/npm versions, review dependency maintenance, licensing, security,
  and browser cost, and use `npm ci` for clean automated installs.
- The project MUST provide repeatable commands for tests, linting, and formatting
  checks, plus a production build when a build pipeline exists. Automated integration
  checks MUST run these commands and block merging when required checks fail.
- Performance-sensitive changes MUST define measurable budgets and a repeatable
  measurement procedure in the plan before implementation. Record the browser/device,
  workload, and before/after results; budget overruns require remediation or an
  approved exception. Do not optimize based only on intuition.
- Timers, listeners, animation loops, and other retained resources MUST have explicit
  cleanup. Tests MUST cover repeated setup/teardown where leaks or duplicate actions
  are possible.

Rationale: reproducible checks and measurements make regressions visible.
See [npm's clean-install documentation](https://docs.npmjs.com/cli/v11/commands/npm-ci/)
and [web.dev's performance budgets](https://web.dev/articles/performance-budgets-101).

## Web Application Standards

- This project is a browser JavaScript application currently served from `index.html`,
  `assets/js/`, and `assets/css/`. A framework, backend, or compile step is not required
  by this constitution. Record changes to that architecture in the current plan.
- New and modified code MUST follow these principles. Existing debt MUST be identified
  when it affects a change, with a scoped remediation task or approved exception;
  adopting this document does not certify untouched legacy code as compliant.
- No feature plan or automated test/lint/format scripts exist at adoption. The first
  behavior-changing implementation MUST establish those checks before changing
  application behavior and document exact runnable commands in `README.md` and its
  plan. For the current static application, build validation is N/A until a build
  pipeline is introduced; static asset loading and browser smoke checks still apply.
- Feature plans MUST name target browsers/viewports, testing tools, verification
  commands, state/storage boundaries, and applicable accessibility/security checks.
  Tools and runtime versions belong in the plan and configuration, not guesses here.
- The linked primary references explain the practices; the MUST rules in this
  constitution define project policy. Changes in external documents do not silently
  amend this constitution.

## Development Workflow and Quality Gates

1. **Specify**: Describe user-observable outcomes, acceptance scenarios, edge cases,
   data compatibility, and applicable browser/accessibility/performance constraints.
2. **Plan**: Complete the Constitution Check before implementation and recheck it after
   design. Map each rule to evidence or a justified N/A; track exceptions explicitly.
3. **Task**: Schedule test setup and failing behavioral tests before dependent code,
   including foundational code. Include function comments with implementation tasks,
   followed by refactoring, boundary tests, and applicable browser/manual checks.
4. **Implement**: Work in small red–green–refactor cycles. Record the failing test and
   subsequent passing result in the change description or validation notes; a separate
   failing commit is unnecessary. Keep each change scoped and reviewable.
5. **Validate**: Run relevant tests during development and all required automated
   checks before merge, including the build when configured. Record exact commands
   and outcomes. Required checks that cannot run remain BLOCKED, not passed; use N/A
   only when the check does not apply and state why.
6. **Review**: Reviewers (or an explicit self-review for solo work) MUST verify tests,
   function comments, dependencies, browser behavior, data safety, and constitution
   compliance. Required manual browser checks need recorded results before release;
   automated success does not substitute for manual acceptance.

## Governance

- This constitution is the authoritative project policy. Feature specifications,
  plans, tasks, reviews, and project guidance MUST conform to it. It takes precedence
  over generic tool/template examples that call behavioral tests optional.
- Amendments MUST state the reason, affected principles, compatibility impact, and
  migration work; receive project-maintainer approval; update dependent templates and
  guidance; and include a Sync Impact Report. Approval through the repository's normal
  review process is sufficient. Routine compliant development needs no extra approval.
- Versions follow semantic versioning: MAJOR for removing or incompatibly redefining
  obligations, MINOR for new principles or materially expanded requirements, PATCH
  for clarification without changed obligations. Preserve the original ratification
  date and update the amendment date for each accepted amendment.
- Exceptions MUST document scope, rationale, risk, compensating checks, owner, and
  expiry or removal condition in the plan/change record and receive maintainer
  approval before merge. An exception is a waiver, never evidence that a check passed.
- Each feature MUST review compliance during planning, after design, and before merge.
  Use `AGENTS.md`, `README.md`, and the current `specs/<feature>/plan.md` for operational
  guidance. If no plan exists, state that fact and use the verified repository layout.

**Version**: 1.0.0 | **Ratified**: 2026-10-05 | **Last Amended**: 2026-10-05
