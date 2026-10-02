import { test, expect } from "@playwright/test";
import { getAllRecipes } from "../lib/mdx";
import { waitForHydration } from "./hydration";

const recipes = getAllRecipes();
const INGREDIENT_ONLY = "mirin";

const BAR = '[data-testid="hero-search"]';
const results = (page: import("@playwright/test").Page) =>
  page.getByTestId("recipe-results").getByRole("link");

test.describe("hero search", () => {
  test("sits near the top of the home page, above the fold", async ({ page }) => {
    await page.goto("/");

    const bar = page.getByTestId("hero-search");
    await expect(bar).toBeVisible();

    const box = await bar.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.y).toBeLessThan(viewport.height);
  });

  test("labels the field and the submit control", async ({ page }) => {
    await page.goto("/");

    const bar = page.getByTestId("hero-search");
    await expect(bar.getByRole("searchbox", { name: /search recipes/i })).toBeVisible();
    await expect(bar.getByRole("button", { name: /search/i })).toBeVisible();
  });

  test("submitting a recipe name lands on the filtered index", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page, BAR);

    const target = recipes.find((r) => /lentil/i.test(r.title))!;
    await page.getByTestId("hero-search").getByRole("searchbox").fill("lentil");
    await page.getByTestId("hero-search").getByRole("button", { name: /search/i }).click();

    await expect(page).toHaveURL(/\/recipes\?q=lentil/);
    await expect(results(page)).toHaveCount(1);
    await expect(results(page).first()).toHaveAttribute(
      "href",
      `/recipes/${target.slug}`,
    );
  });

  test("finds a recipe by an ingredient only its body mentions", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page, BAR);

    await page.getByTestId("hero-search").getByRole("searchbox").fill(INGREDIENT_ONLY);
    await page.getByTestId("hero-search").getByRole("button", { name: /search/i }).click();

    await expect(page).toHaveURL(new RegExp(`/recipes\\?q=${INGREDIENT_ONLY}`));
    await expect(results(page)).toHaveCount(1);
  });

  test("searching a category name keeps that category's recipes", async ({ page }) => {
    const category = recipes[0].category;
    const expected = recipes.filter((r) => r.category === category).length;

    await page.goto("/");
    await waitForHydration(page, BAR);

    await page.getByTestId("hero-search").getByRole("searchbox").fill(category);
    await page.getByTestId("hero-search").getByRole("button", { name: /search/i }).click();

    await expect(page).toHaveURL(/\/recipes\?q=/);
    await expect(results(page)).toHaveCount(expected);
  });

  test("an empty submission just opens the full index", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page, BAR);

    await page.getByTestId("hero-search").getByRole("button", { name: /search/i }).click();

    await expect(page).toHaveURL(/\/recipes$/);
    await expect(results(page)).toHaveCount(recipes.length);
  });
});

test.describe("recipes index search", () => {
  test("also matches ingredients, not just titles", async ({ page }) => {
    await page.goto("/recipes");
    await waitForHydration(page, 'input[type="search"]');

    await page.getByRole("searchbox").fill(INGREDIENT_ONLY);

    await expect(results(page)).toHaveCount(1);
  });
});
