import {
  resolveEncounter,
  resolveRelic,
  getRarity,
} from "../content/catalog.mjs";

export const SAVE_LIMITS = Object.freeze({
  bytes: 16 * 1024 * 1024,
  depth: 64,
  fieldBytes: 64 * 1024,
});
const statKeys = ["hp", "atk", "def", "atkSpd", "vamp", "critRate", "critDmg"];
const skills = [
  "Remnant Razor",
  "Titan's Will",
  "Devastator",
  "Rampager",
  "Blade Dance",
  "Paladin's Heart",
  "Aegis Thorns",
];
// Internal failures carry field paths, never raw player content.
function fail(path, code = "invalid-field") {
  throw Object.assign(new Error(code), { code, path });
}
// Count UTF-8 without allocating an equally large byte buffer.
function bytes(text, limit, path, code) {
  let count = 0;
  for (const ch of text) {
    const n = ch.codePointAt(0);
    count += n < 128 ? 1 : n < 2048 ? 2 : n < 65536 ? 3 : 4;
    if (count > limit) fail(path, code);
  }
  return count;
}
// Inspect nesting outside quoted JSON before the parser allocates a deep graph.
function parse(text, path) {
  bytes(text, SAVE_LIMITS.bytes, path, "size-limit");
  let depth = 0,
    quoted = false,
    escaped = false;
  for (const ch of text) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') quoted = false;
    } else if (ch === '"') quoted = true;
    else if (ch === "{" || ch === "[") {
      if (++depth > SAVE_LIMITS.depth) fail(path, "depth-limit");
    } else if (ch === "}" || ch === "]") depth--;
  }
  try {
    return JSON.parse(text);
  } catch {
    fail(path, "invalid-json");
  }
}
// Count JSON string escapes exactly without creating an escaped copy first.
function stringSize(value, path) {
  let size = bytes(value, SAVE_LIMITS.fieldBytes, path, "field-limit") + 2;
  for (const ch of value) {
    const point = ch.codePointAt(0);
    if (
      ch === '"' ||
      ch === "\\" ||
      ["\b", "\f", "\n", "\r", "\t"].includes(ch)
    )
      size++;
    else if (point < 32) size += 5;
    else if (point >= 0xd800 && point <= 0xdfff) size += 3;
  }
  return size;
}
// Reject accessors/exotic prototypes/cycles before serialization can invoke them.
function inspect(value, path, depth, active, budget) {
  if (depth > SAVE_LIMITS.depth) fail(path, "depth-limit");
  if (typeof value === "string") budget.bytes += stringSize(value, path);
  else if (typeof value === "number") {
    if (!Number.isFinite(value)) fail(path);
    budget.bytes += String(value).length;
  } else if (value === null || typeof value === "boolean")
    budget.bytes += String(value).length;
  else if (typeof value === "object") {
    if (active.has(value)) fail(path, "cyclic-input");
    const isArray = Array.isArray(value);
    if (
      !isArray &&
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))
    )
      fail(path, "unsafe-object");
    if (isArray && value.length > SAVE_LIMITS.bytes / 2)
      fail(path, "size-limit");
    active.add(value);
    budget.bytes += 2;
    let count = 0;
    for (const key of Reflect.ownKeys(value)) {
      if (isArray && key === "length") continue;
      if (
        typeof key !== "string" ||
        ["__proto__", "constructor", "prototype"].includes(key)
      )
        fail(path, "unsafe-key");
      if (
        isArray &&
        (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length)
      )
        fail(path, "unsafe-key");
      const property = Object.getOwnPropertyDescriptor(value, key);
      if (!property.enumerable || !Object.hasOwn(property, "value"))
        fail(path, "unsafe-object");
      if (count++) budget.bytes++;
      if (!isArray) budget.bytes += stringSize(key, path) + 1;
      inspect(property.value, `${path}.${key}`, depth + 1, active, budget);
    }
    if (isArray && count !== value.length) fail(path, "sparse-array");
    active.delete(value);
  } else fail(path, "non-json-value");
  if (budget.bytes > SAVE_LIMITS.bytes) fail(path, "size-limit");
}
/**
 * Parse/clone bounded JSON without evaluating data or invoking object accessors.
 * @param {unknown} input JSON text or plain JSON value.
 * @returns {unknown} Detached data.
 * @throws {Error} Typed code/path for invalid JSON or resource/prototype violations.
 */
export function readBoundedData(input) {
  const value = typeof input === "string" ? parse(input, "input") : input;
  inspect(value, "input", 0, new Set(), { bytes: 0 });
  return JSON.parse(JSON.stringify(value));
}
// Require records and known keys so unknown executable references never escape.
function record(value, path, allowed) {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    fail(path);
  if (allowed)
    for (const key of Object.keys(value))
      if (!allowed.includes(key)) fail(`${path}.${key}`, "unknown-field");
  return value;
}
// Preserve authoritative numbers with explicit domain constraints rather than coercion.
function number(value, path, min = 0, max = Infinity, integer = false) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isInteger(value))
  )
    fail(path);
}
// User text stays text; byte budgets are safeguards, not character-creation rules.
function text(value, path) {
  if (typeof value !== "string") fail(path);
  bytes(value, SAVE_LIMITS.fieldBytes, path, "field-limit");
}
// Boolean state flags must not acquire truthiness from strings or objects.
function boolean(value, path) {
  if (typeof value !== "boolean") fail(path);
}
// Arrays retain ordering and multiplicity, with only established game constraints.
function array(value, path) {
  if (!Array.isArray(value)) fail(path);
}
// Percentage strings are derived legacy output, not CSS or authoritative input.
function percent(value, path) {
  if (typeof value === "string") {
    if (!/^-?\d+(?:\.\d+)?$/.test(value)) fail(path);
  } else number(value, path, -Infinity);
}
// Validate a known stat bag without changing formula inputs or property order.
function stats(value, path, keys, optional = []) {
  record(value, path, [...keys, ...optional]);
  for (const key of keys)
    number(value[key], `${path}.${key}`, key === "hp" ? -Infinity : 0);
  for (const key of optional)
    if (Object.hasOwn(value, key)) {
      if (key === "hpPercent") percent(value[key], `${path}.${key}`);
      else if (key === "pen" && value[key] === null) continue;
      else number(value[key], `${path}.${key}`);
    }
}
// Validate item semantics and add only the historical missing-tier default.
function item(value, path) {
  record(value, path, [
    "category",
    "attribute",
    "type",
    "rarity",
    "lvl",
    "tier",
    "value",
    "stats",
  ]);
  const relic = resolveRelic(value.category, value.attribute, value.type);
  if (
    !relic.ok ||
    relic.value.legacyCategory !== value.category ||
    !getRarity(value.rarity).ok
  )
    fail(path, "unknown-reference");
  number(value.lvl, `${path}.lvl`, 1, 100, true);
  if (!Object.hasOwn(value, "tier")) value.tier = 1;
  number(value.tier, `${path}.tier`, 1, 10, true);
  number(value.value, `${path}.value`);
  array(value.stats, `${path}.stats`);
  const seen = new Set();
  for (const stat of value.stats) {
    record(stat, `${path}.stats`, statKeys);
    const keys = Object.keys(stat);
    if (keys.length !== 1 || seen.has(keys[0])) fail(`${path}.stats`);
    seen.add(keys[0]);
    number(stat[keys[0]], `${path}.stats.${keys[0]}`);
  }
  return value;
}
/**
 * Validate an equipment instance for safe message/item consumers.
 * @param {unknown} input Plain item data.
 * @returns {{ok:boolean,candidate?:object,issues?:object[]}} Detached item or diagnostics.
 */
export function validateEquipment(input) {
  try {
    return { ok: true, candidate: item(readBoundedData(input), "item") };
  } catch (error) {
    return rejected(error);
  }
}
// Retain baseline player shape and derive optional defaults without writing saves.
function player(value) {
  const path = "player";
  record(value, path, [
    "name",
    "lvl",
    "stats",
    "baseStats",
    "equippedStats",
    "bonusStats",
    "exp",
    "inventory",
    "equipped",
    "gold",
    "playtime",
    "kills",
    "deaths",
    "inCombat",
    "skills",
    "blessing",
    "allocated",
    "tempStats",
  ]);
  text(value.name, "player.name");
  number(value.lvl, "player.lvl", 1, Infinity, true);
  for (const key of ["gold", "playtime", "kills", "deaths"])
    number(
      value[key],
      `player.${key}`,
      0,
      Infinity,
      key === "kills" || key === "deaths",
    );
  stats(
    value.stats,
    "player.stats",
    [...statKeys, "hpMax"],
    ["pen", "hpPercent"],
  );
  number(value.stats.hpMax, "player.stats.hpMax", Number.MIN_VALUE);
  stats(value.baseStats, "player.baseStats", [...statKeys, "pen"]);
  value.equippedStats = record(value.equippedStats, "player.equippedStats");
  for (const key of ["pen", "hpPct", "atkPct", "defPct", "penPct"])
    if (!Object.hasOwn(value.equippedStats, key)) value.equippedStats[key] = 0;
  stats(value.equippedStats, "player.equippedStats", [
    ...statKeys,
    "pen",
    "hpPct",
    "atkPct",
    "defPct",
    "penPct",
  ]);
  stats(value.bonusStats, "player.bonusStats", statKeys);
  record(value.exp, "player.exp", [
    "expCurr",
    "expMax",
    "expCurrLvl",
    "expMaxLvl",
    "lvlGained",
    "expPercent",
  ]);
  for (const key of [
    "expCurr",
    "expMax",
    "expCurrLvl",
    "expMaxLvl",
    "lvlGained",
  ])
    number(
      value.exp[key],
      `player.exp.${key}`,
      0,
      Infinity,
      key === "lvlGained",
    );
  if (Object.hasOwn(value.exp, "expPercent"))
    percent(value.exp.expPercent, "player.exp.expPercent");
  record(value.inventory, "player.inventory", ["consumables", "equipment"]);
  array(value.inventory.consumables, "player.inventory.consumables");
  if (value.inventory.consumables.length) fail("player.inventory.consumables");
  array(value.inventory.equipment, "player.inventory.equipment");
  value.inventory.equipment = value.inventory.equipment.map(
    // Decode every holding separately; identical encoded items remain separate.
    (encoded, i) => {
      if (typeof encoded !== "string") fail(`player.inventory.equipment.${i}`);
      const decoded = readBoundedData(encoded);
      const missing = !Object.hasOwn(decoded ?? {}, "tier");
      const checked = item(decoded, `player.inventory.equipment.${i}`);
      return missing ? JSON.stringify(checked) : encoded;
    },
  );
  array(value.equipped, "player.equipped");
  if (value.equipped.length > 6) fail("player.equipped");
  value.equipped.forEach(
    // Validate each equipped instance without deduplication or rerolling.
    (entry, i) => item(entry, `player.equipped.${i}`),
  );
  boolean(value.inCombat, "player.inCombat");
  if (Object.hasOwn(value, "allocated"))
    boolean(value.allocated, "player.allocated");
  if (!Object.hasOwn(value, "skills")) value.skills = [];
  array(value.skills, "player.skills");
  for (const skill of value.skills)
    if (!skills.includes(skill)) fail("player.skills", "unknown-reference");
  if (!Object.hasOwn(value, "blessing")) value.blessing = 1;
  number(value.blessing, "player.blessing", 1, Infinity, true);
  if (!Object.hasOwn(value, "tempStats"))
    value.tempStats = { atk: 0, atkSpd: 0 };
  stats(value.tempStats, "player.tempStats", ["atk", "atkSpd"]);
  return value;
}
/**
 * Return fresh legacy initial run/preferences matching the captured early fixture.
 * @returns {object} Detached dungeon, idle enemy and volume defaults; no player created.
 */
export function initialStateSections() {
  return {
    dungeon: {
      rating: 500,
      grade: "E",
      progress: { floor: 1, room: 1, floorLimit: 100, roomLimit: 5 },
      settings: {
        enemyBaseLvl: 1,
        enemyLvlGap: 5,
        enemyBaseStats: 1,
        enemyScaling: 1.1,
      },
      status: { exploring: false, paused: true, event: false },
      statistics: { kills: 0, runtime: 0 },
      backlog: [],
      action: 0,
    },
    enemy: {
      name: null,
      type: null,
      lvl: null,
      stats: {
        hp: null,
        hpMax: null,
        atk: 0,
        def: 0,
        atkSpd: 0,
        vamp: 0,
        critRate: 0,
        critDmg: 0,
      },
      image: { name: null, type: null, size: null },
      rewards: { exp: null, gold: null, drop: null },
    },
    volume: { master: 1, bgm: 0.4, sfx: 1 },
  };
}
// Validate the tuple's settings, progress and raw history; migration owns log conversion.
function dungeon(value) {
  record(value, "dungeon", [
    "rating",
    "grade",
    "progress",
    "settings",
    "status",
    "statistics",
    "backlog",
    "action",
    "enemyMultipliers",
  ]);
  number(value.rating, "dungeon.rating");
  if (!["E", "D", "C", "B", "A", "S", "SS", "SSS"].includes(value.grade))
    fail("dungeon.grade");
  for (const [section, keys] of [
    ["progress", ["floor", "room", "floorLimit", "roomLimit"]],
    [
      "settings",
      ["enemyBaseLvl", "enemyLvlGap", "enemyBaseStats", "enemyScaling"],
    ],
  ]) {
    record(value[section], `dungeon.${section}`, keys);
    for (const key of keys)
      number(
        value[section][key],
        `dungeon.${section}.${key}`,
        Number.MIN_VALUE,
        Infinity,
        section === "progress",
      );
  }
  record(value.status, "dungeon.status", ["exploring", "paused", "event"]);
  for (const key of ["exploring", "paused", "event"])
    boolean(value.status[key], `dungeon.status.${key}`);
  record(value.statistics, "dungeon.statistics", ["kills", "runtime"]);
  number(value.statistics.kills, "dungeon.statistics.kills", 0, Infinity, true);
  number(value.statistics.runtime, "dungeon.statistics.runtime");
  number(value.action, "dungeon.action");
  if (Object.hasOwn(value, "enemyMultipliers"))
    stats(value.enemyMultipliers, "dungeon.enemyMultipliers", statKeys);
  array(value.backlog, "dungeon.backlog");
  for (const entry of value.backlog) {
    if (typeof entry === "string") text(entry, "dungeon.backlog");
    else {
      record(entry, "dungeon.backlog", ["id", "params"]);
      text(entry.id, "dungeon.backlog.id");
      record(entry.params, "dungeon.backlog.params");
    }
  }
}
// Resolve existing portraits without RNG and distinguish idle placeholders from encounters.
function enemy(value, active) {
  record(value, "enemy", ["name", "type", "lvl", "stats", "image", "rewards"]);
  if (value.name === null) {
    if (active || value.type !== null || value.lvl !== null)
      fail("enemy", "incomplete-enemy");
    record(value.stats, "enemy.stats", [...statKeys, "hpMax"]);
    for (const key of [...statKeys, "hpMax"])
      if (value.stats[key] !== (key === "hp" || key === "hpMax" ? null : 0))
        fail("enemy.stats");
    for (const [section, keys] of [
      ["image", ["name", "type", "size"]],
      ["rewards", ["exp", "gold", "drop"]],
    ]) {
      record(value[section], `enemy.${section}`, keys);
      for (const key of keys)
        if (value[section][key] !== null) fail(`enemy.${section}.${key}`);
    }
    return;
  }
  const identity = resolveEncounter(value.name, value.image);
  if (
    !identity.ok ||
    identity.value.encounter.legacyName !== value.name ||
    identity.value.variant.legacyImage.name !== value.image?.name
  )
    fail("enemy.image", "identity-mismatch");
  record(value.image, "enemy.image", ["name", "type", "size"]);
  if (
    !["Offensive", "Defensive", "Balanced", "Quick", "Lethal"].includes(
      value.type,
    )
  )
    fail("enemy.type", "unknown-reference");
  number(value.lvl, "enemy.lvl", 1, Infinity, true);
  stats(value.stats, "enemy.stats", [...statKeys, "hpMax"], ["hpPercent"]);
  number(value.stats.hpMax, "enemy.stats.hpMax", Number.MIN_VALUE);
  record(value.rewards, "enemy.rewards", ["exp", "gold", "drop"]);
  number(value.rewards.exp, "enemy.rewards.exp");
  number(value.rewards.gold, "enemy.rewards.gold");
  boolean(value.rewards.drop, "enemy.rewards.drop");
  if (active && value.stats.hp <= 0)
    fail("enemy.stats.hp", "interrupted-state");
}
/**
 * Validate preferences independently for a fresh user, preserving mute.
 * @param {unknown} input Plain preferences.
 * @returns {{ok:boolean,candidate?:object,issues?:object[]}} Detached preferences or issues.
 */
export function validateVolume(input) {
  try {
    const value = readBoundedData(input);
    record(value, "volume", ["master", "sfx", "bgm"]);
    for (const key of ["master", "sfx", "bgm"])
      number(value[key], `volume.${key}`, 0, key === "bgm" ? 0.5 : 1);
    return { ok: true, candidate: value };
  } catch (error) {
    return rejected(error);
  }
}
// Map internal validation failures to compact, non-sensitive recovery diagnostics.
function rejected(error) {
  return {
    ok: false,
    issues: [
      { code: error.code ?? "invalid-input", path: error.path ?? "input" },
    ],
  };
}
/**
 * Validate a detached state, legacy tuple, snapshot envelope or character preview.
 * Source kinds: state requires all sections; legacy permits missing early-run defaults;
 * snapshot requires supported metadata; character returns only validated player data.
 * Does not normalize resting flags, migrate history, mutate inputs, write, or draw RNG.
 * @param {unknown} input JSON text or plain JSON data.
 * @param {'state'|'legacy'|'snapshot'|'character'} sourceKind Boundary interpretation.
 * @returns {{ok:boolean,candidate?:object,issues?:object[]}} Accepted data or recovery issues.
 */
export function validateCandidate(input, sourceKind) {
  try {
    const value = readBoundedData(input);
    if (sourceKind === "character")
      return { ok: true, candidate: player(value) };
    if (!["state", "legacy", "snapshot"].includes(sourceKind))
      fail("sourceKind", "unsupported-source");
    if (sourceKind === "snapshot") {
      record(value, "snapshot", [
        "format",
        "version",
        "contentVersion",
        "revision",
        "savedAt",
        "state",
      ]);
      if (
        value.format !== "malevolent-crawler-save" ||
        value.version !== 1 ||
        value.contentVersion !== 1
      )
        fail("snapshot", "unsupported-version");
      number(
        value.revision,
        "snapshot.revision",
        1,
        Number.MAX_SAFE_INTEGER,
        true,
      );
      if (
        typeof value.savedAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.savedAt) ||
        !Number.isFinite(Date.parse(value.savedAt)) ||
        new Date(value.savedAt).toISOString() !== value.savedAt
      )
        fail("snapshot.savedAt");
      const checked = validateCandidate(value.state, "state");
      if (!checked.ok) return checked;
      value.state = checked.candidate;
      return { ok: true, candidate: value };
    }
    record(value, "state", ["player", "dungeon", "enemy", "volume"]);
    value.player = player(value.player);
    if (
      sourceKind === "legacy" &&
      !value.player.allocated &&
      !value.player.inCombat &&
      value.player.lvl === 1 &&
      value.player.kills === 0 &&
      value.player.deaths === 0 &&
      value.player.playtime === 0
    ) {
      const defaults = initialStateSections();
      for (const key of ["dungeon", "enemy", "volume"])
        if (!Object.hasOwn(value, key)) value[key] = defaults[key];
    }
    dungeon(value.dungeon);
    enemy(value.enemy, value.player.inCombat);
    const volume = validateVolume(value.volume);
    if (!volume.ok) return volume;
    value.volume = volume.candidate;
    if (value.player.inCombat && value.player.stats.hp <= 0)
      fail("player.stats.hp", "interrupted-state");
    return { ok: true, candidate: value };
  } catch (error) {
    return rejected(error);
  }
}
