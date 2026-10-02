import { test, expect, type Page } from "@playwright/test";
import { getAllRecipes } from "../lib/mdx";
import { waitForHydration } from "./hydration";

const recipes = getAllRecipes();

const SHELL_PROPS = [
  "borderRadius",
  "borderColor",
  "borderWidth",
  "backgroundColor",
] as const;

const BUTTON_PROPS = [
  "borderRadius",
  "backgroundColor",
  "color",
  "fontWeight",
  "fontFamily",
] as const;

/* getPropertyValue() wants kebab-case and silently returns "" for camelCase,
   which would make every comparison below pass against nothing. Index the
   declaration directly instead, and assert the values are non-empty. */
function read(el: Element, keys: string[]) {
  const computed = getComputedStyle(el) as unknown as Record<string, string>;
  return Object.fromEntries(keys.map((k) => [k, computed[k]]));
}

function assertPopulated(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    expect(value, `${key} came back empty`).toBeTruthy();
  }
  return values;
}

async function styles(page: Page, testId: string, selector: string, props: readonly string[]) {
  const values = await page
    .getByTestId(testId)
    .locator(selector)
    .first()
    .evaluate(read, props as unknown as string[]);
  return assertPopulated(values);
}

async function shellStyles(page: Page, testId: string) {
  const values = await page
    .getByTestId(testId)
    .evaluate(read, SHELL_PROPS as unknown as string[]);
  return assertPopulated(values);
}

test.describe("search field styling", () => {
  test("the recipes index offers the same Search button as the home page", async ({ page }) => {
    await page.goto("/recipes");

    const bar = page.getByTestId("recipes-search");
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("button", { name: /search/i })).toBeVisible();
  });

  test("both search shells are styled identically", async ({ page }) => {
    await page.goto("/");
    const hero = await shellStyles(page, "hero-search");

    await page.goto("/recipes");
    const index = await shellStyles(page, "recipes-search");

    expect(index).toEqual(hero);
    // A pill, not the old square field.
    expect(parseFloat(hero.borderRadius)).toBeGreaterThan(20);
  });

  test("both submit buttons are styled identically", async ({ page }) => {
    await page.goto("/");
    const hero = await styles(page, "hero-search", "button[type=submit]", BUTTON_PROPS);

    await page.goto("/recipes");
    const index = await styles(page, "recipes-search", "button[type=submit]", BUTTON_PROPS);

    expect(index).toEqual(hero);
  });

  test("both fields carry the leading magnifier icon", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-search").locator("svg")).toHaveCount(1);

    await page.goto("/recipes");
    await expect(page.getByTestId("recipes-search").locator("svg")).toHaveCount(1);
  });
});

test.describe("recipes index search still behaves", () => {
  test("typing filters live, without waiting for the button", async ({ page }) => {
    await page.goto("/recipes");
    await waitForHydration(page, '[data-testid="recipes-search"]');

    await page.getByRole("searchbox").fill("lentil");

    await expect(page).toHaveURL(/[?&]q=lentil/);
    await expect(page.getByTestId("recipe-results").getByRole("link")).toHaveCount(1);
  });

  test("submitting does not reload away from the filtered view", async ({ page }) => {
    await page.goto("/recipes");
    await waitForHydration(page, '[data-testid="recipes-search"]');

    await page.getByRole("searchbox").fill("mirin");
    await page.getByTestId("recipes-search").getByRole("button", { name: /search/i }).click();

    await expect(page).toHaveURL(/[?&]q=mirin/);
    await expect(page.getByRole("searchbox")).toHaveValue("mirin");
    await expect(page.getByTestId("recipe-results").getByRole("link")).toHaveCount(1);
  });

  test("category buttons keep working alongside the new field", async ({ page }) => {
    const category = recipes[0].category;
    const expected = recipes.filter((r) => r.category === category).length;

    await page.goto("/recipes");
    await waitForHydration(page, '[data-testid="recipes-search"]');

    await page.getByRole("button", { name: category, exact: true }).click();

    await expect(page.getByTestId("recipe-results").getByRole("link")).toHaveCount(expected);
  });
});
