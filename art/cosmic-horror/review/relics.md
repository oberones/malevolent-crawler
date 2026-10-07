# Integrated relic review — T092

2026-10-07; implementation agent. Scope: original 14-role artwork in the live
inventory, equipped, detail, sale, dungeon-reward and combat-reward surfaces.
Human/maintainer acceptance and native execution remain OPEN/BLOCKED.

All delivered files remain the exact transparent 128 × 128 PNGs from T082–T086;
no artwork was regenerated. Original glyph intrinsic dimensions are N/A, not
128 × 128. Generation, prompt/master hashes and deterministic transforms remain
in the five original batch records and are now joined in the common manifest.

| Role        | Identity cue retained at small size        | Agent finding                                       |
| ----------- | ------------------------------------------ | --------------------------------------------------- |
| Sword       | Pale straight blade and compact guard      | PASS with adjacent Tideglass Edge identity          |
| Axe         | Broad hooked cutting head                  | PASS; dark metal relies on pale edge and label      |
| Hammer      | Squat bronze striking head                 | PASS; distinct from the curved axe                  |
| Dagger      | Short pale pointed shard                   | PASS with Whisper Shard label                       |
| Flail       | Separate weight and curved chain           | PASS; finer chain detail simplifies at 16px         |
| Scythe      | Long curved blade and thin haft            | PASS with Lowwater Reaper label                     |
| Plate       | Stacked broad chest plates                 | PASS; rigid outline differs from mesh and leather   |
| Chain       | Broad mesh shirt silhouette                | PASS; mesh texture simplifies at small size         |
| Leather     | Narrow stitched vest and shoulder openings | PASS with Oilskin Mantle label                      |
| Tower       | Tall rectangular slab and wave channels    | PASS; recognizably taller than other wards          |
| Kite        | Tapered pointed shield                     | PASS; central pearl remains visible                 |
| Buckler     | Round concentric nacre rings               | PASS; clearly distinct round silhouette             |
| Great Helm  | Closed dome and horizontal visor           | PASS; enclosed shape distinguishes Diving Reliquary |
| Horned Helm | Two raised pale listening horns            | PASS; distinct open side silhouette                 |

Each role has six context records at three viewports, two text scales and three
engines: **1,512 actual UI measurements**. The canonical capture set is
`relic-contexts-04/`; each matrix has `measurements.json` and 84 context screenshots.
Tests require successful decode of the catalog image and compare width, height,
spacing and baseline against the immutable source (with the two independently
reproduced probe corrections in `relic-baseline-corrections.json`).

Direct visual review covers all 14 roles and all six contexts on Chromium 360px
at 100%/200%, assembled into `review-1-0.png` through `review-2-2.png`, plus final
individual inventory and selected Firefox/WebKit captures. Montage tiles preserve
source pixels; long text can extend beyond the montage tile, so original captures
and automated scrolling/overlap checks own full text acceptance. These are agent
visual findings, not human certification. Screenshots of other tuples exist but
are not all claimed as individually inspected.

Inventory artwork stays 16px at ordinary text size, with 24px minimum native
button targets for accessibility. Equipped buttons retain their original footprint.
The existing 16rem × 35rem inventory container remains; at enlarged text, content
scrolls and the list reserves enough height for a complete multiline item row.
Labels and prices remain textual, and artwork is decorative wherever the control
or adjacent text already identifies it. No essential meaning depends on color.
No clipped defining art edge or visible background rectangle was found. Lore,
restrained palette and non-gory relic direction remain consistent with batch review.

The common full-collection validator additionally compares absolute page x/y to
pre-theme screenshots. Reworded labels, accessible row targets and scrolling alter
some placements; those literal coordinate rows remain OPEN for the US4 collection
join rather than being fabricated as passes. Native baseline tuples remain BLOCKED.
Image loading/fallback integration, full-collection qualification, performance and
release approval remain with their later tasks. Diagnostic capture sets 01–03
are retained, including the enlarged-list defect found visually and corrected by
a red–green regression before capture-04.
