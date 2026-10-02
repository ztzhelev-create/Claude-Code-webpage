export function TimeBadge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      data-testid="time-required"
      className={`inline-block border-l-2 border-citrus pl-3 font-display text-sm ${className}`}
    >
      <span className="sr-only">Time required </span>
      {children}
    </p>
  );
}
