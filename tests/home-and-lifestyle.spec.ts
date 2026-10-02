import { test, expect } from "@playwright/test";
import { getAllLifestyle, getAllRecipes } from "../lib/mdx";

const recipes = getAllRecipes();
const posts = getAllLifestyle();
const categories = [...new Set(recipes.map((r) => r.category))];
const RECENT = 3;

test.describe("homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("leads with a featured recipe that links to its page", async ({ page }) => {
    const hero = page.getByTestId("hero");
    await expect(hero).toBeVisible();
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();

    const href = await hero.getByRole("link").first().getAttribute("href");
    expect(recipes.map((r) => `/recipes/${r.slug}`)).toContain(href);
  });

  test("shows the latest recipes", async ({ page }) => {
    const latest = page.getByRole("region", { name: "Latest recipes" });
    await expect(latest).toBeVisible();
    expect(await latest.getByRole("link").count()).toBe(RECENT);
  });

  test("groups recipes into category-labelled sections", async ({
    page,
  }) => {
    for (const category of categories) {
      const section = page.getByRole("region", { name: category, exact: true });
      await expect(section).toBeVisible();
      expect(await section.getByRole("link").count()).toBeGreaterThan(0);
    }
  });

  test("every recipe is reachable from the homepage", async ({ page }) => {
    for (const recipe of recipes) {
      await expect(
        page.locator(`a[href="/recipes/${recipe.slug}"]`).first(),
      ).toBeAttached();
    }
  });

  test("lists the most recent lifestyle articles, newest first", async ({
    page,
  }) => {
    const section = page.getByRole("region", { name: "Lifestyle" });
    await expect(section).toBeVisible();

    const dates = await section.locator("time").evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("datetime")),
    );
    expect(dates.length).toBe(Math.min(RECENT, posts.length));
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

test.describe("lifestyle index", () => {
  test("lists every post with a link and a date", async ({ page }) => {
    await page.goto("/lifestyle");

    for (const post of posts) {
      const link = page.locator(`a[href="/lifestyle/${post.slug}"]`).first();
      await expect(link).toBeVisible();
    }

    const dates = await page
      .locator("main time")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("datetime")));
    expect(dates.length).toBe(posts.length);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

test.describe("lifestyle detail", () => {
  const [post] = posts;

  test("renders the title, hero image, date and body", async ({ page }) => {
    await page.goto(`/lifestyle/${post.slug}`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(post.title);
    await expect(page.getByRole("img", { name: post.title })).toBeVisible();
    await expect(page.locator("main time").first()).toHaveAttribute(
      "datetime",
      post.date,
    );
    await expect(page.locator("main p").first()).toBeVisible();
  });

  test("uses the post title as the page title", async ({ page }) => {
    await page.goto(`/lifestyle/${post.slug}`);
    await expect(page).toHaveTitle(new RegExp(post.title));
  });

  for (const { slug, title } of posts) {
    test(`"${slug}" is statically routed`, async ({ page }) => {
      const response = await page.goto(`/lifestyle/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    });
  }

  test("an unknown slug is a 404", async ({ page }) => {
    const response = await page.goto("/lifestyle/not-a-real-post");
    expect(response?.status()).toBe(404);
  });
});
