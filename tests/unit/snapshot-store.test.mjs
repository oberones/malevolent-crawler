import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createSnapshotStore,
  SAVE_KEY,
  PREVIOUS_KEY,
} from "../../assets/js/app/snapshot-store.mjs";
import { createFakeStorage } from "../helpers/fake-storage.mjs";
const corpus = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases;
// Find immutable inputs without sharing mutated candidates between cases.
function fixture(id = "resting") {
  return structuredClone(
    corpus.find(
      // Match the exact captured run.
      (c) => c.id === id,
    ),
  );
}
// Independent wire-format fixture; whitespace verifies exact-byte backup behavior.
function envelope(revision = 3, state = fixture().state) {
  return JSON.stringify(
    {
      format: "malevolent-crawler-save",
      version: 1,
      contentVersion: 1,
      revision,
      savedAt: "2026-10-06T12:00:00.000Z",
      state,
    },
    null,
    2,
  );
}
// Fixed operational time never consumes gameplay RNG.
function now() {
  return new Date("2026-10-06T13:00:00.000Z");
}
// Return attempted mutations, including failed writes, in protocol order.
function writes(storage) {
  return storage.calls.filter(
    // Reads are irrelevant to the write-stage byte matrix.
    (c) => c.method !== "getItem",
  );
}
// Each recorded valid tuple loads independently and never rewrites legacy bytes.
test("complete revision and legacy reads are pure", () => {
  for (const row of corpus) {
    const storage = createFakeStorage(row.raw);
    const before = storage.entries();
    const store = createSnapshotStore({ storage, now });
    const result = store.readLocalState();
    assert.equal(
      result.status,
      row.classification.startsWith("recovery") ? "recovery" : "ready",
      row.id,
    );
    assert.deepEqual(storage.entries(), before);
    assert.equal(writes(storage).length, 0);
    if (result.status === "recovery")
      assert.deepEqual(result.recoveryData.raw, row.raw);
  }
  const storage = createFakeStorage({
    ...fixture("normal").raw,
    [SAVE_KEY]: envelope(),
  });
  const store = createSnapshotStore({ storage, now });
  const result = store.readLocalState();
  assert.equal(result.status, "ready");
  assert.equal(result.source, "canonical");
  assert.equal(result.candidate.player.inCombat, false);
});
// Absent and malformed canonical states have different recovery meanings.
test("empty preferences, partial run, malformed canonical and previous recovery", () => {
  let storage = createFakeStorage({
    volumeData: '{"master":0,"sfx":0,"bgm":0}',
  });
  let result = createSnapshotStore({ storage, now }).readLocalState();
  assert.equal(result.status, "empty");
  assert.deepEqual(result.volume, { master: 0, sfx: 0, bgm: 0 });
  storage = createFakeStorage({ volumeData: "bad" });
  result = createSnapshotStore({ storage, now }).readLocalState();
  assert.equal(result.status, "empty");
  assert.equal(result.volume.bgm, 0.4);
  assert.equal(result.issues.length, 1);
  for (const raw of [
    "",
    "null",
    "{}",
    "{broken",
    envelope().replace('"version": 1', '"version": 2'),
  ]) {
    storage = createFakeStorage({
      ...fixture().raw,
      [SAVE_KEY]: raw,
      [PREVIOUS_KEY]: envelope(2),
    });
    const before = storage.entries();
    const store = createSnapshotStore({ storage, now });
    result = store.readLocalState();
    assert.equal(result.status, "recovery");
    assert.equal(result.recoveryData.raw[SAVE_KEY], raw);
    assert.equal(result.recoveryData.previous.revision, 2);
    assert.equal(store.commitSnapshot(fixture().state).status, "unsaved");
    assert.deepEqual(storage.entries(), before);
  }
  storage = createFakeStorage({ [PREVIOUS_KEY]: envelope(2) });
  assert.equal(
    createSnapshotStore({ storage, now }).readLocalState().status,
    "recovery",
  );
  storage = createFakeStorage({ playerData: fixture("normal").raw.playerData });
  assert.equal(
    createSnapshotStore({ storage, now }).readLocalState().status,
    "recovery",
  );
});
// Read faults preserve available bytes and stop autosave instead of starting fresh.
test("every source read exception becomes recovery with no writes", () => {
  for (const key of [
    SAVE_KEY,
    PREVIOUS_KEY,
    "playerData",
    "dungeonData",
    "enemyData",
    "volumeData",
  ]) {
    const storage = createFakeStorage(fixture().raw);
    storage.fail("getItem", key);
    const before = storage.entries();
    const store = createSnapshotStore({ storage, now });
    assert.equal(store.readLocalState().status, "recovery", key);
    assert.equal(store.commitSnapshot(fixture().state).status, "unsaved");
    assert.deepEqual(storage.entries(), before);
    assert.equal(writes(storage).length, 0);
  }
});
// Assert bytes and write attempts for all specified C/P, C/C and N/C outcomes.
test("commit failure matrix and retry preserve raw sources without rollback", () => {
  for (const stage of [
    "validation",
    "clock",
    "read",
    "backup",
    "canonical",
    "success",
  ]) {
    const C = envelope(),
      P = envelope(2);
    const legacy = fixture("normal").raw;
    const storage = createFakeStorage({
      ...legacy,
      [SAVE_KEY]: C,
      [PREVIOUS_KEY]: P,
    });
    const store = createSnapshotStore({
      storage,
      now:
        stage === "clock"
          ? // Serialization preparation can fail before any storage mutation.
            () => {
              throw new Error("private clock detail");
            }
          : now,
    });
    assert.equal(store.readLocalState().status, "ready");
    storage.calls.length = 0;
    const candidate = fixture().state;
    candidate.player.gold = 123;
    if (stage === "validation") candidate.player.gold = -1;
    if (stage === "read") storage.fail("getItem", SAVE_KEY);
    if (stage === "backup") storage.fail("setItem", PREVIOUS_KEY);
    if (stage === "canonical") storage.fail("setItem", SAVE_KEY);
    const before = structuredClone(candidate);
    const result = store.commitSnapshot(candidate);
    assert.deepEqual(candidate, before);
    assert.equal(
      result.status,
      stage === "success" ? "saved" : "unsaved",
      stage,
    );
    const after = storage.entries();
    assert.equal(
      after[PREVIOUS_KEY],
      ["canonical", "success"].includes(stage) ? C : P,
      stage,
    );
    assert.equal(
      writes(storage).length,
      ["backup"].includes(stage)
        ? 1
        : ["canonical", "success"].includes(stage)
          ? 2
          : 0,
      stage,
    );
    if (stage === "success") {
      const saved = JSON.parse(after[SAVE_KEY]);
      assert.equal(saved.revision, 4);
      assert.equal(saved.state.player.gold, 123);
      assert.equal(saved.savedAt, now().toISOString());
    } else assert.equal(after[SAVE_KEY], C, stage);
    for (const [key, value] of Object.entries(legacy))
      assert.equal(after[key], value);
    if (stage === "canonical") {
      assert.equal(store.commitSnapshot(candidate).status, "saved");
      assert.equal(JSON.parse(storage.entries()[SAVE_KEY]).revision, 4);
    }
  }
});
// A failed first write cannot erase recovery bytes or pretend migration changed live state.
test("first commit skips backup; failed migration/import candidates remain detached", () => {
  const legacy = fixture().raw;
  const P = envelope(2);
  const storage = createFakeStorage({ ...legacy, [PREVIOUS_KEY]: P });
  const live = fixture("normal").state;
  const before = structuredClone(live);
  const store = createSnapshotStore({ storage, now });
  store.readLocalState();
  storage.calls.length = 0;
  storage.fail("setItem", SAVE_KEY);
  const result = store.commitSnapshot(fixture().state);
  assert.equal(result.status, "unsaved");
  assert.deepEqual(live, before);
  assert.equal(storage.entries()[SAVE_KEY], undefined);
  assert.equal(storage.entries()[PREVIOUS_KEY], P);
  assert.deepEqual(
    writes(storage).map(
      // Only canonical is attempted on a first commit.
      (c) => c.key,
    ),
    [SAVE_KEY],
  );
  assert.equal(store.commitSnapshot(fixture().state).revision, 1);
});
// Revision checks and storage notifications suspend writes; disposal removes ownership.
test("revision conflicts, same-revision foreign bytes and event disposal", () => {
  for (const replacement of [
    envelope(4),
    envelope(3, fixture("normal").state),
    null,
  ]) {
    const storage = createFakeStorage({
      [SAVE_KEY]: envelope(),
      [PREVIOUS_KEY]: envelope(2),
    });
    const store = createSnapshotStore({ storage, now });
    store.readLocalState();
    if (replacement === null) storage.removeItem(SAVE_KEY);
    else storage.setItem(SAVE_KEY, replacement);
    storage.calls.length = 0;
    assert.equal(store.commitSnapshot(fixture().state).status, "conflict");
    assert.equal(writes(storage).length, 0);
  }
  const events = new EventTarget();
  const storage = createFakeStorage({ [SAVE_KEY]: envelope() });
  const store = createSnapshotStore({ storage, now, eventTarget: events });
  store.readLocalState();
  const event = new Event("storage");
  Object.assign(event, {
    key: SAVE_KEY,
    storageArea: storage,
    newValue: envelope(4),
  });
  events.dispatchEvent(event);
  assert.equal(store.commitSnapshot(fixture().state).status, "conflict");
  store.readLocalState();
  assert.equal(store.commitSnapshot(fixture().state).status, "saved");
  store.dispose();
  events.dispatchEvent(event);
  assert.equal(store.commitSnapshot(fixture().state).status, "unsaved");
});
