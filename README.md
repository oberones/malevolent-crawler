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

The current app uses `index.html`, `assets/js/`, and `assets/css/`. At constitution
adoption, `package.json` has no test, lint, format-check, or build scripts and there
is no feature plan. The first behavior-changing implementation must establish and
document automated checks before changing application behavior. A build command
is required only if a build pipeline is introduced.

Read the current `specs/<feature>/plan.md` when available for supported browsers,
runtime versions, commands, and validation requirements. Record actual test results
and browser checks separately; unavailable required checks remain blocked.

## Credits

- [Aekashics](https://aekashics.itch.io/) - Monster Sprites
- [Leohpaz](https://leohpaz.itch.io/) - RPG SFX
- [phoenix1291](https://phoenix1291.itch.io/sound-effects-pack-2) - Level up SFX
- [Leviathan_Music](https://soundcloud.com/leviathan254) - Battle Music
- [Sara Garrard](https://sonatina.itch.io/letsadventure) - Dungeon Music
