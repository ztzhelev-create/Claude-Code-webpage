import type { Metadata } from "next";
import { getAllLifestyle } from "@/lib/mdx";
import { PostCard } from "@/components/PostCard";

export const metadata: Metadata = {
  title: "Lifestyle",
  description: "Writing about cooking, and the life around the table.",
};

export default function LifestyleIndex() {
  const posts = getAllLifestyle();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 md:py-16">
      <h1 className="max-w-[18ch] text-4xl font-semibold md:text-5xl">
        Lifestyle
      </h1>
      <p className="mt-4 max-w-[52ch] text-lg text-muted">
        Writing about cooking, and the life around the table.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
        {posts.map((post, index) => (
          <PostCard key={post.slug} post={post} priority={index < 3} />
        ))}
      </div>
    </main>
  );
}
