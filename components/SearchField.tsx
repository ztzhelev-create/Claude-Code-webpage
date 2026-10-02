"use client";

/**
 * The pill-shaped search field shared by the home hero and the recipes index,
 * so the two stay identical by construction rather than by copied classes.
 */
export function SearchField({
  testId,
  value,
  onChange,
  onSubmit,
  placeholder,
  label = "Search recipes",
  className = "",
}: {
  testId: string;
  value: string;
  onChange: (value: string) => void;
  /** Omitted where filtering is already live; the form still must not reload. */
  onSubmit?: () => void;
  placeholder: string;
  label?: string;
  className?: string;
}) {
  return (
    <form
      role="search"
      data-testid={testId}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className={`flex w-full max-w-xl items-center gap-2 rounded-full border border-stone bg-paper p-1.5 transition-colors focus-within:border-ink ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="ml-3 h-4 w-4 shrink-0 text-muted"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-0 flex-1 bg-transparent font-body text-ink placeholder:text-muted focus:outline-none"
      />

      <button
        type="submit"
        className="shrink-0 rounded-full bg-citrus px-5 py-2.5 font-display text-sm font-semibold text-ink transition-opacity hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
