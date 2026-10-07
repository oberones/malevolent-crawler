/* global document */
import { test, expect } from "@playwright/test";
const portrait = { kind: "encounter", identity: "Goblin", variant: "goblin" };
const symbol = { kind: "symbol", role: "Sword", contextId: "sword/detail" };
const valid = "tests/fixtures/art/valid.png";

// Install a real reserved DOM box and an independent controllable decode boundary.
async function setup(page, { controlled = false } = {}) {
  await page.goto("/tests/fixtures/services.html");
  await page.evaluate(
    // Keep test-only layout outside the production loader's responsibilities.
    async (controlled) => {
      document.querySelector("#output").innerHTML =
        '<div style="position:relative;width:120px;height:80px"><img id="art" width="120" height="80" style="width:120px;height:80px;object-fit:contain"><span id="terminal" hidden style="position:absolute;inset:0">◇</span></div><button id="action">Act</button><output id="count">0</output>';
      const image = document.querySelector("#art");
      const active = new Map();
      const add = image.addEventListener.bind(image);
      const remove = image.removeEventListener.bind(image);
      // Track the exact listener identities so repeated setup cannot leak handlers.
      image.addEventListener = (type, handler, options) => {
        if (["load", "error"].includes(type)) active.set(handler, type);
        add(type, handler, options);
      };
      // Track removals independently of any production lifecycle counters.
      image.removeEventListener = (type, handler, options) => {
        active.delete(handler);
        remove(type, handler, options);
      };
      globalThis.probe = { active, decodes: [], image };
      if (controlled) {
        // Resolve/reject decode explicitly to test out-of-order completion without sleeps.
        image.decode = () =>
          new Promise(
            // Expose each independent pending decode to the test driver.
            (resolve, reject) =>
              globalThis.probe.decodes.push({ resolve, reject }),
          );
      }
      document.querySelector("#action").onclick =
        // This unrelated control must remain usable through every loader state.
        () => document.querySelector("#count").textContent++;
      const { createImageLoader } =
        await import("/assets/js/app/image-loader.mjs");
      globalThis.probe.create = createImageLoader;
      globalThis.probe.loader = createImageLoader(
        image,
        document.querySelector("#terminal"),
      );
    },
    controlled,
  );
}
// Dispatch only catalog identity references, never test fixture URLs to the loader.
async function load(page, reference = portrait, options = {}) {
  await page.evaluate(
    // Invoke the same public interface that T104 consumers will use.
    ({ reference, options }) =>
      globalThis.probe.loader.load(reference, options),
    { reference, options },
  );
}
// Compare exact consumer geometry and adjacent controls through asynchronous states.
async function geometry(page) {
  return page.locator("#art").boundingBox();
}
// Observe settled request state without timing-dependent sleeps.
async function state(page, value) {
  await expect(page.locator("#art")).toHaveAttribute("data-image-state", value);
}
// Release one controlled decode independently of the implementation state machine.
async function settle(page, index, reject = false) {
  await expect
    .poll(
      // Wait until the actual image load reached decode before releasing it.
      () =>
        page.evaluate(
          /* Observe the independently controlled decode queue. */ () =>
            globalThis.probe.decodes.length,
        ),
    )
    .toBeGreaterThan(index);
  await page.evaluate(
    // Trigger fulfillment or rejection for this exact generation.
    ({ index, reject }) => {
      const pending = globalThis.probe.decodes[index];
      if (reject) pending.reject(new Error("Fixture decode failure"));
      else pending.resolve();
    },
    { index, reject },
  );
}
// Delayed network data must not resize the slot or block actions; cached reloads must also finish.
test("loading, decoded success and cached reload preserve geometry and controls", async ({
  page,
}) => {
  let release;
  const gate = new Promise(
    /* Release only after the pending-state assertions and real click. */ (
      resolve,
    ) => {
      release = resolve;
    },
  );
  await page.route(
    "**/assets/sprites/goblin.png",
    // Hold the first response until the user action has completed.
    async (route) => {
      await gate;
      await route.fulfill({ path: valid });
    },
  );
  await setup(page);
  const box = await geometry(page);
  try {
    await load(page);
    await state(page, "loading");
    await page.locator("#action").click();
    await expect(page.locator("#count")).toHaveText("1");
    expect(await geometry(page)).toEqual(box);
  } finally {
    release();
  }
  await state(page, "ready");
  await expect(page.locator("#art")).toBeVisible();
  await expect(page.locator("#art")).toHaveAttribute("alt", /.+/);
  await expect(page.locator("#terminal")).toBeHidden();
  expect(await geometry(page)).toEqual(box);
  await load(page);
  await state(page, "ready");
  expect(await geometry(page)).toEqual(box);
});
for (const failure of ["missing", "corrupt"]) {
  // Native image events, not a stub state, exercise each transport/decode failure.
  test(`${failure} image uses one decoded fallback in the reserved box`, async ({
    page,
  }) => {
    let fallbacks = 0;
    await page.route(
      "**/assets/sprites/goblin.png",
      // Supply a real HTTP failure or bytes that cannot decode as a PNG.
      (route) =>
        route.fulfill(
          failure === "missing"
            ? { status: 404, body: "missing" }
            : { contentType: "image/png", body: "corrupt" },
        ),
    );
    await page.route(
      "**/assets/art/fallback.png",
      // The fixture's dimensions deliberately differ from the reserved slot.
      (route) => {
        fallbacks++;
        return route.fulfill({ path: valid });
      },
    );
    await setup(page);
    const box = await geometry(page);
    await load(page);
    await state(page, "fallback");
    await expect(page.locator("#art")).toHaveAttribute(
      "src",
      "/assets/art/fallback.png",
    );
    expect(fallbacks).toBe(1);
    expect(await geometry(page)).toEqual(box);
    await page.locator("#action").click();
    await expect(page.locator("#count")).toHaveText("1");
  });
}
// A successful HTTP response still requires decode; terminal fallback must not recurse.
test("decode rejection tries fallback once and falls back to accessible local text", async ({
  page,
}) => {
  await page.route(
    "**/assets/{sprites,art}/**",
    // Return valid bytes so only the controlled decode boundary causes failure.
    (route) => route.fulfill({ path: valid }),
  );
  await setup(page, { controlled: true });
  const box = await geometry(page);
  await load(page);
  await settle(page, 0, true);
  await settle(page, 1, true);
  await state(page, "text");
  await expect(page.locator("#terminal")).toBeVisible();
  await expect(page.locator("#terminal")).toHaveText("◇");
  await expect(page.locator("#terminal")).toHaveAttribute("aria-label", /.+/);
  await expect(page.locator("#art")).toHaveAttribute(
    "src",
    "/assets/art/fallback.png",
  );
  expect(await geometry(page)).toEqual(box);
  const listeners = await page.evaluate(
    // Settled terminal states own no image listeners or pending retry events.
    () => {
      globalThis.probe.image.dispatchEvent(new Event("error"));
      return globalThis.probe.active.size;
    },
  );
  expect(listeners).toBe(0);
  await state(page, "text");
});
// Two network failures terminate even when the local fallback cannot be downloaded.
test("unavailable fallback terminates without requests or lost decorative semantics", async ({
  page,
}) => {
  let requests = 0;
  await page.route(
    "**/assets/art/**",
    // Count all requests, so a retry loop cannot hide behind a final screenshot.
    (route) => {
      requests++;
      return route.abort();
    },
  );
  await setup(page);
  const box = await geometry(page);
  await load(page, symbol, { decorative: true });
  await state(page, "text");
  expect(requests).toBe(2);
  await expect(page.locator("#terminal")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await expect(page.locator("#terminal")).not.toHaveAttribute("aria-label");
  await expect(page.locator("#art")).toHaveAttribute("aria-hidden", "true");
  expect(await geometry(page)).toEqual(box);
});
for (const oldAttempt of ["primary", "fallback"])
  for (const reject of [false, true]) {
    // Old primary and fallback decode promises must not repaint a newer identity.
    test(`stale ${oldAttempt} ${reject ? "rejection" : "success"} cannot change the current identity`, async ({
      page,
    }) => {
      await page.route(
        "**/assets/{sprites,art}/**",
        // Isolate asynchronous decode ordering from actual asset availability.
        (route) => route.fulfill({ path: valid }),
      );
      await setup(page, { controlled: true });
      await load(page);
      const oldIndex = oldAttempt === "fallback" ? 1 : 0;
      if (oldIndex) await settle(page, 0, true);
      await expect
        .poll(
          // Ensure the selected old attempt is pending before changing identity.
          () =>
            page.evaluate(
              /* Observe the independently controlled decode queue. */ () =>
                globalThis.probe.decodes.length,
            ),
        )
        .toBe(oldIndex + 1);
      await load(page, symbol);
      await settle(page, oldIndex + 1);
      await state(page, "ready");
      const before = await page.locator("#output").innerHTML();
      await settle(page, oldIndex, reject);
      expect(await page.locator("#output").innerHTML()).toBe(before);
      await expect(page.locator("#art")).toHaveAttribute(
        "src",
        "/assets/art/relic-sword.png",
      );
    });
  }
// Disposal removes exact handlers and rejects later loads without changing the current presentation.
test("dispose invalidates pending decode and repeated setup leaves no listeners", async ({
  page,
}) => {
  await page.route(
    "**/assets/{sprites,art}/**",
    // Valid independent bytes allow each new loader to reach decode.
    (route) => route.fulfill({ path: valid }),
  );
  await setup(page, { controlled: true });
  await load(page);
  await expect
    .poll(
      // Wait for the actual pending promise before disposing its owner.
      () =>
        page.evaluate(
          /* Observe the independently controlled decode queue. */ () =>
            globalThis.probe.decodes.length,
        ),
    )
    .toBe(1);
  await page.evaluate(
    // Repeated disposal must be harmless.
    () => {
      globalThis.probe.loader.dispose();
      globalThis.probe.loader.dispose();
    },
  );
  const before = await page.locator("#output").innerHTML();
  await settle(page, 0, true);
  expect(await page.locator("#output").innerHTML()).toBe(before);
  const result = await page.evaluate(
    // Exercise repeated owners on the same slot and preserve the rejected stale owner.
    (reference) => {
      const { probe } = globalThis;
      let rejected = false;
      try {
        probe.loader.load(reference);
      } catch {
        rejected = true;
      }
      for (let i = 0; i < 5; i++) {
        const next = probe.create(
          probe.image,
          document.querySelector("#terminal"),
        );
        next.load(reference);
        next.dispose();
      }
      probe.image.dispatchEvent(new Event("load"));
      probe.image.dispatchEvent(new Event("error"));
      return { rejected, listeners: probe.active.size };
    },
    portrait,
  );
  expect(result).toEqual({ rejected: true, listeners: 0 });
});
// Catalog failures are validation errors, never fallback requests for untrusted paths.
test("unknown identities, mismatched variants, arbitrary URLs and invalid options are rejected atomically", async ({
  page,
}) => {
  await setup(page);
  const result = await page.evaluate(
    // Ensure bad input cannot change attributes, request paths, or fallback text.
    () => {
      const before = document.querySelector("#output").innerHTML;
      const invalid = [
        null,
        { kind: "url", path: "https://evil.invalid/x" },
        { kind: "encounter", identity: "Goblin", variant: "wolf" },
        { kind: "encounter", identity: "<img src=x>", variant: "goblin" },
        { kind: "symbol", role: "Sword", contextId: "axe/detail" },
        { kind: "symbol", role: "Sword" },
        {
          kind: "symbol",
          role: "https://evil.invalid/x",
          contextId: "sword/detail",
        },
      ];
      const rejected = invalid.map(
        // Check each input independently instead of relying on the first exception.
        (reference) => {
          try {
            globalThis.probe.loader.load(reference);
            return false;
          } catch {
            return true;
          }
        },
      );
      try {
        globalThis.probe.loader.load(
          { kind: "symbol", role: "Sword", contextId: "sword/detail" },
          { decorative: "yes" },
        );
        rejected.push(false);
      } catch {
        rejected.push(true);
      }
      return {
        rejected,
        unchanged: before === document.querySelector("#output").innerHTML,
      };
    },
  );
  expect(result).toEqual({ rejected: Array(8).fill(true), unchanged: true });
});

// Reusing one slot must restore both successful decorative art and informative alternatives.
test("a fresh load clears terminal state and restores current accessibility", async ({
  page,
}) => {
  let broken = true;
  await page.route(
    "**/assets/art/**",
    // First fail both attempts, then let a fresh load use independently valid bytes.
    (route) => (broken ? route.abort() : route.fulfill({ path: valid })),
  );
  await setup(page);
  await load(page, symbol, { decorative: true });
  await state(page, "text");
  broken = false;
  await load(page, symbol, { decorative: true });
  await state(page, "ready");
  await expect(page.locator("#art")).toHaveAttribute("alt", "");
  await expect(page.locator("#art")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#terminal")).toBeHidden();
  await load(page, symbol);
  await state(page, "ready");
  await expect(page.locator("#art")).not.toHaveAttribute("aria-hidden");
  await expect(page.locator("#art")).toHaveAttribute(
    "alt",
    "Tideglass Edge (Sword)",
  );
  await expect(page.locator("#terminal")).not.toHaveAttribute("aria-hidden");
});
