/** A recipe, as authored in `content/recipes/<slug>.mdx`. */
export type Recipe = {
  slug: string;
  title: string;
  description: string;
  /** Local path under `public/`, e.g. `/images/feijoada.jpeg`. */
  image: string;
  timeRequired: string;
  category: string;
  type: "recipe";
  /** The MDX body, frontmatter stripped. */
  content: string;
};

/** A lifestyle article, as authored in `content/lifestyle/<slug>.mdx`. */
export type LifestylePost = {
  slug: string;
  title: string;
  description: string;
  image: string;
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  type: "lifestyle";
  content: string;
};
