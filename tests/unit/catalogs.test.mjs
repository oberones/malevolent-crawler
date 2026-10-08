import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { setting } from "../../assets/js/content/setting.mjs";
import { encounters, variants } from "../../assets/js/content/encounters.mjs";
import { relics, rarities } from "../../assets/js/content/relics.mjs";
import { symbols } from "../../assets/js/content/symbols.mjs";
import * as catalog from "../../assets/js/content/catalog.mjs";

// Read independent frozen evidence rather than deriving expected coverage from catalogs.
function fixture(path) {
  return JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url)));
}
const corpus = fixture("tests/fixtures/legacy/encounters.json");
const delivery = fixture("art/cosmic-horror/manifest.json");
const contexts = fixture("tests/fixtures/legacy/symbol-contexts.json").contexts;
const categories = fixture("tests/fixtures/legacy/equipment.json").categories;

// Require the typed failure contract without reflecting untrusted input into diagnostics.
function failure(result, code, kind) {
  assert.deepEqual(result, { ok: false, error: { code, kind } });
}

// Check nested objects as well as arrays; callers must not be able to poison shared lookups.
function frozen(value) {
  if (value === null || typeof value !== "object") return;
  assert.ok(Object.isFrozen(value));
  for (const child of Object.values(value)) frozen(child);
}

// Pin the authoring contract independently of the runtime setting object.
test("setting and authoring guide agree on original world, surfaces and boundaries", () => {
  assert.equal(setting.id, "bell-beneath-brine");
  assert.equal(setting.contentVersion, 1);
  assert.equal(setting.title, "Malevolent Gods: The Drowned Labyrinth");
  assert.match(setting.location, /Veyr Quay/);
  assert.match(
    setting.horrorBoundary,
    /explicit mutilation and graphic gore are excluded/,
  );
  assert.equal(setting.copySurfaces.length, 12);
  const guide = readFileSync(
    new URL("../../art/cosmic-horror/setting-guide.md", import.meta.url),
    "utf8",
  );
  for (const text of [
    setting.title,
    setting.premise,
    setting.playerRole,
    setting.location,
    setting.horrorBoundary,
    setting.creditsPolicy,
    ...setting.copySurfaces,
    ...setting.motifs,
    ...setting.palette,
    ...setting.namingRules,
    ...Object.values(setting.terms),
  ])
    assert.ok(guide.includes(text), text);
  for (const collection of [encounters, variants, relics, symbols]) {
    for (const row of collection) {
      assert.ok(guide.includes(`\`${row.id}\``), row.id);
      assert.ok(guide.includes(row.displayName), row.displayName);
    }
  }
});

// Compare every captured generation result, including both variant draws and mimic overrides.
test("51 encounters and 52 active variants preserve all legacy image tuples and dimensions", () => {
  assert.equal(encounters.length, 51);
  assert.equal(variants.length, 53);
  const seen = new Set();
  for (const row of corpus.cases) {
    const enemy = row.expected.enemy;
    if (!enemy?.name || !enemy.image?.name) continue;
    const resolved = catalog.resolveEncounter(enemy.name, enemy.image);
    assert.equal(resolved.ok, true, row.id);
    assert.equal(resolved.value.encounter.legacyName, enemy.name);
    assert.deepEqual(resolved.value.variant.legacyImage, enemy.image);
    assert.equal(
      catalog.resolveEncounter(
        resolved.value.encounter.id,
        resolved.value.variant.id,
      ).value.variant,
      resolved.value.variant,
    );
    seen.add(resolved.value.variant.id);
  }
  assert.equal(seen.size, 52);
  const paths = new Set();
  for (const variant of variants) {
    const asset = delivery.entries.find(
      // Match the shipped catalog to its retained delivery record.
      (row) => row.delivered.path === variant.path,
    );
    assert.ok(asset, variant.path);
    assert.equal(variant.width, asset.delivered.width);
    assert.equal(variant.height, asset.delivered.height);
    assert.equal(
      variant.path,
      `assets/sprites/${variant.legacyImage.name}.png`,
    );
    assert.equal(variant.legacyImage.type, ".png");
    if (!variant.unusedButRequired)
      assert.ok(["50%", "70%"].includes(variant.legacyImage.size));
    paths.add(variant.path);
  }
  assert.equal(paths.size, 53);
});

// Metadata must cover exactly the engine's eligibility without becoming a second selection pool.
test("roles and archetypes match frozen pools; unused art has no gameplay membership", () => {
  assert.equal(encounters.length, 51);
  for (const encounter of encounters) {
    const roles = new Set();
    const archetypes = new Set();
    for (const [key, names] of Object.entries(corpus.pools)) {
      if (!names.includes(encounter.legacyName)) continue;
      const [archetype, condition] = key.split("/");
      roles.add(
        { normal: "ordinary", guardian: "guardian", sboss: "special-boss" }[
          condition
        ],
      );
      archetypes.add(archetype);
    }
    if (["Mimic", "Door Mimic"].includes(encounter.legacyName)) {
      roles.add(
        encounter.legacyName === "Mimic" ? "chest-mimic" : "door-mimic",
      );
      for (const archetype of [
        "Offensive",
        "Defensive",
        "Balanced",
        "Quick",
        "Lethal",
      ])
        archetypes.add(archetype);
    }
    assert.deepEqual(encounter.roles, [...roles].sort());
    assert.deepEqual(encounter.archetypes, [...archetypes].sort());
    for (const id of encounter.variants)
      assert.equal(catalog.getVariant(id).value.encounterId, encounter.id);
    assert.equal("pools" in encounter, false);
  }
  const unused = catalog.getVariant("spider_spirit").value;
  assert.equal(unused.unusedButRequired, true);
  assert.equal(unused.encounterId, null);
  assert.equal(unused.legacyImage.size, null);
  failure(catalog.getEncounter(unused.id), "unknown-reference", "encounter");
  failure(
    catalog.resolveEncounter("Spider", "spider_spirit"),
    "identity-mismatch",
    "encounter-variant",
  );
});

// Distinct saved illustrations must resolve explicitly rather than choosing a default or random image.
test("mage variants are distinct and missing or mismatched variants fail", () => {
  const mage = catalog.getEncounter("Skeleton Mage").value;
  assert.ok(mage);
  assert.equal(mage.variants.length, 2);
  const a = catalog.resolveEncounter(mage.id, "skeleton_mage1").value.variant;
  const b = catalog.resolveEncounter(mage.id, "skeleton_mage2").value.variant;
  assert.notEqual(a.id, b.id);
  assert.notEqual(a.displayName, b.displayName);
  assert.notEqual(a.description, b.description);
  assert.notEqual(a.alt, b.alt);
  const supplied = {
    ...a.legacyImage,
    path: "https://example.org/hostile.svg",
    className: "hidden",
  };
  const original = structuredClone(supplied);
  const accepted = catalog.resolveEncounter(mage.id, supplied);
  assert.equal(accepted.value.variant, a);
  assert.deepEqual(supplied, original);
  assert.equal("className" in accepted.value.variant, false);
  assert.equal(
    accepted.value.variant.path,
    "assets/sprites/skeleton_mage1.png",
  );
  failure(catalog.resolveEncounter(mage.id), "unknown-reference", "variant");
  failure(
    catalog.resolveEncounter(mage.id, "goblin"),
    "identity-mismatch",
    "encounter-variant",
  );
  for (const patch of [
    { type: ".svg" },
    { size: "100%" },
    { name: "../goblin" },
  ]) {
    const result = catalog.resolveEncounter(mage.id, {
      ...a.legacyImage,
      ...patch,
    });
    assert.equal(result.ok, false);
  }
});

// Preserve category relations and visible rarity labels, including their exact CSS allowlist.
test("14 relics retain rule relations and six rarities without numerical selection rules", () => {
  assert.equal(relics.length, 14);
  assert.deepEqual(
    relics.map(
      // Keep the independent legacy category order for presentation enumeration.
      (row) => row.legacyCategory,
    ),
    categories,
  );
  for (const [index, category] of categories.entries()) {
    const type =
      index < 6
        ? "Weapon"
        : index < 9
          ? "Armor"
          : index < 12
            ? "Shield"
            : "Helmet";
    const attribute = index < 6 ? "Damage" : "Defense";
    const relic = catalog.getRelic(category).value;
    assert.equal(relic.type, type);
    assert.equal(relic.attribute, attribute);
    assert.equal(catalog.resolveRelic(relic.id, attribute, type).value, relic);
    assert.equal(catalog.getSymbol(relic.symbolId).value.legacyRole, category);
    failure(
      catalog.resolveRelic(category, "bogus", type),
      "identity-mismatch",
      "relic",
    );
    failure(
      catalog.resolveRelic(category, attribute, "bogus"),
      "identity-mismatch",
      "relic",
    );
  }
  const names = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Heirloom"];
  assert.deepEqual(
    rarities.map(
      // Rarity spelling/order is a protected rule token.
      (row) => row.id,
    ),
    names,
  );
  for (const name of names)
    assert.deepEqual(catalog.getRarity(name).value, {
      id: name,
      label: name,
      className: name,
    });
});

// Shared glyph classes must not collapse distinct roles or omit dynamic placements.
test("24 symbol roles cover all 111 measured context IDs and planned local paths", () => {
  assert.equal(symbols.length, 24);
  const seen = new Set();
  for (const symbol of symbols) {
    const expected = contexts
      .filter(
        // Join by semantic purpose, never by shared font glyph.
        (row) => row.role === symbol.legacyRole,
      )
      .map(
        // Preserve the baseline's exact context keys for later geometry joins.
        (row) => row.id,
      );
    assert.deepEqual(symbol.contextIds, expected);
    assert.ok(expected.length);
    assert.equal(symbol.path, `assets/art/${symbol.id}.png`);
    assert.equal("width" in symbol, false);
    assert.equal("height" in symbol, false);
    assert.equal(catalog.getSymbol(symbol.legacyRole).value, symbol);
    for (const id of expected) {
      assert.equal(catalog.getSymbol(symbol.id, id).value, symbol);
      assert.equal(seen.has(id), false);
      seen.add(id);
    }
    failure(
      catalog.getSymbol(symbol.id, "wrong/context"),
      "identity-mismatch",
      "symbol-context",
    );
  }
  assert.equal(seen.size, 111);
  assert.equal(
    catalog.getSymbol("health").value.path,
    "assets/art/stat-hp.png",
  );
});

// IDs, aliases, names and asset IDs must be unique in each lookup namespace.
test("identity namespaces have unique stable IDs, aliases and distinct plain-text content", () => {
  assert.equal(encounters.length, 51);
  for (const [rows, alias, lookup] of [
    [encounters, "legacyName", catalog.getEncounter],
    [variants, null, catalog.getVariant],
    [relics, "legacyCategory", catalog.getRelic],
    [symbols, "legacyRole", catalog.getSymbol],
  ]) {
    const keys = new Set();
    const names = new Set();
    const assetIds = new Set();
    for (const row of rows) {
      assert.match(row.id, /^[a-z][a-z0-9-]*$/);
      const legacy = alias ? row[alias] : row.legacyImage.name;
      for (const key of new Set([row.id, legacy])) {
        assert.equal(keys.has(key), false, key);
        keys.add(key);
        assert.equal(lookup(key).value, row);
      }
      assert.equal(names.has(row.displayName), false, row.displayName);
      names.add(row.displayName);
      if (row.assetId) {
        assert.equal(assetIds.has(row.assetId), false);
        assetIds.add(row.assetId);
      }
      for (const text of [
        row.displayName,
        row.description ?? row.purpose,
        row.alt ?? row.accessibleLabel ?? row.description,
      ]) {
        assert.equal(typeof text, "string");
        assert.ok(text.length > 0);
        assert.doesNotMatch(text, /[<>]/);
        for (const character of text) assert.ok(character.codePointAt(0) >= 32);
      }
    }
  }
});

// Frozen data and result wrappers prevent one consumer from changing subsequent resolutions.
test("catalogs and lookup results are deeply immutable", () => {
  for (const value of [
    setting,
    encounters,
    variants,
    relics,
    symbols,
    rarities,
  ])
    frozen(value);
  const result = catalog.resolveEncounter("Skeleton Mage", "skeleton_mage1");
  frozen(result);
  frozen(catalog.getEncounter("not-known"));
  assert.throws(
    // Strict module writes must fail instead of poisoning shared presentation.
    () => {
      result.value.variant.legacyImage.size = "100%";
    },
    TypeError,
  );
  assert.throws(
    // Nested role arrays are as immutable as the containing catalog.
    () => {
      catalog.getEncounter("Goblin").value.roles.push("special-boss");
    },
    TypeError,
  );
  assert.equal(
    catalog.resolveEncounter("Skeleton Mage", "skeleton_mage1").value.variant
      .legacyImage.size,
    "50%",
  );
});

// Lookup failures must not allow inherited properties, coercion, arbitrary URLs or CSS tokens.
test("unknown and hostile references return typed failures without coercion", () => {
  const bad = [
    undefined,
    null,
    0,
    {},
    [],
    "",
    "__proto__",
    "constructor",
    "toString",
    "../goblin",
    "assets/sprites/goblin.png",
    "https://example.org/x",
    "<img onerror=alert(1)>",
    "Common hidden",
    "goblin\u0000",
  ];
  const hostile = {
    // A string conversion would execute caller behavior and is not permitted.
    toString() {
      throw new Error("coercion");
    },
  };
  bad.push(hostile);
  for (const input of bad) {
    for (const [lookup, kind] of [
      [catalog.getEncounter, "encounter"],
      [catalog.getVariant, "variant"],
      [catalog.getRelic, "relic"],
      [catalog.getSymbol, "symbol"],
      [catalog.getRarity, "rarity"],
    ])
      failure(lookup(input), "unknown-reference", kind);
  }
  failure(
    catalog.resolveEncounter("missing", "goblin"),
    "unknown-reference",
    "encounter",
  );
  failure(
    catalog.resolveRelic("missing", "Damage", "Weapon"),
    "unknown-reference",
    "relic",
  );
});

// Execute a fresh import under tripwires so cached imports cannot conceal initialization effects.
test("fresh catalog imports and lookups consume no RNG, DOM, storage, audio or timers", () => {
  const source = `
    import assert from 'node:assert/strict';
    // Fail immediately on any impure dependency access.
    const forbidden = () => { throw new Error('catalog side effect'); };
    Math.random = forbidden;
    for (const key of ['document', 'window', 'localStorage', 'sessionStorage', 'Audio', 'Howl']) Object.defineProperty(globalThis, key, { get: forbidden, configurable: true });
    globalThis.setTimeout = forbidden;
    globalThis.setInterval = forbidden;
    globalThis.fetch = forbidden;
    await import(${JSON.stringify(new URL("../../assets/js/content/setting.mjs", import.meta.url).href)});
    const catalog = await import(${JSON.stringify(new URL("../../assets/js/content/catalog.mjs", import.meta.url).href)});
    assert.equal(catalog.resolveEncounter('Skeleton Mage', 'skeleton_mage2').ok, true);
    assert.ok(catalog.resolveEncounter('Skeleton Mage', 'skeleton_mage2').value, 'expected a resolved saved variant');
    assert.equal(catalog.resolveEncounter('Skeleton Mage', 'skeleton_mage2').value.variant.legacyImage.name, 'skeleton_mage2');
    assert.equal(catalog.getRelic('Sword').ok, true);
    assert.equal(catalog.getSymbol('currency').ok, true);
    assert.equal(catalog.getRarity('Heirloom').ok, true);
  `;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", source],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
});
