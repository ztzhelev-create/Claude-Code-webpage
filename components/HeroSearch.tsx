"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchField } from "./SearchField";

/**
 * The entry point into the recipe index: it carries the query over as `?q=`
 * and lets `RecipeBrowser` do the filtering, so a searched view stays shareable.
 */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <SearchField
      testId="hero-search"
      className="mt-8"
      value={query}
      onChange={setQuery}
      onSubmit={() => {
        const trimmed = query.trim();
        router.push(trimmed ? `/recipes?q=${encodeURIComponent(trimmed)}` : "/recipes");
      }}
      placeholder="Search recipes"
    />
  );
}
