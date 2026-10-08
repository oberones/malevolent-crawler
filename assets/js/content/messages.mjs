import { freezeContent } from "./immutable.mjs";
import { setting } from "./setting.mjs";
import { getEncounter, getRelic, getSymbol } from "./catalog.mjs";
import { validateMessage } from "../app/message-records.mjs";

// Keep authored copy and exact parameter contracts together; interpolation is text-only.
function define(text, schema = {}) {
  return { text, schema };
}
const definitions = {
  "entry.title": define(setting.title),
  "entry.introduction": define(
    `${setting.premise} You are ${setting.playerRole.charAt(0).toLowerCase()}${setting.playerRole.slice(1)}`,
  ),
  "entry.name": define("What is your name, relic seeker?"),
  "entry.nameInvalid": define(
    "Use 3–15 characters without special punctuation.",
  ),
  "entry.begin": define("Begin the descent"),
  "entry.allocation": define("Prepare for Descent"),
  "entry.allocationHelp": define(
    "Distribute 20 stat points and choose one passive skill before descending into the Drowned Observatory.",
  ),
  "entry.points": define("Stat Points: {remaining}", { remaining: "number" }),
  "entry.passive": define("Passive"),
  // Historical formatted amounts retain their original precision; reward panels do not invent sale values.
  "history.gold": define("You recover {amount} Quay Marks.", {
    amount: "text",
  }),
  "history.offering": define(
    "A Tide Offering vessel waits. Offer {cost} Quay Marks for a random permanent bonus this run? Tide Offering {level}.",
    { cost: "text", level: "number" },
  ),
  "history.blackSounding": define(
    "A Deepening Curse ring stirs. Offer {cost} Quay Marks? Enemies become stronger and loot quality improves. Deepening Curse {level}.",
    { cost: "text", level: "number" },
  ),
  "history.reward": define(
    "Recovered Relic: {rarity} {relic} — Level {level}, Tier {tier}; {stats}",
    {
      rarity: "rarity",
      relic: "relic",
      level: "number",
      tier: "number",
      stats: "text",
    },
  ),
  "event.door": define("A tide-marked door opens onto another chamber."),
  "event.guardianDoor": define(
    "Beyond this door, a Threshold Keeper bars the next descent.",
  ),
  "event.treasure": define("A salvage coffer rests in a salt-lined chamber."),
  "event.treasureRoom": define(
    "You enter the next chamber and find a salvage coffer.",
  ),
  "event.emptyChest": define("The salvage coffer holds only salt."),
  "event.encounter": define("Your presence draws {encounter} from the dark.", {
    encounter: "encounter",
  }),
  "event.guardian": define("Threshold Keeper {encounter} bars your descent.", {
    encounter: "encounter",
  }),
  "event.bossChamber": define(
    "A sealed observatory chamber trembles. A Deep Presence sleeps inside.",
  ),
  "event.boss": define("Deep Presence {encounter} has awoken.", {
    encounter: "encounter",
  }),
  "event.fled": define("You follow the guide rope back and escape."),
  "event.fleeFailed": define("The guide rope draws taut. You fail to escape!"),
  "event.ignored": define("You leave it undisturbed and continue exploring."),
  "event.room": define("You follow the tide marks into the next chamber."),
  "event.floor": define("You descend deeper into the observatory."),
  "event.gold": define("You recover {amount} Quay Marks.", {
    amount: "number",
  }),
  "event.offering": define(
    "A Tide Offering vessel waits. Offer {cost} Quay Marks for a random permanent bonus this run? Tide Offering {level}.",
    { cost: "number", level: "number" },
  ),
  "event.blackSounding": define(
    "A Deepening Curse ring stirs. Offer {cost} Quay Marks? Enemies become stronger and loot quality improves. Deepening Curse {level}.",
    { cost: "number", level: "number" },
  ),
  "event.insufficient": define("You do not have enough Quay Marks."),
  "event.curseGain": define(
    "The Deepening Curse strengthens enemies and improves loot quality. Deepening Curse {before} → {after}.",
    { before: "number", after: "number" },
  ),
  "event.nothing0": define("Your search reveals nothing but wet slate."),
  "event.nothing1": define(
    "An empty salvage coffer rocks with a tide you cannot feel.",
  ),
  "event.nothing2": define(
    "A still, unfamiliar shape lies beneath a line of dried tide foam.",
  ),
  "event.nothing3": define(
    "A quay worker lies motionless beside an unlit lantern.",
  ),
  "event.nothing4": define("Only silence answers you in this chamber."),
  "choice.enter": define("Enter"),
  "choice.ignore": define("Ignore"),
  "choice.open": define("Open the coffer"),
  "choice.engage": define("Engage"),
  "choice.flee": define("Flee"),
  "choice.offer": define("Offer"),
  "combat.playerHit": define("{player} dealt {damage} damage to {encounter}.", {
    player: "text",
    damage: "number",
    encounter: "encounter",
  }),
  "combat.playerCritical": define(
    "{player} dealt {damage} critical damage to {encounter}.",
    { player: "text", damage: "number", encounter: "encounter" },
  ),
  "combat.enemyHit": define("{encounter} dealt {damage} damage to {player}.", {
    encounter: "encounter",
    damage: "number",
    player: "text",
  }),
  "combat.enemyCritical": define(
    "{encounter} dealt {damage} critical damage to {player}.",
    { encounter: "encounter", damage: "number", player: "text" },
  ),
  "combat.victory": define(
    "{encounter} falls silent. Encounter time: {duration}.",
    { encounter: "encounter", duration: "text" },
  ),
  "combat.experience": define("You earned {amount} EXP.", { amount: "number" }),
  "combat.gold": define("{encounter} leaves {amount} Quay Marks.", {
    encounter: "encounter",
    amount: "number",
  }),
  "combat.defeat": define(
    "Your descent ends here. You died. Return to the quay to prepare another descent.",
  ),
  "combat.claim": define("Claim"),
  "combat.return": define("Back to Menu"),
  "upgrade.title": define("Attunement Increased"),
  "upgrade.gained": define(
    "The bell sounds within you. Attunement {before} → {after}.",
    { before: "number", after: "number" },
  ),
  "upgrade.remaining": define("Remaining: {count}", { count: "number" }),
  "upgrade.reroll": define("Reroll {remaining}/2", { remaining: "number" }),
  "run.abandon": define("Abandon this descent"),
  "run.abandonConfirm": define("Abandon this descent and return to Veyr Quay?"),
  "run.restart": define("Prepare another descent"),
  "run.resetConsequences": define(
    "Attunement, Tide Offerings, EXP, bonus stats, skills, allocation and observatory progress reset. Your name, recovered relics, inventory, Quay Marks and lifetime statistics remain. Audio settings stay unchanged.",
  ),
  "run.resting": define("Resting..."),
  "run.exploring": define("Exploring..."),
  "run.floor": define("Descent {number}", { number: "number" }),
  "run.room": define("Chamber {number}", { number: "number" }),
  "inventory.title": define("Inventory — Recovered Relics"),
  "inventory.empty": define("No recovered relics in your inventory."),
  "inventory.full": define(
    "All six equipment slots are occupied. Unequip a relic before equipping another.",
  ),
  "inventory.equipment": define("Equipped Relics"),
  "inventory.item": define("{rarity} {relic} — Level {level}, Tier {tier}", {
    rarity: "rarity",
    relic: "relic",
    level: "number",
    tier: "number",
  }),
  "inventory.sell": define("Sell {relic} for {amount} Quay Marks?", {
    relic: "relic",
    amount: "number",
  }),
  "inventory.sellAll": define(
    "Sell all {rarity} inventory relics for {amount} Quay Marks?",
    { rarity: "rarity", amount: "number" },
  ),
  "inventory.unequipAll": define("Unequip all your recovered relics?"),
  "inventory.sale": define("You sold {relic} for {amount} Quay Marks.", {
    relic: "relic",
    amount: "number",
  }),
  "inventory.reward": define("Recovered Relic: {item}", { item: "item" }),
  "inventory.sellEverything": define(
    "Sell all inventory relics for {amount} Quay Marks?",
    { amount: "number" },
  ),
  "menu.title": define("Expedition Journal"),
  "menu.statistics": define("Statistics"),
  "menu.run": define("Current Descent"),
  "menu.settings": define("Settings"),
  "menu.export": define("Export Character"),
  "menu.import": define("Import Character"),
  "menu.save": define("Save"),
  "menu.close": define("Close"),
  "menu.cancel": define("Cancel"),
  "help.title": define("Relic Seeker’s Field Notes"),
  "help.exploration": define(
    "Explore the Drowned Observatory chamber by chamber. Pause to rest. Doors, salvage coffers and offerings present choices; you may ignore them. Threshold Keepers guard deeper descents.",
  ),
  "help.combat": define(
    "Combat attacks are automatic. HP measures survival; ATK and DEF affect damage. ATK.SPD is attacks per second. VAMP restores a percentage of damage dealt; C.RATE is critical chance and C.DMG is bonus critical damage. Fleeing can fail. Claim closes an encounter whose rewards have already been granted.",
  ),
  "help.progression": define(
    "Each Attunement upgrade offers three bonus-stat choices and two rerolls. An upgrade restores 20% of maximum HP. Tide Offerings grant a random bonus for Quay Marks. Deepening Curses strengthen enemies and improve loot quality.",
  ),
  "help.relics": define(
    "Equip up to six recovered relics. Common, Uncommon, Rare, Epic, Legendary and Heirloom rarities retain their stat and sale rules. Selling removes inventory items for Quay Marks; equipped relics remain separate.",
  ),
  "help.saves": define(
    "Local continuation keeps your current descent and encounter. Importing a character replaces the current character and resets run progression after confirmation. Export before replacing a character. An unsaved warning means progress is only in this session; do not close it before recovery.",
  ),
  "about.description": define(
    "Descend beneath Veyr Quay into a drowned observatory. Chart impossible chambers, face listening presences and recover relics that outlast each descent.",
  ),
  "about.credits": define(
    "Historical baseline monster sprites: Aekashics. RPG sound effects: Leohpaz. Level-up sound: phoenix1291. Battle music: Leviathan_Music. Dungeon music: Sara Garrard. Audio library: Howler 2.2.3. Existing font and library attributions remain in their distributed files.",
  ),
  "about.art": define(
    "Original cosmic-horror setting with generated artwork for Quay Scavenger, Needlecast Lookout, Brine Whisperer, Crevice Pilferer, The Dredge Foreman, Surf Stalker, Tarwake Stalker, Rimewake Stalker, The Hush at the Jetty, Tidepool Memory, Halo Medusa, Processional Ooze, Shellbound Bloom, The Reservoir Heart, Breakwater Harpooner, Keelbreaker, Stormsilt Cantor, Tideglass Duelist, Threadpool Creeper, Rustvein Spinner, Verdigris Spinner, Emberreef Weaver, The Tidewheel Weaver, Ossuary Signalman, Reliquary Warden, Splinterblade Usher, Pierbound Husk, both Sounding Vessel variants, Wreck Tallyman, Lowtide Executioner, The Choir in the Wall, The Lantern Without Flame, The Brood Bell, The Salt Regent, The Threefold Watch, Cinderwake Prowler, The Unmoored Magistrate, The Anchor Votary, The Spiral Breaker, The Lockgate Carapace, The Continental Sleeper, The Red Undertow, The Eclipse Ferryman, The Kiln Below, The Stillwater Veil, The Cathedral Remnant, The Final Descent, The Sovereign Below Sound, The Horizon Stitcher, Coffer of Listening Teeth, Threshold That Breathes and the unused Unrung Witness. All 53 creature portraits, 24 relic and symbol roles, both favicons and the shared missing-art fallback are delivered. Artwork was generated with ImageGen; prompts, masters and preparation records are retained in the project. Original contributions retain their credits.",
  ),
};

export const skills = freezeContent({
  "Remnant Razor": {
    name: "Nacre Edge",
    description: "Attacks deal an extra 8% of the enemy’s current HP on hit.",
  },
  "Titan's Will": {
    name: "Breakwater Resolve",
    description: "Attacks deal an extra 5% of your maximum HP on hit.",
  },
  Devastator: {
    name: "Undertow Force",
    description: "Deal 30% more damage but lose 30% base attack speed.",
  },
  Rampager: {
    name: "Gathering Tide",
    description:
      "Increase base attack by 5 after each hit. The bonus resets after battle.",
  },
  "Blade Dance": {
    name: "Quickening Current",
    description:
      "Increase base attack speed by 0.01 after each hit. The bonus resets after battle.",
  },
  "Paladin's Heart": {
    name: "Harbor Heart",
    description:
      "Receive 25% less damage permanently while this skill is active.",
  },
  "Aegis Thorns": {
    name: "Barnacle Reprisal",
    description: "Enemies receive 15% of the damage they dealt.",
  },
});
for (const [stat, [label, amount]] of Object.entries({
  hp: ["HP", 10],
  atk: ["ATK", 8],
  def: ["DEF", 8],
  atkSpd: ["ATK.SPD", 3],
  vamp: ["VAMP", 0.5],
  critRate: ["C.RATE", 1],
  critDmg: ["C.DMG", 6],
})) {
  definitions[`upgrade.${stat}`] = define(
    `Increase bonus ${label} by ${amount}%.`,
  );
  definitions[`event.blessing.${stat}`] = define(
    `The Tide Offering grants ${amount}% bonus ${label}. Tide Offering {before} → {after}.`,
    { before: "number", after: "number" },
  );
}
export const messageDefinitions = freezeContent(definitions);
export const messageSchemas = freezeContent(
  Object.fromEntries(
    Object.entries(definitions).map(
      // Publish the same exact schemas to the shared safe renderer and history mapper.
      ([id, row]) => [id, row.schema],
    ),
  ),
);
// Validated identity values resolve through allowlists; arbitrary strings stay inert text.
function display(value, type) {
  if (type === "encounter") return getEncounter(value).value.displayName;
  if (type === "relic") return getRelic(value).value.displayName;
  if (type === "symbol") return getSymbol(value).value.accessibleLabel;
  if (type === "item") {
    const relic = getRelic(value.category).value;
    return `${value.rarity} ${relic.displayName} — Level ${value.lvl}, Tier ${value.tier ?? 1}; value ${value.value} Quay Marks`;
  }
  return String(value);
}
/**
 * Format an exact typed record as inert text, resolving only catalog-owned identities.
 * No RNG, DOM, storage, escaping or gameplay mutation occurs here.
 * @param {unknown} input MessageRecord {id,params}; player text is preserved verbatim.
 * @returns {string} Plain text, never HTML. Consumers must use text nodes.
 * @throws {TypeError} Unknown IDs or invalid/missing/extra parameters.
 */
export function messageText(input) {
  const checked = validateMessage(input, messageSchemas);
  if (!checked.ok || !Object.hasOwn(messageDefinitions, checked.record.id))
    throw new TypeError("Invalid narrative message");
  const { id, params } = checked.record;
  const row = messageDefinitions[id];
  return row.text.replace(
    /\{(\w+)\}/g,
    // Replacement functions preserve literal dollar signs and braces in player-authored text.
    (_, key) => display(params[key], row.schema[key]),
  );
}
export const messageTemplates = Object.freeze(
  Object.fromEntries(
    Object.keys(definitions).map(
      // Templates validate even when invoked directly rather than through createSafeRenderer.
      (id) => [
        id,
        /** Return a detached text descriptor; invalid parameters throw TypeError. */
        (params) => [{ kind: "text", text: messageText({ id, params }) }],
      ],
    ),
  ),
);
