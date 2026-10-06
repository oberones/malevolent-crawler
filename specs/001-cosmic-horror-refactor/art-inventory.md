# Art Inventory: Cosmic Horror Refactor

**Recorded**: 2026-10-05
**Feature**: [Specification](spec.md)
**Status**: Original-file baseline verified; replacement generation and acceptance remain OPEN.

## Scope and evidence

The repository contains 53 monster PNGs under `assets/sprites/`, one PNG favicon, and one ICO favicon. All 54 PNG files declare an alpha channel. PNG dimensions below were read directly from image headers; ICO dimensions were read from its image directory. These are intrinsic pixel dimensions, not guessed display sizes.

The current enemy-image selection maps 51 encounter identities to 52 sprite files. Skeleton Mage uses two illustrations. `spider_spirit.png` has no current encounter mapping but remains in the required 53-file art replacement scope. Encounter-image selection records 50% or 70% display width; those existing presentation sizes must remain compatible with the new artwork.

This inventory records existing assets and requirements, not a completed replacement manifest. During implementation it must gain the original-to-new identity/path mapping, delivered dimensions, generation/source records, and individual visual acceptance results required by FR-011. The themed glyph list below also needs browser measurements of each distinct rendering context before its replacements are finalized.

## Monster image dimensions

Every row requires a new illustration with exactly the listed pixel width and height. Paths are relative to `assets/sprites/`. Original filenames and legacy names are recorded only to identify replacement obligations; they do not prescribe future visible names.

| Original file               | Width (px) | Height (px) | Existing encounter identity          | Current display width   |
| --------------------------- | ---------- | ----------- | ------------------------------------ | ----------------------- |
| `alfadriel.png`             | 603        | 616         | Alfadriel, the Light Titan           | 50%                     |
| `ant_queen.png`             | 469        | 479         | Llyrrad, the Ant Queen               | 50%                     |
| `behemoth.png`              | 675        | 532         | Behemoth                             | 70%                     |
| `berthelot.png`             | 375        | 251         | Berthelot, the Undead King           | 50%                     |
| `bm-feral.png`              | 441        | 355         | Blood Manipulation Feral             | 70%                     |
| `cerberus_ptolemaios.png`   | 588        | 410         | Cerberus Ptolemaios                  | 50%                     |
| `da-reaper.png`             | 434        | 310         | Darkness Angel Reaper                | 70%                     |
| `fallen_king.png`           | 635        | 506         | Nameless Fallen King                 | 50%                     |
| `firelord.png`              | 744        | 509         | Ifrit                                | 70%                     |
| `goblin.png`                | 161        | 166         | Goblin                               | 50%                     |
| `goblin_archer.png`         | 207        | 136         | Goblin Archer                        | 50%                     |
| `goblin_boss.png`           | 331        | 164         | Zaart, the Dominator Goblin          | 70%                     |
| `goblin_mage.png`           | 228        | 149         | Goblin Mage                          | 50%                     |
| `goblin_rogue.png`          | 162        | 160         | Goblin Rogue                         | 50%                     |
| `hellhound.png`             | 373        | 323         | Hellhound Inferni                    | 50%                     |
| `icemaiden.png`             | 564        | 534         | Shiva                                | 70%                     |
| `mimic.png`                 | 227        | 174         | Mimic                                | 50%                     |
| `mimic_door.png`            | 317        | 230         | Door Mimic                           | 50%                     |
| `orc_archer.png`            | 476        | 480         | Orc Archer                           | 50%                     |
| `orc_axe.png`               | 516        | 434         | Orc Axe                              | 50%                     |
| `orc_mage.png`              | 569        | 386         | Orc Mage                             | 50%                     |
| `orc_swordsmaster.png`      | 517        | 368         | Orc Swordsmaster                     | 50%                     |
| `skeleton_archer.png`       | 299        | 218         | Skeleton Archer                      | 50%                     |
| `skeleton_boss.png`         | 372        | 309         | Banshee, Skeleton Lord               | 50%                     |
| `skeleton_dragon.png`       | 501        | 433         | Ulliot, the Deathlord                | 70%                     |
| `skeleton_knight.png`       | 371        | 212         | Skeleton Knight                      | 50%                     |
| `skeleton_mage1.png`        | 265        | 260         | Skeleton Mage                        | 50%                     |
| `skeleton_mage2.png`        | 178        | 230         | Skeleton Mage                        | 50%                     |
| `skeleton_pirate.png`       | 207        | 232         | Skeleton Pirate                      | 50%                     |
| `skeleton_samurai.png`      | 209        | 223         | Skeleton Samurai                     | 50%                     |
| `skeleton_swordsmaster.png` | 248        | 215         | Skeleton Swordsmaster                | 50%                     |
| `skeleton_warrior.png`      | 254        | 188         | Skeleton Warrior                     | 50%                     |
| `slime.png`                 | 229        | 101         | Slime                                | 50%                     |
| `slime_angel.png`           | 166        | 126         | Angel Slime                          | 50%                     |
| `slime_boss.png`            | 391        | 253         | Slime King                           | 50%                     |
| `slime_crusader.png`        | 153        | 79          | Crusader Slime                       | 50%                     |
| `slime_knight.png`          | 174        | 91          | Knight Slime                         | 50%                     |
| `spider.png`                | 142        | 108         | Spider                               | 50%                     |
| `spider_boss.png`           | 373        | 351         | Clockwork Spider                     | 50%                     |
| `spider_dragon.png`         | 895        | 659         | Naizicher, the Spider Dragon         | 70%                     |
| `spider_fire.png`           | 486        | 366         | Molten Spider                        | 50%                     |
| `spider_green.png`          | 140        | 107         | Green Spider                         | 50%                     |
| `spider_red.png`            | 145        | 110         | Red Spider                           | 50%                     |
| `spider_spirit.png`         | 282        | 626         | No current encounter reference found | Not currently displayed |
| `thanatos.png`              | 748        | 636         | Thanatos                             | 70%                     |
| `tiamat.png`                | 435        | 263         | Tiamat, the Dragon Knight            | 50%                     |
| `wolf.png`                  | 207        | 202         | Wolf                                 | 50%                     |
| `wolf_black.png`            | 203        | 202         | Black Wolf                           | 50%                     |
| `wolf_boss.png`             | 137        | 139         | Aragorn, the Lethal Wolf             | 50%                     |
| `wolf_winter.png`           | 211        | 203         | Winter Wolf                          | 50%                     |
| `zalaras.png`               | 663        | 489         | Zalaras, the Dragon Emperor          | 70%                     |
| `zodiac_aries.png`          | 586        | 397         | Zodiac Aries                         | 50%                     |
| `zodiac_cancer.png`         | 617        | 296         | Zodiac Cancer                        | 50%                     |

## Favicon dimensions

| Original file             | Width (px) | Height (px) | Notes                                                                             |
| ------------------------- | ---------- | ----------- | --------------------------------------------------------------------------------- |
| `assets/icon/favicon.png` | 199        | 200         | PNG with alpha channel; required even though the page currently links to the ICO. |
| `assets/icon/favicon.ico` | 127        | 128         | One embedded image; preserve this exact size and its existing browser-icon role.  |

The current icons are not square. Do not round their dimensions or replace them with a conventional square icon without satisfying the exact-size requirement.

## Equipment art without source-image dimensions

Equipment uses font glyphs rather than standalone image files. There are 14 equipment categories and 12 distinct current equipment glyphs; three armor categories share one glyph. Each category requires a new themed identity and matching new icon. Review every use in rewards, inventory, equipped items, and item details; a single glyph can render at different sizes in different contexts.

| Equipment category | Existing glyph     | Required coverage              |
| ------------------ | ------------------ | ------------------------------ |
| Sword              | `ra-relic-blade`   | New relic identity and icon    |
| Axe                | `ra-axe`           | New relic identity and icon    |
| Hammer             | `ra-flat-hammer`   | New relic identity and icon    |
| Dagger             | `ra-bowie-knife`   | New relic identity and icon    |
| Flail              | `ra-chain`         | New relic identity and icon    |
| Scythe             | `ra-scythe`        | New relic identity and icon    |
| Plate              | `ra-vest`          | New armor identity and icon    |
| Chain              | `ra-vest`          | New armor identity and icon    |
| Leather            | `ra-vest`          | New armor identity and icon    |
| Tower              | `ra-shield`        | New ward identity and icon     |
| Kite               | `ra-heavy-shield`  | New ward identity and icon     |
| Buckler            | `ra-round-shield`  | New ward identity and icon     |
| Great Helm         | `ra-knight-helmet` | New headgear identity and icon |
| Horned Helm        | `ra-helmet`        | New headgear identity and icon |

Before replacement, record each context's browser-rendered width, height, baseline/alignment, and spacing at the supported viewport/text sizes. The existing page applies spacing to glyphs and a separate margin to images; raw file dimensions alone cannot prove a new icon preserves its footprint. Runtime measurement and visual acceptance are OPEN, not inferred from the font's nominal size.

## Other themed pictograms

| Role            | Current glyph(s)       | Existing contexts to cover                                                  |
| --------------- | ---------------------- | --------------------------------------------------------------------------- |
| Title emblem    | `fa-dungeon`           | Title screen; currently a large font glyph                                  |
| Health          | `fa-heart`             | Main stats, bonus stats, character stat allocation                          |
| Attack          | `ra-sword`             | Main stats, bonus stats, character stat allocation                          |
| Defense         | `ra-round-shield`      | Main stats, bonus stats, character stat allocation; also an equipment glyph |
| Attack speed    | `ra-plain-dagger`      | Main stats, bonus stats, character stat allocation                          |
| Vampirism       | `ra-dripping-blade`    | Main and bonus stats                                                        |
| Critical rate   | `ra-lightning-bolt`    | Main and bonus stats                                                        |
| Critical damage | `ra-focused-lightning` | Main and bonus stats                                                        |
| Treasure        | `fa-toolbox`           | Treasure chamber and chest event text                                       |
| Currency        | `fa-coins`             | Player header, combat/exploration rewards, offerings, and sale controls     |

These themed uses require original replacements with measured rendered footprints. Shared glyphs must be audited by purpose and context, not just by font class.

Generic profile/menu/close symbols (`fa-user`, `fa-bars`, `fa-xmark`, `fa-circle-xmark`), other utility controls, typography files, and third-party service badges are outside this replacement inventory. The current page's background is a styled gradient, not a supplied background illustration; this feature does not require inventing an extra background-image size or a new screen layout. Music and sound effects are outside the visual scope.

## Baseline limits and downstream work

- This baseline establishes original file sizes, current encounter-image mapping, and known themed glyph uses. It does not certify the legacy UI's accessibility or its future replacements' appearance.
- Final art coverage must account for all 55 raster/icon files and all themed pictogram contexts, including alternate and unused supplied monster art.
- File dimensions are verified. Browser glyph measurements, replacement generation, transparent-edge inspection, complete in-game visual review, browser/input acceptance, and before/after timing measurements remain OPEN for planning and implementation.
- The current stylesheet suppresses focus outlines and contains title/combat motion. The constitution's keyboard/focus and reduced-motion requirements therefore need explicit attention in the affected journeys; preserving art dimensions does not waive them.
