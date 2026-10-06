import test from "node:test";
import assert from "node:assert/strict";
import { createRandomTape } from "../helpers/random-tape.mjs";
import { createFakeClock } from "../helpers/fake-clock.mjs";
import { createFakeStorage } from "../helpers/fake-storage.mjs";
import { createFakeAudio } from "../helpers/fake-audio.mjs";

// Draws are recorded in order and exhaustion cannot silently change an oracle.
test("random tape records order, rejects invalid values, exhaustion and leftovers", () => {
  const input = [0.2, 0.9];
  const tape = createRandomTape(input);
  input[0] = 0.7;
  assert.equal(tape.random(), 0.2);
  assert.throws(tape.assertConsumed, /unconsumed/);
  assert.equal(tape.random(), 0.9);
  assert.deepEqual(tape.calls, [0.2, 0.9]);
  tape.assertConsumed();
  assert.throws(tape.random, /exhausted/);
  for (const value of [-1, 1, NaN])
    assert.throws(
      // Invalid tapes fail before a test can mistake them for valid Math.random draws.
      () => createRandomTape([value]),
      /random/,
    );
});
// Canceled timers must never run, including cancellation from their own callback.
test("clock orders same-time callbacks, repeats and cancels without wall time", () => {
  const clock = createFakeClock(100);
  const seen = [];
  const canceled = clock.setTimeout(
    // A canceled callback would contaminate the expected event order.
    () => seen.push("canceled"),
    5,
  );
  clock.clearTimeout(canceled);
  const interval = clock.setInterval(
    // Cancel from inside the interval to ensure its next occurrence is removed.
    () => {
      seen.push(clock.now());
      clock.clearInterval(interval);
    },
    10,
  );
  clock.setTimeout(
    // Same-time one-shot registration follows the earlier interval registration.
    () => seen.push("second"),
    10,
  );
  clock.advance(50);
  assert.deepEqual(seen, [110, "second"]);
  assert.equal(clock.now(), 150);
  assert.equal(clock.pending(), 0);
  clock.setTimeout(
    // Disposal must cancel even immediately due callbacks.
    () => seen.push("disposed"),
    0,
  );
  clock.dispose();
  clock.advance(1);
  assert.deepEqual(seen, [110, "second"]);
});
// Forwarded arguments and nested deadlines must not depend on host timers.
test("clock supports repeated ticks and callbacks scheduled by callbacks", () => {
  const clock = createFakeClock();
  const seen = [];
  const interval = clock.setInterval(
    // Count each period crossed by one explicit advance call.
    (label) => seen.push([label, clock.now()]),
    4,
    "tick",
  );
  clock.setTimeout(
    // Schedule a nested callback relative to the simulated firing time.
    () =>
      clock.setTimeout(
        // The nested deadline is exactly 6 ms, before the second interval tick.
        () => seen.push(["nested", clock.now()]),
        3,
      ),
    3,
  );
  clock.advance(9);
  clock.clearInterval(interval);
  assert.deepEqual(seen, [
    ["tick", 4],
    ["nested", 6],
    ["tick", 8],
  ]);
  assert.equal(clock.pending(), 0);
});
// Failed reads and writes remain distinguishable, and failure preserves old bytes.
test("storage injects key-specific read/write failures and retains exact strings", () => {
  const storage = createFakeStorage({ a: " old " });
  assert.equal(storage.getItem("a"), " old ");
  storage.fail("setItem", "a");
  assert.throws(
    // A denied write cannot replace even whitespace in the prior value.
    () => storage.setItem("a", "new"),
    /setItem/,
  );
  assert.equal(storage.entries().a, " old ");
  storage.fail("getItem", "a");
  assert.throws(
    // Read denial is a distinct operation and is consumed only once.
    () => storage.getItem("a"),
    /getItem/,
  );
  assert.equal(storage.getItem("a"), " old ");
  storage.setItem("b", 3);
  assert.equal(storage.getItem("b"), "3");
  assert.equal(storage.getItem("absent"), null);
});
// Each adapter owns its resources; disposal is idempotent and prevents reuse.
test("audio records playback and disposes every instance once", () => {
  const audio = createFakeAudio();
  const sound = audio.create({ src: ["local.wav"] });
  sound.play();
  sound.stop();
  assert.equal(audio.instances.length, 1);
  assert.equal(sound.plays, 1);
  assert.equal(sound.playing, false);
  audio.dispose();
  audio.dispose();
  assert.equal(sound.unloads, 1);
  assert.throws(sound.play, /disposed/);
  assert.throws(audio.create, /disposed/);
});
// No module-level storage, timer, draw or playback state can leak to another case.
test("dependency instances are isolated", () => {
  const first = createFakeStorage({ a: "first" });
  first.setItem("b", "private");
  assert.deepEqual(createFakeStorage().entries(), {});
  const clock = createFakeClock();
  clock.setTimeout(
    // The assertion concerns timer ownership, so the callback has no side effect.
    () => {},
    5,
  );
  assert.equal(clock.pending(), 1);
  assert.equal(createFakeClock().pending(), 0);
  assert.equal(createRandomTape([0.7]).random(), 0.7);
  assert.equal(createRandomTape([0.3]).random(), 0.3);
  assert.equal(createFakeAudio().instances.length, 0);
  clock.dispose();
});
