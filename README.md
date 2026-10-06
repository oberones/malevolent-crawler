# Dungeon Crawler On Demand!

Quickly and easily access a thrilling dungeon-crawling experience at any time. With a simple click of a button, players can enter a fully-realized, randomly generated dungeon filled with monsters and diablo inspired equipment looting system!
<br><br><a href='https://ko-fi.com/W7W4I2XU6' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate/?hosted_button_id=8F4LBS6QB4PVC)

## Gameplay Mechanics

- Roguelite gameplay where the progress is reset when the player dies, but equipment is carried over.
- Players navigate through the dungeon by climbing the floors that features randomized events.
- Players can upgrade their stats upon level up, choosing 3 possible upgrades and 2 reroll chances per level.
- Players has 6 slots of equipment that they can equip.
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

Phase 1 verified 5 tooling unit tests, 6 HTTP/MIME integration cases and 18 browser
setup/input cases across Chromium, Firefox and WebKit at the three planned
viewports. These tests establish setup only. Gameplay characterization and
story suites start in Phase 2. Lint/format commands are configured and report
[inventoried legacy debt](validation/cosmic-horror/legacy-debt.md); they are not
currently passing repository-wide. Art preparation/validation, evidence validation
and performance scripts are reserved for their later implementation tasks and
currently exit nonzero because those tools/suites do not exist.

See the [Phase 1 results](validation/cosmic-horror/phase-1.md),
[environment](validation/cosmic-horror/environment.json),
[manual workbook](validation/cosmic-horror/manual.md), and
[CI/enforcement record](validation/cosmic-horror/ci.md). Native/manual acceptance,
art qualification, matched performance and GitHub required-check enforcement
remain OPEN/BLOCKED; automated setup success does not substitute for them.

## Credits

- [Aekashics](https://aekashics.itch.io/) - Monster Sprites
- [Leohpaz](https://leohpaz.itch.io/) - RPG SFX
- [phoenix1291](https://phoenix1291.itch.io/sound-effects-pack-2) - Level up SFX
- [Leviathan_Music](https://soundcloud.com/leviathan254) - Battle Music
- [Sara Garrard](https://sonatina.itch.io/letsadventure) - Dungeon Music
