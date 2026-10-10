# Phase 8 performance findings

Date: 2026-10-08. T133/T134: PASS for the matched local Chromium environment.
No timing-budget or input-responsiveness finding requires remediation.

The prepared candidate is the working tree based on
`ea372b73418ddd6af4461b510b9942f073a2f458`, identified by runtime SHA-256
`1cfbf3f39b04d43c6a309eada7c4d2a3f02aae91c4a86dea4897c6905a2e503d`.
The base revision alone does not describe the uncommitted changes.

[candidate.json](candidate.json) preserves all 190 samples across 38 comparisons;
[comparison.json](comparison.json) records each median, limit, delta and outcome.
The original exclusive output is [candidate-1cfbf3f39b04.json](candidate-1cfbf3f39b04.json).
Both widths (1440 and 360), cold/warm entry and encounter workloads passed.
Every warm sample has cache proof; normal art samples successfully decode the
expected portrait. No samples were discarded and no baseline bytes changed.
Largest median increase: 30.7 ms for 360/largest-spider-dragon/cold, within its 100.0 ms allowance.

The run used one worker, real clocks, no request/HAR routing, retries, trace or
video; it ran after the functional browser suites ended. Browser/OS/hardware,
power, fixture, transform, font, viewport and network metadata matched the frozen
baseline exactly. Source bytes were verified before timing. The final candidate
server was stopped after the measurement.

Full-loadout/long-name diagnostics are retained in `candidate-diagnostics/`;
these are responsiveness observations, not native accessibility acceptance.
Missing/delayed-art action checks passed separately in the functional matrix.
No speculative optimization or performance-related runtime change was made.
Physical-device responsiveness and native context qualification remain separate.

The earlier candidate also passed all timing budgets, but its screenshot exposed
an inventory Sell label wrapping into two lines. A failing line-box regression
preceded the text-width fix; 57 final cross-story/relic/reflow checks pass. The
final run above repeats all samples against the corrected layout. Earlier raw
samples remain in `candidate-7d40e86ff71f.json` and `candidate-before-label.json`,
with `comparison-before-label.json` and `candidate-before-label-diagnostics/`.
No slow sample was removed or baseline replaced. Final inventory diagnostics
show six equipped relics, no document overflow at 360/1440 pixels and short
inventory-entry times; these are not full accessibility certification.
