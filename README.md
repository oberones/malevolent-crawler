# The Bell Beneath Brine

Descend beneath Veyr Quay into the Drowned Observatory. As a sounding keeper, chart impossible chambers, face listening presences, and recover relics that outlast each descent. This original coastal cosmic-horror setting preserves the crawler’s existing combat, loot, and progression rules.
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
npm run validate:art
npm audit --audit-level=high
npm run validate:evidence
```

Phase 1, Phase 2A–2G foundations, and Phase 3A–3B narrative integration are implemented.
The unit suite passes 2,382 tests, including 1,118 candidate gameplay replays against
frozen rules. The integration/browser matrix passes 321 checks across Chromium,
Firefox, and WebKit. Lint, formatting, and the dependency audit pass locally.
[Foundation results](validation/cosmic-horror/foundation.md) record guarded startup
and completed-transition saves. [Narrative integration results](validation/cosmic-horror/phase-3b.md)
record catalog-driven entry, event choices, combat/rewards, relic labels, menu, help,
and credits, plus inert rendering of player names. These are local automated results;
no remote CI run or native/manual acceptance is claimed.

Continue with Phase 3C for semantic navigation, modal focus, reflow, reduced motion,
and US1 acceptance. Legacy history remains preserved with neutral notices until
Phase 7A supplies template-aware migration and recovery controls.

Art and release-evidence validators intentionally remain incomplete pending
original-art generation, reviews and qualification. [Phase 2F results](validation/cosmic-horror/phase-2f.md)
record 190 immutable baseline timing samples with warm-cache proof. Candidate
performance comparison and full recovery/import/lifecycle acceptance remain OPEN.

To prepare one recorded generated master, run
`npm run art:prepare -- <manifest-asset-id>`. The manifest row must first contain its
master path and explicit output dimensions. Record the printed delivered hash and
transform in that row, then validate. Preparation never fills review fields or
claims originality. The 80 required art rows remain OPEN.

See the [Phase 1 results](validation/cosmic-horror/phase-1.md),
[environment](validation/cosmic-horror/environment.json),
[manual workbook](validation/cosmic-horror/manual.md), and
[CI/enforcement record](validation/cosmic-horror/ci.md). Native/manual acceptance,
art qualification, matched performance and GitHub required-check enforcement
remain OPEN/BLOCKED; automated setup success does not substitute for them.

## Credits

The original setting and narrative are implemented. Generated replacement art is
still pending; the shipped original sprites retain their author credit below.
Howler 2.2.3 remains the audio library. Font/library license notices remain in their
distributed files.

- [Aekashics](https://aekashics.itch.io/) - Monster Sprites
- [Leohpaz](https://leohpaz.itch.io/) - RPG SFX
- [phoenix1291](https://phoenix1291.itch.io/sound-effects-pack-2) - Level up SFX
- [Leviathan_Music](https://soundcloud.com/leviathan254) - Battle Music
- [Sara Garrard](https://sonatina.itch.io/letsadventure) - Dungeon Music
