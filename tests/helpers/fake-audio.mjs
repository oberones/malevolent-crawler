/**
 * Provide Howl-shaped local audio instances without playback or network I/O.
 * @returns {object} create(options), instances and idempotent dispose().
 */
export function createFakeAudio() {
  const instances = [];
  let disposed = false;
  return {
    instances,
    // Each sound owns counters and is unusable once unloaded.
    create(options = {}) {
      if (disposed) throw new Error("Audio adapter disposed");
      const sound = {
        options: structuredClone(options),
        plays: 0,
        stops: 0,
        unloads: 0,
        playing: false,
        // Count starts even when a caller starts an already-playing sound.
        play() {
          if (sound.unloads) throw new Error("Sound disposed");
          sound.plays++;
          sound.playing = true;
          return sound.plays;
        },
        // Stopping releases playback but permits later replay until disposal.
        stop() {
          sound.stops++;
          sound.playing = false;
        },
        // Pause exploration music without disposing the reusable sound instance.
        pause() {
          sound.playing = false;
        },
        // Unloading is idempotent and makes retained sound references inert.
        unload() {
          if (!sound.unloads) {
            sound.stop();
            sound.unloads = 1;
          }
        },
        // Preserve the configured gain for volume-setting characterization.
        volume(value) {
          if (value !== undefined) sound.options.volume = value;
          return sound.options.volume;
        },
      };
      instances.push(sound);
      return sound;
    },
    // Dispose all owned sounds, including stopped sounds.
    dispose() {
      for (const sound of instances) sound.unload();
      disposed = true;
    },
  };
}
