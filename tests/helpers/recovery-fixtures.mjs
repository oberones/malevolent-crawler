import { readFileSync } from "node:fs";
import { createLegacyBrowserFixture } from "./browser-fixtures.mjs";
export const SAVE = "malevolentCrawler.save.v1";
export const PREVIOUS = "malevolentCrawler.save.previous.v1";
export const resting = JSON.parse(
  readFileSync("tests/fixtures/legacy/saves.json"),
).cases.find(
  // Use a captured complete run for byte-preservation comparisons.
  (row) => row.id === "resting",
);
/** Build a complete supported envelope without mutating the frozen fixture. */
export function envelope(state = resting.state) {
  return JSON.stringify({
    format: "malevolent-crawler-save",
    version: 1,
    contentVersion: 1,
    revision: 1,
    savedAt: "2026-10-08T00:00:00.000Z",
    state,
  });
}
/** Open a controlled offline page with optional storage fault injection before boot. */
export async function recoveryFixture(browser, storage, fault) {
  const fixture = await createLegacyBrowserFixture(browser, {
    storage,
    viewport: { width: 360, height: 800 },
  });
  if (fault)
    await fixture.context.addInitScript(
      // Fault only the selected I/O boundary and retain a reversible test control.
      ({ method, key }) => {
        const original = Storage.prototype[method];
        globalThis.__restoreStorage = () => {
          Storage.prototype[method] = original;
        }; // Restore the actual browser method for Retry.
        Storage.prototype[method] = function (name, ...args) {
          // Simulate denied/quota access without altering stored bytes.
          if (name === key) throw new DOMException("Denied", "SecurityError");
          return original.call(this, name, ...args);
        };
      },
      fault,
    );
  await fixture.page.goto("http://127.0.0.1:4173/");
  return fixture;
}
