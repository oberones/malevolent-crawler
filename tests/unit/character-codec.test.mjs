import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  encodeCharacter,
  decodeCharacter,
} from "../../assets/js/app/character-codec.mjs";
import {
  validateCandidate,
  SAVE_LIMITS,
} from "../../assets/js/app/save-validation.mjs";
const exports = JSON.parse(
  readFileSync("tests/fixtures/legacy/exports.json"),
).cases;
const player = JSON.parse(atob(exports[0].text));
// Build adversarial envelope bytes independently of the production encoder.
function envelope(value) {
  return "MC1:" + Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}
// All historical fixtures preserve Latin-1 and accept a combat flag without an enemy.
test("strict historical exports retain validated values", () => {
  for (const row of exports) {
    const expected = validateCandidate(JSON.parse(atob(row.text)), "character");
    assert.equal(decodeCharacter(row.text).ok, true, row.id);
    assert.deepEqual(decodeCharacter(row.text).player, expected.candidate);
  }
  const active = { ...player, inCombat: true };
  assert.equal(
    decodeCharacter(btoa(JSON.stringify(active))).player.inCombat,
    true,
  );
});
// Unicode and hostile-looking names are inert data; no run/preferences are exported.
test("UTF-8 round trips and character-only envelope", () => {
  const input = {
    ...structuredClone(player),
    name: "潮 🌊 Márin <img onerror=alert(1)>",
  };
  const before = structuredClone(input);
  const result = encodeCharacter(input);
  assert.equal(result.ok, true);
  const raw = JSON.parse(
    Buffer.from(result.text.slice(4), "base64").toString("utf8"),
  );
  assert.deepEqual(Object.keys(raw), ["format", "version", "player"]);
  assert.equal(raw.format, "malevolent-crawler-character");
  assert.equal(raw.version, 1);
  assert.deepEqual(
    decodeCharacter(result.text).player,
    validateCandidate(input, "character").candidate,
  );
  assert.deepEqual(input, before);
});
// Strict transport decoding rejects permissive browser Base64 and invalid UTF-8 forms.
test("malformed transport and unsupported versions fail explicitly", () => {
  for (const text of [
    "",
    " ",
    "e30",
    "e30=\n",
    "e31=",
    "!!!!",
    "MC2:e30=",
    "MC1:/w==",
    "MC1:7aCA",
    "MC1:",
  ]) {
    assert.equal(decodeCharacter(text).ok, false, text);
  }
  assert.equal(
    decodeCharacter("MC2:e30=").issues[0].code,
    "unsupported-version",
  );
});
// Shape and domain validation is shared with saves, including encoded holdings.
test("unsafe and unsupported character shapes cannot escape", () => {
  for (const value of [
    null,
    [],
    {},
    { ...player, gold: -1 },
    { ...player, dungeon: {} },
    { ...player, skills: ["unknown"] },
    {
      ...player,
      inventory: { consumables: [], equipment: ['{"__proto__":{}}'] },
    },
  ]) {
    assert.equal(encodeCharacter(value).ok, false);
    assert.equal(
      decodeCharacter(
        envelope({
          format: "malevolent-crawler-character",
          version: 1,
          player: value,
        }),
      ).ok,
      false,
    );
  }
  for (const value of [
    { format: "other", version: 1, player },
    { format: "malevolent-crawler-character", version: 2, player },
    { format: "malevolent-crawler-character", version: 1, player, volume: {} },
  ])
    assert.equal(decodeCharacter(envelope(value)).ok, false);
  for (const key of ["__proto__", "constructor", "prototype"]) {
    const raw = JSON.stringify(player).replace("{", `{"${key}":{},`);
    assert.equal(decodeCharacter(btoa(raw)).ok, false);
  }
});
// Budgets are checked before decoding/recursive validation and never truncate data.
test("encoded size, depth, field size and non-finite budgets", () => {
  assert.equal(
    decodeCharacter("A".repeat(SAVE_LIMITS.bytes + 1)).issues[0].code,
    "size-limit",
  );
  assert.equal(
    decodeCharacter(btoa("[".repeat(65) + "0" + "]".repeat(65))).issues[0].code,
    "depth-limit",
  );
  assert.equal(
    encodeCharacter({ ...player, name: "x".repeat(SAVE_LIMITS.fieldBytes + 1) })
      .ok,
    false,
  );
  assert.equal(encodeCharacter({ ...player, gold: Infinity }).ok, false);
  const accessor = { ...player };
  Object.defineProperty(accessor, "name", {
    enumerable: true,
    // An unsafe accessor must never execute during export validation.
    get() {
      throw new Error("must not execute");
    },
  });
  assert.equal(encodeCharacter(accessor).ok, false);
});
