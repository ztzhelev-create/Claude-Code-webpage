import { test, expect } from "@playwright/test";
import { siteUrl } from "../lib/site";

const ENV_KEY = "VERCEL_PROJECT_PRODUCTION_URL";

test.describe("siteUrl", () => {
  test.afterEach(() => {
    delete process.env[ENV_KEY];
  });

  test("falls back to the dev origin when not deployed", () => {
    delete process.env[ENV_KEY];
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  // Vercel supplies the bare host, with no scheme.
  test("derives an https origin from the Vercel host", () => {
    process.env[ENV_KEY] = "happy-healthy-marry.vercel.app";
    expect(siteUrl()).toBe("https://happy-healthy-marry.vercel.app");
  });

  test("is read at call time, not frozen at module load", () => {
    delete process.env[ENV_KEY];
    expect(siteUrl()).toBe("http://localhost:3000");
    process.env[ENV_KEY] = "example.com";
    expect(siteUrl()).toBe("https://example.com");
  });

  test("produces a value that parses as a URL", () => {
    process.env[ENV_KEY] = "example.com";
    expect(new URL(siteUrl()).origin).toBe("https://example.com");
  });
});
