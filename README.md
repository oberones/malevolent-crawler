# Malevolent Gods: The Drowned Labyrinth

Descend beneath Veyr Quay into the Drowned Observatory. As a relic seeker, chart impossible chambers, face listening presences, and recover relics that outlast each descent. This original coastal cosmic-horror setting preserves the crawler’s existing combat, loot, and progression rules.
<br><br><a href='https://ko-fi.com/W7W4I2XU6' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate/?hosted_button_id=8F4LBS6QB4PVC)

## Gameplay Mechanics

- Roguelite gameplay where the progress is reset when the player dies, but equipment is carried over.
- Explore randomized chambers and pass Threshold Keepers to reach deeper descents.
- Each Attunement increase offers three stat choices and two rerolls.
- Equip up to six recovered relics.
- There are 6 equipment rarities which are Common, Uncommon, Rare, Epic, Legendary, and Heirloom.

## In-game Stats

- HP (Hit Points) - The amount of damage a unit can take before dying.
- ATK (Attack) - The amount of damage dealt when a unit attacks.
- DEF (Defense) - The amount of damage reduction against attacks.
- ATK.SPD (Attack Speed) - How quickly a unit can perform attacks per second.
- VAMP (Vampirism) - Heals for a percentage of the damage dealt.
- C.RATE (Crit Rate) - Chance to land a critical hit.
- C.DMG (Crit Damage) - Amount of bonus damage dealt upon landing a critical hit.

## Development

The [project constitution](.specify/memory/constitution.md) defines the development
rules: test-driven development, modular JavaScript, clear function comments, safe
data handling, accessible browser behavior, and reproducible validation.

For every new or changed behavior, write and run a failing test, implement the
smallest passing change, then refactor with tests green. Document each new or
modified function with a concise purpose comment, using JSDoc for public interfaces
and non-obvious contracts. Update comments whenever the corresponding code changes.

The app remains static HTML/CSS/JavaScript, with native ES modules for new code.
Use the active [implementation plan](specs/001-cosmic-horror-refactor/plan.md) and
[quickstart](specs/001-cosmic-horror-refactor/quickstart.md).

### Setup

Use Node **24.21.0** and npm **12.2.0**. With nvm:

```sh
nvm install
nvm use
# Only if this selected nvm version has a different npm:
npm install --global npm@12.2.0 --ignore-scripts
node --version
npm --version
npm ci
npx playwright install chromium firefox webkit
npm run dev
```

Open `http://127.0.0.1:4173`. Serve `.mjs` as JavaScript over HTTP(S); opening
`index.html` through `file://` is unsupported for module loading. The dev server
binds only to loopback. There is no production build: **build N/A**.
The project disables dependency lifecycle scripts; Sharp and browser tooling were
verified without enabling arbitrary install hooks. Do not change the default nvm
alias or system Node to select this project runtime.

### Checks and current limits

```sh
npm run test:unit
npm run test:integration
npm run test:browser
npm run lint
npm run format:check
npm audit --audit-level=high
```

PR CI runs these six checks to detect code regressions and dependency issues.
Accepted artwork and refactor qualification are not repeatedly approved by CI.
The optional **Release evidence (manual)** workflow, or `npm run validate:evidence`
locally, checks historical qualification records on demand and is not a PR gate.

All five story implementations are integrated: narrative, encounters, relics,
art recovery and saved-player continuation/exchange. All 80 generated art
outputs are delivered and [maintainer-approved](validation/cosmic-horror/art-approval-2026-10-07-complete.md).
[Phase 8 qualification](validation/cosmic-horror/release.md) records the current
candidate checks and outstanding release gates. Automated success does not
certify native browsers, physical devices, manual accessibility or release acceptance.

Local continuation restores a validated saved encounter without rerolling rewards.
Character export uses Unicode-capable `MC1:` text; importing an old or new character
requires confirmation and resets its run while retaining character holdings.
Recovery preserves original source bytes and supports explicitly unsaved sessions.
Keep one active gameplay tab; a conflicting save suspends writes and offers reload
or export. A recovery JSON download is an archive, not a character import format.

The one-time legacy art comparison and generation tooling has been retired.
Current assets remain covered by browser loading, layout and missing-image recovery
checks. See the [review cleanup record](validation/cosmic-horror/review-cleanup.md)
for retained provenance and the non-art qualification scope.

For performance, follow the prepared-root procedure in the
[quickstart](specs/001-cosmic-horror-refactor/quickstart.md). The comparison uses
five or more samples per matched workload and verifies warm caching. The
[manual workbook](validation/cosmic-horror/manual.md),
[environment](validation/cosmic-horror/environment.json) and
[CI record](validation/cosmic-horror/ci.md) retain separate qualification status.

## Credits

The coastal setting and narrative are original to this refactor. All 53 creature
sprites, 24 symbol roles, two favicons and the shared fallback were generated with
built-in ImageGen and prepared deterministically at their recorded dimensions.
The [delivery manifest](art/cosmic-horror/manifest.json) and
[prompts](art/cosmic-horror/prompts/) retain generation provenance, delivered
hashes, preparation settings and recorded maintainer approval. Masters, legacy
raster artwork and screenshot collections are no longer required or tracked.
Future artwork is reviewed against the current game, without legacy comparisons.

The original game's monster sprites by [Aekashics](https://aekashics.itch.io/)
remain credited as historical baseline assets; shipped creature sprites have
been replaced. Retained audio credits:

- [Leohpaz](https://leohpaz.itch.io/) — RPG sound effects
- [phoenix1291](https://phoenix1291.itch.io/sound-effects-pack-2) — Level-up sound effect
- [Leviathan_Music](https://soundcloud.com/leviathan254) — Battle music
- [Sara Garrard](https://sonatina.itch.io/letsadventure) — Dungeon music

Howler 2.2.3 remains the audio library. Retained text fonts, generic Font Awesome
controls, library assets and their license notices remain in their distributed files.
