# Orc-alias batch review — T067

Date: 2026-10-06. Reviewer: implementation agent. PASS for the four delivered
portraits and recorded automated-browser visual contexts. Native/human release
acceptance and collection qualification remain OPEN/BLOCKED.

| Runtime file / identity                                   | Exact canvas | Individual findings                                                                                                                                                                                      |
| --------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/sprites/orc_archer.png` — Breakwater Harpooner    | 476 × 480    | Pale plated sentinel with a continuous ribbed forearm harpoon, supported by its other hand. Diagonal weapon remains distinct at the smallest size; complete spear tip, crown and webbed toes. PASS.      |
| `assets/sprites/orc_axe.png` — Keelbreaker                | 516 × 434    | Broad barnacled laborer with an integrated iron crescent and heavy stance. Crescent negative space distinguishes it from the sentinel; complete crescent, fingers and toes. PASS.                        |
| `assets/sprites/orc_mage.png` — Stormsilt Cantor          | 569 × 386    | Pale storm-filled throat sacs dominate the wide upper silhouette; flowing silt body and extended fingers remain complete. Cloud microdetail softens at small size while the ring remains readable. PASS. |
| `assets/sprites/orc_swordsmaster.png` — Tideglass Duelist | 517 × 368    | Four separated arms, crossed pale glass blades and narrow bronze breastplate. Full crown and blade tips retained, with clear negative space around lower arms. PASS.                                     |

Four separate built-in ImageGen generation requests produced the initial masters.
Three targeted edits corrected the harpooner's initially handheld weapon, the
cantor's crowded silhouette and the duelist's crown framing. Initial and selected
masters, exact generation/edit prompts, hashes and revision reasons are preserved
in [generation.json](generation.json). No original game sprite was supplied as a
tracing or recoloring input. Unknown model, seed, generation timestamp and source
URL remain null; filesystem modification times are identified separately.

All selected masters were inspected inline, all four delivered PNGs at native
size, and all 24 decoded Chromium screenshots in viewport/text-scale comparison
sheets, supplemented by full-size desktop captures. Nacre/slate/bronze/verdigris
colors and pale edges read against the dark combat panel. No graphic wounds,
explicit mutilation, lettering, opaque backdrop or recognizable borrowed
character was observed; this is not a legal originality certification.

The unchanged tested `prepareArt` API applied proportional contain and transparent
padding, without cropping, stretching or changing portrait containers. Full
decode, exact immutable dimensions, visible/transparent pixels, changed baseline
hashes and identical repeat-export hashes pass in [validation.json](validation.json).

[Browser captures](browser-captures.json) cover four portraits × three viewports
(360 × 800, 768 × 1024, 1440 × 900) × 100%/200% root text, DPR 1. Captures use the
immutable synthetic resting save and selected enemies, initialized audio, paused
clock and production `engageBattle()`. Each image decoded before capture; natural
and rendered dimensions, alt text and screenshot hashes are recorded. Names and
HP stay separate from portraits. Enlarged-text history shows partial accumulated
entries in its existing scrolling region; screenshots do not certify scrolling
or native interaction.

Common-manifest integration belongs to T076, collection qualification to
T077/T078. Native/human review, matched performance and release remain OPEN.
