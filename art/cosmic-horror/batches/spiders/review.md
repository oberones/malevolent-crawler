# Spider-alias batch review — T068

Date: 2026-10-06. Reviewer: implementation agent. PASS for these five delivered
portraits and the recorded automated-browser visual contexts. Native/human release
acceptance and collection qualification remain OPEN/BLOCKED.

| Runtime file / identity                                 | Exact canvas | Individual findings                                                                                                                                                                            |
| ------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/sprites/spider.png` — Threadpool Creeper        | 142 × 108    | Pale radial body and conspicuous silver thread spool; complete fine legs and connected threads. Spool remains distinct at the smallest combat size. PASS.                                      |
| `assets/sprites/spider_red.png` — Rustvein Spinner      | 145 × 110    | Large glass abdomen with branching rust veins and trailing iron filaments. Abdomen silhouette remains distinct as fine threads soften at small size. Complete extremities. PASS.               |
| `assets/sprites/spider_green.png` — Verdigris Spinner   | 140 × 107    | Copper-green plated body and forked forelegs framing a pale mesh fan. Mesh reads against the dark panel independently of color; all tips retained. PASS.                                       |
| `assets/sprites/spider_fire.png` — Emberreef Weaver     | 486 × 366    | Broad nacre reef shell, amber pockets and heavy slate legs. Framing edit restores the upper coral tip and surrounding margin. Shell and warm pockets remain readable at small size. PASS.      |
| `assets/sprites/spider_boss.png` — The Tidewheel Weaver | 373 × 351    | Circular bronze loom around a pale living core, visible pulley openings and articulated legs. Framing edit restores complete upper pulley and outer legs; ring remains the dominant cue. PASS. |

Five separate built-in ImageGen requests produced original masters; two targeted
edits corrected framing. Exact prompts, initial/selected masters, hashes, source
paths and revision reasons are preserved in [generation.json](generation.json).
No original game sprites were supplied for tracing or recoloring. Unknown model,
seed, generation timestamp and source URL remain null. Filesystem modification
times are recorded separately rather than represented as generation timestamps.

Selected masters were inspected inline, each exported PNG at native size, and all
30 decoded Chromium captures in viewport/text-scale comparison sheets, with
full-size desktop enlarged-text captures inspected individually. Nacre highlights,
separated silhouettes and identity cues remain visible against the dark panel.
Small PNGs soften when enlarged by the existing interface; their exact required
canvases and the original 50% display width are preserved. No cropped defining
anatomy, opaque backdrop, lettering, graphic wounds or explicit mutilation was
observed. No recognizable borrowed character was observed; this is not a legal
originality certification.

The unchanged tested `prepareArt` API used proportional contain and transparent
padding. [Validation](validation.json) records full decode, exact immutable
dimensions, visible/transparent pixels, changed baseline hashes and identical
repeat-export hashes. No cropping, stretching or container resizing was applied.

[Browser captures](browser-captures.json) cover five portraits × three viewports
(360 × 800, 768 × 1024, 1440 × 900) × 100%/200% root text, DPR 1. The capture used
the immutable resting save and selected enemy fixtures, initialized audio, paused
clock and production `engageBattle()`. Every image decoded before capture; natural
and rendered dimensions, alt text and screenshot hashes are retained. Portraits
do not overlap names or HP. Enlarged history text is partly outside its existing
scrolling region; screenshots do not certify scrolling or native interaction.

The pilot's `spider_spirit.png` and `spider_dragon.png` were not regenerated.
T076 owns common-manifest integration and T077/T078 own collection qualification.
Native/human review, matched performance and release acceptance remain OPEN.
