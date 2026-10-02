import { test, expect } from "@playwright/test";
import { waitForHydration } from "./hydration";

const form = (page: import("@playwright/test").Page) =>
  page.getByTestId("newsletter");

test.describe("newsletter form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page, "#newsletter-email");
  });

  test("offers an email field and a subscribe button", async ({ page }) => {
    await expect(form(page).getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(form(page).getByRole("button", { name: /subscribe/i })).toBeVisible();
  });

  test("rejects an empty submission without claiming success", async ({ page }) => {
    await form(page).getByRole("button", { name: /subscribe/i }).click();

    await expect(form(page).getByRole("alert")).toBeVisible();
    await expect(form(page).getByRole("textbox", { name: /email/i })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(form(page).getByTestId("newsletter-success")).toHaveCount(0);
  });

  test("rejects a malformed address", async ({ page }) => {
    await form(page).getByRole("textbox", { name: /email/i }).fill("not-an-email");
    await form(page).getByRole("button", { name: /subscribe/i }).click();

    await expect(form(page).getByRole("alert")).toBeVisible();
    await expect(form(page).getByTestId("newsletter-success")).toHaveCount(0);
  });

  test("accepts a valid address and confirms", async ({ page }) => {
    await form(page).getByRole("textbox", { name: /email/i }).fill("reader@example.com");
    await form(page).getByRole("button", { name: /subscribe/i }).click();

    await expect(form(page).getByTestId("newsletter-success")).toBeVisible();
    await expect(form(page).getByRole("alert")).toHaveCount(0);
  });

  test("clears the error once a valid address is supplied", async ({ page }) => {
    const field = form(page).getByRole("textbox", { name: /email/i });

    await form(page).getByRole("button", { name: /subscribe/i }).click();
    await expect(form(page).getByRole("alert")).toBeVisible();

    await field.fill("reader@example.com");
    await form(page).getByRole("button", { name: /subscribe/i }).click();
    await expect(form(page).getByTestId("newsletter-success")).toBeVisible();
  });
});
