import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

const CONTACT_EMAIL = "z.t.zhelev@gmail.com";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="mx-auto grid max-w-5xl gap-12 px-5 py-14 md:grid-cols-2 md:gap-16">
        <div>
          <p className="max-w-[26ch] font-display text-2xl leading-tight">
            Made something from here? Tell me how it turned out.
          </p>
          <Link
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-6 inline-block rounded-sm bg-citrus px-5 py-3 font-display text-[0.95rem] font-semibold text-ink transition-opacity hover:opacity-90"
          >
            Contact me
          </Link>
        </div>

        <NewsletterForm />
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-8">
        <p className="text-sm text-stone">Cooking, and the life around it.</p>
      </div>
    </footer>
  );
}
