# Creature pilot review — T062/T063

Date: 2026-10-06. Reviewer: implementation agent. Status: PASS for pilot direction
and the three delivered files; full human/native/collection acceptance remains OPEN.

| File / identity                                           | Exact canvas | Individual findings                                                                                                                                                                                                                                                      |
| --------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `assets/sprites/goblin.png` — Quay Scavenger              | 161 × 166    | Compact crouched silhouette, webbed feet, cupped lamp and nacre shell distinguish the identity. Lamp and face survive downsampling; microtexture is secondary. Entire figure is present, no ground rectangle or obvious matte halo. No gore. PASS.                       |
| `assets/sprites/spider_spirit.png` — The Unrung Witness   | 282 × 626    | Tall bell crown and trailing pale/dark filaments make a distinct continuous vertical silhouette. All defining tips remain present; narrow side padding comes from proportional contain. Bronze/nacre treatment matches the family. No gore. PASS as unused artwork only. |
| `assets/sprites/spider_dragon.png` — The Horizon Stitcher | 895 × 659    | Broad arch, membrane sails and needle legs read as a major presence. Pale membranes separate from the dark UI; suspended bell details remain subordinate. Full limb silhouette is visible without covering labels or HP bars. No explicit wounds or gore. PASS.          |

The generated masters and exact runtime PNGs were visually inspected. Six actual
Chromium captures (`goblin-{360,768,1440}.png` and
`spider_dragon-{360,768,1440}.png`) were inspected with decoded delivered images,
using the production combat-entry path and a paused clock. Viewports were
360 × 800, 768 × 1024 and 1440 × 900, DPR 1. Measurements and alt text are in
[browser-captures.json](browser-captures.json). The portraits fit their unchanged
50%/70% widths. Names, HP areas and log text remain separate and readable.
These are automated-browser visual reviews, not physical-device or manual-play acceptance.
The Witness has no in-game encounter or fabricated browser context.

No originals were supplied to generation: each asset used its authored description
and a separate built-in request. This establishes independent generation provenance;
visual review found no recognizable borrowed character, but is not a legal originality certification.
The tool returned no model identifier, seed, generation timestamp or source URL;
those remain null. The local source path, file modification timestamp, exact prompt,
master SHA-256 and delivered SHA-256 are retained in [generation.json](generation.json).

## Frozen direction for later creature batches

Use painterly nacre plates, wet slate anatomy, pitted bronze and sparse verdigris
accents. Establish one dominant silhouette and one identity cue before surface
texture. Small creatures need broad readable masses; tall forms need continuous
filaments; bosses need negative space between supporting limbs and membranes.
Use pale edge/mass contrast against the near-black battle panel, not a background glow.

Request a complete silhouette and clear margins, but judge the returned pixels:
the pilot tool used tighter margins than requested. Do not depend on prompt margin
numbers as measured truth. Accept only complete defining anatomy, then contain
proportionally with transparent padding to the exact baseline canvas; never stretch,
crop to fit, or enlarge the UI container. The three pilots required no trimming or
retouching. Preserve authored identity/variant IDs, percentage widths and alt text.
Keep mutation non-graphic; exclude detailed wounds, explicit mutilation and gore.

Review every later asset at delivered size and on the dark runtime panel. Do not
carry a pilot PASS into later batches automatically. Keep separate generation and
review records; T076 owns the collection-manifest merge. Native/art/performance
qualification and the whole collection remain unfinished.
