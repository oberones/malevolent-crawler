import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTransitions } from "../../assets/js/app/transitions.mjs";
const corpus = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases;
// Detached active encounter allows an independently checked reward/HP completion.
function state() {
  return structuredClone(
    corpus.find(
      // Select a captured active encounter with known live stats.
      (c) => c.id === "normal",
    ).state,
  );
}
// Intermediate nested requests coalesce into exactly one final validated snapshot.
test("outer transition saves completed HP and rewards exactly once", () => {
  const live = state();
  const saved = [];
  const t = createTransitions({
    capture:
      // Capture current owner state only at the completed outer boundary.
      () => live,
    commitSnapshot:
      // Independent sink records exactly what persistence was asked to save.
      (candidate) => {
        saved.push(structuredClone(candidate));
        return { status: "saved", revision: 1 };
      },
  });
  const result = t.run(
    // Simulate attack followed by nested reward resolution.
    () => {
      live.enemy.stats.hp = 0;
      t.requestSave();
      assert.equal(saved.length, 0);
      t.run(
        // Resolve victory before committing the previously interrupted tuple.
        () => {
          live.player.gold += 108;
          t.requestSave();
          live.player.inCombat = false;
        },
      );
      assert.equal(saved.length, 0);
      return "victory";
    },
  );
  assert.equal(result.value, "victory");
  assert.equal(result.persistence.status, "saved");
  assert.equal(saved.length, 1);
  assert.equal(saved[0].player.gold, 108);
  assert.equal(saved[0].enemy.stats.hp, 0);
  assert.equal(saved[0].player.inCombat, false);
});
// Even a caught nested failure poisons its containing operation, not the next operation.
test("failed transitions cannot persist partial state or leak pending requests", () => {
  const live = state();
  let commits = 0;
  const t = createTransitions({
    capture: /* Return engine-owned state for detached validation. */ () =>
      live,
    commitSnapshot: /* Record or fail attempted durable persistence. */ () => {
      commits++;
      return { status: "saved" };
    },
  });
  assert.throws(
    /* Invoke the boundary so the caller observes its synchronous error. */
    () =>
      t.run(
        // Model a rule exception after a mid-rule save request.
        () => {
          t.requestSave();
          throw new Error("rule failed");
        },
      ),
    /rule failed/,
  );
  assert.equal(commits, 0);
  const result = t.run(
    // A caller catching a nested exception must not rehabilitate partial mutations.
    () => {
      try {
        t.run(
          /* Raise a nested rule failure after requesting persistence. */ () => {
            t.requestSave();
            throw new Error("nested");
          },
        );
      } catch {
        /* Deliberately handled by the simulated rule. */
      }
      t.requestSave();
    },
  );
  assert.equal(result.persistence.status, "unsaved");
  assert.equal(commits, 0);
  t.run(/* Complete a rule that does not request persistence. */ () => {});
  assert.equal(commits, 0);
  t.run(/* Queue a completed-operation save. */ () => t.requestSave());
  assert.equal(commits, 1);
});
// Validation and persistence failures remain visible without an accidental outside save.
test("invalid final tuples, capture errors, unsaved/conflict results and async rejection", () => {
  const live = state();
  let commits = 0;
  const t = createTransitions({
    capture: /* Return engine-owned state for detached validation. */ () =>
      live,
    commitSnapshot: /* Record or fail attempted durable persistence. */ () => {
      commits++;
      return { status: "conflict" };
    },
  });
  assert.equal(t.requestSave().status, "unsaved");
  assert.equal(commits, 0);
  live.enemy.stats.hp = 0;
  const invalid = t.run(
    /* Queue a completed-operation save. */ () => t.requestSave(),
  );
  assert.equal(invalid.persistence.status, "unsaved");
  assert.equal(commits, 0);
  live.enemy.stats.hp = 1;
  assert.equal(
    t.run(/* Queue a completed-operation save. */ () => t.requestSave())
      .persistence.status,
    "conflict",
  );
  assert.equal(commits, 1);
  const broken = createTransitions({
    capture: /* Simulate a failed engine-state boundary. */ () => {
      throw new Error("private data");
    },
    commitSnapshot: /* Record or fail attempted durable persistence. */ () => {
      throw new Error("must not run");
    },
  });
  const failure = broken.run(
    /* Exercise failed state capture after a save request. */ () =>
      broken.requestSave(),
  );
  assert.equal(failure.persistence.status, "unsaved");
  assert.equal(JSON.stringify(failure).includes("private data"), false);
  assert.throws(
    /* Invoke the boundary so the caller observes its synchronous error. */
    () =>
      t.run(
        /* Unsupported async rules must fail before running. */ async () => {
          t.requestSave();
        },
      ),
    /synchronous/,
  );
  assert.equal(commits, 1);
});
// Rejecting a nested asynchronous rule must poison its outer transaction even if caught.
test("caught unsupported asynchronous nested rule cannot rehabilitate outer save", () => {
  let commits = 0;
  const t = createTransitions({
    // Supply a valid tuple so only failed-transition tracking determines the result.
    capture: () => state(),
    // Count attempted durable commits independently of the transition implementation.
    commitSnapshot: () => {
      commits++;
      return { status: "saved" };
    },
  });
  const result = t.run(
    // Simulate a caller attempting to save after handling an unsupported operation.
    () => {
      try {
        t.run(
          // Async work is intentionally outside the synchronous engine contract.
          async () => {},
        );
      } catch {
        /* The outer operation must remain poisoned. */
      }
      t.requestSave();
    },
  );
  assert.equal(result.persistence.status, "unsaved");
  assert.equal(commits, 0);
});
// A mistakenly returned rejected Promise is reported as unsupported without an unhandled rejection.
test("returned promises never save or leak unhandled rejections", async () => {
  let commits = 0;
  const t = createTransitions({
    // An unused capture guards against any asynchronous persistence attempt.
    capture: () => state(),
    // Record unexpected persistence after rejecting a promise-returning operation.
    commitSnapshot: () => {
      commits++;
      return { status: "saved" };
    },
  });
  assert.throws(
    // Return an already rejected promise from a non-async callback.
    () =>
      t.run(
        // This emulates an accidental async dependency in a synchronous rule.
        () => Promise.reject(new Error("unsupported async work")),
      ),
    /synchronous/,
  );
  await new Promise(
    // Drain one event-loop turn so node:test can detect leaked rejections.
    (resolve) => setImmediate(resolve),
  );
  assert.equal(commits, 0);
});
