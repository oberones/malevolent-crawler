import { continueEncounter } from "../../assets/js/app/continuation.mjs";
import { createCharacterImport } from "../../assets/js/app/character-import.mjs";
import { createLifecycle } from "../../assets/js/app/lifecycle.mjs";
import { createItemActions } from "../../assets/js/app/item-actions.mjs";
import { record, text } from "../../assets/js/app/outcome-view.mjs";
import test, { after } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import {
  createLegacyHarness,
  legacyFiles,
} from "../helpers/legacy-harness.mjs";
// Keep rule-only adaptation out of shipped code; browser tests exercise the real bridge separately.
const root = new URL("../../", import.meta.url);
mkdirSync(new URL(".cache/", root), { recursive: true });
const directory = mkdtempSync(new URL(".cache/candidate-rules-", root));
mkdirSync(`${directory}/assets/js`, { recursive: true });
for (const file of legacyFiles) {
  let source = readFileSync(new URL(file, root), "utf8");
  if (file.endsWith("/main.js")) {
    assert.equal(source.match(/^initializeGame\(\);$/gm)?.length, 1);
    source = source.replace(
      /^initializeGame\(\);$/m,
      'gameReady = true; gameServices = { /* Symbols are inert in numerical replay; real geometry has browser coverage. */ symbol() { return document.createElement("span"); }, /* Authored slot mounting does not affect rules. */ mountSymbols() {}, /* Use the explicitly injected test presentation boundary. */ get narrative() { return document.narrative; }, /* Use the actual import boundary with detached harness accessors. */ get characterImport() { return document.characterImport; }, /* Schedule on the deterministic harness clock. */ get lifecycle() { return document.lifecycle; }, /* Reuse production continuation with the deterministic clock. */ get continueEncounter() { return document.continueEncounter; }, /* Scope deterministic run work separately. */ get runLifecycle() { return document.runLifecycle; }, /* Scope deterministic attacks separately. */ get combatLifecycle() { return document.combatLifecycle; }, /* Own harness audio instances. */ get audioLifecycle() { return document.audioLifecycle; }, /* The adapter uses the real item mutation boundary. */ get items() { return document.items; }, /* Preserve synchronous rule execution. */ run(callback) { return callback(); }, /* Never persist rule-replay state. */ requestSave() { return { status: "deferred" }; } };',
    );
    source = "document.addEventListener = function () {};\n" + source;
  }
  writeFileSync(`${directory}/${file}`, source);
}
// Remove only this test's generated adapter after every case has released its realm.
after(
  /* Release the temporary rule adapter owned by this test run. */ () =>
    rmSync(directory, { recursive: true, force: true }),
);
// Load immutable inputs independently of the candidate implementation.
function fixture(name) {
  return JSON.parse(
    readFileSync(new URL(`../fixtures/legacy/${name}.json`, import.meta.url)),
  );
}
const selectors = [
  ...fixture("dom-selectors"),
  "#import-description",
  "#import-status",
  "#import-session-only",
];
// Seed every realm with the same captured resting tuple.
const resting = fixture("saves").cases.find(
  /* Select the captured input for this scenario. */ (row) =>
    row.id === "resting",
).state;
for (const corpus of ["encounters", "equipment", "progression"]) {
  for (const row of fixture(corpus).cases) {
    // Candidate functions must preserve exact numerical results and the complete RNG tape.
    test(`candidate ${corpus}: ${row.id}`, /* Verify the named behavior using isolated state and observable outcomes. */ () => {
      const h = createLegacyHarness({
        sourceRoot: directory,
        selectors,
        randomTape: row.tape,
      });
      try {
        const document = h.dom.document;
        document.continueEncounter = continueEncounter;
        document.lifecycle = createLifecycle({ clock: h.clock });
        document.runLifecycle = createLifecycle({ clock: h.clock });
        document.combatLifecycle = createLifecycle({ clock: h.clock });
        document.audioLifecycle = createLifecycle({ clock: h.clock });
        document.characterImport = createCharacterImport({
          // Copy each authoritative section out of the isolated classic realm.
          capture: () =>
            Object.fromEntries(
              ["player", "dungeon", "enemy", "volume"].map(
                // The harness returns detached JSON values suitable for real validation.
                (key) => [key, h.read(key)],
              ),
            ),
          // Persistence failures/order are exercised through real browser storage separately.
          commit: () => ({ status: "saved" }),
          // Cancel pending fixture timers before replacing the classic tuple.
          cleanup: () => document.lifecycle.invalidate(),
          // Return the real import reset result to the authoritative classic bindings.
          replace: (state) => {
            for (const [key, value] of Object.entries(state))
              h.write(key, value);
          },
        });
        // This oracle has no HTML parser; browser tests own all visual assertions.
        const create = document.createElement.bind(document);
        // Supply inert node operations used by unchanged classic rule call sites.
        function decorate(node) {
          node.append = /* Retain child identity without parsing markup. */ (
            ...children
          ) => node.children.push(...children);
          node.replaceChildren =
            /* Replace inert presentation children without parsing HTML. */ (
              ...children
            ) => {
              node.children = children;
            };
          node.querySelector =
            /* Return an inert nested presentation slot. */ () =>
              decorate(create());
          node.setAttribute =
            /* Attributes have no bearing on numerical rule replay. */ () => {};
          return node;
        }
        for (const node of h.dom.nodes.values()) decorate(node);
        document.createElement =
          /* Decorate only this realm's created nodes. */ () =>
            decorate(create());
        document.createTextNode =
          /* Preserve authored text without an HTML parser. */ (value) => ({
            textContent: value,
          });
        document.narrative = {
          record,
          // Transfer VM-owned parameter objects into the module realm before validation.
          text(id, params) {
            return text(id, structuredClone(params));
          },
          // These view-only operations have separate real-browser assertions.
          put() {},
          // Logs are checked by the narrative browser suite, not by the frozen text oracle.
          renderLog() {},
          // Current item identities are tested across actual inventory/detail/confirmation DOM.
          itemLabel() {},
          // Encounter names and art resolution have browser/catalog coverage.
          encounter() {},
          // Upgrade presentation never rolls choices or grants a reward.
          upgrade() {},
          events: {
            /* Choice handlers bind to the oracle's existing selector inventory. */ appendChoices() {},
          },
          entry: {
            /* Rule replay retains original option tokens. */ allocation() {},
            /* Skill description has no rule effect. */ skill() {},
          },
        };
        // Reuse actual item rules while this realm deliberately has no DOM renderer.
        function transaction(collection, index, action, rarity) {
          const player = h.read("player");
          const actions = createItemActions({
            // A detached candidate lets the harness copy the completed state back atomically.
            getPlayer: () => player,
            // Stale DOM behavior belongs to browser tests.
            rerender() {},
          });
          const result = actions.execute(
            actions.beginRender()(collection, index),
            action,
            rarity,
          );
          if (result.ok) {
            h.write("player", player);
            h.call("playerLoadStats");
          }
        }
        document.items = {
          // Numerical replay intentionally omits presentation work.
          render() {},
          // Bind the fixture's existing control IDs to the real mutation service.
          show(collection, index) {
            h.dom.nodes.get("#un-equip").onclick =
              /* Preserve the fixture action sequence. */ () =>
                transaction(
                  collection,
                  index,
                  collection === "inventory" ? "equip" : "unequip",
                );
            h.dom.nodes.get("#sell-equip").onclick =
              /* Confirmation itself owns the eventual sale. */ () => {
                h.dom.nodes.get("#sell-confirm").onclick =
                  /* Use the tested action service for exact sale arithmetic. */ () =>
                    transaction(collection, index, "sell");
              };
          },
          // Run direct legacy bulk entry points through the same actual item service.
          bulk(action, rarity) {
            transaction(
              action === "unequip-all" ? "equipped" : "inventory",
              null,
              action,
              rarity,
            );
          },
        };
        for (const [key, value] of Object.entries(resting)) h.write(key, value);
        for (const [key, value] of Object.entries(row.setup))
          h.write(key, value);
        h.call("setVolume");
        for (const op of row.operations) {
          if (op.call) h.call(op.call, ...(op.args ?? []));
          if (op.value) h.dom.nodes.get(op.value).value = op.text;
          if (op.click) h.dom.nodes.get(op.click).dispatch("click");
          if (op.advance) h.clock.advance(op.advance);
        }
        for (const [key, value] of Object.entries(row.expected)) {
          if (key === "combatBacklog") continue; // Narrative is intentionally changed.
          const actual = h.read(key);
          const expected = structuredClone(value);
          if (key === "dungeon") {
            delete actual.backlog;
            delete expected.backlog;
          }
          assert.deepEqual(actual, expected, key);
        }
        h.random.assertConsumed();
        assert.deepEqual(h.random.calls, row.tape);
      } finally {
        h.dispose();
      }
    });
  }
}
