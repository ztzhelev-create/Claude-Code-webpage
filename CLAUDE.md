# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Personality

Your personality is defined in `soul.md`. Behave exactly as described there in everything you do, on every task, without being reminded.

@soul.md

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev          # next dev on :3000
npm run build        # production build; fails loudly on bad content (see below)
npm start            # serve the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # full Playwright suite (all 5 projects)
```

Running a subset:

```bash
npx playwright test --project=data                  # data layer only, no browser, ~0.5s
npx playwright test --project=chromium              # one browser
npx playwright test tests/recipe-page.spec.ts       # one file
npx playwright test -g "renders ingredients"        # one test by name
npx playwright cli <command>                        # drive a real browser (also `npm run pw`)
```

**Verify by exit code, not by reading piped output.** `npm run lint | tail -2 && echo ok` reports `tail`'s status, not lint's, and will print `ok` over a real failure. Use `npm run lint; echo $?` or check `${PIPESTATUS[0]}`. The Playwright summary line is equally misleading — `180 passed` can accompany a non-zero exit when other tests failed.

**Kill any server on :3000 before running tests.** `playwright.config.ts` sets `reuseExistingServer`, so a leftover `npm start` from an earlier build will be reused and the suite will silently test stale code.

## Test-driven development is required here

This project is built strictly test-first: write the Playwright spec, run it, **watch it fail**, then write the minimum code to make it pass. Skipping the red phase is not a shortcut, it is the thing being practised. A new test that passes immediately usually means it is asserting nothing — a 404 test passes before the route exists.

## Architecture

**Content is the source of truth.** Recipes and articles are MDX files under `content/recipes/` and `content/lifestyle/`. `lib/mdx.ts` is the only module that touches the filesystem; everything else consumes its typed output. Readers are wrapped in React `cache()` and exported as `getAllRecipes`, `getRecipeBySlug`, `getAllLifestyle`, `getLifestyleBySlug`, `getRecipesByCategory`.

**Frontmatter is validated at read time and throws.** Missing fields, a wrong `type` discriminator, a remote image URL, an unparseable date, or an `image` with no matching file in `public/` all raise an error naming the file and the field. Because pages call these readers, a malformed `.mdx` fails `npm run build` with exit 1 rather than rendering blank. Shapes live in `lib/types.ts`; `Recipe` and `LifestylePost` differ (`timeRequired`/`category` versus `date`).

**Recipe bodies are split, not styled into columns.** MDX renders a flat run of `h2, ul, h2, ol`, which cannot be placed into a two-column grid. `lib/sections.ts` splits the body on its `##` headings so the recipe page can render each section into its own cell wrapped in `<section aria-labelledby>`. Those landmark regions are what the tests target (`getByRole("region", { name: "Ingredients" })`), so keep the wrappers when editing that page.

**Filtering is client-side over server-supplied data.** `app/recipes/page.tsx` reads all recipes on the server and hands them to `components/RecipeBrowser.tsx` (`"use client"`), which owns `?q=` and `?category=` via `useSearchParams` so a filtered view is shareable. It must stay inside a `<Suspense>` boundary. The search field keeps local state and adopts URL changes *during render*, not in an effect — `react-hooks/set-state-in-effect` is enforced, and routing the field through the URL alone makes every keystroke wait on a navigation.

**Design tokens live in `app/globals.css`** under Tailwind v4's `@theme inline`: `paper`, `ink`, `muted`, `stone`, `citrus`, plus the two font variables. Use the token utilities (`text-ink`, `border-stone`) rather than raw hex. The clean modern direction is deliberate and is explicitly **not** the `Style.png` reference from the original brief.

## Gotchas

- **Specs that drive client components must wait for hydration.** Use `waitForHydration` from `tests/hydration.ts` before interacting with search, filters, or the newsletter. Without it the test races the hydration boundary and fails on WebKit only, where the handlers are not yet attached.
- **`tests/*.node.spec.ts` run in the browserless `data` project**; the four browser projects ignore that pattern. Put filesystem and parsing tests there so they do not run four times over.
- **Specs import the data layer** (`import { getAllRecipes } from "../lib/mdx"`) and generate a test per recipe, so adding content grows the suite automatically — no spec edits needed.
- **Dates are formatted in a pinned locale and zone** (`en-GB`, `UTC`) in `lib/format.ts`. Left to the default, a server in another timezone renders the day before and the tests still pass.
- **The site name is "Happy Healthy Marry"** — `Marry` is the owner's wife's name, not a typo for "Merry". Never "correct" it. It lives in `components/Header.tsx` and `app/layout.tsx` only.
- The footer contact link must remain exactly `mailto:z.t.zhelev@gmail.com`; a test asserts the attribute.
- Several recipe images are generated "Photograph to come" placeholders awaiting real photography. Replacing the file at the same path is all that is needed.
