/* global document, window */
import { test, expect } from "@playwright/test";
// Use a same-origin fixture without loading the classic game's eager handlers.
test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/services.html");
});
// No caller string is interpreted as markup, classes or a resource location.
test("text, structured nodes and catalog assets remain inert", async ({
  page,
}) => {
  const data = await page.evaluate(
    /* Exercise the renderer directly in a real browser document. */ async () => {
      const { createSafeRenderer } =
        await import("/assets/js/app/safe-render.mjs");
      const r = createSafeRenderer(document);
      window.executed = false;
      const payload = '<img src=x onerror="window.executed=true">';
      document.querySelector("#output").append(
        r.renderParts([
          { kind: "text", text: payload },
          { kind: "strong", children: [{ kind: "text", text: "Name" }] },
          {
            kind: "rarity",
            id: "Rare",
            children: [{ kind: "text", text: "Rare" }],
          },
          { kind: "symbol", id: "stat-hp" },
          { kind: "encounter", id: "Skeleton Mage", image: "skeleton_mage2" },
        ]),
      );
      return {
        text: document.querySelector("#output").textContent,
        executed: window.executed,
      };
    },
  );
  expect(data.text).toContain("<img src=x onerror=");
  expect(data.executed).toBe(false);
  await expect(page.locator("#output strong")).toHaveText("Name");
  await expect(page.locator("#output .Rare")).toHaveText("Rare");
  await expect(page.locator("#output img")).toHaveCount(2);
  await expect(page.locator("#output img").nth(1)).toHaveAttribute(
    "src",
    "assets/sprites/skeleton_mage2.png",
  );
});
// Unknown fields must not smuggle CSS, URLs, event handlers or arbitrary tags.
test("rejects arbitrary DOM and mismatched catalog descriptors", async ({
  page,
}) => {
  const rejected = await page.evaluate(
    /* Exercise the renderer directly in a real browser document. */ async () => {
      const { createSafeRenderer } =
        await import("/assets/js/app/safe-render.mjs");
      const r = createSafeRenderer(document);
      const attacks = [
        { kind: "html", text: "<script>bad</script>" },
        { kind: "text", text: "x", onclick: "bad" },
        { kind: "symbol", id: "stat-hp", src: "javascript:bad" },
        { kind: "symbol", id: "../../evil" },
        { kind: "rarity", id: "Rare evil", children: [] },
        { kind: "encounter", id: "Goblin", image: "skeleton_mage1" },
      ];
      return attacks.map(
        // Check typed refusal without ever inserting a partial rejected fragment.
        (part) => {
          try {
            r.renderParts([part]);
            return false;
          } catch {
            return true;
          }
        },
      );
    },
  );
  expect(rejected).toEqual(Array(6).fill(true));
});
// Registered schemas validate each primitive/reference/item before trusted template execution.
test("typed messages and unknown-history recovery notices", async ({
  page,
}) => {
  const result = await page.evaluate(
    /* Exercise the renderer directly in a real browser document. */ async () => {
      const { createSafeRenderer } =
        await import("/assets/js/app/safe-render.mjs");
      const { validateMessage } =
        await import("/assets/js/app/message-records.mjs");
      const schemas = {
        "test.message": {
          name: "text",
          amount: "number",
          foe: "encounter",
          symbol: "symbol",
          relic: "relic",
          rarity: "rarity",
          item: "item",
        },
      };
      const item = {
        category: "Sword",
        type: "Weapon",
        attribute: "Damage",
        rarity: "Common",
        lvl: 1,
        tier: 1,
        value: 75,
        stats: [{ atk: 10 }],
      };
      const record = {
        id: "test.message",
        params: {
          name: "<svg onload=evil()>",
          amount: 1.5,
          foe: "Goblin",
          symbol: "stat-hp",
          relic: "Sword",
          rarity: "Rare",
          item,
        },
      };
      const templates = {
        "test.message":
          // Trusted application templates return only inert structured descriptors.
          (p) => [
            { kind: "text", text: p.name },
            { kind: "text", text: String(p.amount) },
          ],
      };
      const r = createSafeRenderer(document, { schemas, templates });
      const out = document.querySelector("#output");
      out.append(r.renderMessage(record));
      window.recovered = null;
      const history = createSafeRenderer(document, {
        onRecover:
          // Capture the raw-recovery token rather than opening it as a URL.
          (ref) => {
            window.recovered = ref;
          },
      });
      out.append(
        history.renderMessage({
          id: "history.unavailable",
          params: { recoveryRef: "raw:2" },
        }),
      );
      const valid = validateMessage(record, schemas).ok;
      const failures = [];
      for (const [key, value] of Object.entries({
        name: { html: "bad" },
        amount: Infinity,
        foe: "unknown",
        symbol: "evil",
        relic: "evil",
        rarity: "evil",
        item: {},
      })) {
        const bad = structuredClone(record);
        bad.params[key] = value;
        failures.push(validateMessage(bad, schemas).ok);
      }
      return {
        valid,
        failures,
        unknown: validateMessage({ id: "unknown", params: {} }, schemas).ok,
        extra: validateMessage(
          { ...record, params: { ...record.params, html: "bad" } },
          schemas,
        ).ok,
      };
    },
  );
  expect(result).toEqual({
    valid: true,
    failures: Array(7).fill(false),
    unknown: false,
    extra: false,
  });
  await expect(page.locator("#output svg")).toHaveCount(0);
  await expect(page.locator("#output")).toContainText(
    "Some history is unavailable",
  );
  await page.getByRole("button", { name: "Recover history" }).click();
  expect(
    await page.evaluate(
      /* Inspect the opaque recovery callback result. */ () => window.recovered,
    ),
  ).toBe("raw:2");
});
