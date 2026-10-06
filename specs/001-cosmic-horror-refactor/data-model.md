# Data Model: Cosmic Horror Refactor

**Design status**: Proposed implementation contracts; no runtime schema or migration has been installed. See [research](research.md) for source evidence and [persistence contract](contracts/persistence.md) for transactions and recovery.

## Ownership and identity

The classic engine continues to own `player`, `dungeon`, `enemy`, and `volume`. ES services receive accessors and return validated candidates or presentation data; they do not silently mutate engine globals. Internal legacy rule tokens remain stable. Catalog IDs are immutable lowercase ASCII identifiers; display names are separate plain text. A unique legacy alias maps to exactly one identity. Changing a display name never changes a rule, save key, probability, or item value.

An equipment instance has no legacy UUID. Preserve inventory/equipped sequence and multiplicity, including two items with identical attributes. Do not deduplicate by category, value, or serialized text. UI actions bind to the current collection/index plus render revision and reject stale actions after list mutation; re-render instead of operating on a different item.

## SettingBrief

| Field                                        | Type / constraint                                                                                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `id`, `contentVersion`                       | Stable setting ID; integer content version 1                                                                                      |
| `title`, `premise`, `playerRole`, `location` | Plain text establishing one original coastal settlement/submerged-ruins setting                                                   |
| `terms`                                      | Canonical token → visible label/description; neutral HP/Inventory/Equip and six rarity names retained                             |
| `motifs`, `palette`, `namingRules`           | Shared prompt and narrative direction, category cues, readability constraints                                                     |
| `horrorBoundary`                             | Fixed accepted rule: grotesque mutation/exposed anatomy/restrained blood permitted; explicit mutilation and graphic gore excluded |
| `copySurfaces`                               | Title/browser title, introduction, events, combat, upgrades, items, resets, menus, help, description, credits                     |

The authored `art/cosmic-horror/setting-guide.md` and runtime content exports must agree. This is an implementation deliverable using the settled creative direction, not a new product decision gate.

## EncounterIdentity and ArtVariant

| Field                                       | Type / constraint                                                                   |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| `id`                                        | Unique stable encounter catalog ID; exactly 51 mapped active identities             |
| `legacyName`                                | Exact internal name used by current rule code                                       |
| `displayName`, `description`                | New original identity and accessible description, plain text                        |
| `roles`                                     | Existing ordinary/guardian/special-boss/chest-mimic/door-mimic eligibility          |
| `archetypes`                                | Existing Offensive/Defensive/Balanced/Quick/Lethal eligibility; no new combat types |
| `variants`                                  | One or two ArtVariant references, with unique legacy image key per variant          |
| `ArtVariant.id`                             | Stable variant ID, separate from creature ID                                        |
| `legacyImage`                               | Allowlisted `{name, type: '.png', size: '50%' or '70%'}`                            |
| `assetId`, `path`, `width`, `height`, `alt` | Manifest reference, repository asset URL, exact recorded pixel size, plain text     |

Skeleton Mage's two legacy image keys resolve independently. `spider_spirit.png` has an art identity/manifest row with `unusedButRequired: true` and no encounter-pool membership. Ordered pools and draw order stay in the existing rules; the catalog validates coverage without duplicating numerical rules. A saved identity/image mismatch is a recoverable validation error, not permission to randomly select another variant.

## RelicIdentity and SymbolRole

`RelicIdentity` has `id`, exact `legacyCategory`, `displayName`, `description`, `attribute`, `type`, and `symbolId`. There are 14 categories: Sword, Axe, Hammer, Dagger, Flail, Scythe, Plate, Chain, Leather, Tower, Kite, Buckler, Great Helm, Horned Helm. Retain their Damage/Defense and Weapon/Armor/Shield/Helmet semantics. Rarity is the ordered enum Common, Uncommon, Rare, Epic, Legendary, Heirloom; labels, probabilities and sale filtering stay unchanged.

`SymbolRole` has `id`, `purpose`, `assetId`, `accessibleLabel`, and `contextIds`. Exactly 24 roles are required: 14 equipment categories; title, HP, attack, defense, attack speed, vampirism, critical rate, critical damage, treasure, currency. Shared old glyph classes do not collapse these roles. One role may appear at many measured sizes; a role's source image size is chosen for adequate resolution after measurement, never invented as an original glyph dimension.

## EquipmentInstance

| Field                                     | Validation / preservation                                                                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `category`, `attribute`, `type`, `rarity` | Catalog/rule allowlists with valid category/type/attribute relationship                                                                                              |
| `lvl`, `tier`                             | Generated level 1–100, tier 1–10; supported older items without tier receive existing default 1                                                                      |
| `value`                                   | Finite nonnegative sale value; preserve generated numeric value                                                                                                      |
| `stats`                                   | Array of unique single-key objects with finite values; allowed generated keys `hp`, `atk`, `def`, `atkSpd`, `vamp`, `critRate`, `critDmg`; preserve order and values |

Decode inventory item strings individually for validation; canonical engine-facing representation remains `player.inventory.equipment: string[]` and `player.equipped: EquipmentInstance[]`. New metadata does not replace or reinterpret stat keys. Do not trust persisted `icon`, HTML, CSS classes, or image URLs. Derived presentation comes from the catalog.

## PlayerProgress

| Field group          | Existing fields and rules                                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity/progression | `name` (preserve player-authored string), `lvl`, `gold`, `playtime`, `kills`, `deaths`; finite domain-valid numbers, counters without new arbitrary gameplay maxima          |
| Current stats        | `stats`: `hp`, `hpMax`, `atk`, `def`, `pen`, `atkSpd`, `vamp`, `critRate`, `critDmg`, optional derived `hpPercent`; historical `pen: null` is legitimate                     |
| Stat inputs          | `baseStats`, `equippedStats`, `bonusStats`; known fields as in baseline, including equipped `hpPct`, `atkPct`, `defPct`, `penPct`; preserve numeric inputs and formula order |
| Experience           | `expCurr`, `expMax`, `expCurrLvl`, `expMaxLvl`, `lvlGained`, optional derived string `expPercent`                                                                            |
| Holdings             | `inventory.consumables` (currently empty), inventory equipment strings, equipped item objects (maximum six)                                                                  |
| Run state            | `inCombat`; historical optional `skills`, `blessing`, `allocated`, `tempStats: {atk, atkSpd}`                                                                                |

Unallocated early players and allocated running players are distinct supported shapes. Missing optional fields use the same established defaults as legacy initialization, without fabricating progression. Do not reject a legitimate null/derived percentage simply because a new schema assumes all stats are numbers. Gameplay calculations use numeric authoritative inputs, not stored percentage strings. Names accepted by a historical save are preserved as text rather than being rewritten to match the current character-creation input filter.

## DungeonProgress, EnemyState, AudioPreferences

- **DungeonProgress**: `rating`, `grade`; `progress: {floor,room,floorLimit,roomLimit}`; `settings: {enemyBaseLvl,enemyLvlGap,enemyBaseStats,enemyScaling}`; `status: {exploring,paused,event}`; `statistics: {kills,runtime}`; `backlog`; `action`; optional `enemyMultipliers`. Preserve counters and settings. No new room/floor/balance caps. On local entry, restore resting exploration (`exploring=false`, `paused=true`), then derive `event` from whether combat is resumed so exploration cannot overlap combat.
- **EnemyState**: legacy `name`, `type`, `lvl`; `stats` and `image`; `rewards: {exp,gold,drop}`. Idle placeholder nulls are valid when not in combat. An active local encounter requires a mapped name/image pair and valid numerical state. Character-only import validation does not require a companion enemy because confirmed import resets combat. `rewards.exp` can be fractional; `stats.hpPercent` may be number or derived string. Resume never regenerates this object.
- **AudioPreferences**: `master` and `sfx` range 0–1; `bgm` range 0–0.5, defaults 1/1/0.4 respectively. Preserve mute. Character import retains current preferences because legacy character exports do not include them.

Validate cross-record consistency after all records parse. Inactive terminal values are legitimate after victory/death and follow existing resting/reset behavior. Negative/terminal HP with an active-combat flag from an interrupted four-key write is a recoverable interrupted-state case; do not guess which rewards have already been applied. Provide raw recovery and an explicit retained-character recovery action without silently resetting a run.

## LocalSnapshot and CharacterExport

```text
LocalSnapshot = {
  format: 'malevolent-crawler-save', version: 1, contentVersion: 1,
  revision: positive safe integer, savedAt: ISO timestamp,
  state: { player: PlayerProgress, dungeon: DungeonProgress,
           enemy: EnemyState, volume: AudioPreferences }
}
CharacterExport = {
  format: 'malevolent-crawler-character', version: 1,
  player: PlayerProgress
}
```

Save metadata is operational only; it consumes no gameplay RNG. JSON round trips preserve all supported authoritative values. A save request inside a nested rule function is deferred until its enclosing gameplay transition finishes; default validation never writes. The persisted snapshot always represents the last completed outcome, not half-applied HP/rewards. `revision` is not a multiplayer or cross-tab compare-and-swap guarantee. Accept only supported `format`/`version`; absent version is legacy only when the complete old shape matches. Do not silently downgrade an unsupported canonical record to old keys.

Normal boundary resource budgets: at most 16 MiB encoded import text or local snapshot, 64 nested levels, and 64 KiB for one message/name field. These are parsing safeguards, not item or history caps. Detect limit violations before large allocation/recursive processing; preserve the original and report recovery instructions. Validate budgets against the captured legacy corpus before release and raise them if a supported genuine legacy fixture requires it; never truncate holdings or history to pass validation.

## MessageRecord and legacy history

`MessageRecord = {id, params}` selects a known template. Parameter schemas allow finite numbers, player text, and catalog IDs as appropriate; optional item details contain validated EquipmentInstance data. Rich display is composed from text and allowlisted symbol nodes. Event choices are separate current UI state, not executable log markup.

Recognized full legacy templates convert to message records, including reward panels. Unrecognized entries become `{id: 'history.unavailable', params: {recoveryRef}}`; original bytes remain in raw source/backup recovery data. This record is an actionable, neutral indication of recoverable history, never a successful migration claim for unknown content. Structured logs preserve sequence; displayed history still follows the existing last-50 behavior. Combat log/timer phase is not part of legacy persisted progress and is not invented during migration.

## ArtManifest and RenderContext

Manifest schema version 1 contains `baselineRevision`, `contentVersion`, `assets[]`, and `contexts[]`.

Each **ArtManifestEntry** has a unique `id`; kind/role/identity IDs; `legacySource` and aliases; `unusedButRequired`; `contextIds`; baseline hash/dimensions/alpha/ICO entries; delivered relative path/hash/dimensions/alpha/ICO entries; generation prompt path, master path/hash, timestamp, actual returned provenance; deterministic transform processor/version/fit/padding/options; visual-review status/reviewer/evidence/findings. Unknown tool metadata is null, never fabricated. Final delivered paths must resolve inside the repository's runtime asset roots.

Each **RenderContext** identifies role, fixture, selector, browser/OS/build, viewport, text scale, DPR, font readiness, and baseline/new box, spacing, line-height, vertical-align and measured baseline offset. Reference screenshots and numeric captures. `OPEN`, `PASS`, `FAIL`, `BLOCKED`, `N/A` are evidence statuses; N/A needs a reason. A manifest is complete only when every required file and context has the required evidence, not merely a nonempty path.

## State transitions and idempotence

1. **Startup**: uninitialized → reading → validated candidate → migrated/committed (or visible unsaved session) → ready; failure → recoverable error, never silent new character.
2. **Local continuation**: validated player/dungeon/enemy → restore paused exploration → resolve saved variant without RNG → resume combat with one new full attack delay per actor and one timer set, if active. No room advancement or reward replay.
3. **Import**: text → validated character candidate → confirmation → reset candidate once → persist candidate → replace runtime and return to allocation/title. Cancel/error preserves current state. Explicit session-only recovery is permitted after persistence failure with visible unsaved status.
4. **Combat end/reset/teardown**: invalidate combat generation token, cancel attack/UI timers, stop old audio/loops, remove owned listeners, then transition. Claim closes the result; rewards are not awarded again.
5. **Migration**: applying the same pure decoder/mapping twice yields equivalent authoritative state and presentation references. Repeated load of a committed v1 record never reapplies import reset or legacy rewards.
