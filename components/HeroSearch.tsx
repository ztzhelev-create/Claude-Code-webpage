"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The entry point into the recipe index: it carries the query over as `?q=`
 * and lets `RecipeBrowser` do the filtering, so a searched view stays shareable.
 */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/recipes?q=${encodeURIComponent(trimmed)}` : "/recipes");
  }

  return (
    <form
      role="search"
      data-testid="hero-search"
      onSubmit={handleSubmit}
      className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-full border border-stone bg-paper p-1.5 transition-colors focus-within:border-ink"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="ml-3 h-4 w-4 shrink-0 text-muted"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        type="search"
        aria-label="Search recipes"
        placeholder="Search recipes"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-10 min-w-0 flex-1 bg-transparent font-body text-ink placeholder:text-muted focus:outline-none"
      />

      <button
        type="submit"
        className="shrink-0 rounded-full bg-citrus px-5 py-2.5 font-display text-sm font-semibold text-ink transition-opacity hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
