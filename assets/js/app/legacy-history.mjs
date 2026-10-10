import { readBoundedData } from "./save-validation.mjs";
import { validateMessage } from "./message-records.mjs";
import { messageSchemas } from "../content/messages.mjs";
import { getEncounter, getRelic, getRarity } from "../content/catalog.mjs";

const fixed = new Map([
  ["You found a door.", "event.door"],
  [
    '<span class="Heirloom">You found the door to the boss room.</span>',
    "event.guardianDoor",
  ],
  ["You moved to the next floor.", "event.floor"],
  ["You moved to the next room.", "event.room"],
  [
    'You found a treasure chamber. There is a <i class="fa fa-toolbox"></i>Chest inside.',
    "event.treasure",
  ],
  [
    'You moved to the next room and found a treasure chamber. There is a <i class="fa fa-toolbox"></i>Chest inside.',
    "event.treasureRoom",
  ],
  [
    '<span class="Heirloom">You found a mysterious chamber. It seems like there is something sleeping inside.</span>',
    "event.bossChamber",
  ],
  ["You managed to flee.", "event.fled"],
  ["You failed to escape!", "event.fleeFailed"],
  ["You ignored it and decided to move on.", "event.ignored"],
  ["You don't have enough gold.", "event.insufficient"],
  ["The chest is empty.", "event.emptyChest"],
  ["You explored and found nothing.", "event.nothing0"],
  ["You found an empty chest.", "event.nothing1"],
  ["You found a monster corpse.", "event.nothing2"],
  ["You found a corpse.", "event.nothing3"],
  ["There is nothing in this area.", "event.nothing4"],
]);
const icons = {
  Sword: "relic-blade",
  Axe: "axe",
  Hammer: "flat-hammer",
  Dagger: "bowie-knife",
  Flail: "chain",
  Scythe: "scythe",
  Plate: "vest",
  Chain: "vest",
  Leather: "vest",
  Tower: "shield",
  Kite: "heavy-shield",
  Buckler: "round-shield",
  "Great Helm": "knight-helmet",
  "Horned Helm": "helmet",
};
const buffs = {
  HP: ["hp", 10],
  ATK: ["atk", 8],
  DEF: ["def", 8],
  "ATK.SPD": ["atkSpd", 3],
  VAMP: ["vamp", 0.5],
  "C.RATE": ["critRate", 1],
  "C.DMG": ["critDmg", 6],
};
const coin = '<i class="fas fa-coins" style="color: #FFD700;"></i>';
const amount = "(?:0|[1-9]\\d*)(?:\\.\\d{1,2})?[kMBTPE]?";
// Escape only application-authored literal templates before exact full-string matching.
function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// Anchor both ends including the final newline; no partial or surrounding markup is accepted.
function match(source, pattern) {
  const result = new RegExp(`^(?:${pattern})$`, "u").exec(source);
  return result?.[0].length === source.length ? result : null;
}
// Only publish records accepted by the shared catalog schema.
function checked(id, params = {}) {
  return validateMessage({ id, params }, messageSchemas).record ?? null;
}
// A full reward panel contains displayed values, not an authoritative inventory item or sale price.
function reward(source) {
  const m = match(
    source,
    '\\s*You got <span class="([A-Za-z]+)">\\1 ([A-Za-z ]+)</span>\\.<br>\\s*<div class="primary-panel" style="padding: 0\\.5rem; margin-top: 0\\.5rem;">\\s*<h4 class="\\1"><b><i class="ra ra-([a-z-]+)"></i>\\1 \\2</b></h4>\\s*<h5 class="\\1"><b>Lv\\.(\\d+) Tier (\\d+)</b></h5>\\s*<ul>\\s*((?:<li>(?:HP|ATK|DEF|ATK\\.SPD|VAMP|C\\.RATE|C\\.DMG)\\+\\d+(?:\\.\\d+)?%?</li>)+)\\s*</ul>\\s*</div>',
  );
  if (!m) return null;
  const [, rarity, relic, icon, level, tier, list] = m;
  if (
    !getRarity(rarity).ok ||
    !getRelic(relic).ok ||
    icons[relic] !== icon ||
    +level < 1 ||
    +level > 100 ||
    +tier < 1 ||
    +tier > 10
  )
    return null;
  const stats = [],
    seen = new Set();
  for (const [, label, value, percent] of list.matchAll(
    /<li>([^+]+)\+(\d+(?:\.\d+)?)(%?)<\/li>/g,
  )) {
    if (
      seen.has(label) ||
      !Number.isFinite(+value) ||
      Boolean(percent) !== !["HP", "ATK", "DEF"].includes(label)
    )
      return null;
    seen.add(label);
    stats.push(`${label}+${value}${percent}`);
  }
  return checked("history.reward", {
    rarity,
    relic,
    level: +level,
    tier: +tier,
    stats: stats.join(", "),
  });
}
// Recognize complete frozen dungeon templates; never evaluate or strip arbitrary HTML.
function recognize(source) {
  if (fixed.has(source)) return checked(fixed.get(source));
  let m = match(source, "You encountered (.+)\\.");
  if (m && getEncounter(m[1]).ok)
    return checked("event.encounter", {
      encounter: getEncounter(m[1]).value.id,
    });
  m = match(source, "Dungeon Monarch (.+) has awoken\\.");
  if (m && getEncounter(m[1]).ok)
    return checked("event.boss", { encounter: getEncounter(m[1]).value.id });
  m = match(source, `You found ${escape(coin)}(${amount})\\.`);
  if (m) return checked("history.gold", { amount: m[1] });
  for (const [id, prefix, suffix] of [
    [
      "history.offering",
      '<span class="Legendary">You found a Statue of Blessing. Do you want to offer ',
      " to gain blessings? (Blessing Lv.",
    ],
    [
      "history.blackSounding",
      '<span class="Heirloom">You found a Cursed Totem. Do you want to offer ',
      "? This will strengthen the monsters but will also improve the loot quality. (Curse Lv.",
    ],
  ]) {
    m = match(
      source,
      `${escape(prefix + coin + '<span class="Common">')}(${amount})${escape("</span>" + suffix)}([1-9]\\d*)${escape(")</span>")}`,
    );
    if (m) return checked(id, { cost: m[1], level: +m[2] });
  }
  m = match(
    source,
    "The monsters in the dungeon became stronger and the loot quality improved\\. \\(Curse Lv\\.([1-9]\\d*) > Curse Lv\\.([1-9]\\d*)\\)",
  );
  if (m && +m[2] === +m[1] + 1)
    return checked("event.curseGain", { before: +m[1], after: +m[2] });
  m = match(
    source,
    "You gained (\\d+(?:\\.\\d+)?)% bonus (HP|ATK|DEF|ATK\\.SPD|VAMP|C\\.RATE|C\\.DMG) from the blessing\\. \\(Blessing Lv\\.([1-9]\\d*) > Blessing Lv\\.([1-9]\\d*)\\)",
  );
  if (m && +m[1] === buffs[m[2]][1] && +m[4] === +m[3] + 1)
    return checked(`event.blessing.${buffs[m[2]][0]}`, {
      before: +m[3],
      after: +m[4],
    });
  return reward(source);
}
/** Convert complete legacy dungeon history to typed records without parsing HTML or changing holdings.
 * Rounded historical amounts remain text: missing precision and item sale values are never invented.
 * @param {unknown} backlog Bounded saved strings/records, with sequence and duplicates preserved.
 * @param {object} [options] Stable source prefix for raw recovery references.
 * @returns {{records:Array,recovery:object}} All records (no last-50 truncation) and original changed entries.
 * @throws {Error} Invalid collection, unsafe JSON or resource-budget violation.
 */
export function migrateLegacyMessages(backlog, { source = "legacy" } = {}) {
  const input = readBoundedData(backlog);
  if (!Array.isArray(input) || !["legacy", "canonical"].includes(source))
    throw new TypeError("Invalid history source");
  const recovery = {};
  const records = input.map(
    // Existing valid typed records are idempotent, including names containing old terms or markup.
    (entry, index) => {
      if (typeof entry !== "string") {
        const valid = validateMessage(entry, messageSchemas);
        if (valid.ok) return valid.record;
      }
      const recoveryRef = `${source}:dungeon.backlog:${index}`;
      recovery[recoveryRef] = entry;
      return (
        (typeof entry === "string" ? recognize(entry) : null) ?? {
          id: "history.unavailable",
          params: { recoveryRef },
        }
      );
    },
  );
  return { records, recovery };
}
