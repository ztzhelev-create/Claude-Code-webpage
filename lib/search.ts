import { splitSections } from "./sections";
import type { Recipe } from "./types";

/**
 * Ingredients are authored in the body rather than the frontmatter, so they
 * have to be read back out of the `## Ingredients` section to be searchable.
 */
export function extractIngredients(content: string): string[] {
  const section = splitSections(content).find(
    (part) => part.heading?.toLowerCase() === "ingredients",
  );
  if (!section) return [];

  return section.body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[*-] +/.test(line))
    .map((line) => line.replace(/^[*-] +/, "").trim())
    .filter(Boolean);
}

/** Every field a visitor can reasonably expect to find a recipe by. */
function haystack(recipe: Recipe): string {
  return [
    recipe.title,
    recipe.description,
    recipe.category,
    ...extractIngredients(recipe.content),
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Substring match across name, category and ingredients. An empty query is not
 * a filter, so it returns the list untouched and in its original order.
 */
export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return recipes;

  return recipes.filter((recipe) => haystack(recipe).includes(needle));
}
