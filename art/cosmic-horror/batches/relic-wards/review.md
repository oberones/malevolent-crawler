# T085 — relic ward batch

Date: 2026-10-07. Reviewer: implementation agent. Status: PASS for isolated art production; maintainer acceptance remains OPEN.

Three separate built-in imagegen requests follow the accepted T082 frontal ward guidance. Each master was visually inspected and prepared proportionally into a 128 × 128 transparent PNG. Source glyph dimensions remain not applicable. All objects retain complete silhouettes without scenery, lettering, wearers or gore.

| Asset                   | Agent assessment                                                                                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Breakwater Slab (Tower) | PASS. Tall rectangular slate shield with three pale stepped wave channels and a bronze rim. At 16 px the narrow slab remains distinct; the waves simplify to light marks. The enlarged proofs resolve the wave forms. |
| Pilgrim Keel (Kite)     | PASS. Broad shoulders taper to a single lower point, with hull-like bronze ribs and a central pale pearl. The pointed silhouette and pearl survive at 16 px; fine material texture does not.                          |
| Tidepool Disc (Buckler) | PASS. Round outline, broad concentric nacre rings and dark central boss clearly distinguish this ward at 16 px. Its pale rings remain readable on both proof backgrounds.                                             |

Direct visual review covered all three generated masters, the delivered tower PNG, and `chromium-360-1.png`, `firefox-768-2.png`, and `webkit-1440-1.png`. These sheets cover all six inventory/equipped/detail/sale/dungeon-reward/combat-reward contexts, small and enlarged footprints, and dark/light backgrounds. Edges have no visible background panel or clipping at delivered sizes. Adjacent identity/category text remains required. This is agent assessment, not maintainer originality certification or native-device acceptance.

`context-proofs.json` indexes 324 automated proofs: three icons × six contexts × three engines × three viewports × two text scales. All 18 sheets were captured; only the three named sheets are claimed as direct visual inspections. Rendered width/height match the immutable baseline within 0.5 CSS px. These isolated art proofs do not establish integrated spacing, baseline alignment, focus, control geometry or player journeys. T087–T093 own integration; unmatched native measurements remain BLOCKED.

`generation.json` links exact prompts, selected masters, returned source paths, hashes and export transforms. Unknown model, seed and generation timestamps remain null; source file modification times are separately labeled. `validation.json` records full PNG decode, alpha, exact dimensions and equal hashes after a second preparation call. Shared manifest integration remains T092.

To reproduce, select the pinned Node runtime and run `node art/cosmic-horror/batches/relic-wards/capture-proofs.mjs <new-batch-directory> relic-tower relic-kite relic-buckler` from repository root. The capture script is copied unchanged from T084 and refuses to overwrite evidence. Preparation uses the existing tested `prepareArt()` interface with width/height 128 and transparent contain.
