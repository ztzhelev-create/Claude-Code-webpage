import { test, expect } from "@playwright/test";
import {
  assertLocalAssetExists,
  getAllLifestyle,
  getAllRecipes,
  getLifestyleBySlug,
  getRecipeBySlug,
  getRecipesByCategory,
  parseLifestylePost,
  parseRecipe,
} from "../lib/mdx";

const VALID_RECIPE = `---
title: "Fixture Loaf"
description: "A loaf that exists only for the tests."
image: "/images/fixture-loaf.jpeg"
timeRequired: "40 mins"
category: "Baking"
type: "recipe"
---

## Ingredients

* flour

## Method

1. Bake it.
`;

test.describe("recipe collection", () => {
  test("finds the seeded recipes and parses the full typed shape", () => {
    const recipes = getAllRecipes();
    expect(recipes.length).toBeGreaterThanOrEqual(3);

    for (const recipe of recipes) {
      expect(recipe).toMatchObject({
        slug: expect.stringMatching(/^[a-z0-9-]+$/),
        title: expect.any(String),
        description: expect.any(String),
        image: expect.stringMatching(/^\/images\/.+\.(jpe?g|png|webp)$/),
        timeRequired: expect.any(String),
        category: expect.any(String),
        type: "recipe",
      });
      expect(recipe.content.trim()).not.toBe("");
    }
  });

  test("every recipe body carries an Ingredients and a Method section", () => {
    for (const recipe of getAllRecipes()) {
      expect(recipe.content).toContain("## Ingredients");
      expect(recipe.content).toContain("## Method");
    }
  });

  test("getRecipeBySlug round-trips a known slug and returns null otherwise", () => {
    const [first] = getAllRecipes();
    expect(getRecipeBySlug(first.slug)).toEqual(first);
    expect(getRecipeBySlug("no-such-recipe")).toBeNull();
  });

  test("getRecipesByCategory returns only that category, and nothing for an unused one", () => {
    const { category } = getAllRecipes()[0];
    const matches = getRecipesByCategory(category);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((r) => r.category === category)).toBe(true);
    expect(getRecipesByCategory("Not A Category")).toEqual([]);
  });
});

test.describe("lifestyle collection", () => {
  test("parses lifestyle frontmatter into its own shape", () => {
    const posts = getAllLifestyle();
    expect(posts.length).toBeGreaterThanOrEqual(2);

    for (const post of posts) {
      expect(post).toMatchObject({
        slug: expect.stringMatching(/^[a-z0-9-]+$/),
        title: expect.any(String),
        description: expect.any(String),
        image: expect.stringMatching(/^\/images\/.+\.(jpe?g|png|webp)$/),
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        type: "lifestyle",
      });
      // Lifestyle posts carry no recipe-only fields.
      expect(post).not.toHaveProperty("timeRequired");
    }
  });

  test("lifestyle posts come back newest first", () => {
    const dates = getAllLifestyle().map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test("getLifestyleBySlug round-trips a known slug and returns null otherwise", () => {
    const [first] = getAllLifestyle();
    expect(getLifestyleBySlug(first.slug)).toEqual(first);
    expect(getLifestyleBySlug("no-such-post")).toBeNull();
  });
});

test.describe("frontmatter validation", () => {
  test("accepts a well-formed recipe", () => {
    const recipe = parseRecipe(VALID_RECIPE, "fixture-loaf");
    expect(recipe.title).toBe("Fixture Loaf");
    expect(recipe.category).toBe("Baking");
    expect(recipe.type).toBe("recipe");
  });

  test("rejects a recipe missing a required field, naming the file and the field", () => {
    const missingTime = VALID_RECIPE.replace(/timeRequired: .*\n/, "");
    expect(() => parseRecipe(missingTime, "fixture-loaf")).toThrow(
      /fixture-loaf.*timeRequired/,
    );
  });

  test("rejects a recipe carrying the wrong type discriminator", () => {
    const wrongType = VALID_RECIPE.replace('type: "recipe"', 'type: "lifestyle"');
    expect(() => parseRecipe(wrongType, "fixture-loaf")).toThrow(/type/);
  });

  test("rejects a recipe whose image is not a local public path", () => {
    const remoteImage = VALID_RECIPE.replace(
      '"/images/fixture-loaf.jpeg"',
      '"https://example.com/loaf.jpg"',
    );
    expect(() => parseRecipe(remoteImage, "fixture-loaf")).toThrow(/image/);
  });

  test("rejects a lifestyle post with an unparseable date", () => {
    const badDate = `---
title: "Fixture Post"
description: "Exists only for the tests."
image: "/images/fixture-post.jpeg"
date: "last Tuesday"
type: "lifestyle"
---

Body.
`;
    expect(() => parseLifestylePost(badDate, "fixture-post")).toThrow(/date/);
  });
});

test.describe("referenced images", () => {
  test("rejects a post pointing at an image that is not in public/", () => {
    expect(() =>
      assertLocalAssetExists("/images/not-on-disk.jpeg", "recipes", "ghost"),
    ).toThrow(/not-on-disk\.jpeg/);
  });

  test("every seeded recipe and post points at a file that exists", () => {
    for (const recipe of getAllRecipes()) {
      expect(() =>
        assertLocalAssetExists(recipe.image, "recipes", recipe.slug),
      ).not.toThrow();
    }
    for (const post of getAllLifestyle()) {
      expect(() =>
        assertLocalAssetExists(post.image, "lifestyle", post.slug),
      ).not.toThrow();
    }
  });
});
