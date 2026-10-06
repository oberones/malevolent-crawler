# First guardian-alias batch review — T071

Date: 2026-10-07. Reviewer: implementation agent. PASS for these five delivered
portraits and the recorded automated Chromium visual contexts. Human/native
review and collection/release acceptance remain OPEN/BLOCKED.

| Runtime file / identity                                        | Exact canvas | Individual findings                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/sprites/alfadriel.png` — The Lantern Without Flame     | 603 × 616    | Upright nacre/glass ribcage frames a visibly dark bronze lantern. Full head crest, hands and feet retained. Fine rib texture softens at the smallest size but the hollow torso and lantern remain distinct. PASS.                                                   |
| `assets/sprites/ant_queen.png` — The Brood Bell                | 469 × 479    | Broad bronze bell mantle and pale hanging egg chambers provide a strong silhouette. Hook, shell rim and leg tips fit; translucent sacs remain legible on the dark panel. PASS.                                                                                      |
| `assets/sprites/berthelot.png` — The Salt Regent               | 375 × 251    | Seated figure, salt-needle crown and spread layered ledger-page cloak form a distinct triangular silhouette. Framing edit restores space around the crown and outer cloak. Crown and robe mass read at small size; individual page texture becomes secondary. PASS. |
| `assets/sprites/cerberus_ptolemaios.png` — The Threefold Watch | 588 × 410    | Exactly three pale listening heads clearly separate above one chained seal-like body. Full flippers and tail retained. Pale gills and heads contrast against the slate body and dark panel. PASS.                                                                   |
| `assets/sprites/hellhound.png` — Cinderwake Prowler            | 373 × 323    | Low crouched hunter, coral tooth cage, warm mouth mist and arched tail distinguish this guardian. All claws and tail tip fit; mouth warmth remains bounded and does not become a background glow. PASS.                                                             |

Five separate built-in ImageGen requests produced original masters. One retained
Salt Regent edit corrected edge-tight crown/cloak framing. The initial and selected
masters, exact prompts and source paths are retained in [generation.json](generation.json).
No legacy image was supplied as a generation reference. Unknown model, seed,
generation timestamp and source URL remain null; source filesystem modification
time is recorded separately.

Reviewed generated masters inline, all delivered sprites at their intrinsic sizes
in [actual-size.png](actual-size.png), all 30 decoded browser captures in comparison
sheets, and all five desktop 200% captures individually. No observed opaque
background, lettering, graphic wounds, explicit mutilation or recognizable
borrowed character. This agent review does not certify legal originality or human
acceptance.

The unchanged tested `prepareArt` API uses proportional contain with transparent
padding; no cropping, stretching or alpha trimming. [validation.json](validation.json)
records full decoding, visible/transparent pixels, immutable canvas dimensions,
changed baseline hashes and identical repeat exports. No portrait container or
catalog identity changed.

[browser-captures.json](browser-captures.json) indexes five portraits × three
viewports (360 × 800, 768 × 1024, 1440 × 900) × 100%/200% root text at DPR 1.
The fixture uses immutable resting/selected-enemy data, initialized audio, paused
clock and production `engageBattle()`. Images decoded before capture. Natural and
rendered dimensions, alt text, screenshot hashes and actual Chromium version are
recorded. All portraits remain separate from names and HP panels. At enlarged
text, accumulated history extends in its existing scroll region; captures do not
certify scrolling, keyboard operation or native-device interaction.

T076 owns common-manifest integration. T077/T078 own collection qualification.
Matched performance, human/native review and release acceptance remain OPEN.
