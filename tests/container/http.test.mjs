import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const baseURL = process.env.CONTAINER_BASE_URL;
if (!baseURL)
  throw new Error("CONTAINER_BASE_URL must point to a running container.");

/** Drain each response before assertions so failing contracts cannot retain sockets. */
async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(5000),
  });
  return {
    status: response.status,
    headers: response.headers,
    body: Buffer.from(await response.arrayBuffer()),
  };
}

// Compare delivered bytes, not merely status codes or a fallback HTML page.
for (const [path, file, mime] of [
  ["/", "index.html", "text/html"],
  ["/index.html", "index.html", "text/html"],
  ["/assets/js/main.js", "assets/js/main.js", "application/javascript"],
  [
    "/assets/js/app/services.mjs",
    "assets/js/app/services.mjs",
    "application/javascript",
  ],
  ["/assets/css/style.css", "assets/css/style.css", "text/css"],
  ["/assets/icon/favicon.png", "assets/icon/favicon.png", "image/png"],
  ["/LICENSE", "LICENSE", "text/plain"],
]) {
  // Every public resource must remain revalidatable and safe for strict MIME handling.
  test(`serves ${path} with exact bytes and headers`, async () => {
    const response = await request(new URL(path, baseURL));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type")?.split(";")[0], mime);
    assert.equal(response.headers.get("cache-control"), "no-cache");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.deepEqual(response.body, readFileSync(file));
  });
}

for (const path of [
  "/unknown-route",
  "/assets/missing.png",
  "/assets/js/missing.mjs",
  "/assets/",
  "/assets/js/",
  "/assets/js/app/",
  "/.git/config",
  "/.env",
  "/package.json",
  "/package-lock.json",
  "/Dockerfile",
  "/README.md",
  "/nginx/nginx.conf",
  "/deploy/compose.production.yml",
  "/tests/fixtures/static/module.mjs",
  "/.github/workflows/publish.yml",
]) {
  // Missing paths, directory indexes and development files must never become app HTML.
  test(`returns a real 404 for ${path}`, async () => {
    const response = await request(new URL(path, baseURL));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("cache-control"), "no-cache");
    assert.doesNotMatch(response.body.toString(), /id="character-creation"/);
  });
}

// Unhashed resources can be cached only with validation against the current image.
test("HEAD and conditional GET preserve cache and security headers", async () => {
  const url = new URL("/assets/js/app/services.mjs", baseURL);
  const head = await request(url, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(head.body.length, 0);
  assert.ok(head.headers.get("etag"));
  const cached = await request(url, {
    headers: { "If-None-Match": head.headers.get("etag") },
  });
  assert.equal(cached.status, 304);
  assert.equal(cached.headers.get("cache-control"), "no-cache");
  assert.equal(cached.headers.get("x-content-type-options"), "nosniff");
});

// Compress text payloads while advertising the negotiated representation to proxies.
test("compresses HTML, CSS and JavaScript", async () => {
  for (const path of [
    "/index.html",
    "/assets/css/style.css",
    "/assets/js/main.js",
    "/assets/js/app/services.mjs",
  ]) {
    const response = await request(new URL(path, baseURL), {
      headers: { "Accept-Encoding": "gzip" },
    });
    assert.equal(response.headers.get("content-encoding"), "gzip", path);
    assert.match(response.headers.get("vary"), /Accept-Encoding/i);
  }
});
