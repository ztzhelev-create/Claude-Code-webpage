/** Dev and test both serve from here; Playwright's baseURL matches. */
const DEV_ORIGIN = "http://localhost:3000";

/**
 * The origin absolute metadata URLs are resolved against.
 *
 * Vercel exposes the production host without a scheme, and only at runtime,
 * so this is read per call rather than captured at module load.
 */
export function siteUrl(): string {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return host ? `https://${host}` : DEV_ORIGIN;
}
