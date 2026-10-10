import { test, expect } from "@playwright/test";

// Native modules must be served over HTTP with an executable JavaScript MIME.
test("static server serves a module with JavaScript MIME", async ({
  request,
}) => {
  const response = await request.get("/tests/fixtures/static/module.mjs");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(
    /(?:text|application)\/javascript/,
  );
  expect(await response.text()).toContain(
    "export const staticModuleReady = true",
  );
});

// Existing local asset types must load without a production build step.
test("static server supplies HTML, styles, scripts, fonts, art and audio", async ({
  request,
}) => {
  for (const path of [
    "/index.html",
    "/assets/css/style.css",
    "/assets/js/main.js",
    "/assets/sprites/goblin.png",
    "/assets/icon/favicon.ico",
    "/assets/fonts/rpgawesome-webfont.woff",
    "/assets/bgm/dungeon.mp3",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect((await response.body()).length, path).toBeGreaterThan(0);
  }
});
