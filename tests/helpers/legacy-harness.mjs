import vm from "node:vm";
import { readFileSync, realpathSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRandomTape } from "./random-tape.mjs";
import { createFakeClock } from "./fake-clock.mjs";
import { createFakeStorage } from "./fake-storage.mjs";
import { createFakeAudio } from "./fake-audio.mjs";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
export const legacyFiles = Object.freeze(
  [
    "utility",
    "elements",
    "music",
    "player",
    "equipment",
    "combat",
    "dungeon",
    "enemy",
    "main",
  ].map(
    // Preserve the original classic script order while replacing only Howler in tests.
    (name) => `assets/js/${name}.js`,
  ),
);

// A deliberately small event/node stub: no parsing, layout or browser acceptance claims.
function createNode() {
  const listeners = new Map();
  const classes = new Set();
  let html = "";
  return {
    style: {},
    value: "",
    textContent: "",
    children: [],
    // Retain trusted markup as inert text; do not evaluate handlers or parse HTML.
    get innerHTML() {
      return html;
    },
    // Clearing markup also removes constructed child nodes like the real container.
    set innerHTML(value) {
      html = String(value);
      this.children.length = 0;
    },
    // Expose the final child for legacy damage-number cleanup.
    get lastElementChild() {
      return this.children.at(-1);
    },
    classList: {
      // Preserve class membership for animation characterization.
      add(value) {
        classes.add(value);
      },
      // Clear only the requested animation class.
      remove(value) {
        classes.delete(value);
      },
      // Let tests inspect class changes without pretending to render them.
      contains(value) {
        return classes.has(value);
      },
    },
    // Duplicate registration of the same callback does not multiply dispatches.
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    // Explicit removal supports repeated setup and teardown assertions.
    removeEventListener(type, callback) {
      listeners.get(type)?.delete(callback);
    },
    // Dispatch trusted fixture callbacks, forwarding data as an object value.
    dispatch(type, event = {}) {
      for (const callback of listeners.get(type) ?? []) callback(event);
      this[`on${type}`]?.(event);
    },
    // Append constructed nodes without parsing any incoming player string.
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    // Remove a previously appended node by identity.
    removeChild(node) {
      const index = this.children.indexOf(node);
      if (index !== -1) this.children.splice(index, 1);
      return node;
    },
    // Dispose event callbacks and handler properties retained by the stub.
    dispose() {
      listeners.clear();
      for (const key of Object.keys(this))
        if (key.startsWith("on")) delete this[key];
    },
  };
}

/**
 * Load explicitly selected trusted repository scripts into an isolated classic realm.
 * This is a rule oracle, not a DOM implementation or a sandbox for untrusted code.
 * @param {object} [options] Trusted sourceRoot/files, explicit selectors, storage and randomTape.
 * @returns {object} call/read/write identifier operations, DOM, clock, storage, audio, dispose.
 * @throws {Error} On missing stubs, escaped paths, invalid identifiers or disposed access.
 */
export function createLegacyHarness({
  sourceRoot = "tests/fixtures/legacy/source",
  files = legacyFiles,
  selectors = [],
  storage: initialStorage = {},
  randomTape = [],
  start = 0,
} = {}) {
  const root = realpathSync(resolve(repositoryRoot, sourceRoot));
  if (root !== repositoryRoot.slice(0, -1) && !root.startsWith(repositoryRoot))
    throw new Error("Untrusted source path");
  const random = createRandomTape(randomTape);
  const clock = createFakeClock(start);
  const storage = createFakeStorage(initialStorage);
  const audio = createFakeAudio();
  const nodes = new Map();
  const created = [];
  for (const selector of selectors) nodes.set(selector, createNode());
  const window = createNode();
  const document = {
    // Missing elements are test setup failures rather than fabricated UI success.
    querySelector(selector) {
      if (!nodes.has(selector))
        throw new Error(`Missing DOM stub: ${selector}`);
      return nodes.get(selector);
    },
    // IDs share the same explicit fixture inventory as CSS selectors.
    getElementById(id) {
      return this.querySelector(`#${id}`);
    },
    // Track dynamically constructed nodes for deterministic disposal.
    createElement() {
      const node = createNode();
      created.push(node);
      return node;
    },
  };
  let disposed = false;
  // Override calendar construction and Date.now while preserving explicit date input.
  class FakeDate extends Date {
    // No-argument construction uses the injected clock, never wall time.
    constructor(...args) {
      super(...(args.length ? args : [clock.now()]));
    }
    // Support trusted classic code reading the current millisecond timestamp.
    static now() {
      return clock.now();
    }
  }
  // Match the legacy new Howl constructor using the test-owned audio adapter.
  function Howl(options) {
    return audio.create(options);
  }
  const context = vm.createContext(
    {
      document,
      window,
      localStorage: storage,
      Howl,
      Date: FakeDate,
      setTimeout: clock.setTimeout,
      clearTimeout: clock.clearTimeout,
      setInterval: clock.setInterval,
      clearInterval: clock.clearInterval,
      // Legacy character exports use Latin-1 browser encoding; reject non-byte text.
      btoa(value) {
        return btoa(value);
      },
      // Decode bytes into the same Latin-1 string interpreted by legacy JSON.parse.
      atob(value) {
        return atob(value);
      },
      __random: random.random,
    },
    { codeGeneration: { strings: false, wasm: false } },
  );
  vm.runInContext(
    "Math.random = __random; delete globalThis.__random;",
    context,
  );
  // Restrict generated harness expressions to identifiers; values use scratch slots.
  function identifier(name) {
    if (disposed) throw new Error("Legacy harness disposed");
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name))
      throw new Error("Expected a binding identifier");
    return name;
  }
  // Every generated expression is fixed harness code plus a checked identifier.
  function evaluate(expression) {
    return vm.runInContext(expression, context, { timeout: 1000 });
  }
  // Dispose everything even if loading a trusted fixture throws partway through.
  function dispose() {
    clock.dispose();
    audio.dispose();
    window.dispose();
    for (const node of [...nodes.values(), ...created]) node.dispose();
    disposed = true;
  }
  try {
    for (const file of files) {
      if (file.split(/[\\/]/).includes("..") || file.startsWith("/"))
        throw new Error("Invalid source path");
      const path = realpathSync(resolve(root, file));
      if (!path.startsWith(`${root}${sep}`))
        throw new Error("Invalid source path");
      vm.runInContext(readFileSync(path, "utf8"), context, {
        filename: path,
        timeout: 1000,
      });
    }
  } catch (error) {
    dispose();
    throw error;
  }
  return {
    random,
    clock,
    storage,
    audio,
    dom: { document, window, nodes },
    // Copy observable state out so callers cannot mutate a realm accidentally.
    read(name) {
      return structuredClone(evaluate(identifier(name)));
    },
    // Assign cloned data through a slot, never interpolating JSON or player text.
    write(name, value) {
      identifier(name);
      context.__value = structuredClone(value);
      try {
        evaluate(`${name} = __value`);
      } finally {
        delete context.__value;
      }
    },
    // Invoke an existing trusted rule with cloned arguments and copy its result.
    call(name, ...args) {
      identifier(name);
      context.__args = structuredClone(args);
      try {
        return structuredClone(evaluate(`${name}(...__args)`));
      } finally {
        delete context.__args;
      }
    },
    dispose,
  };
}
