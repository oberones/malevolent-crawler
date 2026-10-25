import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Static deployments must ship exactly the reviewed, locked package distribution.
test("vendored Howler matches the installed distribution byte for byte", () => {
  const shipped = readFileSync(
    new URL("../../assets/js/howler.min.js", import.meta.url),
  );
  const installed = readFileSync(require.resolve("howler/dist/howler.min.js"));
  assert.ok(
    shipped.equals(installed),
    "Copy node_modules/howler/dist/howler.min.js to assets/js/howler.min.js after updating Howler",
  );
});
