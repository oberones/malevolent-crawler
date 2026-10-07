# T082 small-icon pilot

Date: 2026-10-07. Reviewer: implementation agent.

Sword pilot: PASS for isolated art production. The full sword is framed inside transparent margins; the pale blade and bronze guard remain distinguishable at 16 px and at the 100%/200% detail sizes. No scene, letters, gore or unrelated objects. The selected master and the Chromium 360/100%, Firefox 768/200% and WebKit 1440/100% proof sheets were visually inspected. `pilot-context-proofs.json` records all 108 automated measured-size proofs. Other proof sheets are captured evidence, not separately claimed human inspections.

Guidance was frozen in the setting guide before subsequent icon generation. Native baselines remain BLOCKED; live UI geometry, maintainer acceptance and collection qualification remain OPEN. Proof labels use IDs and are not production UI.

## Completed three-icon batch

| Asset          | Agent art review | Finding                                                                                                                              |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Tideglass Edge | PASS             | Pale straight blade and broad wave guard remain recognizable at 16 px; the large master retains translucent tideglass.               |
| Keelcleaver    | PASS             | Single crescent head and driftwood haft separate it from the narrow sword; the bright cutting edge remains visible against deep ink. |
| Sounding Maul  | PASS             | Wide bronze bell head, transverse handle and reversed diagonal distinguish the hammer; bronze highlights carry its outline at 16 px. |

All three selected masters and the full-batch Chromium 360/100%, Firefox 768/200% and WebKit 1440/100% proof sheets were visually inspected, covering all six contexts and the smallest/largest footprint families. Fine material details intentionally disappear at small sizes; adjacent identity/category text remains required. No defining shape is cropped; alpha edges are clean on dark and light swatches. No explicit gore or borrowed character imagery is depicted. This is an agent assessment, not a maintainer originality certification.

`context-proofs.json` indexes 324 browser-rendered proofs: three icons × six contexts × three engines × three viewports × two text scales. All 18 sheets were captured; only the three named sheets are claimed as direct visual inspections. These isolated proofs use immutable baseline widths/heights and verify them within 0.5 CSS px. They do not measure integrated spacing, baseline alignment, focus, interactions or container preservation. T087–T093 own that work. Native baseline tuples and maintainer acceptance remain BLOCKED/OPEN.

`generation.json` retains individual prompts, source paths, master/prompt/output hashes and unknown generation metadata as null. Tool timestamps were not returned; source file modification times are explicitly separate. `validation.json` records decode/alpha and deterministic re-export checks. Runtime resolution is 128 × 128, selected above the largest recorded 43 px footprint; original glyph dimensions remain null.

To reproduce into a fresh evidence directory, copy `capture-proofs.mjs`, select the pinned Node runtime, and run it from repository root with a new batch directory name followed by `relic-sword relic-axe relic-hammer`. Existing capture files are exclusive-write protected. This evidence script produces isolated art proofs only. The canonical production preparation function is `prepareArt()` in `scripts/prepare-art.mjs`.
