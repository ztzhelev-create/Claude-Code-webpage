import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { TimeBadge } from "./TimeBadge";

export function RecipeCard({
  recipe,
  priority = false,
}: {
  recipe: Recipe;
  priority?: boolean;
}) {
  return (
    <article>
      {/* One link per card: the whole block is the target. */}
      <Link href={`/recipes/${recipe.slug}`} className="group block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-stone">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <h3 className="mt-3 font-display text-lg leading-snug group-hover:underline group-hover:decoration-citrus group-hover:decoration-2 group-hover:underline-offset-4">
          {recipe.title}
        </h3>
      </Link>
      <TimeBadge className="mt-2 text-muted">{recipe.timeRequired}</TimeBadge>
    </article>
  );
}
