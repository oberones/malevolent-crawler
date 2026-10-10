import { test } from "node:test";
import assert from "node:assert/strict";
import { createLifecycle } from "../../assets/js/app/lifecycle.mjs";
import { createFakeClock } from "../helpers/fake-clock.mjs";
// Manually retained callbacks reproduce callbacks already queued during teardown.
test("generation invalidation cancels timers and makes retained callbacks inert", () => {
  const clock = createFakeClock();
  const owner = createLifecycle({ clock });
  let count = 0;
  const guarded = owner.guard(
    // This represents a stale attack with observable damage.
    () => {
      count++;
    },
  );
  owner.timeout(guarded, 10);
  owner.interval(guarded, 20);
  assert.equal(clock.pending(), 2);
  clock.advance(10);
  assert.equal(count, 1);
  assert.equal(owner.pending(), 1);
  owner.invalidate();
  guarded();
  clock.advance(100);
  assert.equal(count, 1);
  assert.equal(clock.pending(), 0);
  assert.equal(owner.pending(), 0);
  owner.timeout(
    // A new generation remains usable after encounter teardown.
    () => {
      count++;
    },
    1,
  );
  clock.advance(1);
  assert.equal(count, 2);
  owner.dispose();
  assert.throws(
    /* Attempt resurrection after final disposal. */ () =>
      owner.timeout(guarded, 1),
    /disposed/,
  );
});
// Repeated setup/teardown cannot accumulate listeners, audio or timer ownership.
test("listeners and audio dispose once; individual releases clean ownership", () => {
  const clock = createFakeClock();
  const owner = createLifecycle({ clock });
  const target = new EventTarget();
  let calls = 0,
    stops = 0,
    unloads = 0;
  for (let i = 0; i < 3; i++) {
    owner.listen(
      target,
      "ping",
      // Count one currently owned listener per event.
      () => {
        calls++;
      },
    );
    owner.ownAudio({
      // Teardown must stop playback before freeing the instance.
      stop() {
        stops++;
      },
      // Unloading releases browser/audio resources.
      unload() {
        unloads++;
      },
    });
    target.dispatchEvent(new Event("ping"));
    owner.invalidate();
    target.dispatchEvent(new Event("ping"));
  }
  assert.equal(calls, 3);
  assert.equal(stops, 3);
  assert.equal(unloads, 3);
  const release = owner.listen(
    target,
    "ping",
    /* Observe a separately releasable listener. */ () => {
      calls++;
    },
  );
  assert.equal(owner.pending(), 1);
  release();
  release();
  assert.equal(owner.pending(), 0);
  owner.dispose();
  owner.dispose();
  assert.equal(stops, 3);
});
// A failed disposer cannot prevent other resources or audio unload from being released.
test("cleanup failures are reported after all resources are attempted", () => {
  const owner = createLifecycle({ clock: createFakeClock() });
  let unloaded = 0,
    stopped = 0;
  owner.ownAudio({
    // Simulate a failing retained audio handle without exposing host exception text.
    stop() {
      throw new Error("private detail");
    },
    // Still free the failing audio resource.
    unload() {
      unloaded++;
    },
  });
  owner.ownAudio({
    // A different handle still receives cleanup after the first failure.
    stop() {
      stopped++;
    },
    // Count final release for both resources.
    unload() {
      unloaded++;
    },
  });
  const issues = owner.dispose();
  assert.equal(stopped, 1);
  assert.equal(unloaded, 2);
  assert.equal(issues.length, 1);
  assert.equal(JSON.stringify(issues).includes("private detail"), false);
});
// UI owners can attach restoration work to the same encounter/application teardown.
test("consumer cleanup runs exactly once on invalidation or explicit release", () => {
  const owner = createLifecycle({ clock: createFakeClock() });
  let restored = 0;
  const release = owner.ownCleanup(
    // Restore a resource such as modal inert/focus state.
    () => {
      restored++;
    },
  );
  owner.invalidate();
  release();
  assert.equal(restored, 1);
  assert.equal(owner.pending(), 0);
});
