import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { migrateLegacyState } from "../../assets/js/app/legacy-migration.mjs";
import { validateCandidate } from "../../assets/js/app/save-validation.mjs";
import {
  createSnapshotStore,
  SAVE_KEY,
} from "../../assets/js/app/snapshot-store.mjs";
import { createFakeStorage } from "../helpers/fake-storage.mjs";
const corpus = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases;
// Locate detached immutable state for each boundary test.
function fixture(id) {
  return structuredClone(
    corpus.find(/* Select the named source. */ (row) => row.id === id),
  );
}
// Fixed operational metadata cannot consume gameplay randomness.
function now() {
  return new Date("2026-10-08T00:00:00.000Z");
}
// Preserve every authoritative field while mapping only history and presentation references.
test("migration corpus, defaults, terminal states, exact variants and zero RNG", () => {
  const random = Math.random;
  Math.random = /* Any migration draw is a regression. */ () => {
    throw new Error("RNG forbidden");
  };
  try {
    for (const row of corpus) {
      const before = structuredClone(row.state);
      const result = migrateLegacyState(row.state);
      assert.equal(
        result.ok,
        !row.classification.startsWith("recovery"),
        row.id,
      );
      assert.deepEqual(row.state, before);
      if (!result.ok) continue;
      const expected = validateCandidate(row.state, "legacy").candidate;
      const state = structuredClone(result.candidate);
      state.dungeon.backlog = expected.dungeon.backlog;
      assert.deepEqual(state, expected, row.id);
      assert.ok(result.presentation, row.id);
      if (row.id === "variant-1")
        assert.equal(
          result.presentation.encounter.variantId,
          "sounding-vessel-bowl",
        );
      if (row.id === "variant-2")
        assert.equal(
          result.presentation.encounter.variantId,
          "sounding-vessel-chimes",
        );
      assert.deepEqual(
        migrateLegacyState(result.candidate).candidate,
        result.candidate,
      );
    }
  } finally {
    Math.random = random;
  }
});
// A migrated save is durable without rewriting original four-key bytes or replaying outcomes.
test("store maps history, keeps raw bytes, and repeated loads do not reset or award", () => {
  const row = fixture("settled-victory");
  row.state.dungeon.backlog = [
    "You encountered Skeleton Mage.",
    "<script>hostile()</script>",
  ];
  row.raw.dungeonData = JSON.stringify(row.state.dungeon, null, 2);
  const storage = createFakeStorage(row.raw);
  const store = createSnapshotStore({ storage, now });
  const loaded = store.readLocalState();
  assert.equal(loaded.status, "ready");
  assert.equal(loaded.candidate.dungeon.backlog[0].id, "event.encounter");
  assert.equal(loaded.candidate.dungeon.backlog[1].id, "history.unavailable");
  assert.deepEqual(loaded.recoveryData.raw, row.raw);
  assert.equal(store.commitSnapshot(loaded.candidate).status, "saved");
  for (let i = 0; i < 3; i++) {
    const next = store.readLocalState();
    assert.deepEqual(next.candidate, loaded.candidate);
    assert.equal(
      next.recoveryData.history["legacy:dungeon.backlog:1"],
      "<script>hostile()</script>",
    );
    assert.equal(store.commitSnapshot(next.candidate).status, "saved");
  }
  for (const [key, value] of Object.entries(row.raw))
    assert.equal(storage.entries()[key], value);
});
// Canonical records with older strings need the same mapping, and unknown bytes must outlive backup rotation.
test("canonical history recovery survives repeated commits; unsupported versions cannot downgrade", () => {
  const state = fixture("resting").state;
  state.dungeon.backlog = [
    "You found a door.",
    "  unknown <img onerror=bad>  ",
  ];
  const raw = JSON.stringify({
    format: "malevolent-crawler-save",
    version: 1,
    contentVersion: 1,
    revision: 2,
    savedAt: now().toISOString(),
    state,
  });
  const storage = createFakeStorage({
    ...fixture("normal").raw,
    [SAVE_KEY]: raw,
  });
  const store = createSnapshotStore({ storage, now });
  for (let i = 0; i < 4; i++) {
    const loaded = store.readLocalState();
    assert.equal(loaded.candidate.dungeon.backlog[0].id, "event.door");
    assert.equal(
      loaded.recoveryData.history["canonical:dungeon.backlog:1"],
      state.dungeon.backlog[1],
    );
    assert.equal(store.commitSnapshot(loaded.candidate).status, "saved");
  }
  storage.setItem(SAVE_KEY, raw.replace('"version":1', '"version":2'));
  assert.equal(store.readLocalState().status, "recovery");
  assert.equal(store.commitSnapshot(state).status, "unsaved");
});
// Stage defaults must never turn missing allocated-run sections into an invented run.
test("only early tuples receive missing sections; mismatched variants enter recovery", () => {
  for (const id of ["early", "resting", "normal"]) {
    const input = { player: fixture(id).state.player };
    assert.equal(migrateLegacyState(input).ok, id === "early");
  }
  const state = fixture("normal").state;
  state.enemy.image.name = "skeleton_mage2";
  assert.equal(migrateLegacyState(state).ok, false);
});
// An early-shaped player cannot justify defaults when another section proves a run existed.
test("partial early-shaped tuples with run progress do not fabricate missing enemy or dungeon", () => {
  const early = fixture("early").state;
  const advanced = structuredClone(early.dungeon);
  advanced.progress.floor = 3;
  assert.equal(
    migrateLegacyState({ player: early.player, dungeon: advanced }).ok,
    false,
  );
  assert.equal(
    migrateLegacyState({
      player: early.player,
      enemy: fixture("normal").state.enemy,
    }).ok,
    false,
  );
});
