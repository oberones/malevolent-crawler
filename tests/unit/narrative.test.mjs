import test from "node:test";
import assert from "node:assert/strict";
import {
  messageDefinitions,
  messageSchemas,
  messageTemplates,
  messageText,
  skills,
} from "../../assets/js/content/messages.mjs";
import { validateMessage } from "../../assets/js/app/message-records.mjs";

// This inventory comes from the original screen/event branches, not the new registry.
const required = {
  entry: [
    "title",
    "introduction",
    "name",
    "nameInvalid",
    "begin",
    "allocation",
    "allocationHelp",
    "points",
    "passive",
  ],
  event: [
    "door",
    "guardianDoor",
    "treasure",
    "treasureRoom",
    "emptyChest",
    "encounter",
    "guardian",
    "bossChamber",
    "boss",
    "fled",
    "fleeFailed",
    "ignored",
    "room",
    "floor",
    "gold",
    "offering",
    "blackSounding",
    "insufficient",
    "curseGain",
    "nothing0",
    "nothing1",
    "nothing2",
    "nothing3",
    "nothing4",
  ],
  choice: ["enter", "ignore", "open", "engage", "flee", "offer"],
  combat: [
    "playerHit",
    "playerCritical",
    "enemyHit",
    "enemyCritical",
    "victory",
    "experience",
    "gold",
    "defeat",
    "claim",
    "return",
  ],
  upgrade: ["title", "gained", "remaining", "reroll"],
  run: [
    "abandon",
    "abandonConfirm",
    "restart",
    "resetConsequences",
    "resting",
    "exploring",
    "floor",
    "room",
  ],
  inventory: [
    "title",
    "empty",
    "full",
    "equipment",
    "item",
    "sell",
    "sellAll",
    "unequipAll",
    "sale",
  ],
  menu: [
    "title",
    "statistics",
    "run",
    "settings",
    "export",
    "import",
    "save",
    "close",
    "cancel",
  ],
  help: ["title", "exploration", "combat", "progression", "relics", "saves"],
  about: ["description", "credits", "art"],
};
for (const [group, names] of Object.entries(required)) {
  // Missing branches must fail independently, even when the catalog exports successfully.
  test(`narrative covers ${group}`, () => {
    for (const name of names) {
      const id = `${group}.${name}`;
      assert.ok(messageDefinitions[id], `Missing ${id}`);
      assert.equal(typeof messageTemplates[id], "function", id);
      assert.deepEqual(messageSchemas[id], messageDefinitions[id].schema);
    }
  });
}
// Seven actual rule tokens stay stable, including the legacy-only Rampager skill.
test("skill descriptions preserve exact effects and aliases", () => {
  const expected = {
    "Remnant Razor": ["8%", "current"],
    "Titan's Will": ["5%", "maximum"],
    Devastator: ["30%", "30%"],
    Rampager: ["5", "after each hit", "resets"],
    "Blade Dance": ["0.01", "after each hit", "resets"],
    "Paladin's Heart": ["25%"],
    "Aegis Thorns": ["15%"],
  };
  assert.deepEqual(Object.keys(skills).sort(), Object.keys(expected).sort());
  for (const [alias, fragments] of Object.entries(expected)) {
    assert.notEqual(skills[alias].name, alias);
    for (const text of fragments)
      assert.ok(skills[alias].description.includes(text), alias);
  }
});
// Fixed upgrade magnitudes must agree with existing rules without inventing new bonuses.
test("all seven upgrades and offering outcomes retain their amounts", () => {
  for (const [stat, amount] of Object.entries({
    hp: 10,
    atk: 8,
    def: 8,
    atkSpd: 3,
    vamp: 0.5,
    critRate: 1,
    critDmg: 6,
  })) {
    assert.match(
      messageText({ id: `upgrade.${stat}`, params: {} }),
      new RegExp(`${amount}%`),
    );
    const result = messageText({
      id: `event.blessing.${stat}`,
      params: { before: 2, after: 3 },
    });
    assert.ok(result.includes(`${amount}%`));
    assert.ok(result.includes("Tide Offering 2 → 3"));
  }
});
// Exact typed schemas stop identity, path and parameter confusion at the text boundary.
test("typed messages reject unknown, missing, extra and hostile identity parameters", () => {
  const params = {
    encounter: "Goblin",
    player: "Skeleton Mage <img onerror=alert(1)>",
    damage: 12.5,
  };
  const invalid = [
    { id: "missing", params: {} },
    { id: "event.encounter", params: { encounter: "../../evil.png" } },
    { id: "combat.playerHit", params: {} },
    { id: "combat.playerHit", params: { ...params, damage: Infinity } },
    { id: "entry.title", params: { extra: true } },
  ];
  for (const record of invalid) {
    assert.equal(validateMessage(record, messageSchemas).ok, false);
    assert.throws(
      /* Invalid records must fail before text composition. */ () =>
        messageText(record),
      TypeError,
    );
  }
});
// Player-authored text is preserved verbatim; only catalog identities are renamed.
test("text formatting preserves hostile player names and fractional rewards without HTML interpretation", () => {
  const player = "Skeleton Mage <img src=x onerror=alert(1)> & 雨";
  const record = {
    id: "combat.playerHit",
    params: { player, encounter: "Goblin", damage: 12.5 },
  };
  const text = messageText(record);
  assert.ok(text.includes(player));
  assert.ok(text.includes("12.5"));
  assert.ok(!text.includes("to Goblin."));
  assert.ok(
    messageText({ id: "combat.experience", params: { amount: 50.5 } }).includes(
      "50.5",
    ),
  );
  assert.deepEqual(messageTemplates["combat.playerHit"](record.params), [
    { kind: "text", text },
  ]);
});
// Authored records are immutable and every placeholder has a schema, including unused entries.
test("registry is immutable, complete and produces only text descriptors", () => {
  assert.ok(Object.keys(messageDefinitions).length > 90);
  for (const [id, row] of Object.entries(messageDefinitions)) {
    assert.ok(Object.isFrozen(row));
    assert.ok(Object.isFrozen(row.schema));
    const tokens = [...row.text.matchAll(/\{(\w+)\}/g)].map(
      /* Extract authored parameter names for exact schema comparison. */ (m) =>
        m[1],
    );
    assert.deepEqual(
      [...new Set(tokens)].sort(),
      Object.keys(row.schema).sort(),
      id,
    );
    assert.doesNotMatch(
      row.text,
      /<[^>]+>|Dungeon Crawler on Demand|Statue of Blessing|Cursed Totem|Dungeon Monarch|Floor Guardian/,
    );
  }
  assert.ok(Object.isFrozen(messageTemplates));
  assert.ok(Object.isFrozen(skills));
});
// Every authored row must render with valid data, reject malformed parameters, and consume no RNG.
test("all templates validate inputs without modifying records or consuming randomness", () => {
  const samples = {
    text: "$& {name} 雨",
    number: 12.5,
    encounter: "Goblin",
    relic: "Sword",
    rarity: "Rare",
    symbol: "stat-hp",
    item: {
      category: "Sword",
      attribute: "Damage",
      type: "Weapon",
      rarity: "Common",
      lvl: 1,
      tier: 1,
      value: 75,
      stats: [{ atk: 10 }],
    },
  };
  const random = Math.random;
  // Presentation is forbidden from changing the gameplay draw position.
  Math.random = () => {
    throw new Error("Presentation consumed RNG");
  };
  try {
    for (const [id, row] of Object.entries(messageDefinitions)) {
      const params = Object.fromEntries(
        Object.entries(row.schema).map(
          /* Create independently valid representatives of each established boundary type. */ ([
            key,
            type,
          ]) => [key, structuredClone(samples[type])],
        ),
      );
      const record = { id, params };
      const original = structuredClone(record);
      assert.equal(validateMessage(record, messageSchemas).ok, true, id);
      const text = messageText(record);
      assert.ok(text.length > 0, id);
      assert.deepEqual(messageTemplates[id](params), [{ kind: "text", text }]);
      assert.deepEqual(record, original);
      for (const key of Object.keys(params)) {
        const missing = structuredClone(params);
        delete missing[key];
        assert.throws(
          /* Exact parameters are required even for direct template calls. */ () =>
            messageTemplates[id](missing),
          TypeError,
          id,
        );
        assert.throws(
          /* Objects cannot cross a scalar boundary or impersonate an equipment record. */ () =>
            messageText({ id, params: { ...params, [key]: { bad: true } } }),
          TypeError,
          id,
        );
      }
    }
  } finally {
    Math.random = random;
  }
});
// Costs, reset retention, passive consequences and credits must remain explicit and accurate.
test("costs, reset consequences, neutral labels and retained credits are explicit", () => {
  const offering = messageText({
    id: "event.offering",
    params: { cost: 1000, level: 1 },
  });
  assert.match(offering, /1000 Quay Marks/);
  const curse = messageText({
    id: "event.blackSounding",
    params: { cost: 10000, level: 1 },
  });
  assert.match(curse, /10000 Quay Marks/);
  assert.match(curse, /stronger/);
  assert.match(curse, /loot quality/);
  const reset = messageText({ id: "run.resetConsequences", params: {} });
  for (const word of [
    "Attunement",
    "EXP",
    "skills",
    "allocation",
    "inventory",
    "Quay Marks",
    "lifetime",
    "reset",
  ])
    assert.ok(reset.includes(word));
  const credits = messageText({ id: "about.credits", params: {} });
  for (const name of [
    "Aekashics",
    "Leohpaz",
    "phoenix1291",
    "Leviathan_Music",
    "Sara Garrard",
    "Howler 2.2.3",
  ])
    assert.ok(credits.includes(name));
  assert.equal(messageText({ id: "combat.claim", params: {} }), "Claim");
});
