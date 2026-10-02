"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Recipe } from "@/lib/types";
import { RecipeCard } from "./RecipeCard";

export function RecipeBrowser({
  recipes,
  categories,
}: {
  recipes: Recipe[];
  categories: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const urlQuery = params.get("q") ?? "";
  const category = params.get("category") ?? "";

  /* The field is driven locally so typing never waits on a navigation; the URL
     follows so a filtered view can be shared or reloaded. When the URL changes
     from outside (back/forward, a pasted link), adopt it during render rather
     than in an effect. */
  const [query, setQuery] = useState(urlQuery);
  const [adoptedQuery, setAdoptedQuery] = useState(urlQuery);
  if (urlQuery !== adoptedQuery) {
    setAdoptedQuery(urlQuery);
    setQuery(urlQuery);
  }

  function updateUrl(next: { q?: string; category?: string }) {
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) search.set(key, value);
      else search.delete(key);
    }
    const qs = search.toString();
    router.replace(qs ? `/recipes?${qs}` : "/recipes", { scroll: false });
  }

  const needle = query.trim().toLowerCase();
  const matches = recipes.filter((recipe) => {
    const inCategory = !category || recipe.category === category;
    const inText =
      !needle ||
      recipe.title.toLowerCase().includes(needle) ||
      recipe.description.toLowerCase().includes(needle) ||
      recipe.category.toLowerCase().includes(needle);
    return inCategory && inText;
  });

  function clearAll() {
    setQuery("");
    router.replace("/recipes", { scroll: false });
  }

  return (
    <>
      <div className="mt-8 flex flex-col gap-5">
        <input
          type="search"
          aria-label="Search recipes"
          placeholder="Search recipes"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            updateUrl({ q: event.target.value });
          }}
          className="w-full max-w-md rounded-sm border border-stone bg-transparent px-4 py-3 font-body text-ink placeholder:text-muted"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={category === ""}
            onClick={() => updateUrl({ category: "" })}
            className={`rounded-sm border px-3 py-1.5 font-display text-sm transition-colors ${
              category === ""
                ? "border-ink bg-ink text-paper"
                : "border-stone text-muted hover:border-ink hover:text-ink"
            }`}
          >
            All
          </button>
          {categories.map((name) => {
            const active = category === name;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => updateUrl({ category: active ? "" : name })}
                className={`rounded-sm border px-3 py-1.5 font-display text-sm transition-colors ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-stone text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" role="status">
        {matches.length} of {recipes.length} recipes
      </p>

      <div
        data-testid="recipe-results"
        className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
      >
        {matches.map((recipe, index) => (
          <RecipeCard key={recipe.slug} recipe={recipe} priority={index < 3} />
        ))}
      </div>

      {matches.length === 0 ? (
        <div data-testid="empty-state" className="mt-4 border-t border-stone pt-8">
          <p className="font-display text-xl">Nothing matches that yet.</p>
          <p className="mt-2 max-w-[48ch] text-muted">
            Try a different word, or look through everything.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-5 rounded-sm bg-citrus px-4 py-2.5 font-display text-sm font-semibold text-ink"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </>
  );
}
