/* global document, requestAnimationFrame, getComputedStyle, innerWidth, innerHeight, devicePixelRatio,
   player, enemy, generateRandomEnemy, engageBattle, specialBossBattle,
   mimicBattle, Howler, openInventory */
import { test, expect } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import {
  sha256,
  TRANSFORM_HASH,
  validateRun,
} from "../helpers/performance-fixture.mjs";
import { compareReports, writeReport } from "../helpers/performance-report.mjs";

// Load committed synthetic inputs without executing fixture content.
async function fixture(name) {
  return JSON.parse(
    await readFile(new URL(`../fixtures/legacy/${name}.json`, import.meta.url)),
  );
}
const saves = await fixture("saves");
const encounters = await fixture("encounters");
const baselineManifest = await fixture("baseline");
const resting = saves.cases.find(
  // One immutable resting tuple is shared across all measured actions.
  (row) => row.id === "resting",
).state;
const workloads = [
  ["normal", "Balanced/normal/0/0"],
  ["special-boss", "Offensive/sboss/0/0"],
  ["largest-spider-dragon", "Quick/sboss/0/0"],
  ["variant-1", "Offensive/normal/13/0"],
  ["variant-2", "Offensive/normal/13/0.99"],
  ["chest-mimic", "Offensive/chest"],
  ["door-mimic", "Offensive/door"],
].map(
  // Stable oracle IDs retain generation draw order and expected image variants.
  ([id, oracleId]) => ({
    id,
    oracle: encounters.cases.find(
      // Fail rather than replacing an absent protected oracle with generated expectations.
      (row) => row.id === oracleId,
    ),
  }),
);
const widths = [1440, 360];

/**
 * Wait for visible, enabled controls with a browser-clock endpoint (no fake clocks).
 * @param {import('@playwright/test').Page} page Measured page.
 * @param {string} selector Shared baseline/candidate control selector.
 * @returns {Promise<number>} Milliseconds since navigation start.
 */
async function usableAt(page, selector) {
  const handle = await page.waitForFunction(
    // A visible control underneath the loader is not usable yet.
    (selector) => {
      const node = document.querySelector(selector);
      if (!node || node.disabled) return false;
      const rect = node.getBoundingClientRect();
      if (
        !rect.width ||
        !rect.height ||
        getComputedStyle(node).visibility === "hidden"
      )
        return false;
      const x = Math.min(innerWidth - 1, Math.max(0, rect.x + rect.width / 2));
      const y = Math.min(
        innerHeight - 1,
        Math.max(0, rect.y + rect.height / 2),
      );
      const hit = document.elementFromPoint(x, y);
      if (!hit || !(node === hit || node.contains(hit))) return false;
      return performance.now();
    },
    selector,
    { polling: "raf" },
  );
  const value = await handle.jsonValue();
  await handle.dispose();
  return value;
}
// A fresh context is the cold-cache boundary; a reused context/page preserves warm cache.
async function createSession(browser, width, state) {
  const context = await browser.newContext({
    viewport: { width, height: width === 360 ? 800 : 900 },
    deviceScaleFactor: 1,
    serviceWorkers: "block",
    locale: "en-US",
    timezoneId: "America/New_York",
  });
  await context.addInitScript(
    // Reset only synthetic storage on navigation, leaving the browser HTTP cache intact.
    ({ state }) => {
      localStorage.clear();
      if (state)
        for (const key of ["player", "dungeon", "enemy"])
          localStorage.setItem(`${key}Data`, JSON.stringify(state[key]));
      localStorage.setItem(
        "volumeData",
        JSON.stringify({ master: 0, bgm: 0, sfx: 0 }),
      );
    },
    { state },
  );
  const page = await context.newPage();
  const errors = [];
  page.on(
    "pageerror",
    // Preserve errors as invalid-run evidence rather than suppressing them.
    (error) => errors.push(error.message),
  );
  page.on(
    "request",
    // Detect accidental external dependencies without routing or altering browser caching.
    (request) => {
      if (!new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))
        errors.push(`External request: ${request.url()}`);
    },
  );
  return { context, page, errors };
}
// Navigate and measure the same actual title click and dungeon control in both revisions.
async function enter(session, baseURL) {
  const { page } = session;
  await page.goto(baseURL, { waitUntil: "load" });
  const titleMs = await usableAt(page, "#title-screen");
  await page.evaluate(
    // Mute real audio without substituting a faster audio implementation.
    () => Howler.mute(true),
  );
  await page.locator("#title-screen").evaluate(
    // Start timing at the dispatched action, including synchronous listener work.
    (node) => {
      globalThis.__perfTitleStart = performance.now();
      node.click();
    },
  );
  const ready = await usableAt(page, "#dungeonActivity");
  const start = await page.evaluate(
    // Read the actual browser timestamp recorded at title activation.
    () => globalThis.__perfTitleStart,
  );
  return { titleMs, dungeonMs: ready - start };
}
// Measure the real encounter action through successful decoding and a subsequent rendered frame.
async function encounterSample(session, workload) {
  const { page } = session;
  const expectedPath = `assets/sprites/${workload.oracle.expected.enemy.image.name}.png`;
  await page.evaluate(
    // Replay only trusted fixture data through explicit classic-script entry points.
    ({ tape, condition, expectedName }) => {
      let index = 0;
      const original = Math.random;
      // Exhaustion exposes unexpected gameplay draws without affecting elapsed clocks.
      Math.random = () => {
        if (index >= tape.length)
          throw new Error("Performance RNG tape exhausted");
        return tape[index++];
      };
      globalThis.__perfArtStart = performance.now();
      try {
        if (condition === "sboss") specialBossBattle();
        else if (condition === "chest" || condition === "door")
          mimicBattle(condition);
        else {
          generateRandomEnemy();
          engageBattle();
        }
        if (index !== tape.length || enemy.name !== expectedName)
          throw new Error("Encounter oracle identity/RNG mismatch");
      } finally {
        Math.random = original;
      }
    },
    {
      tape: workload.oracle.tape,
      condition: workload.oracle.operations[0].args?.[0],
      expectedName: workload.oracle.expected.enemy.name,
    },
  );
  await expect(page.locator("#enemy-sprite")).toBeVisible();
  return page.locator("#enemy-sprite").evaluate(
    // Reject fallback, zero-size, hidden, undecoded or wrong-identity portrait endpoints.
    async (image, expectedPath) => {
      await image.decode();
      await new Promise(
        // Two frames allow the decoded image to reach a rendered frame before stopping.
        (resolve) =>
          requestAnimationFrame(
            // The first callback precedes paint; sample on the following frame.
            () => requestAnimationFrame(resolve),
          ),
      );
      const rect = image.getBoundingClientRect();
      const actualPath = new URL(image.currentSrc).pathname.replace(/^\//, "");
      const resource = performance.getEntriesByName(image.currentSrc).at(-1);
      const combat = document.querySelector("#combatPanel");
      return {
        durationMs: performance.now() - globalThis.__perfArtStart,
        decoded: image.naturalWidth > 0 && image.naturalHeight > 0,
        rendered:
          rect.width > 0 &&
          rect.height > 0 &&
          getComputedStyle(image).visibility !== "hidden",
        controlsUsable:
          player.inCombat &&
          getComputedStyle(combat).display !== "none" &&
          Boolean(document.querySelector("#player-hp-battle")),
        actualPath,
        expectedPath,
        cacheHit: Boolean(
          resource &&
          resource.transferSize === 0 &&
          resource.decodedBodySize > 0,
        ),
        resource: resource
          ? {
              transferSize: resource.transferSize,
              encodedBodySize: resource.encodedBodySize,
              decodedBodySize: resource.decodedBodySize,
              duration: resource.duration,
            }
          : null,
        dpr: devicePixelRatio,
      };
    },
    expectedPath,
  );
}
// One worker owns every sample and writes evidence only after complete validation.
test("matched load and decoded-art performance", async ({
  browser,
}, testInfo) => {
  test.setTimeout(600_000);
  const stage = process.env.PERF_STAGE;
  const baseURL = process.env.BASE_URL;
  if (!["baseline", "candidate"].includes(stage))
    throw new Error("PERF_STAGE must be baseline or candidate");
  if (
    !baseURL ||
    !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(baseURL)
  )
    throw new Error("BASE_URL must name the prepared loopback server root");
  const metadata = await (
    await fetch(new URL("performance-source.json", baseURL))
  ).json();
  const expectedRevision =
    stage === "baseline"
      ? baselineManifest.revision
      : process.env.PERF_REVISION;
  validateRun({
    stage,
    baseURL,
    expectedRevision,
    metadata,
    transformHash: TRANSFORM_HASH,
  });
  expect(sha256(await (await fetch(baseURL)).text())).toBe(
    metadata.servedIndexHash,
  );
  // Recheck each served runtime byte before accepting revision-labelled measurements.
  for (const entry of metadata.files) {
    const bytes = Buffer.from(
      await (await fetch(new URL(entry.path, `${baseURL}/`))).arrayBuffer(),
    );
    expect(sha256(bytes)).toBe(
      entry.path === "index.html" ? metadata.servedIndexHash : entry.sha256,
    );
    if (stage === "baseline")
      expect(
        baselineManifest.files.find(
          // The served manifest alone cannot attest to its own baseline identity.
          (original) => original.path === entry.path,
        )?.sha256,
      ).toBe(entry.sha256);
  }
  const outputRoot = "validation/cosmic-horror/performance";
  await mkdir(outputRoot, { recursive: true });
  const output = join(
    outputRoot,
    stage === "baseline"
      ? "baseline.json"
      : `candidate-${metadata.sourceHash.slice(0, 12)}.json`,
  );
  // Exclusive output is checked before spending time collecting any repeat run.
  try {
    await readFile(output);
    throw new Error(`Evidence already exists: ${output}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const match = {
    browser: browser.version(),
    executable: browser.browserType().executablePath(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpu: os.cpus()[0].model,
    memory: os.totalmem(),
    power: execFileSync("pmset", ["-g", "custom"], { encoding: "utf8" }),
    transformHash: TRANSFORM_HASH,
    fixtureHash: sha256(JSON.stringify({ resting, workloads })),
    font: "Arial/Helvetica/sans-serif title; existing local fonts elsewhere",
    network: "localhost, no CPU/network throttling, no request/HAR routing",
    server: "http-server 14.1.1 -a 127.0.0.1 -p 4174 -c3600 --silent",
    dpr: 1,
    audio: "real Howler; master/bgm/sfx=0",
    viewports: [
      { width: 1440, height: 900 },
      { width: 360, height: 800 },
    ],
  };
  const rows = [];
  const diagnostics = [];
  const invalidRuns = [];
  // Register stable keys before collection so missing work cannot disappear from validation.
  const requiredKeys = [];
  for (const width of widths) {
    requiredKeys.push(`${width}/first-visit/cold`);
    for (const cache of ["cold", "warm"]) {
      requiredKeys.push(
        `${width}/resting-return/${cache}`,
        `${width}/title-to-dungeon/${cache}`,
      );
      for (const { id } of workloads)
        requiredKeys.push(`${width}/${id}/${cache}`);
    }
  }
  try {
    for (const width of widths) {
      const fresh = {
        key: `${width}/first-visit/cold`,
        kind: "entry",
        cache: "cold",
        samples: [],
      };
      rows.push(fresh);
      for (let i = 0; i < 5; i++) {
        const session = await createSession(browser, width, null);
        try {
          await session.page.goto(baseURL, { waitUntil: "load" });
          const durationMs = await usableAt(session.page, "#name-input");
          await expect(
            session.page.locator("#name-submit button"),
          ).toBeEnabled();
          fresh.samples.push({
            durationMs,
            controlsUsable: true,
            errors: session.errors,
          });
          expect(session.errors).toEqual([]);
        } finally {
          await session.context.close();
        }
      }
      for (const cache of ["cold", "warm"]) {
        const titleRow = {
          key: `${width}/resting-return/${cache}`,
          kind: "entry",
          cache,
          samples: [],
        };
        const dungeonRow = {
          key: `${width}/title-to-dungeon/${cache}`,
          kind: "entry",
          cache,
          samples: [],
        };
        rows.push(titleRow, dungeonRow);
        const warm =
          cache === "warm"
            ? await createSession(browser, width, resting)
            : null;
        try {
          if (warm) await enter(warm, baseURL);
          for (let i = 0; i < 5; i++) {
            const session =
              warm ?? (await createSession(browser, width, resting));
            try {
              const timing = await enter(session, baseURL);
              const cacheProof = await session.page.evaluate(
                // Local CSS resource timing demonstrates enabled warm HTTP caching.
                () => {
                  const r = performance.getEntriesByType("resource").find(
                    // Match a resource present on every initial screen.
                    (r) => r.name.endsWith("/assets/css/style.css"),
                  );
                  return {
                    cacheHit: Boolean(
                      r && r.transferSize === 0 && r.decodedBodySize > 0,
                    ),
                    transferSize: r?.transferSize,
                    decodedBodySize: r?.decodedBodySize,
                  };
                },
              );
              titleRow.samples.push({
                durationMs: timing.titleMs,
                controlsUsable: true,
                ...cacheProof,
              });
              dungeonRow.samples.push({
                durationMs: timing.dungeonMs,
                controlsUsable: true,
                ...cacheProof,
              });
              expect(session.errors).toEqual([]);
            } finally {
              if (!warm) await session.context.close();
            }
          }
        } finally {
          if (warm) await warm.context.close();
        }
        for (const workload of workloads) {
          const row = {
            key: `${width}/${workload.id}/${cache}`,
            kind: "art",
            cache,
            expectedPath: `assets/sprites/${workload.oracle.expected.enemy.image.name}.png`,
            oracleId: workload.oracle.id,
            samples: [],
          };
          rows.push(row);
          const warm =
            cache === "warm"
              ? await createSession(browser, width, resting)
              : null;
          try {
            if (warm) {
              await enter(warm, baseURL);
              await encounterSample(warm, workload);
            }
            for (let i = 0; i < 5; i++) {
              const session =
                warm ?? (await createSession(browser, width, resting));
              try {
                await enter(session, baseURL);
                row.samples.push(await encounterSample(session, workload));
                expect(session.errors).toEqual([]);
              } finally {
                if (!warm) await session.context.close();
              }
            }
          } finally {
            if (warm) await warm.context.close();
          }
        }
      }
      const full = structuredClone(
        saves.cases.find(
          // The existing duplicate-item fixture supplies six equipped objects.
          (row) => row.id === "full-duplicate-equipment",
        ).state,
      );
      full.player.name =
        "Mariner of the Drowned Observatory With a Very Long Remembered Name";
      const session = await createSession(browser, width, full);
      try {
        await enter(session, baseURL);
        const start = await session.page.evaluate(
          // Exercise the real inventory entry, including six-item rendering and long text.
          () => {
            const start = performance.now();
            openInventory();
            return start;
          },
        );
        await expect(session.page.locator("#inventory")).toBeVisible();
        const diagnostic = await session.page.evaluate(
          // Record overflow honestly; this diagnostic is not an accessibility acceptance gate.
          (start) => ({
            durationMs: performance.now() - start,
            equipped: player.equipped.length,
            scrollWidth: document.documentElement.scrollWidth,
            viewportWidth: innerWidth,
          }),
          start,
        );
        const screenshot = `inventory-${width}.png`;
        await session.page.screenshot({
          path: testInfo.outputPath(screenshot),
          fullPage: true,
        });
        diagnostics.push({
          width,
          ...diagnostic,
          screenshot: testInfo.outputPath(screenshot),
        });
      } finally {
        await session.context.close();
      }
    }
    const report = {
      schemaVersion: 1,
      stage,
      revision: expectedRevision,
      recordedAt: new Date().toISOString(),
      testRevision: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      match,
      source: metadata,
      requiredKeys,
      rows,
      diagnostics,
      invalidRuns,
    };
    if (stage === "candidate") {
      const baseline = JSON.parse(
        await readFile(join(outputRoot, "baseline.json")),
      );
      report.comparisons = compareReports(baseline, report);
    }
    await writeReport(output, report);
    if (report.comparisons)
      expect(
        report.comparisons.every(
          // Every required timing budget must pass independently.
          (row) => row.pass,
        ),
      ).toBe(true);
  } catch (error) {
    invalidRuns.push({
      reason: error.message,
      recordedAt: new Date().toISOString(),
    });
    await writeFile(
      testInfo.outputPath("invalid-run.json"),
      JSON.stringify({ stage, match, rows, diagnostics, invalidRuns }, null, 2),
    );
    throw error;
  }
});
