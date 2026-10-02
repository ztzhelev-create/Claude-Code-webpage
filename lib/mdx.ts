import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import type { LifestylePost, Recipe } from "./types";

const RECIPES_DIR = path.join(process.cwd(), "content", "recipes");
const LIFESTYLE_DIR = path.join(process.cwd(), "content", "lifestyle");

const LOCAL_IMAGE = /^\/images\/.+\.(jpe?g|png|webp)$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Frontmatter problems are build-time problems: throw loudly, naming the file
 * and the field, rather than letting a page render blank.
 */
function fail(collection: string, slug: string, problem: string): never {
  throw new Error(`content/${collection}/${slug}.mdx: ${problem}`);
}

function requireStrings(
  data: Record<string, unknown>,
  fields: readonly string[],
  collection: string,
  slug: string,
) {
  for (const field of fields) {
    const value = data[field];
    if (typeof value !== "string" || value.trim() === "") {
      fail(collection, slug, `missing required frontmatter field "${field}"`);
    }
  }
}

/** YAML turns an unquoted `2026-09-14` into a Date; accept either spelling. */
function toIsoDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  return typeof value === "string" ? value : null;
}

export function parseRecipe(source: string, slug: string): Recipe {
  const { data, content } = matter(source);

  requireStrings(
    data,
    ["title", "description", "image", "timeRequired", "category", "type"],
    "recipes",
    slug,
  );

  if (data.type !== "recipe") {
    fail("recipes", slug, `frontmatter type must be "recipe", got "${data.type}"`);
  }
  if (!LOCAL_IMAGE.test(data.image)) {
    fail(
      "recipes",
      slug,
      `image must be a local path like "/images/name.jpeg", got "${data.image}"`,
    );
  }

  return {
    slug,
    title: data.title,
    description: data.description,
    image: data.image,
    timeRequired: data.timeRequired,
    category: data.category,
    type: "recipe",
    content: content.trim(),
  };
}

export function parseLifestylePost(source: string, slug: string): LifestylePost {
  const { data, content } = matter(source);

  requireStrings(data, ["title", "description", "image", "type"], "lifestyle", slug);

  if (data.type !== "lifestyle") {
    fail("lifestyle", slug, `frontmatter type must be "lifestyle", got "${data.type}"`);
  }
  if (!LOCAL_IMAGE.test(data.image)) {
    fail(
      "lifestyle",
      slug,
      `image must be a local path like "/images/name.jpeg", got "${data.image}"`,
    );
  }

  const date = toIsoDate(data.date);
  if (date === null || !ISO_DATE.test(date)) {
    fail("lifestyle", slug, `date must be an ISO calendar date (YYYY-MM-DD), got "${data.date}"`);
  }

  return {
    slug,
    title: data.title,
    description: data.description,
    image: data.image,
    date,
    type: "lifestyle",
    content: content.trim(),
  };
}

/**
 * A frontmatter image that is not on disk renders as a broken box rather than
 * an error, so check it at read time alongside the rest of the frontmatter.
 */
export function assertLocalAssetExists(
  image: string,
  collection: string,
  slug: string,
): void {
  const onDisk = path.join(process.cwd(), "public", image);
  if (!fs.existsSync(onDisk)) {
    fail(collection, slug, `image "${image}" does not exist in public/`);
  }
}

function readCollection<T>(
  dir: string,
  parse: (source: string, slug: string) => T,
): T[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) =>
      parse(fs.readFileSync(path.join(dir, file), "utf8"), file.replace(/\.mdx$/, "")),
    );
}

export const getAllRecipes = cache((): Recipe[] => {
  const recipes = readCollection(RECIPES_DIR, parseRecipe);
  for (const recipe of recipes) {
    assertLocalAssetExists(recipe.image, "recipes", recipe.slug);
  }
  return recipes.sort((a, b) => a.title.localeCompare(b.title));
});

export const getAllLifestyle = cache((): LifestylePost[] => {
  const posts = readCollection(LIFESTYLE_DIR, parseLifestylePost);
  for (const post of posts) {
    assertLocalAssetExists(post.image, "lifestyle", post.slug);
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
});

export const getRecipeBySlug = cache(
  (slug: string): Recipe | null =>
    getAllRecipes().find((recipe) => recipe.slug === slug) ?? null,
);

export const getLifestyleBySlug = cache(
  (slug: string): LifestylePost | null =>
    getAllLifestyle().find((post) => post.slug === slug) ?? null,
);

export const getRecipesByCategory = cache((category: string): Recipe[] =>
  getAllRecipes().filter((recipe) => recipe.category === category),
);
