import type { MDXComponents } from "mdx/types";

/**
 * Body styling for authored MDX. Ingredients read as a scannable list of
 * discrete things to gather; method steps read as a numbered sequence.
 */
export const mdxComponents: MDXComponents = {
  p: (props) => <p className="mb-4 max-w-[62ch] last:mb-0" {...props} />,

  ul: (props) => (
    <ul className="divide-y divide-stone border-y border-stone" {...props} />
  ),
  ol: (props) => (
    <ol
      className="list-decimal space-y-4 pl-6 marker:font-display marker:font-semibold marker:text-citrus"
      {...props}
    />
  ),
  li: (props) => <li className="py-2 [ol>&]:py-0 [ol>&]:pl-1" {...props} />,

  h3: (props) => <h3 className="mt-8 mb-3 text-lg font-semibold" {...props} />,

  a: (props) => (
    <a
      className="underline decoration-citrus decoration-2 underline-offset-4 hover:decoration-ink"
      {...props}
    />
  ),

  strong: (props) => <strong className="font-semibold" {...props} />,

  // eslint-disable-next-line @next/next/no-img-element
  img: (props) => <img className="my-6 w-full rounded-sm" alt="" {...props} />,
};
