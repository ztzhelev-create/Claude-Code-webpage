import Image from "next/image";
import Link from "next/link";
import type { LifestylePost } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function PostCard({
  post,
  priority = false,
}: {
  post: LifestylePost;
  priority?: boolean;
}) {
  return (
    <article>
      <Link href={`/lifestyle/${post.slug}`} className="group block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-stone">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <h3 className="mt-3 font-display text-lg leading-snug group-hover:underline group-hover:decoration-citrus group-hover:decoration-2 group-hover:underline-offset-4">
          {post.title}
        </h3>
      </Link>
      <time dateTime={post.date} className="mt-2 block text-sm text-muted">
        {formatDate(post.date)}
      </time>
      <p className="mt-2 max-w-[48ch] text-muted">{post.description}</p>
    </article>
  );
}
