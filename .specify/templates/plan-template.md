# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by `/speckit.plan`. Follow
`.specify/memory/constitution.md` and `.agents/skills/speckit-plan/SKILL.md`.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [JavaScript target; supported Node.js/npm versions for tooling]
**Primary Dependencies**: [Existing dependencies; reasons and costs for additions]
**Storage**: [Browser storage/data contracts, compatibility and migration needs, or N/A]
**Testing**: [Unit, integration, and browser tools; randomness/clock/storage controls]
**Target Platform**: [Supported browser versions, devices, viewport sizes, input methods]
**Project Type**: [Static browser application; explain any architecture change]
**Performance Goals**: [Applicable numeric budgets, baseline, workload, measurement procedure]
**Constraints**: [Accessibility, security, privacy, offline/error behavior, or justified N/A]
**Scale/Scope**: [Affected game systems, UI journeys, asset/data sizes]
**Verification Commands**: [Exact install/test/lint/format/build commands; mark missing setup]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference `.specify/memory/constitution.md` v1.0.0. Record PASS, FAIL, BLOCKED, or
justified N/A and supporting evidence for every gate, before and after design.
At planning time, evidence is the concrete design and verification plan; runtime
results are still required before merge/release.

- **I — TDD**: Failing tests precede changed behavior, including foundational work;
  regression/characterization tests, deterministic inputs, and test levels are mapped.
- **II — Modularity**: Game rules are separable from DOM/storage/audio; module and state
  ownership is explicit; new complexity/dependencies and legacy bridges are justified.
- **III — Comments**: Tasks require concise comments for every new/modified function,
  applicable JSDoc contracts, and comment review alongside implementation.
- **IV — Data safety**: Untrusted input, safe DOM rendering, failure handling, diagnostics,
  and save compatibility/migrations have explicit checks or justified N/A.
- **V — Browser usability**: Browser/viewport targets, applicable WCAG 2.2 AA criteria,
  automated journeys, and manual keyboard/focus checks are defined.
- **VI — Delivery**: Lockfile/tool versions, automated test/lint/format checks, configured
  build checks, resource cleanup, and applicable performance budgets have task owners.
- **Governance**: Required tooling gaps are scheduled before behavior changes;
  legacy debt and exceptions record owner, risk, approval, and expiry/removal condition.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Verify the existing layout and replace proposed paths with
  concrete feature paths. Include planned test/configuration files and distinguish
  existing directories from additions. Do not introduce a framework by assumption.
-->

```text
index.html
assets/
├── js/                  # Existing browser scripts and vendored audio library
└── css/                 # Application and vendored styles
tests/                   # Proposed; choose paths/tools in this plan
├── unit/
├── integration/
└── browser/
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Rule / Deviation | Why Needed / Alternatives | Risk / Compensating Checks | Owner | Approval | Expiry / Removal Condition |
|------------------|---------------------------|----------------------------|-------|----------|----------------------------|
| [Rule and scope] | [Reason and simpler options] | [Risk and evidence] | [Owner] | [Maintainer decision] | [Date or condition] |
