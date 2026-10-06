# Contract: Content Catalogs and Art Delivery

Applies to FR-001–011/015 and SC-001–004/008. The original [art inventory](../art-inventory.md) is authoritative for source dimensions; the [data model](../data-model.md) defines manifest records.

## Catalog boundary

All new catalog modules are pure, immutable ES modules with no DOM/storage/audio side effects and no randomness. Public lookup functions have JSDoc and accept internal legacy keys or stable catalog IDs. They return plain-text names/descriptions and allowlisted art references. Unknown state identities return a typed validation failure; an image network/decode failure for a known identity instead uses the visual fallback and preserves gameplay.

- 51 encounter identities map to 52 active image variants, preserving role/archetype coverage and ordered pools. An additional unused image record covers `spider_spirit.png`.
- 14 relic categories retain exact legacy generation/stat/value semantics and each receives its own new identity/icon.
- Six rarity names and ordering remain unchanged. Numeric controls, HP/stat abbreviations, Inventory, Equip, Save, and other useful neutral labels may remain.
- 24 themed symbol roles cover all old font-pictogram contexts. Generic menu/close/volume symbols, text fonts, service badges, and retained audio stay outside replacement scope.
- The authoring guide covers player role, location, motifs, naming, all narrative surfaces, and credits. Use original cosmic horror; the accepted mutation/anatomy/blood boundary applies to every asset and every system-authored description.
- Legacy names may exist in rule keys, compatibility records, tests, and provenance. UI rendering must resolve them into the new world. Do not simply rename the creature and leave its old image/alt text in another surface.

A renderer consumes an existing identity/variant, not a selection instruction. It must consume zero gameplay random draws. Keep the existing additional Skeleton Mage variant draw and mimic's discarded selection draws at generation time; compare the complete random tape in characterization tests.

## Asset obligations

| Output | Count | Delivery requirement |
| --- | --- | --- |
| `assets/sprites/*.png` baseline paths | 53 | New original transparent art; exact per-file width/height from inventory; preserve existing 50%/70% in-game width |
| `assets/icon/favicon.png` | 1 | New emblem, exactly 199 × 200 |
| `assets/icon/favicon.ico` | 1 | New emblem, one embedded 127 × 128 image; validate directory and decoded payload |
| Relic icons | 14 roles | Original category-specific artwork; every reward/list/detail/equipped context measured |
| Other symbols | 10 roles | Title, seven stats, treasure, currency; each purpose/context covered |
| Missing-art fallback | Shared new themed asset or safe local symbol | Fit reserved box, keep readable identity and working controls; no recursive image-error loop |

The two favicon outputs may share a new master; their deliverables and hashes remain separate. Distinct creature variants must receive separately generated original artwork. The unused sprite receives a replacement without adding a new gameplay encounter.

## Generation and deterministic preparation

1. Freeze original-file hashes/dimensions and browser glyph measurements before replacement. Store these in `art/cosmic-horror/baseline.json`; never replace original baselines with candidate measurements.
2. Author setting and exhaustive legacy→new identity/variant/symbol mappings. Check each against encounter pools and every rendering call site.
3. Generate original masters using the built-in imagegen workflow, one distinct asset/variant per request. Use the shared art direction and accepted content boundary; transparent backgrounds; clear full silhouettes and category cues. Original files are dimensional/framing evidence, not artwork to trace.
4. Keep selected masters, prompts, actual returned provenance, timestamps and hashes in the art directory. Record rejected outputs/findings where useful. No claim of reproducible AI generation or seed control unless actually supported and recorded.
5. Prepare shipped PNGs with Sharp `contain` and explicitly transparent padding. Fit proportionally; never stretch or crop defining anatomy. Any alpha-bound trimming/framing adjustment is recorded and visually reviewed. Use deterministic, recorded export settings.
6. Pack the required ICO size with a tested one-entry directory/PNG encoder. Keep encoded and decoded dimensions aligned; do not replace the odd dimensions with conventional square sizes.
7. Validate all files, integrate references, and review at actual size. A wrong-size, blank, corrupt, unchanged, placeholder, or visually unsuitable file fails delivery.

## Rendered footprint measurements

For each role/context/browser/viewport/text-scale tuple, await `document.fonts.ready` and verify the intended font loaded. Capture bounding box, margins, font size/family, line height, vertical alignment, baseline offset using an inline probe, DPR, and screenshot. Use 100% and 200% text at all declared viewports. Record the fixture and selector; contexts in dynamic reward/confirmation content count too.

Match the new reserved box, spacing, and alignment to that baseline; rounding tolerance is at most 0.5 CSS pixels per measured edge/offset. Reset the legacy global image top margin for inline artwork explicitly. Container sizes and button hit areas cannot be changed solely to fit the image. If new narrative text needs wrapping for accessibility, verify it separately from artwork geometry rather than misreporting it as an art-size change.

## Manifest and evidence rules

`art/cosmic-horror/manifest.json` must link each original source/role to its delivered path, exact baseline/delivered size, identity, generation master/prompt, transform record, file hashes, contexts, and individual visual-review status/evidence. Source dimensions for glyphs are null/not-applicable; measured context dimensions are mandatory. Provenance-only unused sprite has no fabricated in-game selector.

Automated validation checks counts, unique IDs and aliases, every required path, safe relative references, full image decode, PNG alpha and nonempty transparent/visible content, exact dimensions, ICO directory/payload, immutable baselines, generation-record completeness, and geometry. It includes negative fixtures rather than merely testing the validator against its own output.

Human visual review separately establishes originality, coherent art direction, distinct identities, safe framing, clean transparent edges, actual-size readability, correct meaning, and the content boundary. Hash differences and automatic color/alpha checks cannot certify these. Review every required file, including unused art, and every declared display context. No required asset may ship with OPEN/FAIL/BLOCKED visual status or a placeholder path.
