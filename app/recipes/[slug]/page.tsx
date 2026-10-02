import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllRecipes, getRecipeBySlug } from "@/lib/mdx";
import { headingId, splitSections } from "@/lib/sections";
import { mdxComponents } from "@/components/mdx-components";

type RecipeParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllRecipes().map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({
  params,
}: RecipeParams): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) return {};

  return {
    title: recipe.title,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: [{ url: recipe.image }],
    },
  };
}

export default async function RecipePage({ params }: RecipeParams) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) notFound();

  const sections = splitSections(recipe.content);
  const preamble = sections.find((section) => section.heading === null);
  const body = sections.filter((section) => section.heading !== null);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 md:py-14">
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-sm md:aspect-[21/9]">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />
      </div>

      <header className="mt-8 md:mt-10">
        <h1 className="max-w-[20ch] text-4xl font-semibold md:text-5xl">
          {recipe.title}
        </h1>
        <p className="mt-4 max-w-[58ch] text-lg text-muted">
          {recipe.description}
        </p>
        <p
          data-testid="time-required"
          className="mt-6 inline-block border-l-2 border-citrus pl-3 font-display text-sm"
        >
          <span className="sr-only">Time required </span>
          {recipe.timeRequired}
        </p>
      </header>

      {preamble ? (
        <div className="mt-8 border-t border-stone pt-8">
          <MDXRemote source={preamble.body} components={mdxComponents} />
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-10 md:mt-14 md:grid-cols-[1fr_1.5fr] md:gap-16">
        {body.map((section) => {
          const id = headingId(section.heading!);
          return (
            <section key={id} aria-labelledby={id}>
              <h2 id={id} className="mb-4 text-2xl font-semibold">
                {section.heading}
              </h2>
              <MDXRemote source={section.body} components={mdxComponents} />
            </section>
          );
        })}
      </div>
    </main>
  );
}
