import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Automated accessibility checks", () => {
  test("landing page has no serious axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("analyze overview (demo data) has no serious axe violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).click();
    await expect(page).toHaveURL(/\/analyze$/);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("clause detail dialog has no serious axe violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).click();
    await page.getByRole("button", { name: "View details →" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
