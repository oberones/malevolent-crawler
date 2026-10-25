/* global document, AudioContext */
import { test, expect } from "@playwright/test";

// Distinguish a missing browser audio backend from failures in the app or decoder.
test("native audio output advances its clock after a user gesture", async ({
  page,
}) => {
  await page.setContent('<button type="button">Start audio probe</button>');
  await page.evaluate(
    // Use the real Web Audio destination with silent samples, never a mocked context.
    () => {
      const probe = { context: null, source: null, error: null };
      globalThis.__audioOutputProbe = probe;
      document.querySelector("button").addEventListener(
        "click",
        // AudioContext creation and resume belong to the trusted button gesture.
        async () => {
          try {
            probe.context = new AudioContext();
            probe.source = probe.context.createConstantSource();
            const gain = probe.context.createGain();
            gain.gain.value = 0;
            probe.source.connect(gain).connect(probe.context.destination);
            probe.source.start();
            await probe.context.resume();
          } catch (error) {
            probe.error = error.message;
          }
        },
        { once: true },
      );
    },
  );
  try {
    await page.getByRole("button", { name: "Start audio probe" }).click();
    await expect
      .poll(
        // A running context with an advancing device clock proves output is available.
        () =>
          page.evaluate(
            // Return diagnostic state so a missing Linux output has an actionable failure.
            () => {
              const probe = globalThis.__audioOutputProbe;
              return {
                state: probe.context?.state ?? "unavailable",
                advanced: (probe.context?.currentTime ?? 0) > 0.1,
                error: probe.error,
              };
            },
          ),
        {
          message:
            "Browser audio output must run; Linux CI needs its PulseAudio null sink.",
        },
      )
      .toEqual({ state: "running", advanced: true, error: null });
  } finally {
    await page.evaluate(
      // Release the native source and device even when the environment probe fails.
      async () => {
        const probe = globalThis.__audioOutputProbe;
        probe.source?.stop();
        if (probe.context && probe.context.state !== "closed")
          await probe.context.close();
        delete globalThis.__audioOutputProbe;
      },
    );
  }
});
