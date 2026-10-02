import { test, expect } from "@playwright/test";
import { getAllRecipes } from "../lib/mdx";
import { extractIngredients, searchRecipes } from "../lib/search";

const recipes = getAllRecipes();

/* Chosen because they appear only in an ingredient list — never in a title,
   description or category — so a hit proves the body was searched. */
const INGREDIENT_ONLY = "mirin";
const OTHER_INGREDIENT_ONLY = "borlotti";

const BODY = `Some intro prose.

## Ingredients

* 2 large aubergines, halved lengthways
* 2 tbsp mirin
* 1 thumb of ginger, grated

## Method

1. Heat the oven and roast the aubergines until collapsing.
`;

test.describe("extractIngredients", () => {
  test("returns one entry per bullet under the Ingredients heading", () => {
    expect(extractIngredients(BODY)).toEqual([
      "2 large aubergines, halved lengthways",
      "2 tbsp mirin",
      "1 thumb of ginger, grated",
    ]);
  });

  test("ignores the method steps", () => {
    expect(extractIngredients(BODY).join(" ")).not.toContain("Heat the oven");
  });

  test("returns nothing when the body has no ingredient list", () => {
    expect(extractIngredients("## Method\n\n1. Stir.\n")).toEqual([]);
  });

  test("every seeded recipe exposes at least one ingredient", () => {
    for (const recipe of recipes) {
      expect(
        extractIngredients(recipe.content).length,
        `${recipe.slug} has no ingredients`,
      ).toBeGreaterThan(0);
    }
  });
});

test.describe("searchRecipes", () => {
  test("returns everything for an empty or whitespace query", () => {
    expect(searchRecipes(recipes, "")).toHaveLength(recipes.length);
    expect(searchRecipes(recipes, "   ")).toHaveLength(recipes.length);
  });

  test("matches on the recipe name", () => {
    const target = recipes.find((r) => /lentil/i.test(r.title))!;
    const hits = searchRecipes(recipes, "lentil");
    expect(hits.map((r) => r.slug)).toContain(target.slug);
  });

  test("matches on the category", () => {
    const category = recipes[0].category;
    const expected = recipes.filter((r) => r.category === category);
    const hits = searchRecipes(recipes, category);
    for (const recipe of expected) {
      expect(hits.map((r) => r.slug)).toContain(recipe.slug);
    }
  });

  test("matches on an ingredient that appears nowhere in the frontmatter", () => {
    const hits = searchRecipes(recipes, INGREDIENT_ONLY);
    expect(hits).toHaveLength(1);

    const [hit] = hits;
    expect(`${hit.title} ${hit.description} ${hit.category}`.toLowerCase()).not.toContain(
      INGREDIENT_ONLY,
    );
    expect(
      extractIngredients(hit.content).join(" ").toLowerCase(),
    ).toContain(INGREDIENT_ONLY);
  });

  test("tells two ingredient-only terms apart", () => {
    const a = searchRecipes(recipes, INGREDIENT_ONLY);
    const b = searchRecipes(recipes, OTHER_INGREDIENT_ONLY);
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
    expect(a[0].slug).not.toBe(b[0].slug);
  });

  test("is case and padding insensitive", () => {
    const plain = searchRecipes(recipes, INGREDIENT_ONLY).map((r) => r.slug);
    expect(searchRecipes(recipes, INGREDIENT_ONLY.toUpperCase()).map((r) => r.slug)).toEqual(plain);
    expect(searchRecipes(recipes, `  ${INGREDIENT_ONLY}  `).map((r) => r.slug)).toEqual(plain);
  });

  test("returns nothing for a term no recipe mentions", () => {
    expect(searchRecipes(recipes, "zzzznotathing")).toEqual([]);
  });

  test("preserves the incoming order", () => {
    const hits = searchRecipes(recipes, "");
    expect(hits.map((r) => r.slug)).toEqual(recipes.map((r) => r.slug));
  });
});
