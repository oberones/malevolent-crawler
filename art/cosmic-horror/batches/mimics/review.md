# Mimic batch review — T075

Date: 2026-10-07. Reviewer: implementation agent. PASS for these two delivered
portraits and the recorded Chromium visual contexts. Human/native review and
collection/release acceptance remain OPEN/BLOCKED.

| Runtime file / identity                                   | Trigger | Exact canvas | Individual findings                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------- | ------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/sprites/mimic.png` — Coffer of Listening Teeth    | chest   | 227 × 174    | A low slate-and-bronze coffer opens around nested pale ivory fans. The lid, base, hinges and outer plates fit inside the canvas. Pale fans distinguish the dark coffer at the smallest 108.61 CSS-pixel capture; fine metalwork softens while the open-coffer silhouette remains clear. No opaque background or clipped defining part observed. PASS. |
| `assets/sprites/mimic_door.png` — Threshold That Breathes | door    | 317 × 230    | A broad stone arch encloses a translucent green membrane with inward-folding ribs and a dark listening slit. Nacre edges preserve the arch against the black combat panel. The crest, buttressed sides and base fit; the membrane and arch remain distinct from the coffer at the smallest 108.61 CSS-pixel capture. PASS.                            |

Two separate built-in ImageGen requests produced two selected original masters.
No baseline artwork was supplied as a reference. Neither asset needed a framing
edit or regeneration. Exact prompts, separate trigger/encounter/variant IDs,
source paths, master hashes and deterministic transforms are retained in
[generation.json](generation.json). Model, seed, generation timestamp and source
URL were not returned and remain null; source filesystem modification time is
recorded separately.

Reviewed the returned masters, both delivered sprites at intrinsic size in
[actual-size.png](actual-size.png), all 12 decoded browser captures in comparison
sheets, and both desktop 200% captures individually. No observed lettering,
graphic wounds, explicit mutilation, opaque background, clipped silhouette or
recognizable borrowed character. This agent review does not establish legal
originality or human acceptance.

The unchanged tested `prepareArt` API uses proportional contain and transparent
padding without cropping, stretching or alpha trimming. [validation.json](validation.json)
records full decoding, visible/transparent pixels, exact immutable dimensions,
changed baseline hashes and identical repeat exports. Existing catalog identities
and 50% portrait widths remain unchanged.

[browser-captures.json](browser-captures.json) indexes two portraits × three
viewports (360 × 800, 768 × 1024, 1440 × 900) × 100%/200% root text at DPR 1.
Each fresh fixture uses the immutable resting state and its separate chest or
door random tape, initialized audio and a paused clock. Production
`mimicBattle(trigger)` selects the encounter. Authoritative enemy values and the
complete tape match the immutable oracle; only the derived HP percentage is
compared numerically because display refresh formats it as text. Images decoded
before capture. Natural/rendered dimensions, alt text, screenshot hashes and
actual Chromium version are recorded.

Portraits remain separate from names and HP panels. Names wrap at narrow 200%
text; history occupies the existing scroll region and is partly below its visible
area. Captures do not certify scrolling, keyboard operation or physical touch.

T076 owns common-manifest integration, and T077/T078 own encounter collection
qualification. Human/native review, matched performance and release acceptance
remain OPEN/BLOCKED.
