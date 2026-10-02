import { test, expect } from "@playwright/test";
import { getAllRecipes } from "../lib/mdx";
import { waitForHydration } from "./hydration";

const recipes = getAllRecipes();
const categories = [...new Set(recipes.map((r) => r.category))].sort();

const results = (page: import("@playwright/test").Page) =>
  page.getByTestId("recipe-results").getByRole("link");

test.describe("recipes index", () => {
  test("lists every recipe by default", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(results(page)).toHaveCount(recipes.length);
  });

  test("search narrows the list and is reflected in the URL", async ({ page }) => {
    await page.goto("/recipes");
    await waitForHydration(page, 'input[type="search"]');
    const target = recipes.find((r) => /lentil/i.test(r.title))!;

    await page.getByRole("searchbox").fill("lentil");

    await expect(page).toHaveURL(/[?&]q=lentil/);
    await expect(results(page)).toHaveCount(1);
    await expect(results(page).first()).toHaveAttribute(
      "href",
      `/recipes/${target.slug}`,
    );
  });

  test("a shared ?q= URL filters on first load", async ({ page }) => {
    await page.goto("/recipes?q=lentil");
    await expect(page.getByRole("searchbox")).toHaveValue("lentil");
    await expect(results(page)).toHaveCount(1);
  });

  test("choosing a category filters and is reflected in the URL", async ({
    page,
  }) => {
    const category = categories.find(
      (c) => recipes.filter((r) => r.category === c).length > 1,
    )!;
    const expected = recipes.filter((r) => r.category === category).length;

    await page.goto("/recipes");
    await waitForHydration(page, 'input[type="search"]');
    await page.getByRole("button", { name: category, exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`[?&]category=${encodeURIComponent(category)}`));
    await expect(results(page)).toHaveCount(expected);
  });

  test("a shared ?category= URL filters on first load", async ({ page }) => {
    const category = categories[0];
    const expected = recipes.filter((r) => r.category === category).length;

    await page.goto(`/recipes?category=${encodeURIComponent(category)}`);
    await expect(results(page)).toHaveCount(expected);
    await expect(
      page.getByRole("button", { name: category, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("search and category combine", async ({ page }) => {
    await page.goto("/recipes?category=Dessert&q=zzzznothing");
    await expect(results(page)).toHaveCount(0);
    await expect(page.getByTestId("empty-state")).toBeVisible();
  });

  test("the empty state offers a way back to everything", async ({ page }) => {
    await page.goto("/recipes?q=zzzznothing");
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await waitForHydration(page, 'input[type="search"]');

    await page.getByRole("button", { name: /clear/i }).click();

    await expect(results(page)).toHaveCount(recipes.length);
    await expect(page.getByRole("searchbox")).toHaveValue("");
  });
});
