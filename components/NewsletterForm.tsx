"use client";

import { useState } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!EMAIL.test(email.trim())) {
      setError("Enter an email address, like name@example.com.");
      return;
    }

    setError(null);
    setSubscribed(true);
  }

  return (
    <section
      data-testid="newsletter"
      aria-labelledby="newsletter-heading"
      className="max-w-sm"
    >
      <h2 id="newsletter-heading" className="font-display text-xl">
        Something new most weeks
      </h2>

      {subscribed ? (
        <p data-testid="newsletter-success" className="mt-3 text-stone">
          You&rsquo;re on the list. The next recipe lands in your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-3">
          <label htmlFor="newsletter-email" className="block text-sm text-stone">
            Email address
          </label>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "newsletter-error" : undefined}
              className="w-full rounded-sm border border-paper/30 bg-paper px-3 py-2.5 text-ink"
            />
            <button
              type="submit"
              className="shrink-0 rounded-sm bg-citrus px-4 py-2.5 font-display text-sm font-semibold text-ink"
            >
              Subscribe
            </button>
          </div>

          {error ? (
            <p id="newsletter-error" role="alert" className="mt-2 text-sm text-citrus">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
