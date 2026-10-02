import type { Page } from "@playwright/test";

/**
 * Filtering and the newsletter are client-side, so a test that interacts before
 * React has attached its handlers races the hydration boundary — which shows up
 * on slower engines. Wait until React owns the node before driving it.
 */
export async function waitForHydration(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return !!el && Object.keys(el).some((key) => key.startsWith("__react"));
  }, selector);
}
