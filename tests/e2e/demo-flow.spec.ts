import { test, expect, type Page } from "@playwright/test";

const MOBILE_BREAKPOINT_PX = 1024; // matches the `lg:` breakpoint used to hide the sidebar

async function gotoNav(page: Page, name: string) {
  const viewport = page.viewportSize();
  if (viewport && viewport.width < MOBILE_BREAKPOINT_PX) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
  }
  await page.getByRole("link", { name }).click();
}

test.describe("Demo document flow", () => {
  test("landing page shows the core value proposition", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Understand before you sign" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Try the demo" })).toBeVisible();
  });

  test("try the demo leads to a populated overview with risk radar and clauses", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).click();

    await expect(page).toHaveURL(/\/analyze$/);
    await expect(page.getByRole("heading", { name: "Understand before you sign" })).toBeVisible();
    await expect(page.getByText("Risk Radar")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Key Clauses" })).toBeVisible();
  });

  test("clauses tab shows the clause table and opens clause detail", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).click();
    await gotoNav(page, "Clauses");

    await expect(page).toHaveURL(/\/analyze\/clauses$/);
    const firstDetailButton = page.getByRole("button", { name: "View details →" }).first();
    await firstDetailButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Original text")).toBeVisible();
    await expect(dialog.getByText("Recommended question for professional review")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("risks tab lists concern findings with evidence", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).click();
    await gotoNav(page, "Risks");

    await expect(page).toHaveURL(/\/analyze\/risks$/);
    await expect(page.getByText("High concern").first()).toBeVisible();

    await page.getByRole("button", { name: "View evidence →" }).first().click();
    const evidenceDialog = page.getByRole("dialog", { name: "Evidence" });
    await expect(evidenceDialog).toBeVisible();
    await expect(evidenceDialog.getByText(/Page \d/)).toBeVisible();
  });

  test("obligations and rights tabs render structured tables", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).click();

    await gotoNav(page, "Obligations");
    await expect(page.getByRole("columnheader", { name: "Obligation" })).toBeVisible();

    await gotoNav(page, "Rights");
    await expect(page.getByRole("heading", { name: "Rights" })).toBeVisible();
  });

  test("ask AI answers a suggested question with evidence", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).click();
    await gotoNav(page, "Ask AI");

    await expect(page).toHaveURL(/\/ask$/);
    await page.getByRole("button", { name: /Does this agreement contain a non-compete/ }).click();

    await expect(page.getByText("What the document says")).toBeVisible();
    await page.getByRole("button", { name: "View evidence →" }).click();
    await expect(page.getByRole("dialog", { name: "Evidence" })).toBeVisible();
  });

  test("compare page offers a demo comparison without uploads", async ({ page }) => {
    await page.goto("/compare");
    await page.getByRole("button", { name: "Try demo comparison" }).click();

    await expect(page.getByText("Material differences")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Document A" })).toBeVisible();
  });

  test("keyboard navigation reaches and activates the demo button", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).focus();
    await expect(page.getByRole("button", { name: "Try the demo" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/analyze$/);
  });
});

test.describe("Mobile layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile navigation opens via the menu button", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).click();
    await expect(page).toHaveURL(/\/analyze$/);

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("link", { name: "Clauses" })).toBeVisible();
  });

  test("no horizontal overflow on the overview page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).click();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasOverflow).toBe(false);
  });
});
