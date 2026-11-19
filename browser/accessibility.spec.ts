import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("route content has accessible names, landmarks and contrast, and keyboard focus can leave each control", async ({ page, browserName }) => {
  await page.goto("/accessible");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "yes");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("link", { name: "Next page" }).focus();
  // WebKit on macOS uses Option+Tab to include every interactive control.
  const tab = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  await page.keyboard.press(tab);
  await expect(page.getByRole("button", { name: "Save draft" })).toBeFocused();
  await page.keyboard.press(tab);
  await expect(page.getByRole("link", { name: "Continue", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("h1")).toHaveText("accessible-next");
  await expect(page.locator("h1")).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
