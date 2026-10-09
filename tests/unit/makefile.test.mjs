import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const makefile = new URL("../../Makefile", import.meta.url);

// Run the real Makefile in an isolated checkout with harmless command recorders.
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "crawler-make-"));
  // Remove only the temporary checkout owned by this test.
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, "Makefile"), readFileSync(makefile));
  writeFileSync(
    join(root, "runner"),
    '#!/bin/sh\nprintf "%s\\n" "$*" >> commands\nif [ "$*" = "$FAIL_COMMAND" ]; then exit 9; fi\n',
    { mode: 0o755 },
  );
  return root;
}

// Exercise make itself and surface launch errors before checking command results.
function run(root, args = [], env = {}) {
  const result = spawnSync(
    "make",
    ["--no-print-directory", "NPM=./runner", "NPX=./runner", ...args],
    {
      cwd: root,
      encoding: "utf8",
      timeout: 10_000,
      env: { ...process.env, MAKEFLAGS: "", MFLAGS: "", ...env },
    },
  );
  if (result.error) throw result.error;
  return result;
}

// Missing executables must report the launch error before exit-status assertions.
test("make launch failures retain the executable and operating-system error", (t) => {
  const root = fixture(t);
  assert.throws(
    // An empty search directory reliably excludes make on every supported host.
    () => run(root, [], { PATH: root }),
    { code: "ENOENT", syscall: "spawnSync make" },
  );
});

// Default invocation must be useful without installing packages or starting a server.
test("make defaults to discoverable help", (t) => {
  const root = fixture(t);
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /check/);
  assert.match(result.stdout, /test-performance/);
  assert.match(result.stdout, /ARGS/);
  assert.throws(() => readFileSync(join(root, "commands")), /ENOENT/);
});

// Shared browser resources require sequential execution even with parallel make.
test("check runs the six CI checks in order under make -j", (t) => {
  const root = fixture(t);
  const result = run(root, ["-j8", "check"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(join(root, "commands"), "utf8"),
    "run lint\nrun format:check\nrun test:unit\nrun test:integration\nrun test:browser\naudit --audit-level=high\n",
  );
});

// A failed suite must stop the aggregate and remain visible to callers.
test("check stops on failure and does not report later checks as run", (t) => {
  const root = fixture(t);
  const result = run(root, ["-j8", "check"], {
    FAIL_COMMAND: "run test:integration",
  });
  assert.notEqual(result.status, 0);
  assert.equal(
    readFileSync(join(root, "commands"), "utf8"),
    "run lint\nrun format:check\nrun test:unit\nrun test:integration\n",
  );
});

// Forward shell-quoted filters intact so focused browser checks remain usable.
test("browser target forwards arguments containing spaces", (t) => {
  const root = fixture(t);
  const result = run(root, [
    "test-browser",
    'ARGS=--project=chromium --grep "saved encounter"',
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(join(root, "commands"), "utf8"),
    "run test:browser -- --project=chromium --grep saved encounter\n",
  );
});

// Installation must finish before browser installation starts, even under -j.
test("setup installs from the lockfile before selected browsers", (t) => {
  const root = fixture(t);
  const result = run(root, ["-j8", "setup", "BROWSERS=chromium"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(join(root, "commands"), "utf8"),
    "ci\n--no-install playwright install chromium\n",
  );
});

// Cleanup may discard transient reports but must retain fixtures and evidence.
test("clean preserves recorded evidence, caches and dependencies", (t) => {
  const root = fixture(t);
  const removed = ["test-results", "playwright-report", "coverage"];
  const retained = [
    "validation",
    "art",
    ".cache",
    "node_modules",
    "ci-reports",
  ];
  for (const directory of [...removed, ...retained]) {
    mkdirSync(join(root, directory));
    writeFileSync(join(root, directory, "keep.txt"), "record");
  }
  const result = run(root, ["clean"]);
  assert.equal(result.status, 0, result.stderr);
  for (const directory of removed) {
    assert.throws(
      // Transient output must actually have been removed.
      () => readFileSync(join(root, directory, "keep.txt")),
      /ENOENT/,
    );
  }
  for (const directory of retained) {
    assert.equal(
      readFileSync(join(root, directory, "keep.txt"), "utf8"),
      "record",
    );
  }
});
