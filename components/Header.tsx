"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Recipes", href: "/recipes" },
  { label: "Lifestyle", href: "/lifestyle" },
] as const;

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-stone">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-5 pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <Link
          href="/"
          data-testid="wordmark"
          className="pb-4 font-display text-[1.75rem] font-extrabold tracking-[-0.03em] sm:text-3xl"
        >
          Happy Healthy Marry
        </Link>

        <nav aria-label="Main" className="-mx-5 w-full overflow-x-auto px-5 sm:mx-0 sm:w-auto sm:overflow-visible sm:px-0">
          <ul className="flex gap-7">
            {LINKS.map(({ label, href }) => {
              const current = isCurrent(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={current ? "page" : undefined}
                    /* The 3px border overlaps the header rule, so the active
                       item interrupts it rather than sitting above it. */
                    className={`-mb-px block whitespace-nowrap border-b-[3px] pb-4 font-display text-base transition-colors ${
                      current
                        ? "border-citrus text-ink"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
