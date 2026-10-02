import { test, expect, type Page } from "@playwright/test";
import { getAllRecipes } from "../lib/mdx";

const recipes = getAllRecipes();
const [recipe] = recipes;

const DESKTOP = { width: 1280, height: 900 };
const NARROW = { width: 390, height: 844 };

function ingredients(page: Page) {
  return page.getByRole("region", { name: "Ingredients" });
}

function method(page: Page) {
  return page.getByRole("region", { name: "Method" });
}

test.describe("recipe detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/recipes/${recipe.slug}`);
  });

  test("leads with the title, a hero image and the time required", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(recipe.title);
    await expect(page.getByRole("img", { name: recipe.title })).toBeVisible();
    await expect(page.getByTestId("time-required")).toContainText(
      recipe.timeRequired,
    );
    await expect(page.getByText(recipe.description)).toBeVisible();
  });

  test("renders ingredients as a list and method as an ordered list", async ({
    page,
  }) => {
    const ingredientItems = ingredients(page).locator("ul > li");
    await expect(ingredientItems.first()).toBeVisible();
    expect(await ingredientItems.count()).toBeGreaterThan(2);

    const methodSteps = method(page).locator("ol > li");
    await expect(methodSteps.first()).toBeVisible();
    expect(await methodSteps.count()).toBeGreaterThan(2);
  });

  test("uses the recipe title as the page title", async ({ page }) => {
    await expect(page).toHaveTitle(new RegExp(recipe.title));
  });
});

test.describe("recipe layout is responsive", () => {
  test("ingredients and method sit side by side on a wide viewport", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`/recipes/${recipe.slug}`);

    const left = await ingredients(page).boundingBox();
    const right = await method(page).boundingBox();
    expect(left).not.toBeNull();
    expect(right).not.toBeNull();

    // Ingredients on the left, method to its right, sharing a row.
    expect(right!.x).toBeGreaterThan(left!.x + left!.width - 1);
    expect(Math.abs(right!.y - left!.y)).toBeLessThan(40);
  });

  test("they stack into one column on a narrow viewport", async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto(`/recipes/${recipe.slug}`);

    const left = await ingredients(page).boundingBox();
    const right = await method(page).boundingBox();

    // Method drops below ingredients, and both run the full column width.
    expect(right!.y).toBeGreaterThan(left!.y + left!.height - 1);
    expect(Math.abs(right!.x - left!.x)).toBeLessThan(2);
  });
});

test.describe("recipe routing", () => {
  for (const { slug, title } of recipes) {
    test(`"${slug}" is statically routed`, async ({ page }) => {
      const response = await page.goto(`/recipes/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    });
  }

  test("an unknown slug is a 404", async ({ page }) => {
    const response = await page.goto("/recipes/not-a-real-recipe");
    expect(response?.status()).toBe(404);
  });
});
