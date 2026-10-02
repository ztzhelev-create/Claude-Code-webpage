import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllRecipes } from "@/lib/mdx";
import { RecipeBrowser } from "@/components/RecipeBrowser";

export const metadata: Metadata = {
  title: "Recipes",
  description: "Every recipe, searchable and filterable by category.",
};

export default function RecipesIndex() {
  const recipes = getAllRecipes();
  const categories = [...new Set(recipes.map((r) => r.category))].sort();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 md:py-16">
      <h1 className="text-4xl font-semibold md:text-5xl">Recipes</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-muted">
        Everything in one place. Search by name or ingredient, or narrow it down
        to a category.
      </p>

      <Suspense fallback={<p className="mt-8 text-muted">Loading recipes…</p>}>
        <RecipeBrowser recipes={recipes} categories={categories} />
      </Suspense>
    </main>
  );
}
