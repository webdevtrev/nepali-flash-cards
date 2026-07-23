# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A Nepali language–learning web app (flashcards, Devanagari review, word-of-the-day). Built on the Sanity + Next.js "clean" template. It is an **npm workspaces monorepo** with two workspaces:

- `frontend/` — Next.js 16 (App Router, React 19) app served to learners.
- `studio/` — Sanity Studio (v5) CMS where content editors manage words, consonants, lessons, etc.

Sanity is the single source of truth for all content. The frontend fetches content via GROQ queries; there is no separate application database.

## Commands

Run from the repo root unless noted. The root uses npm workspaces, so most tasks fan out to the two workspaces.

- `npm run dev` — runs frontend (`:3000`) and studio (`:3333`) concurrently via `npm-run-all`.
- `npm run dev:next` / `npm run dev:studio` — run just one workspace.
- `npm run type-check` — `tsc --noEmit` across both workspaces.
- `npm run lint` — ESLint (frontend only). Use `npm run lint:fix --workspace=frontend` to autofix.
- `npm run format` — Prettier over the whole repo (`@sanity/prettier-config`, no semicolons, single quotes).

Frontend (`cd frontend` or `--workspace=frontend`):
- `npm run build` — `next build` (a `prebuild` hook runs `sanity typegen generate` first).
- `npm run storybook` — Storybook on `:6006`; `npm run build-storybook` to build.
- Tests run through **Storybook + Vitest** (`@storybook/addon-vitest`, browser mode via Playwright). Config in `frontend/vitest.config.ts`. Component tests live as `*.stories.tsx` play functions. Run a single story file with `npx vitest run path/to/Component.stories.tsx` from `frontend/`.

### Sanity typegen (important)

Types are generated, not hand-written. `frontend/sanity.types.ts` and `studio/sanity.types.ts` are **generated artifacts** — do not edit them by hand. After changing any schema in `studio/src/schemaTypes/` or any GROQ query, regenerate:

- `npm run sanity:typegen --workspace=frontend` — extracts the schema to the root `sanity.schema.json`, then generates typed query results.

Both `predev` and `prebuild` run typegen automatically, so a fresh `npm run dev` / `build` will pick up schema changes.

## Architecture

### Content model (Sanity schema)

Schema types are registered in [studio/src/schemaTypes/index.ts](studio/src/schemaTypes/index.ts). Domain-specific document types for this app:

- `word` — vocabulary: english, romanized, devanagari, pronunciation, optional audio file, tags.
- `consonant` — Devanagari consonant glyphs (char, transliteration, type).
- `phrase`, `lesson`, `courseSection` — lesson/phrase content.
- `wordOfTheDay` — a *scheduled* entry referencing a `word` plus a `scheduledFor` date (see flow below).
- `tags` — used to categorize words; the `word-of-the-day` tag is special (see below).
- `page`, `person`, `settings` (singleton) — carryover template types.

The Studio document list is customized in [studio/src/structure/index.ts](studio/src/structure/index.ts), which hides `settings`, `person`, and AI-assist types and pluralizes titles.

### Word of the Day flow

This is the most nontrivial feature and spans schema, a cron job, and a scheduled function:

1. An editor creates a `wordOfTheDay` document referencing a `word`, with a `scheduledFor` date.
2. A scheduler calls `promoteDueWordOfTheDay()` in [frontend/sanity/lib/promoteWordOfTheDay.ts](frontend/sanity/lib/promoteWordOfTheDay.ts). It finds due entries, ensures the `word-of-the-day` tag document exists, tags the underlying `word` (both published and draft), keeps only the most-recent due entry, and deletes the rest.
3. The review page ([frontend/app/review/vocabulary/word-of-the-day/page.tsx](frontend/app/review/vocabulary/word-of-the-day/page.tsx)) queries `word` docs that `references("word-of-the-day")`.

Two independent schedulers invoke the promotion (whichever the deployment target uses):
- **Vercel cron** → `frontend/app/api/cron/word-of-the-day/route.ts` (guarded by the `x-vercel-cron` header in production). Configured in `frontend/vercel.json`.
- **Netlify scheduled function** → `netlify/functions/promote-word-of-the-day.ts`, scheduled hourly in `netlify.toml`; it self-gates to run only at midnight America/New_York.

All date math is timezone-aware around **America/New_York** and carefully handles date-only vs. full-ISO `scheduledFor` values and DST — preserve that logic when editing.

### Frontend data fetching

- Reusable GROQ queries live in [frontend/sanity/lib/queries.ts](frontend/sanity/lib/queries.ts) using `defineQuery` (required for typegen to type results). Prefer adding queries here so results stay typed. Some pages (e.g. word-of-the-day) inline a query string with `client.fetch` — those are **not** typed.
- Sanity clients are in [frontend/sanity/lib/client.ts](frontend/sanity/lib/client.ts): `client` (stega-enabled for Visual Editing) and `publicClient`.
- Live/preview content uses `sanityFetch` and `<SanityLive>` from [frontend/sanity/lib/live.ts](frontend/sanity/lib/live.ts) (`defineLive`). Draft Mode + `<VisualEditing>` are wired in [frontend/app/layout.tsx](frontend/app/layout.tsx) for the Sanity Presentation tool.
- Env config (`projectId`, `dataset`, `apiVersion`, `studioUrl`) is centralized in [frontend/sanity/lib/api.ts](frontend/sanity/lib/api.ts) and read from `NEXT_PUBLIC_SANITY_*` env vars.

### Frontend routing / UI

- App Router pages under `frontend/app/`. Learner-facing sections: `/review` (→ `devanagari` consonants/vowels, `vocabulary/word-of-the-day`), `/quiz`, `/learn`, `/lessons/[slug]`, `/profile`, `/settings`. Some (`/learn`) are stubs.
- The core interactive component is [frontend/app/components/FlashCards/FlashCards.tsx](frontend/app/components/FlashCards/FlashCards.tsx) — a client component with a `type: 'devanagari' | 'word'` prop; server pages fetch data and map it into its `cards` shape.
- Styling is **CSS Modules** (`*.module.css`) plus Tailwind CSS v4. Icons from `react-icons`. Toasts via `sonner`. Devanagari text uses the `Noto_Sans_Devanagari` font (loaded in the root layout) and should carry `lang="ne"`.

### Scripts (`scripts/`)

Standalone `tsx` maintenance/seed scripts (word import, combination/vowel generation, migrations, deletions) that talk to Sanity with a write client. They load env from `frontend/.env.local` and require `SANITY_API_WRITE_TOKEN`. Run with e.g. `npx tsx scripts/importWords.ts`. `npm run ensure-word-of-the-day-words` is the one wired into package.json. These are one-off/administrative — they write directly to the production dataset.

## Environment

Secrets live in `.env.local` (gitignored). Required Sanity vars: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` (`production`), `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_SANITY_STUDIO_URL`, and `SANITY_API_WRITE_TOKEN` (write client + scripts + WotD promotion).

## Deployment

- Frontend deploys to **Netlify** (`netlify.toml`, base `frontend`) and/or **Vercel** (`frontend/vercel.json`). The word-of-the-day scheduler differs per platform (see the flow above).
- The Studio is deployed separately with `npm run deploy --workspace=studio` (`sanity deploy`).
