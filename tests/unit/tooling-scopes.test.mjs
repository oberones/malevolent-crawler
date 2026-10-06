import assert from "node:assert/strict";
import test from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint();

// A shared owner must be declared once without being mistaken for an ambient redeclaration.
test("classic ownership declarations remain legal", async () => {
  const [result] = await eslint.lintText(
    "let player = null; document.title = String(player); player = {}; document.title = String(player);",
    { filePath: "assets/js/player.js" },
  );
  assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
});

// Classic files share declared engine owners and browser APIs across script tags.
test("classic scripts can use the documented shared owners", async () => {
  const [result] = await eslint.lintText(
    "player = null; document.title = nFormatter(1000); Howler.mute(true);",
    { filePath: "assets/js/main.js" },
  );
  assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
});

// Browser modules must not inherit legacy state or Node-only capabilities.
test("browser modules reject ambient engine and Node bindings", async () => {
  const [result] = await eslint.lintText(
    'document.title = "ready"; player.hp = 1; process.exit(0);',
    { filePath: "assets/js/app/probe.mjs" },
  );
  assert.equal(result.errorCount, 2, JSON.stringify(result.messages));
  assert.ok(
    result.messages.every(
      // Only the two deliberately leaked ambient bindings should fail.
      (message) => message.ruleId === "no-undef",
    ),
  );
});

// Development tools receive Node APIs, while accidental DOM coupling fails lint.
test("tool modules get Node capabilities but no DOM", async () => {
  const [result] = await eslint.lintText(
    'process.stdout.write("ready"); document.title = "bad";',
    { filePath: "scripts/probe.mjs" },
  );
  assert.equal(result.errorCount, 1, JSON.stringify(result.messages));
  assert.equal(result.messages[0].ruleId, "no-undef");
  assert.match(result.messages[0].message, /document/);
});

// Every owned scope must reject accidental global writes.
test("undeclared assignments stay errors in every scope", async () => {
  for (const filePath of [
    "assets/js/main.js",
    "assets/js/app/probe.mjs",
    "scripts/probe.mjs",
  ]) {
    const [result] = await eslint.lintText("accidentalGlobal = 1;", {
      filePath,
    });
    assert.ok(result.errorCount > 0, filePath);
    assert.ok(
      result.messages.some(
        // Additional protection rules may also flag the same global write.
        (message) => message.ruleId === "no-undef",
      ),
    );
  }
});
