# T083 — second relic weapon batch

Date: 2026-10-07. Reviewer: implementation agent. Status: PASS for isolated art production; maintainer acceptance remains OPEN.

The accepted T082 guidance was used for three separate built-in imagegen requests. All three generated masters were visually inspected before proportional 128 × 128 transparent export. No defining shape is cropped, and no scenery, text, gore or unrelated objects are present. Source glyph dimensions remain not applicable.

| Asset                    | Agent assessment                                                                                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Whisper Shard (Dagger)   | PASS. Broad triangular nacre blade and compact wrapped grip distinguish it from the long sword. The pale blade remains visible at 16 px.                                                                                                               |
| Mooring Lash (Flail)     | PASS. Curved chain, separated handle and rounded bright weight form a distinct flail outline. Individual links simplify at 16 px while the overall cue survives.                                                                                       |
| Lowwater Reaper (Scythe) | PASS. Continuous hooked shell blade and long diagonal haft distinguish the scythe. The dark haft is subtle at 16 px on deep ink, but its bronze rim and bright curved blade retain the category cue; adjacent identity/category text remains required. |

Direct visual review covered all three masters plus `chromium-360-1.png`, `firefox-768-2.png` and `webkit-1440-1.png`. These sheets include every inventory/equipped/detail/sale/dungeon-reward/combat-reward context, small and enlarged footprint families, and dark/light backgrounds. Fine master details intentionally disappear at the smallest size. This is agent visual assessment, not maintainer originality certification or native-device acceptance.

`context-proofs.json` indexes 324 automated browser proofs: three icons × six contexts × three engines × three viewports × two text scales. All 18 sheets were captured; only the three named sheets are claimed as direct visual inspections. Rendered width/height match the immutable baseline within 0.5 CSS px. These isolated art proofs do not establish integrated spacing, baseline alignment, focus, control geometry or player journeys. T087–T093 own integration; native measurements remain BLOCKED.

`generation.json` links exact prompts, selected masters, returned source paths, file hashes and export transforms. Unknown model, seed and generation timestamps remain null; source file modification time is explicitly separate. `validation.json` records full PNG decode, alpha, exact dimensions and equal hashes after a second preparation call. Shared manifest integration remains T092.

To reproduce, select the pinned Node runtime and run `node art/cosmic-horror/batches/relic-weapons-b/capture-proofs.mjs <new-batch-directory> relic-dagger relic-flail relic-scythe` from repository root. The capture script is copied unchanged from T082 and refuses to overwrite evidence. Preparation uses the existing tested `prepareArt()` interface with width/height 128 and transparent contain.
