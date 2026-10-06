# First boss-alias batch review — T073

Date: 2026-10-07. Reviewer: implementation agent. PASS for these four delivered
portraits and the recorded Chromium visual contexts. Human/native review and
collection/release acceptance remain OPEN/BLOCKED.

| Runtime file / identity                                 | Exact canvas | Individual findings                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/sprites/behemoth.png` — The Continental Sleeper | 675 × 532    | A heavy low creature carries stepped drowned quay terraces along its back. The broad listening-cavity head, pale ridges and squat feet give it a distinct silhouette. Head, claws, terraces and tail are complete; fine shoreline detail softens at small sizes while the stepped profile remains readable. PASS. |
| `assets/sprites/bm-feral.png` — The Red Undertow        | 441 × 355    | Open flowing sinews surround a visible muted red pearl. The arcing tail, pointed head and separated hunting limbs distinguish it from the other bosses. All tips fit; nacre edges and the central pearl remain visible at the smallest capture. No blood spray or wounds. PASS.                                   |
| `assets/sprites/da-reaper.png` — The Eclipse Ferryman   | 434 × 310    | Broad sail wings surround a thin figure with a pale face and diagonal crescent oar. Full wing tips, oar ends and feet fit. Dark interior cloth recedes at small sizes, while pale spars, face and broad oar blade retain the identity against the black panel. PASS.                                              |
| `assets/sprites/firelord.png` — The Kiln Below          | 744 × 509    | Porous reef armor and unequal chimney tubes form a broad furnace creature. Restrained orange interiors contrast with nacre and bronze. Complete legs and chimney tops fit; clustered vents and the broad shell remain legible at small sizes. PASS.                                                               |

Four separate built-in ImageGen requests produced four selected original masters.
No baseline art was supplied as a reference; no framing edit or regeneration was
needed. Exact prompts, source paths, master hashes and deterministic transforms
are retained in [generation.json](generation.json). Model, seed, generation
timestamp and source URL were not returned and remain null; source filesystem
modification time is recorded separately.

Reviewed the returned masters, all delivered sprites at intrinsic size in
[actual-size.png](actual-size.png), the 24 decoded browser captures in comparison
sheets, and the four desktop 200% captures individually. No observed opaque
background, lettering, clipped defining anatomy, graphic wounds, explicit
mutilation or recognizable borrowed character. This agent review does not
certify legal originality or human acceptance.

The unchanged tested `prepareArt` API uses proportional contain and transparent
padding, with no cropping, stretching or alpha trimming. [validation.json](validation.json)
records full decoding, visible/transparent pixels, exact immutable dimensions,
changed baseline hashes and identical repeat exports. Catalog identities,
gameplay rules and 70% portrait widths remain unchanged.

[browser-captures.json](browser-captures.json) indexes four portraits × three
viewports (360 × 800, 768 × 1024, 1440 × 900) × 100%/200% root text at DPR 1.
The fixture uses immutable resting/selected-enemy data, initialized audio, a
paused clock and production `engageBattle()`. Images decoded before capture.
Natural/rendered dimensions, alt text, screenshot hashes and actual Chromium
version are recorded. Portraits remain separate from names and HP panels. At
enlarged text names wrap and accumulated history occupies the existing scroll
region; these captures do not certify scrolling, keyboard operation or physical
touch.

T076 owns common-manifest integration, and T077/T078 own encounter collection
qualification. Human/native review, matched performance and release acceptance
remain OPEN/BLOCKED.
