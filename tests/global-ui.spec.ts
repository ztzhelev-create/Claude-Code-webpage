import { test, expect } from "@playwright/test";

const CONTACT_MAILTO = "mailto:z.t.zhelev@gmail.com";

test.describe("global header", () => {
  test("exposes Home, Recipes and Lifestyle in the main nav", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("banner").getByRole("navigation", { name: /main/i });
    await expect(nav.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Recipes", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Lifestyle", exact: true })).toBeVisible();
  });

  // The destination pages arrive in later steps; Step 2 only owns the routing.
  for (const [label, path] of [
    ["Home", "/"],
    ["Recipes", "/recipes"],
    ["Lifestyle", "/lifestyle"],
  ] as const) {
    test(`"${label}" navigates to ${path}`, async ({ page, baseURL }) => {
      await page.goto("/");
      await page
        .getByRole("banner")
        .getByRole("link", { name: label, exact: true })
        .click();
      await expect(page).toHaveURL(new URL(path, baseURL).href);
    });
  }

  test("logo links home under the site name", async ({ page }) => {
    await page.goto("/recipes");

    const logo = page
      .getByRole("banner")
      .getByRole("link", { name: "Happy Healthy Marry", exact: true });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", "/");
  });

  test("wordmark is set at display scale", async ({ page }) => {
    await page.goto("/");

    const wordmark = page.getByRole("banner").getByTestId("wordmark");
    const size = await wordmark.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(size).toBeGreaterThanOrEqual(28);

    const weight = await wordmark.evaluate(
      (el) => parseInt(getComputedStyle(el).fontWeight, 10),
    );
    expect(weight).toBeGreaterThanOrEqual(700);
  });

  // The header sat at 65px before the wordmark was scaled up; this guards the
  // extra breathing room from being trimmed back by a later padding tweak.
  test("header stands taller than the original compact bar", async ({ page }) => {
    await page.goto("/");

    const box = await page.getByRole("banner").boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(76);
  });
});

test.describe("global footer", () => {
  test("contact button points at the owner's mailbox", async ({ page }) => {
    await page.goto("/");

    const contact = page
      .getByRole("contentinfo")
      .getByRole("link", { name: /contact me/i });

    await expect(contact).toBeVisible();
    await expect(contact).toHaveAttribute("href", CONTACT_MAILTO);
  });
});
