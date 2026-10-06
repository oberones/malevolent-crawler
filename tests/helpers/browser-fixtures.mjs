import { createRandomTape } from "./random-tape.mjs";

/**
 * Own a functional-test browser context with synthetic storage and optional RNG tape.
 * External requests are aborted; this fixture must not be used for performance runs.
 * @param {import('@playwright/test').Browser} browser Browser supplied by Playwright.
 * @param {object} [options] storage strings, optional randomTape and viewport.
 * @returns {Promise<object>} Isolated context, page and idempotent async dispose().
 * @throws {Error} On invalid draws, context setup failure or browser launch failure.
 */
export async function createLegacyBrowserFixture(
  browser,
  { storage = {}, randomTape, viewport = { width: 1440, height: 900 } } = {},
) {
  if (randomTape !== undefined) createRandomTape(randomTape);
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    serviceWorkers: "block",
  });
  let disposed = false;
  // Context ownership ensures listeners, routes, timers and storage die together.
  async function dispose() {
    if (!disposed) {
      disposed = true;
      await context.close();
    }
  }
  try {
    await context.route(
      "**/*",
      // Keep functional tests offline while permitting their loopback fixture server.
      (route) => {
        const url = new URL(route.request().url());
        return ["127.0.0.1", "localhost"].includes(url.hostname)
          ? route.continue()
          : route.abort();
      },
    );
    await context.addInitScript(
      // Pass fixture data through Playwright's serialization, never source interpolation.
      ({ storage, randomTape }) => {
        if (!["127.0.0.1", "localhost"].includes(globalThis.location.hostname))
          return;
        for (const [key, value] of Object.entries(storage))
          globalThis.localStorage.setItem(key, value);
        if (randomTape !== undefined) {
          const calls = [];
          globalThis.__legacyRandomCalls = calls;
          // Exhaustion detects unintended extra draws in actual browser code.
          Math.random = () => {
            if (calls.length >= randomTape.length)
              throw new Error("Random tape exhausted");
            const value = randomTape[calls.length];
            calls.push(value);
            return value;
          };
        }
      },
      { storage, randomTape },
    );
    return { context, page: await context.newPage(), dispose };
  } catch (error) {
    await dispose();
    throw error;
  }
}
