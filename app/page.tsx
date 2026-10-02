import Image from "next/image";
import Link from "next/link";
import { getAllLifestyle, getAllRecipes } from "@/lib/mdx";
import { headingId } from "@/lib/sections";
import { RecipeCard } from "@/components/RecipeCard";
import { PostCard } from "@/components/PostCard";
import { TimeBadge } from "@/components/TimeBadge";
import { HeroSearch } from "@/components/HeroSearch";

const RECENT = 3;

export default function Home() {
  const recipes = getAllRecipes();
  const [featured, ...rest] = recipes;
  const latest = rest.slice(0, RECENT);
  const posts = getAllLifestyle().slice(0, RECENT);

  const categories = [...new Set(recipes.map((r) => r.category))].sort();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 md:py-16">
      <section data-testid="hero">
        <h1 className="max-w-[18ch] text-4xl font-semibold md:text-6xl">
          Recipes worth repeating
        </h1>

        <p className="mt-5 max-w-[48ch] text-lg text-muted">
          Search the whole collection by name, by category, or by what you
          already have in the cupboard.
        </p>

        <HeroSearch />

        <Link
          href={`/recipes/${featured.slug}`}
          className="group mt-8 grid gap-6 md:mt-12 md:grid-cols-2 md:items-center md:gap-10"
        >
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-sm bg-stone">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div>
            <h2 className="text-3xl font-semibold group-hover:underline group-hover:decoration-citrus group-hover:decoration-2 group-hover:underline-offset-4 md:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-3 max-w-[48ch] text-lg text-muted">
              {featured.description}
            </p>
            <TimeBadge className="mt-5">{featured.timeRequired}</TimeBadge>
          </div>
        </Link>
      </section>

      <section
        aria-labelledby="latest-recipes"
        className="mt-16 border-t border-stone pt-10 md:mt-24"
      >
        <h2 id="latest-recipes" className="text-2xl font-semibold">
          Latest recipes
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {latest.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="by-category"
        className="mt-16 border-t border-stone pt-10 md:mt-24"
      >
        <h2 id="by-category" className="text-2xl font-semibold">
          Browse by category
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category) => {
            const id = headingId(category);
            return (
              <section key={category} aria-labelledby={id}>
                <h3 id={id} className="font-display text-lg">
                  {category}
                </h3>
                {/* Compact index: the photography already appears above. */}
                <ul className="mt-3 divide-y divide-stone border-t border-stone">
                  {recipes
                    .filter((recipe) => recipe.category === category)
                    .map((recipe) => (
                      <li key={recipe.slug}>
                        <Link
                          href={`/recipes/${recipe.slug}`}
                          className="flex items-baseline justify-between gap-4 py-3 hover:underline hover:decoration-citrus hover:decoration-2 hover:underline-offset-4"
                        >
                          <span>{recipe.title}</span>
                          <span className="shrink-0 text-sm text-muted">
                            {recipe.timeRequired}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="lifestyle"
        className="mt-16 border-t border-stone pt-10 md:mt-24"
      >
        <h2 id="lifestyle" className="text-2xl font-semibold">
          Lifestyle
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
