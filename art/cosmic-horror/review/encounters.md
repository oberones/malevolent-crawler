# Encounter collection review — T077/T078

**Acceptance update — 2026-10-07:** [Direct maintainer approval](../../../validation/cosmic-horror/art-approval-2026-10-07.md) marks human visual acceptance PASS for all 53 delivered creature artworks and related visual criteria. Native execution remains separate. The implementation/capture-time record below is preserved; its human-artwork OPEN statements are superseded by this approval.

Date: 2026-10-07. Reviewer: implementation agent. **Automated/agent review PASS;
human and native acceptance OPEN/BLOCKED. US2 is not release-accepted.**

The [shared manifest](../manifest.json) integrates 53 delivered sprites from 13
batches, including two independent Sounding Vessel alternatives and the unused
Unrung Witness. [Capture index](encounters/index.json) records source/asset hashes,
actual browser versions, OS, viewport, DPR 1, text scale and screenshot hashes.
Only **capture-03** supplies final-candidate context evidence.

## Method and findings

The browser suite selects all 52 active variants from immutable oracle enemies,
renders the real combat view, decodes each PNG, and exercises three engines ×
three viewports (360 × 800, 768 × 1024, 1440 × 900) × 100%/200% root text.
It verifies exact natural dimensions, original 50%/70% content widths, aspect
ratios within 0.5 CSS px, wrapped identity labels, portrait separation from HP
and player panels, and no additional RNG/state mutation. A synthetic settled
Claim control is checked for pointer actionability and programmatic focus; reward
and real Claim behavior are covered separately by the existing journey suites.
No physical touch, manual keyboard traversal or native browser acceptance is
inferred. External analytics/fonts are blocked; local fallback fonts are ready.

All 18 capture-02 overview sheets were visually inspected, covering all 936
portrait contexts. Final capture-03 has 931 pixel-identical portrait crops; the
five differing crops were inspected individually. Full-size narrow enlarged-text
and extreme-aspect examples were inspected separately, including both size
extremes and the tall chime variant. The unused sprite was inspected at its
intrinsic 282 × 626 size. Overview sheets are reduced comparison aids; original
full-screen and portrait crops remain available at actual captured pixel size.

- **F01 — RESOLVED, fixture only:** capture-01 refreshed an inactive player and
  showed an empty name/undefined HP percentage. The fixture now matches
  startCombat's active-state-before-refresh ordering. This was not a production
  defect. capture-01 remains diagnostic and is not referenced by manifest contexts.
- **F02 — RESOLVED, production text layout:** full-size WebKit 360px/200% review
  exposed player HP percentage overlapping EXP. A regression first failed on
  glyph bounds. A full-track-width text span and automatic text-row height now
  keep full, half and near-zero HP readable above EXP in all three engines.
  HP fill percentages, gameplay values, portrait dimensions and container widths
  are preserved. capture-02 documents the earlier layout; capture-03 is final.
- Some microtexture softens at the smallest portrait sizes and small source
  canvases soften when enlarged by the retained percentage widths. Primary
  silhouettes remain distinct. No unresolved creature-art defect was observed.

The original batch reviews remain the per-file source/provenance record. No new
art was generated in this package. No observed recognizable borrowed character,
opaque backdrop, lettering, explicit mutilation or graphic gore appears in this
agent review. This does not establish legal originality or substitute for the
required human direction/boundary/originality review, which remains OPEN for all
53 files and required native contexts.

## Individual results

Every active row below has 18 passing automated layout/control contexts and an
agent visual PASS for framing, shared direction and the accepted horror boundary.
The unused row has no invented combat context. Human acceptance is OPEN for every
row. Each batch link contains its separate prompts, masters, source references,
prior edits and original individual review. Use the manifest's `contexts` links
for every full-size screenshot and measurement record.

| Runtime file / identity                           | Individual silhouette and framing observation                                                           | Contexts / source review                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `alfadriel.png` — The Lantern Without Flame       | Hollow upright ribcage and dark central lantern; long hands remain inside the canvas.                   | 18 PASS; [batch](../batches/guardians-a/review.md)         |
| `ant_queen.png` — The Brood Bell                  | Broad bell mantle with hanging pale chambers and separated legs.                                        | 18 PASS; [batch](../batches/guardians-a/review.md)         |
| `behemoth.png` — The Continental Sleeper          | Low massive body with layered shoreline ridges; pale side plates separate it from the panel.            | 18 PASS; [batch](../batches/bosses-a/review.md)            |
| `berthelot.png` — The Salt Regent                 | Triangular spread cloak and central crown; wide hem stays complete.                                     | 18 PASS; [batch](../batches/guardians-a/review.md)         |
| `bm-feral.png` — The Red Undertow                 | Long curled tendrils surround a red central focus; no graphic wound is visible.                         | 18 PASS; [batch](../batches/bosses-a/review.md)            |
| `cerberus_ptolemaios.png` — The Threefold Watch   | Three distinct listening heads above a low flippered body.                                              | 18 PASS; [batch](../batches/guardians-a/review.md)         |
| `da-reaper.png` — The Eclipse Ferryman            | Hooded body and sweeping crescent appendage; broad outline remains distinct.                            | 18 PASS; [batch](../batches/bosses-a/review.md)            |
| `fallen_king.png` — The Unmoored Magistrate       | Hanging robed mantle and dark central cavity, with complete robe tips.                                  | 18 PASS; [batch](../batches/guardians-b/review.md)         |
| `firelord.png` — The Kiln Below                   | Broad kiln-like shell with warm internal openings; limbs and chimney tips fit.                          | 18 PASS; [batch](../batches/bosses-a/review.md)            |
| `goblin.png` — Quay Scavenger                     | Compact plated scavenger with a tall shell crest and pale lower edges.                                  | 18 PASS; [batch](../batches/encounter-pilot/review.md)     |
| `goblin_archer.png` — Needlecast Lookout          | Forward-projecting needle fan and low stance; thin tips remain visible.                                 | 18 PASS; [batch](../batches/goblins/review.md)             |
| `goblin_boss.png` — The Dredge Foreman            | Heavy asymmetric body and hooked arm; narrow-view detail softens but the hook reads.                    | 18 PASS; [batch](../batches/goblins/review.md)             |
| `goblin_mage.png` — Brine Whisperer               | Low hooded figure framing a teal chest spiral.                                                          | 18 PASS; [batch](../batches/goblins/review.md)             |
| `goblin_rogue.png` — Crevice Pilferer             | Crouched slender figure with long curved appendages and open negative space.                            | 18 PASS; [batch](../batches/goblins/review.md)             |
| `hellhound.png` — Cinderwake Prowler              | Arched tail and low predatory body with a warm coral mouth cage.                                        | 18 PASS; [batch](../batches/guardians-a/review.md)         |
| `icemaiden.png` — The Stillwater Veil             | Pale open veil and long floating side lobes; edges stay readable on black.                              | 18 PASS; [batch](../batches/bosses-b/review.md)            |
| `mimic.png` — Coffer of Listening Teeth           | Low open coffer with pale folded plates; distinct from the arch-shaped door mimic.                      | 18 PASS; [batch](../batches/mimics/review.md)              |
| `mimic_door.png` — Threshold That Breathes        | Broad stone arch enclosing a green membrane; crown and buttresses fit.                                  | 18 PASS; [batch](../batches/mimics/review.md)              |
| `orc_archer.png` — Breakwater Harpooner           | Upright plated body with a diagonal integrated harpoon silhouette.                                      | 18 PASS; [batch](../batches/orcs/review.md)                |
| `orc_axe.png` — Keelbreaker                       | Heavy stance with a broad crescent arm and visible negative space.                                      | 18 PASS; [batch](../batches/orcs/review.md)                |
| `orc_mage.png` — Stormsilt Cantor                 | Pale clustered throat rings above a dark flowing lower body.                                            | 18 PASS; [batch](../batches/orcs/review.md)                |
| `orc_swordsmaster.png` — Tideglass Duelist        | Separated arms and crossing pale blades; tips remain inside the frame.                                  | 18 PASS; [batch](../batches/orcs/review.md)                |
| `skeleton_archer.png` — Ossuary Signalman         | Thin spread limbs and a horizontal bow-like arm shape.                                                  | 18 PASS; [batch](../batches/skeletons-a/review.md)         |
| `skeleton_boss.png` — The Choir in the Wall       | Broad ribbed mantle and central bell; complete crown and hem.                                           | 18 PASS; [batch](../batches/skeletons-b/review.md)         |
| `skeleton_dragon.png` — The Cathedral Remnant     | High nacre arches over a heavy quadruped; full crest and tail retained.                                 | 18 PASS; [batch](../batches/bosses-b/review.md)            |
| `skeleton_knight.png` — Reliquary Warden          | Low guarded stance with a large round pale shield.                                                      | 18 PASS; [batch](../batches/skeletons-a/review.md)         |
| `skeleton_mage1.png` — Sounding Vessel — Bowl     | Broad bowl and circular halo above a crouched frame; distinct from Chimes.                              | 18 PASS; [batch](../batches/skeletons-b/review.md)         |
| `skeleton_mage2.png` — Sounding Vessel — Chimes   | Tall narrow chime cage with hanging loop; distinct from Bowl.                                           | 18 PASS; [batch](../batches/skeletons-b/review.md)         |
| `skeleton_pirate.png` — Wreck Tallyman            | Hunched hood and hanging coat/token forms; pale hands separate from the body.                           | 18 PASS; [batch](../batches/skeletons-b/review.md)         |
| `skeleton_samurai.png` — Lowtide Executioner      | Wide horizontal nacre blade edge and upright robe.                                                      | 18 PASS; [batch](../batches/skeletons-b/review.md)         |
| `skeleton_swordsmaster.png` — Splinterblade Usher | Open angular limbs and long separated blade-like forearms.                                              | 18 PASS; [batch](../batches/skeletons-a/review.md)         |
| `skeleton_warrior.png` — Pierbound Husk           | Stooped plated body with a long cross-body weapon and complete feet.                                    | 18 PASS; [batch](../batches/skeletons-a/review.md)         |
| `slime.png` — Tidepool Memory                     | Low translucent ripple with pale curling edges; soft texture at enlarged display sizes is expected.     | 18 PASS; [batch](../batches/slimes/review.md)              |
| `slime_angel.png` — Halo Medusa                   | Floating bell canopy and separated dangling tendrils.                                                   | 18 PASS; [batch](../batches/slimes/review.md)              |
| `slime_boss.png` — The Reservoir Heart            | Broad carapace and contrasting warm central cavity; no graphic exposed wound.                           | 18 PASS; [batch](../batches/slimes/review.md)              |
| `slime_crusader.png` — Processional Ooze          | Horizontal sequence of pale upright lobes; low silhouette remains recognizable.                         | 18 PASS; [batch](../batches/slimes/review.md)              |
| `slime_knight.png` — Shellbound Bloom             | Low layered shell plates form a broad triangular mound.                                                 | 18 PASS; [batch](../batches/slimes/review.md)              |
| `spider.png` — Threadpool Creeper                 | Symmetric low crawler with separated arched legs.                                                       | 18 PASS; [batch](../batches/spiders/review.md)             |
| `spider_boss.png` — The Tidewheel Weaver          | Tall circular wheel-like shell above multiple separated legs.                                           | 18 PASS; [batch](../batches/spiders/review.md)             |
| `spider_dragon.png` — The Horizon Stitcher        | Wide suspended arches with long downward points; full outer tips fit.                                   | 18 PASS; [batch](../batches/encounter-pilot/review.md)     |
| `spider_fire.png` — Emberreef Weaver              | Warm ridged upper carapace and pale jointed legs.                                                       | 18 PASS; [batch](../batches/spiders/review.md)             |
| `spider_green.png` — Verdigris Spinner            | Rounded dark shell with green ridges and pale folded front limbs.                                       | 18 PASS; [batch](../batches/spiders/review.md)             |
| `spider_red.png` — Rustvein Spinner               | Reddish veined round shell and a low spread of legs; no graphic gore.                                   | 18 PASS; [batch](../batches/spiders/review.md)             |
| `spider_spirit.png` — The Unrung Witness          | Tall patinated bell with long thin hanging strands; full loop and strand tips fit the 282 × 626 canvas. | N/A: unused; [batch](../batches/encounter-pilot/review.md) |
| `thanatos.png` — The Last Sounding                | Wide draped hooded figure holding a central hanging bronze weight.                                      | 18 PASS; [batch](../batches/bosses-b/review.md)            |
| `tiamat.png` — The Anchor Votary                  | Symmetric serpentine coils and a high central crest; distinct from the quadruped bosses.                | 18 PASS; [batch](../batches/guardians-b/review.md)         |
| `wolf.png` — Surf Stalker                         | Compact curled-tail hunter with pale plated shoulders.                                                  | 18 PASS; [batch](../batches/wolves/review.md)              |
| `wolf_black.png` — Tarwake Stalker                | Lower dark hunter with a high ridged back and complete tail.                                            | 18 PASS; [batch](../batches/wolves/review.md)              |
| `wolf_boss.png` — The Hush at the Jetty           | Compact upright listening fan with pale scalloped fins.                                                 | 18 PASS; [batch](../batches/wolves/review.md)              |
| `wolf_winter.png` — Rimewake Stalker              | Pale branching dorsal fins and an extended muzzle; light silhouette contrasts with the other hunters.   | 18 PASS; [batch](../batches/wolves/review.md)              |
| `zalaras.png` — The Sovereign Below Sound         | Looped coiled body around a central bronze anchor-like form.                                            | 18 PASS; [batch](../batches/bosses-b/review.md)            |
| `zodiac_aries.png` — The Spiral Breaker           | Heavy curled shell and low stance with broad pale ridges.                                               | 18 PASS; [batch](../batches/guardians-b/review.md)         |
| `zodiac_cancer.png` — The Lockgate Carapace       | Low wide segmented carapace with curled side claws.                                                     | 18 PASS; [batch](../batches/guardians-b/review.md)         |

## Review overview index

- [chromium-1440-1](encounters/capture-02/chromium-1440-1/overview.png)
- [chromium-1440-2](encounters/capture-02/chromium-1440-2/overview.png)
- [chromium-360-1](encounters/capture-02/chromium-360-1/overview.png)
- [chromium-360-2](encounters/capture-02/chromium-360-2/overview.png)
- [chromium-768-1](encounters/capture-02/chromium-768-1/overview.png)
- [chromium-768-2](encounters/capture-02/chromium-768-2/overview.png)
- [firefox-1440-1](encounters/capture-02/firefox-1440-1/overview.png)
- [firefox-1440-2](encounters/capture-02/firefox-1440-2/overview.png)
- [firefox-360-1](encounters/capture-02/firefox-360-1/overview.png)
- [firefox-360-2](encounters/capture-02/firefox-360-2/overview.png)
- [firefox-768-1](encounters/capture-02/firefox-768-1/overview.png)
- [firefox-768-2](encounters/capture-02/firefox-768-2/overview.png)
- [webkit-1440-1](encounters/capture-02/webkit-1440-1/overview.png)
- [webkit-1440-2](encounters/capture-02/webkit-1440-2/overview.png)
- [webkit-360-1](encounters/capture-02/webkit-360-1/overview.png)
- [webkit-360-2](encounters/capture-02/webkit-360-2/overview.png)
- [webkit-768-1](encounters/capture-02/webkit-768-1/overview.png)
- [webkit-768-2](encounters/capture-02/webkit-768-2/overview.png)

Final full-size examples: [WebKit narrow/200%](encounters/capture-03/webkit-360-2/spider_dragon.png), [Firefox tall variant](encounters/capture-03/firefox-360-2/skeleton_mage2.png), [Chromium large boss](encounters/capture-03/chromium-1440-2/behemoth.png).
