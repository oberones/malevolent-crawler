/* global document, window */
import { test, expect } from "@playwright/test";
// Real buttons in a legacy-shaped modal exercise browser focus and inert behavior.
test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/services.html");
  await page.evaluate(
    /* Wire only the fixture controls and explicit service dependencies. */ async () => {
      const { createDialogService } =
        await import("/assets/js/app/dialogs.mjs");
      const { createLifecycle } = await import("/assets/js/app/lifecycle.mjs");
      window.owner = createLifecycle({ clock: window });
      window.dialogs = createDialogService({
        document,
        lifecycle: window.owner,
      });
      window.cancels = 0;
      window.confirms = 0;
      window.outside = 0;
      document.querySelector("#confirm").addEventListener(
        "click",
        // Keep confirmation separate so Escape cannot accidentally invoke it.
        () => {
          window.confirms++;
        },
      );
      document.querySelector("#outside").addEventListener(
        "click",
        // Background pointer/keyboard actions must be blocked during the decision.
        () => {
          window.outside++;
        },
      );
      document.querySelector("#invoke").addEventListener(
        "click",
        // Reopen from the same invoking control to check focus restoration.
        () => {
          window.closeDialog = window.dialogs.open(
            document.querySelector("#modal"),
            {
              // WebKit pointer activation need not focus a button; pass the actual trigger.
              invoker: document.querySelector("#invoke"),
              initialFocus: document.querySelector("#cancel"),
              labelledBy: "heading",
              onCancel:
                // Cancellation is observable but never performs confirmation.
                () => {
                  window.cancels++;
                },
            },
          );
        },
      );
    },
  );
});
// Keyboard focus stays within the modal and Escape performs cancellation only.
test("initial focus, accessible name, background blocking, tab wrap and Escape return", async ({
  page,
}) => {
  await page.locator("#invoke").click();
  await expect(page.locator("#cancel")).toBeFocused();
  await expect(
    page.getByRole("dialog", { name: "Replace character?" }),
  ).toBeVisible();
  expect(
    await page
      .locator("#background")
      .evaluate(
        /* Read native background-interaction blocking. */ (node) => node.inert,
      ),
  ).toBe(true);
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#confirm")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#cancel")).toBeFocused();
  await page
    .locator("#outside")
    .evaluate(
      /* Attempt a programmatic background-focus escape. */ (node) =>
        node.focus(),
    );
  await expect(page.locator("#cancel")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#modal")).toBeHidden();
  await expect(page.locator("#invoke")).toBeFocused();
  expect(
    await page.evaluate(
      /* Collect cancellation, confirmation and retained-resource evidence. */ () => ({
        cancels: window.cancels,
        confirms: window.confirms,
        outside: window.outside,
        pending: window.owner.pending(),
      }),
    ),
  ).toEqual({ cancels: 1, confirms: 0, outside: 0, pending: 0 });
  expect(
    await page
      .locator("#background")
      .evaluate(
        /* Read native background-interaction blocking. */ (node) => node.inert,
      ),
  ).toBe(false);
});
// Closing twice and reopening cannot retain listeners or overwrite prior attributes.
test("repeated open/close restores attributes and removes ownership", async ({
  page,
}) => {
  for (let i = 0; i < 3; i++) {
    await page.locator("#invoke").click();
    await expect(page.locator("#modal")).toBeVisible();
    await page.evaluate(
      /* Repeated close calls must be harmless. */ () => {
        window.closeDialog();
        window.closeDialog();
      },
    );
    await expect(page.locator("#invoke")).toBeFocused();
  }
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(
      /* Collect cancellation, confirmation and retained-resource evidence. */ () => ({
        cancels: window.cancels,
        confirms: window.confirms,
        pending: window.owner.pending(),
        role: document.querySelector("#modal").getAttribute("role"),
      }),
    ),
  ).toEqual({ cancels: 0, confirms: 0, pending: 0, role: null });
});
// Non-dismissibility, removed invokers and teardown all avoid destructive actions.
test("explicit dismissal policy and disposal restore the page without confirmation", async ({
  page,
}) => {
  await page.evaluate(
    /* Open a nondismissible decision from a known keyboard focus. */ () => {
      document.querySelector("#invoke").focus();
      window.closeDialog = window.dialogs.open(
        document.querySelector("#modal"),
        {
          labelledBy: "heading",
          dismissible: false,
        },
      );
    },
  );
  await expect(page.locator("#heading")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#modal")).toBeVisible();
  await page.evaluate(
    /* Teardown still restores the page after the trigger disappears. */ () => {
      document.querySelector("#invoke").remove();
      window.dialogs.dispose();
      window.dialogs.dispose();
    },
  );
  await expect(page.locator("#modal")).toBeHidden();
  expect(
    await page
      .locator("#background")
      .evaluate(
        /* Read native background-interaction blocking. */ (node) => node.inert,
      ),
  ).toBe(false);
  expect(
    await page.evaluate(
      /* Verify disposal never confirmed a destructive action. */ () =>
        window.confirms,
    ),
  ).toBe(0);
});
// Application teardown must restore inert state even when no close control is invoked.
test("lifecycle invalidation restores an open modal", async ({ page }) => {
  await page.locator("#invoke").click();
  await expect(page.locator("#modal")).toBeVisible();
  await page.evaluate(
    /* End the owning generation without closing through the UI. */ () =>
      window.owner.invalidate(),
  );
  await expect(page.locator("#modal")).toBeHidden();
  expect(
    await page
      .locator("#background")
      .evaluate(
        /* Read native background-interaction blocking. */ (node) => node.inert,
      ),
  ).toBe(false);
  expect(
    await page.evaluate(
      /* Collect cancellation, confirmation and retained-resource evidence. */ () => ({
        confirms: window.confirms,
        pending: window.owner.pending(),
      }),
    ),
  ).toEqual({ confirms: 0, pending: 0 });
});
