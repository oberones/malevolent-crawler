import test from "node:test";
import assert from "node:assert/strict";
import { createFakeAudio } from "../helpers/fake-audio.mjs";
// Battle entry pauses exploration music and permits later replay without unloading it.
test("audio pause retains the sound for later exploration", () => {
  const audio = createFakeAudio();
  const sound = audio.create();
  sound.play();
  assert.equal(typeof sound.pause, "function");
  sound.pause();
  assert.equal(sound.playing, false);
  assert.equal(sound.unloads, 0);
  sound.play();
  assert.equal(sound.plays, 2);
  audio.dispose();
});
