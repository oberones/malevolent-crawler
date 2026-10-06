# Second skeleton-alias batch review — T070

Date: 2026-10-06. Reviewer: implementation agent. PASS for the five delivered
portraits and recorded automated-browser visual contexts. Human/native review
and collection/release acceptance remain OPEN/BLOCKED.

| Runtime file / identity                                        | Exact canvas | Individual findings                                                                                                                                                                                                                     |
| -------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/sprites/skeleton_mage1.png` — Sounding Vessel — Bowl   | 265 × 260    | Broad bronze bowl, circular vertebra halo and crouched stance distinguish this variant. Full halo and feet retained; bowl remains visible at smallest size. PASS.                                                                       |
| `assets/sprites/skeleton_mage2.png` — Sounding Vessel — Chimes | 178 × 230    | Slender upright frame, hanging bronze chimes and salt spiral are clearly distinct from Bowl. Full yoke, cage and feet retained. Fine texture softens at small sizes, but the silhouette and cage remain readable. PASS.                 |
| `assets/sprites/skeleton_pirate.png` — Wreck Tallyman          | 207 × 232    | Hunched shell head, long coat and bronze wreck tokens establish identity. Pale hands and head separate from the dark panel. Initial master retained after alpha-composited inspection disproved preview haze. PASS.                     |
| `assets/sprites/skeleton_samurai.png` — Lowtide Executioner    | 209 × 223    | Wide continuous nacre shell edge across folded arms provides a strong cue. Both blade tips, reed cowl and feet remain within frame. PASS.                                                                                               |
| `assets/sprites/skeleton_boss.png` — The Choir in the Wall     | 372 × 309    | Broad ribbed mantle, closed mouths and central bell establish the guardian. A framing edit restores the entire crown spike; robe tips and feet fit. Mouth detail softens at smallest size while vaulted silhouette remains clear. PASS. |

Five separate built-in ImageGen requests produced the initial original masters.
One retained edit corrected the Choir's crown framing. Wreck Tallyman received an
unselected background edit and regeneration after the generation preview appeared
hazy. Direct alpha inspection and compositing onto a dark panel showed the initial
master was clean; it remains selected. Those attempts and exact prompts are retained
in [generation records](generation.json). No legacy art was supplied as reference.
Unknown model, seed, generation timestamp and source URL stay null; filesystem
modification time is labeled separately.

Selected masters were inspected inline, all five runtime images at their exact
pixel sizes, all 30 Chromium captures in comparison sheets, and the five desktop
200% captures individually. No observed opaque backdrop, lettering, graphic wounds,
explicit mutilation or recognizable borrowed character. This agent visual review
does not certify legal originality or human acceptance.

The unchanged tested `prepareArt` API uses proportional contain and transparent
padding without cropping, stretching or alpha trimming. [Validation](validation.json)
records full decode, visible and transparent pixels, exact immutable dimensions,
changed hashes and identical repeat exports. Portrait containers remain unchanged.

[Browser captures](browser-captures.json) cover five portraits × three viewports
(360 × 800, 768 × 1024, 1440 × 900) × 100%/200% root text, DPR 1, using immutable
resting and selected-enemy fixtures, initialized audio, paused clock and production
`engageBattle()`. Images decoded before capture. Natural/rendered dimensions, alt
text, screenshot hashes and browser version are recorded. Portraits remain clear
of names and HP. History accumulates across the five selections and extends inside
the existing scrolling region; these captures do not certify scrolling or native
interaction. Small PNGs soften when enlarged by the existing 50% display width.

T076 owns common-manifest integration; T077/T078 own collection qualification.
Matched performance, human/native review and release acceptance remain OPEN.
