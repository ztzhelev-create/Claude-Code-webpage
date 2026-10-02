import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllLifestyle, getLifestyleBySlug } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx-components";
import { formatDate } from "@/lib/format";

type PostParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllLifestyle().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getLifestyleBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      images: [{ url: post.image }],
    },
  };
}

export default async function LifestylePost({ params }: PostParams) {
  const { slug } = await params;
  const post = getLifestyleBySlug(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 md:py-14">
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-sm bg-stone md:aspect-[2/1]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <header className="mt-8 md:mt-10">
        <h1 className="max-w-[20ch] text-4xl font-semibold md:text-5xl">
          {post.title}
        </h1>
        <time
          dateTime={post.date}
          className="mt-4 block border-l-2 border-citrus pl-3 font-display text-sm"
        >
          {formatDate(post.date)}
        </time>
      </header>

      <div className="mt-8 border-t border-stone pt-8 text-lg">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>
    </main>
  );
}
