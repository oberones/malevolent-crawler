<!-- SPECKIT START -->
For stack choices, project structure, implementation sequencing, and verification
commands, read the active [implementation plan](specs/001-cosmic-horror-refactor/plan.md).
<!-- SPECKIT END -->

Read `.specify/memory/constitution.md` before planning, task generation, or implementation.
It takes precedence over generic optional-test examples in installed skills/templates.
New or changed behavior requires red–green–refactor tests, including foundational code.
Every new or modified function requires a clear, concise purpose comment; use JSDoc
for public interfaces and non-obvious contracts, and update comments with the code.

Use the active feature's `specs/<feature>/plan.md` for stack choices and commands.
If there is no feature plan, say so and use the verified repository structure and
`README.md`; do not invent tool commands or claim unconfigured checks passed.
