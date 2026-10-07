# T086 — relic helmet batch

Date: 2026-10-07. Reviewer: implementation agent. Status: PASS for isolated art production; maintainer acceptance remains OPEN.

Two separate built-in imagegen requests follow the accepted T082 frontal helmet guidance. Both masters and delivered files were visually inspected and prepared proportionally into 128 × 128 transparent PNGs. Original glyph dimensions remain not applicable. No wearer, scenery, lettering or gore appears.

| Asset                         | Agent assessment                                                                                                                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diving Reliquary (Great Helm) | PASS. Closed bronze dome, broad nacre visor rim and dark horizontal window form a compact, recognizable helmet. At 16 px the pale visor and neck rim carry its shape; fine patina disappears.               |
| Listening Crown (Horned Helm) | PASS. Two substantial pale listening horns frame the dark fitted headguard. The separated horn openings and angular cheek guards distinguish it from the enclosed diving helm at 16 px on both backgrounds. |

Direct visual review covered both generated masters, both delivered PNGs, and `chromium-360-1.png`, `firefox-768-2.png`, and `webkit-1440-1.png`. The sheets cover inventory, equipped, detail, sale, dungeon reward and combat reward, small and enlarged footprints, and dark/light backgrounds. No visible background panel or cropped defining shape was found. Adjacent identity/category text remains required. This is agent assessment, not maintainer originality certification or native-device acceptance.

`context-proofs.json` indexes 216 automated proofs: two icons × six contexts × three engines × three viewports × two text scales. All 18 sheets were captured; only the three named sheets are claimed as direct visual inspections. Rendered width/height match immutable baseline dimensions within 0.5 CSS px. These isolated art proofs do not establish integrated spacing, baseline alignment, focus, control geometry or player journeys. T087–T093 own integration; unmatched native measurements remain BLOCKED.

`generation.json` links exact prompts, selected masters, source paths, hashes and export transforms. Unknown model, seed and generation timestamps remain null; source file modification times are separately labeled. `validation.json` records full PNG decode, alpha, exact dimensions, equal hashes after a second preparation call, and transparent outer edges. Shared manifest integration remains T092.

To reproduce, select the pinned Node runtime and run `node art/cosmic-horror/batches/relic-helms/capture-proofs.mjs <new-batch-directory> relic-great-helm relic-horned-helm` from repository root. The capture script is copied unchanged from T085 and refuses to overwrite evidence. Preparation uses the existing tested `prepareArt()` interface with width/height 128 and transparent contain.
