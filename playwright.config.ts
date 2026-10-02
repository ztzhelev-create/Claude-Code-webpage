import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

/** Specs that exercise server-side modules directly rather than a page. */
const NODE_SPECS = /.*\.node\.spec\.ts/;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "html" : "list",

  use: {
    baseURL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: NODE_SPECS,
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: NODE_SPECS,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: NODE_SPECS,
    },
    {
      // Responsive runs: the recipe layout must stack on a narrow viewport.
      name: "mobile",
      use: { ...devices["Pixel 5"] },
      testIgnore: NODE_SPECS,
    },
    {
      // Data-layer specs: plain Node, no browser needed.
      name: "data",
      testMatch: NODE_SPECS,
    },
  ],

  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
