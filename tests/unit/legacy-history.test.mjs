import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { migrateLegacyMessages } from "../../assets/js/app/legacy-history.mjs";
import {
  messageText,
  messageSchemas,
} from "../../assets/js/content/messages.mjs";
import { validateMessage } from "../../assets/js/app/message-records.mjs";
import { createLegacyHarness } from "../helpers/legacy-harness.mjs";
const coin = '<i class="fas fa-coins" style="color: #FFD700;"></i>';
const cases = [
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
  ["You encountered Skeleton Mage.", "event.encounter"],
  ["Dungeon Monarch Nameless Fallen King has awoken.", "event.boss"],
  [
    '<span class="Heirloom">You found a mysterious chamber. It seems like there is something sleeping inside.</span>',
    "event.bossChamber",
  ],
  ["You managed to flee.", "event.fled"],
  ["You failed to escape!", "event.fleeFailed"],
  ["You ignored it and decided to move on.", "event.ignored"],
  ["You don't have enough gold.", "event.insufficient"],
  ["The chest is empty.", "event.emptyChest"],
  ...[
    "You explored and found nothing.",
    "You found an empty chest.",
    "You found a monster corpse.",
    "You found a corpse.",
    "There is nothing in this area.",
  ].map(
    /* Preserve exact legacy event ordering. */ (s, i) => [
      s,
      `event.nothing${i}`,
    ],
  ),
  [`You found ${coin}1.23k.`, "history.gold"],
  [
    `<span class="Legendary">You found a Statue of Blessing. Do you want to offer ${coin}<span class="Common">1k</span> to gain blessings? (Blessing Lv.1)</span>`,
    "history.offering",
  ],
  [
    `<span class="Heirloom">You found a Cursed Totem. Do you want to offer ${coin}<span class="Common">2M</span>? This will strengthen the monsters but will also improve the loot quality. (Curse Lv.2)</span>`,
    "history.blackSounding",
  ],
  [
    "The monsters in the dungeon became stronger and the loot quality improved. (Curse Lv.2 > Curse Lv.3)",
    "event.curseGain",
  ],
  ...Object.entries({
    hp: [10, "HP"],
    atk: [8, "ATK"],
    def: [8, "DEF"],
    atkSpd: [3, "ATK.SPD"],
    vamp: [0.5, "VAMP"],
    critRate: [1, "C.RATE"],
    critDmg: [6, "C.DMG"],
  }).map(
    /* Enumerate all seven frozen blessing outcomes. */ ([
      key,
      [amount, label],
    ]) => [
      `You gained ${amount}% bonus ${label} from the blessing. (Blessing Lv.1 > Blessing Lv.2)`,
      `event.blessing.${key}`,
    ],
  ),
];
// Match full historical templates, without global term substitutions or HTML parsing.
test("all persisted event templates become typed themed records in sequence", () => {
  const result = migrateLegacyMessages(
    cases.map(/* Select historical bytes. */ (row) => row[0]),
  );
  assert.deepEqual(
    result.records.map(/* Inspect exact message ownership. */ (row) => row.id),
    cases.map(/* Expected authored mappings. */ (row) => row[1]),
  );
  for (const record of result.records)
    assert.equal(validateMessage(record, messageSchemas).ok, true);
  assert.match(messageText(result.records[19]), /1.23k Quay Marks/);
  assert.deepEqual(
    migrateLegacyMessages(result.records).records,
    result.records,
  );
});
// The frozen equipment printer is an independent oracle for complete reward markup.
test("reward panels across all categories retain historical stats without inventing sale values", () => {
  const equipment = JSON.parse(
    readFileSync("tests/fixtures/legacy/equipment.json"),
  );
  const selectors = JSON.parse(
    readFileSync("tests/fixtures/legacy/dom-selectors.json"),
  );
  const resting = JSON.parse(
    readFileSync("tests/fixtures/legacy/saves.json"),
  ).cases.find(/* Select settled run. */ (row) => row.id === "resting").state;
  const rows = [];
  for (const category of equipment.categories) {
    for (const rarity of [
      "Common",
      "Uncommon",
      "Rare",
      "Epic",
      "Legendary",
      "Heirloom",
    ])
      rows.push(
        equipment.cases.find(
          // Select an independently generated panel for each category and rarity.
          (row) =>
            row.id.startsWith(`${category}/`) &&
            JSON.parse(row.expected.player.inventory.equipment.at(-1))
              .rarity === rarity,
        ),
      );
  }
  assert.equal(rows.length, 84);
  for (const row of rows) {
    const category = row.id.split("/")[0];
    const h = createLegacyHarness({ selectors, randomTape: row.tape });
    try {
      for (const [key, value] of Object.entries(resting)) h.write(key, value);
      for (const [key, value] of Object.entries(row.setup)) h.write(key, value);
      h.call("setVolume");
      h.call("createEquipmentPrint", "dungeon");
      const original = h.read("dungeon").backlog.at(-1);
      const result = migrateLegacyMessages([original]);
      const record = result.records[0];
      assert.equal(record.id, "history.reward", category);
      assert.equal(validateMessage(record, messageSchemas).ok, true);
      assert.equal(record.params.relic, category);
      assert.ok(record.params.stats.length);
      assert.equal(Object.hasOwn(record.params, "value"), false);
      assert.equal(result.recovery["legacy:dungeon.backlog:0"], original);
      assert.equal(
        migrateLegacyMessages([
          original.replace("</ul>", "<script>bad()</script></ul>"),
        ]).records[0].id,
        "history.unavailable",
      );
    } finally {
      h.dispose();
    }
  }
});
// Old-looking player text is data, not an identity alias or executable HTML.
test("player names, unknown strings and invalid typed records preserve recoverable originals", () => {
  const playerName = "Goblin <img src=x onerror=bad()> Sword";
  const known = {
    id: "combat.playerHit",
    params: { player: playerName, damage: 12, encounter: "Goblin" },
  };
  const unknown = [
    "You encountered Goblin.<script>bad()</script>",
    "You encountered Unknown.",
    "<svg onload=bad()>",
    { id: "bogus", params: {} },
  ];
  const input = [known, ...unknown];
  const before = structuredClone(input);
  const result = migrateLegacyMessages(input);
  assert.deepEqual(input, before);
  assert.deepEqual(result.records[0], known);
  assert.match(
    messageText(result.records[0]),
    /Goblin <img src=x onerror=bad\(\)> Sword/,
  );
  for (let i = 1; i < input.length; i++) {
    assert.deepEqual(result.records[i], {
      id: "history.unavailable",
      params: { recoveryRef: `legacy:dungeon.backlog:${i}` },
    });
    assert.deepEqual(result.recovery[`legacy:dungeon.backlog:${i}`], input[i]);
  }
});
