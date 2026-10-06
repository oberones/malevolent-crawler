# Feature Specification: Lovecraftian Cosmic Horror Refactor

**Feature Branch**: `001-cosmic-horror-refactor`
**Feature Directory**: `specs/001-cosmic-horror-refactor`
**Created**: 2026-10-05
**Status**: Specification, implementation plan, and task backlog prepared; implementation and acceptance evidence OPEN
**Input**: User description: "Refactor the game setting, monsters, loot, and art to be set in a Lovecraftian cosmic horror universe. Generate all new art matching the dimensions of the existing art to minimize code changes."

## Clarifications

### Session 2026-10-05

- Q: What horror intensity should govern the new artwork and narrative text? → A: Grotesque cosmic horror: mutations, exposed anatomy, and restrained blood; no explicit mutilation or graphic gore.

## User Scenarios & Testing _(mandatory)_

Follow `.specify/memory/constitution.md`. New and changed behavior requires automated tests written and observed failing before implementation, followed by green and refactor steps. Characterize existing behavior before restructuring it. The plan selects test tools and levels; documentation-only work needs relevant validation. Function documentation and delivery gates remain mandatory under the constitution. Automated results do not replace manual browser and visual acceptance.

### User Story 1 - Enter a Coherent Cosmic Horror World (Priority: P1)

As a player, I want the title, exploration, events, combat narration, and rewards to describe a single Lovecraftian universe so that each run feels like an expedition into forbidden places inhabited by incomprehensible beings.

**Why this priority**: The setting connects the monsters, loot, and artwork; isolated renames would leave the experience inconsistent.

**Independent Test**: Start a new character and exercise each exploration event and run outcome. Review their text against the setting brief without requiring the entire replacement art collection to be integrated.

**Acceptance Scenarios**:

1. **Given** a first visit, **When** the player views the title and begins a run, **Then** the title, introductory text, and initial exploration establish the same cosmic horror setting and explain how to begin.
2. **Given** an active run, **When** the player encounters an ordinary enemy, treasure, a door, a blessing, a curse, an uneventful room, a guardian, or a special boss, **Then** the names, event descriptions, and outcomes follow the setting's terminology while choices still communicate their actual effects.
3. **Given** a run reaches combat victory, defeat, a level-up, a floor transition, or voluntary abandonment, **When** the outcome appears, **Then** its narration remains consistent with the new world and rewards, resets, and progression follow the existing rules.
4. **Given** the player visits inventory, menus, help or descriptive copy, and credits, **When** these surfaces describe the world or its content, **Then** they agree with the new setting; practical labels and retained third-party credits remain accurate.

---

### User Story 2 - Recognize Cosmic Horrors in Every Encounter (Priority: P1)

As a player, I want every existing monster and encounter variant to have a new cosmic horror identity and original artwork, while retaining readable combat information and the current variety of encounters.

**Why this priority**: Monsters are the main visual expression of the requested universe and must be replaced comprehensively.

**Independent Test**: Present every ordinary enemy, guardian, special boss, mimic, and alternate illustration in a controlled encounter review. Compare encounter roles and combat outcomes to the pre-refactor game separately from loot changes.

**Acceptance Scenarios**:

1. **Given** any existing encounter identity, **When** it is presented, **Then** its new name, original illustration, accessible description, and combat messages identify the same creature, and none refer to its former fantasy identity.
2. **Given** an encounter has alternative illustrations or belongs to multiple combat archetypes, **When** each variation is exercised, **Then** all variants remain available with consistent new identities and the existing selection rules.
3. **Given** ordinary, guardian, special-boss, chest-mimic, and door-mimic encounters, **When** equivalent pre-refactor and refactored runs use the same gameplay choices and random outcomes, **Then** enemy statistics, difficulty, rewards, and progression outcomes are unchanged.
4. **Given** a wide, tall, or large replacement creature, **When** it appears at its existing display size, **Then** its defining silhouette is visible, its artwork is undistorted, and it does not obscure health, combat messages, or controls.

---

### User Story 3 - Collect and Manage Forbidden Relics (Priority: P1)

As a player, I want equipment and treasure to feel like occult instruments, warding artifacts, and relics of an unknowable civilization, while still understanding their rarity, statistics, and use.

**Why this priority**: Loot drives repeat play and is explicitly part of the requested refactor.

**Independent Test**: Review items from all 14 existing equipment categories across all six rarity levels. Claim, inspect, equip, unequip, and sell representative items, including bulk sale and a full six-item equipment loadout.

**Acceptance Scenarios**:

1. **Given** any generated equipment category and rarity, **When** the player claims or inspects it, **Then** its new name and original icon match the setting while its level, tier, rarity, statistics, and sale value remain understandable.
2. **Given** an item appears in a reward, inventory list, equipment list, detail view, or sale interaction, **When** the player compares these appearances, **Then** the same item has a consistent identity and icon without clipped essential information.
3. **Given** a six-item loadout and items of different rarities, **When** the player equips, unequips, sells, or filters them, **Then** capacity, eligibility, stat changes, rarity ordering, generation probabilities, and sale proceeds match the existing rules.
4. **Given** death, abandonment, or a new run, **When** the established reset occurs, **Then** the same equipment and other persistent values survive as before, presented with the new theme.

---

### User Story 4 - See a Complete Replacement Art Collection That Fits (Priority: P1)

As a player, I want a cohesive set of newly generated illustrations and themed symbols that fits the existing game layout, so the visual transformation does not make the game harder to read or operate.

**Why this priority**: Complete new art and exact dimensional compatibility are explicit delivery requirements, not optional polish.

**Independent Test**: Review the complete art inventory against the recorded originals, then inspect each replacement at its actual display size and each supported viewport. This review can be completed independently of game-balance verification.

**Acceptance Scenarios**:

1. **Given** the baseline image inventory, **When** the final replacement files are inspected, **Then** all 53 monster images and both favicon files have new artwork with exactly the recorded width and height for each corresponding original, including each embedded icon size.
2. **Given** existing transparent creature art, **When** its replacement is viewed over the game background, **Then** it preserves a transparent backdrop and appropriate framing, without matte rectangles, unintended edge clipping, or stretching.
3. **Given** loot, title, event, currency, and stat symbols currently drawn as font icons, **When** their new art appears in each use context, **Then** it fits the recorded rendered width, height, and alignment of that context; a source-image dimension is not invented for a glyph.
4. **Given** the complete art collection, **When** it is reviewed together, **Then** the pieces share the art direction, distinct creature and item identities remain recognizable, and none are old illustrations reused, traced, or merely recolored.
5. **Given** an illustration cannot load, **When** its encounter or item is displayed, **Then** a readable identity and themed fallback preserve the layout and the player can complete the relevant action without a broken-image control or blocked journey.

---

### User Story 5 - Continue Existing Progress in the New Setting (Priority: P2)

As a returning player, I want my existing character and equipment to work after the theme changes, so I can continue playing without losing progress or seeing mixed old and new identities.

**Why this priority**: Compatibility protects existing players; its lower priority is sequencing, not permission to omit it from release.

**Independent Test**: Load representative pre-refactor saves at rest, during an encounter, and with equipment in inventory and equipped slots; separately import an old exported character and exercise invalid-data recovery.

**Acceptance Scenarios**:

1. **Given** valid pre-refactor saved state, **When** the player returns, **Then** the character, progression, equipment, currency, and preferences retain their values and applicable existing reset behavior, while system-owned names and artwork use the new theme.
2. **Given** saved state from an unfinished encounter, **When** play resumes, **Then** the corresponding new creature appears with the same remaining combat state and no duplicate rewards or forced run reset.
3. **Given** a valid old character export, **When** the player confirms import, **Then** the character and equipment are recognized and re-themed; import still follows its existing documented run-reset behavior rather than promising to restore an unexported encounter.
4. **Given** malformed, incomplete, unsupported, or unsafe imported or stored data, **When** loading is attempted, **Then** the player receives actionable feedback and recoverable existing data is not silently overwritten or discarded.
5. **Given** the browser denies saving, **When** the player attempts an affected journey, **Then** the failure is visible, the game does not falsely report persistence, and recoverable progress remains available for recovery where possible.

### Edge Cases

- The two illustrations for the existing Skeleton Mage each require a replacement; replacing one does not satisfy coverage.
- The currently unreferenced `spider_spirit.png` still belongs to the supplied monster-art collection and requires replacement; retaining it does not require introducing a new encounter.
- Each existing encounter-selection pool must remain populated after renaming, including creatures shared by multiple archetypes and both mimic triggers.
- Extreme aspect ratios, narrow favicons, transparent margins, and small loot icons must be reviewed at actual size; correct file dimensions alone do not establish visual suitability.
- Long creature and relic names must wrap or otherwise remain fully available without covering controls, prices, statistics, or rarity indicators on narrow screens and enlarged text.
- An existing save may contain old equipment categories, enemy names, image references, or system-authored log text. Recognized legacy content must display consistently with the new setting without changing player-authored names or gameplay values.
- At maximum equipment level/tier, a full loadout, or repeated equip/sell/claim actions, the refactor must not change limits, duplicate rewards, or lose items.
- Interrupted loading, missing art, corrupt saves, import cancellation, and unavailable storage require explicit recovery behavior rather than a blank or permanently blocked screen.
- The full changed journey must remain operable by keyboard and touch. Reduced-motion settings, muted audio, and color-vision differences must not hide essential information.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The feature MUST define and apply one setting brief and terminology guide covering the player role, expedition location, hostile entities, relics, and sources of danger. The default direction is an original Lovecraftian world of a decaying coastal settlement, submerged ruins, forbidden cults, and entities beyond human understanding.
- **FR-002**: All system-authored, player-facing setting text MUST be reviewed and re-themed across the title/browser title, character introduction, exploration events, combat, upgrades, loot, run outcomes, menus, and game description. Neutral functional vocabulary such as HP, Inventory, Equip, and Save may remain when it improves comprehension.
- **FR-003**: Every existing ordinary enemy, guardian, special boss, and mimic identity MUST have a documented cosmic horror replacement, including every alternate image. The replacement roster MUST preserve encounter coverage and distinct readable identities rather than collapse the roster into one generic creature.
- **FR-004**: Existing enemy archetypes, encounter eligibility and probabilities, combat rules, statistics, rewards, room/floor progression, level-up choices, and reset/retention rules MUST retain their gameplay meaning and numerical behavior. The theme MUST NOT introduce new sanity, investigation, combat, or progression systems.
- **FR-005**: All 14 equipment categories MUST receive themed names and original matching icon art. All six rarity levels, six-item capacity, equipment effects, generation rules, limits, filtering, and sale behavior MUST remain equivalent. Thematic rarity names, if used, MUST preserve a clearly communicated six-level ordering.
- **FR-006**: System-owned names and art MUST remain consistent across rewards, logs, combat, inventory, equipment, details, filters, and confirmations, including recognized legacy saved content. Player-authored names MUST be preserved.
- **FR-007**: The feature MUST generate a complete original art collection replacing all 53 supplied monster sprites, both favicons, and all game-themed title, loot, event, currency, and stat pictograms. Merely relabeling, tracing, recoloring, or retaining existing illustrations does not satisfy this requirement. Generic utility symbols such as close, menu, and volume controls, text fonts, and third-party service badges are outside the art replacement scope.
- **FR-008**: Every replacement raster image MUST have exactly the same intrinsic pixel width and height as its corresponding original; preserving only aspect ratio is insufficient. All original embedded favicon sizes MUST be retained. The baseline is recorded in [Art Inventory](art-inventory.md).
- **FR-009**: Replacement art MUST preserve the transparency, display footprint, alignment, and framing needed by its current use. Font-based themed symbols MUST be inventoried by rendered dimensions and alignment in every distinct display context before replacement, then match those footprints. No control or container resizing may be required solely to accommodate replacement art.
- **FR-010**: All new art MUST follow a shared direction: illustrated cosmic horror, aged stone and brine textures, occult markings, inhuman anatomy, and restrained abyssal, sea-green, and violet accents. Silhouette, value separation, and recognizable category cues MUST remain clear at actual display size; critical information cannot depend on darkness or color alone. Artwork and narrative text MUST use grotesque cosmic horror: mutations, exposed anatomy, and restrained blood are permitted; explicit mutilation and graphic gore are excluded.
- **FR-011**: Delivery MUST include an auditable art inventory linking every original image or themed symbol to its replacement, original and delivered dimensions, role, generation/source record, and visual acceptance result. Every required replacement MUST be present and referenced correctly; unused supplied monster art MUST also receive a replacement.
- **FR-012**: Valid pre-refactor local saves and character exports MUST remain usable without loss of retained character, equipment, currency, or preference values. Resumed encounters MUST present their mapped identity without restarting combat; imported character exports MUST preserve the existing import confirmation and run-reset semantics.
- **FR-013**: Unrecognized or invalid saved/imported content and persistence failures MUST produce actionable feedback, preserve recoverable data, and avoid silent destructive resets. Missing illustrations MUST have a themed, dimension-compatible fallback plus readable creature/item identity without preventing gameplay.
- **FR-014**: Changes MUST remain scoped to the requested content and presentation plus the compatibility, accessibility, and validation work needed to deliver them. Existing screen organization and art display sizes MUST be retained; new screens or a general interface redesign are not part of this feature.
- **FR-015**: The game's description and credits MUST accurately reflect the new setting, generated art, and retained third-party contributions. Historical source records and compatibility mappings may retain old names; visible game content may not rely on them as current world identities.

### Web Quality Requirements _(mandatory)_

- **QR-001 — Accessibility**: Changed UI MUST meet applicable WCAG 2.2 AA criteria. All affected actions must have meaningful labels, keyboard operation, visible focus, and perceivable outcome/error feedback. Informative art must have a meaningful text equivalent; decorative art must not create redundant announcements. Text, focus, and essential symbols must meet applicable contrast requirements; item rarity and danger cannot depend on color alone. Content must remain usable with enlarged text and reduced motion, and existing audio controls must remain available.
- **QR-002 — Compatibility**: Acceptance MUST cover desktop keyboard/pointer and mobile touch journeys in Chrome, Firefox, and Safari on supported platforms. Representative viewports MUST include 360 × 800, 768 × 1024, and 1440 × 900. No affected information or action may become inaccessible through clipping, overlap, or horizontal overflow. The plan records exact tested browser/OS versions and device combinations before implementation; unavailable required combinations remain blocked.
- **QR-003 — Data safety**: Existing saves and imports MUST follow FR-012 and FR-013. Changed data boundaries must reject invalid types, shapes, unsupported content, and unsafe values without executing or interpreting player-provided text as markup. Recovery must retain the last recoverable progress and explain corrective actions. The feature must not introduce transmission of save data or secrets as a condition of generating or displaying art.
- **QR-004 — Performance**: Under matched browser, device, network, and save conditions, the median time to the initial playable screen and to an encounter with its art ready MUST each be no more than the pre-refactor median plus the greater of 10% or 100 ms. Use at least five measurements per scenario; record cold-start and repeat-encounter results separately. Controls must remain usable while a slow image loads. The plan defines the repeatable workloads and measurement procedure before implementation.
- **QR-005 — Acceptance evidence**: Delivery MUST record automated outcomes separately from manual browser, keyboard/focus, and visual review. Evidence must cover new-character entry, every encounter identity/art variant, exploration event types, every equipment category and rarity, inventory operations, level-up, death/restart, saved-encounter resumption, old export import, and failure/recovery cases. Art review must verify exact dimensions and actual-size readability on the declared viewports. Unperformed required checks remain OPEN or BLOCKED, never passed by inference.

### Key Entities _(include if feature involves data)_

- **Setting Brief and Terminology Guide**: The world premise, player role, naming rules, recurring motifs, and consistent vocabulary used throughout the experience.
- **Encounter Identity**: A creature's legacy identity, new name, encounter tier/archetype eligibility, and one or more corresponding illustrations; its gameplay role remains stable.
- **Relic Identity**: A legacy equipment category mapped to its new name, icon, functional role, and unchanged rarity/stat/value semantics.
- **Art Inventory Entry**: The source visual, its replacement, purpose, original and delivered dimensions or rendered footprint, transparency/alignment needs, generation record, and acceptance evidence.
- **Player Progress**: Character and run state, equipment, currency, preferences, and ongoing encounter information; old representations remain recognizable and retain their established persistence behavior.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A complete review of the defined player-facing surfaces finds zero unmapped old setting, monster, or loot identities in system-authored current content, including resumed legacy content; neutral vocabulary, player-authored text, and accurate credits are excluded.
- **SC-002**: 100% of the 53 monster sprites and two favicon files contain new art with exact per-original dimensions, and 100% of inventoried themed pictogram uses have new art matching their prior rendered footprints. No required asset is missing or left as a placeholder.
- **SC-003**: Every encounter identity and alternate illustration, all 14 equipment categories, and all six rarity levels pass name/art consistency and actual-size readability review on the declared viewport sizes, with zero clipped defining silhouettes or obscured essential controls.
- **SC-004**: All equivalent gameplay comparisons preserve encounter rules, numerical combat and loot outcomes, progression, equipment capacity, and retention behavior. No required baseline-preservation scenario may fail.
- **SC-005**: Every supported legacy-save/export acceptance case restores the expected retained values and new presentation without data loss; every invalid-data case reports its failure without silently overwriting recoverable state.
- **SC-006**: All specified browser/input journeys complete with no inaccessible critical action, including manual keyboard/focus review. Required accessibility and art-review findings must be resolved before acceptance.
- **SC-007**: Both playable-entry and encounter-art timing meet QR-004 on the recorded workloads, with no layout changes needed solely to fit replacement artwork.
- **SC-008**: A complete manual review of all new artwork and system-authored narrative text records zero depictions or descriptions of explicit mutilation or graphic gore; mutations, exposed anatomy, and restrained blood are permitted under FR-010.

## Assumptions

- This is a content and art transformation of the existing repeatable dungeon-crawling loop. The player becomes an explorer of forbidden ruins; new narrative systems, authored quest campaigns, new equipment slots, and game-balance changes are outside scope.
- The default creative direction is original Lovecraftian cosmic horror rather than a recreation of a particular adaptation. Exact place, creature, and relic names will be developed together in the setting guide; changing that vocabulary must not change this feature's scope or mechanics.
- All required visuals will be newly generated during implementation. This specification and its inventory define coverage and acceptance; they are not a claim that art has already been produced or approved.
- Every shipped monster illustration is in scope, including an apparently unused sprite. Themed font pictograms count as game art even though no standalone source-image dimensions exist. Generic utility icons, typography files, external service badges, and existing music/sound effects are retained unless a narrow compatibility correction is necessary.
- Existing portrait/combat framing and screen organization remain the reference for minimal integration changes. Dimensional matching is required in addition to visual quality and transparent backgrounds; it is not satisfied by distorting artwork to fit.
- The existing game supports local persistence and player export/import. Local continuation and imported character restoration have different run semantics and must not be conflated.
- Dependencies are access to the original assets and existing gameplay baseline, a means to generate the required art, representative legacy saves/exports, and the browser/device coverage needed for acceptance. No runtime dependency on an art-generation service is required.
- The [implementation plan](plan.md), [quickstart](quickstart.md), and [task backlog](tasks.md) define the constitution-required validation setup and exact command contracts. Automated test/lint/format scripts remain implementation deliverables; foundation tasks must configure and verify them before application behavior changes. This specification introduces no build-system requirement; a production-build check applies only if one is configured.
