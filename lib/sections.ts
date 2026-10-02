/** One `## Heading` block of a recipe body, plus any text before the first one. */
export type Section = {
  /** `null` for the preamble that precedes the first heading. */
  heading: string | null;
  body: string;
};

/**
 * MDX renders a flat run of headings and lists, which cannot be placed into a
 * two-column grid. Splitting on the `##` headings lets each section own a cell.
 */
export function splitSections(markdown: string): Section[] {
  const parts = markdown.split(/^## +(.+)$/m);
  const sections: Section[] = [];

  const preamble = parts[0].trim();
  if (preamble) sections.push({ heading: null, body: preamble });

  for (let i = 1; i < parts.length; i += 2) {
    sections.push({ heading: parts[i].trim(), body: (parts[i + 1] ?? "").trim() });
  }

  return sections;
}

export function headingId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
