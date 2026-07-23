# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## What this is

**Learn Nepali** — a Nepali language-learning web app (flashcards, Devanagari
script review, vocabulary, and a daily "Word of the Day"). It is built on the
[Sanity "clean" Next.js template](https://github.com/sanity-io/sanity-template-nextjs-clean)
and has been extended with domain-specific content types and features.

It is an **npm-workspaces monorepo** with two apps:

| Workspace  | Path        | Stack                                   | Dev port |
| ---------- | ----------- | --------------------------------------- | -------- |
| `frontend` | `/frontend` | Next.js 16 (App Router), React 19       | 3000     |
| `studio`   | `/studio`   | Sanity Studio v5 (content CMS + schema) | 3333     |

The frontend renders content that editors author in the Studio. Sanity is the
single source of truth for all content (lessons, words, characters, etc.).

## Repository layout

```
/
├── frontend/                 # Next.js app (public site)
│   ├── app/                  # App Router routes + components
│   │   ├── components/       # React components (co-located CSS Modules + Storybook stories)
│   │   ├── api/              # Route handlers (draft-mode, cron)
│   │   ├── review/           # Devanagari + vocabulary review flows
│   │   ├── lessons/[slug]/   # Lesson pages
│   │   ├── [slug]/           # Catch-all content pages
│   │   └── layout.tsx        # Root layout (fonts, live editing, header)
│   ├── sanity/lib/           # Sanity client, queries, live config, tokens
│   ├── sanity.types.ts       # GENERATED types (do not edit by hand)
│   └── .storybook/           # Storybook config
├── studio/                   # Sanity Studio
│   ├── src/schemaTypes/      # Content schema (documents / objects / singletons)
│   ├── src/structure/        # Custom Studio desk structure
│   ├── sanity.config.ts      # Studio config (plugins, presentation tool)
│   └── sample-data.tar.gz    # Importable seed dataset
├── netlify/functions/        # Scheduled Netlify function(s)
├── scripts/                  # One-off / maintenance TS scripts (run with tsx)
├── sanity.schema.json        # GENERATED schema extract (feeds typegen)
└── package.json              # Workspace root: dev/lint/format/type-check
```

## Getting started & common commands

Run all commands from the **repo root** unless noted. Node + npm workspaces.

```bash
npm install                    # install all workspaces

npm run dev                    # run frontend (:3000) AND studio (:3333) together
npm run dev:next               # frontend only
npm run dev:studio             # studio only

npm run lint                   # eslint (frontend workspace)
npm run type-check             # tsc --noEmit across all workspaces
npm run format                 # prettier --write . (config: @sanity/prettier-config)
```

Frontend-scoped commands (run in `/frontend` or via `--workspace=frontend`):

```bash
npm run build                  # runs `sanity typegen generate` (prebuild) then `next build`
npm run start                  # serve production build
npm run lint:fix               # eslint --fix
npm run storybook              # Storybook dev server (:6006)
npm run sanity:typegen         # regenerate sanity.schema.json + sanity.types.ts
```

**Testing:** tests run through Storybook + Vitest (`@storybook/addon-vitest`)
using a Playwright/Chromium browser runner (`frontend/vitest.config.ts`). Tests
are the component **stories** (`*.stories.tsx`). There is no standalone `test`
npm script — run via Vitest/Storybook tooling. Chromium is preinstalled in this
environment; do **not** run `playwright install`.

## Sanity type generation — important

`frontend/sanity.types.ts` and root `sanity.schema.json` are **generated
artifacts**. Never hand-edit them. The pipeline is:

1. `sanity schema extract` (in `studio`) writes `sanity.schema.json` at repo root.
2. `sanity typegen generate` (in `frontend`) reads it and writes
   `frontend/sanity.types.ts`.

This runs automatically on `predev`/`prebuild`, or manually via
`npm run sanity:typegen` (frontend). **After changing any schema in
`studio/src/schemaTypes/`, regenerate types** so the frontend stays type-safe.
GROQ queries are written with `defineQuery` from `next-sanity` so typegen can
infer their result types.

## Data layer conventions (frontend)

- **All Sanity access lives in `frontend/sanity/lib/`.** Don't create ad-hoc
  clients in components.
  - `client.ts` — `client` (with stega for visual editing) and `publicClient`.
  - `live.ts` — `sanityFetch` + `<SanityLive>` from `defineLive`. **Use
    `sanityFetch` for all content reads** so live/real-time revalidation works.
  - `queries.ts` — all GROQ queries, defined with `defineQuery`. Add new queries
    here, not inline.
  - `api.ts` — env-derived config (`projectId`, `dataset`, `apiVersion`,
    `studioUrl`); throws if required env vars are missing.
  - `token.ts` — `server-only` read token; never import into client components.
- **Path alias:** `@/*` maps to the frontend root (e.g. `@/sanity/lib/live`,
  `@/app/components/...`). See `frontend/tsconfig.json`.
- **Visual editing / draft mode:** the root layout renders `<SanityLive>`
  always and `<VisualEditing>` only in draft mode. The Studio's Presentation
  tool previews the frontend via `/api/draft-mode/enable`.

## Component conventions (frontend)

- Components live in `frontend/app/components/<Name>/`. Common pattern per
  component: an `index.tsx` (or `<Name>.tsx`), a co-located `<Name>.module.css`
  (CSS Modules), and a `<Name>.stories.tsx` for Storybook.
- Styling is **CSS Modules + Tailwind v4** (`@tailwindcss/postcss`,
  `tailwind.config.ts`). Global styles in `app/globals.css`.
- Fonts are loaded via `next/font/google` in `layout.tsx`, including
  **Noto Sans Devanagari** for Nepali script (`--font-noto-sans-devanagari`).
- `FlashCards` is the current flashcard implementation; `FlashCardsLegacy`
  is the older one kept for compatibility — prefer `FlashCards` for new work.

## Content model (Studio schema)

Schema is registered in `studio/src/schemaTypes/index.ts`. Types:

**Documents**

- `courseSection`, `lesson`, `person` — course/lesson structure and authors.
- `page` — generic content page (page-builder driven).
- `word` — a vocabulary word: `english`, `romanized`, `devanagari`,
  `pronunciation`, optional `audio` file, `tags[]`.
- `phrase` — multi-word expressions (words can be migrated to phrases via the
  `migrateToPhrase` flag + `scripts/migratePhrase.ts`).
- `wordOfTheDay` — a `word` reference scheduled via `scheduledFor` (see feature
  below).
- `consonant`, `vowel`, `combination` — Devanagari script data. A `combination`
  = base `consonant` + optional `vowel` → a `glyph` with `transliteration`.
- `flashcardSet` — an ordered list of `flashcard` objects and/or references to
  `consonant`/`combination`, plus study settings (shuffle, spaced repetition).
- `tags` — used to categorize words (incl. the special `word-of-the-day` tag).

**Objects:** `flashcard`, `blockContent`, `blockContentTextOnly`, `infoSection`,
`callToAction`, `link`, `button`.

**Singletons:** `settings` (site settings; hidden from the main list).

The Studio desk (`src/structure/index.ts`) pluralizes type titles and hides
`settings`, `person`, and `assist.instruction.context` from the main list.

## Word of the Day feature

A daily word is surfaced on the home page. The scheduling/promotion pipeline:

- Editors create `wordOfTheDay` documents with a `scheduledFor` date and a
  reference to a `word`.
- A scheduled job runs `promoteDueWordOfTheDay()`
  (`frontend/sanity/lib/promoteWordOfTheDay.ts`), which finds due entries,
  ensures a `word-of-the-day` tag exists, tags the underlying word document(s)
  (published + draft), keeps the most recent eligible entry, and deletes the
  rest. **Cutoff is midnight America/New_York (ET)**, with careful DST handling
  and support for both date-only and full-ISO `scheduledFor` values.
- It is triggered two ways (both call the same function):
  - **Netlify:** `netlify/functions/promote-word-of-the-day.ts`, scheduled
    hourly in `netlify.toml` (`0 * * * *`); the function self-gates to the ET
    midnight hour.
  - **Vercel:** `frontend/app/api/cron/word-of-the-day/route.ts`, scheduled in
    `frontend/vercel.json`. In production it requires the `x-vercel-cron` header.
- Requires `SANITY_API_WRITE_TOKEN`.
- `npm run ensure-word-of-the-day-words` (root) seeds candidate words via
  `scripts/ensureWordOfTheDayWords.ts`.

## Maintenance scripts (`/scripts`)

Run with `tsx` (e.g. `npx tsx scripts/<name>.ts`); most read env from
`frontend/.env.local` and support `--dry-run`. They need write access
(`SANITY_API_WRITE_TOKEN`). Notable ones:

- `seed-consonants-vowels.ts` — upsert standard Devanagari consonants/vowels.
- `generate-combinations.ts` / `generate-flashcard-sets.ts` — generate
  `combination` and `flashcardSet` documents.
- `ensureWordOfTheDayWords.ts` — seed Word-of-the-Day candidate words.
- `importWords.ts` (+ `words.js`) — bulk import vocabulary.
- `migratePhrase.ts` / `deleteMigratedPhrases.ts` — word↔phrase migration.
- `deleteTags.ts`, `promoteWordOfTheDay.ts`, `dry_run_et_cutoff.js` — misc.

## Environment variables

**Frontend** (`frontend/.env.local`):

- `NEXT_PUBLIC_SANITY_PROJECT_ID` (required)
- `NEXT_PUBLIC_SANITY_DATASET` (required, e.g. `production`)
- `NEXT_PUBLIC_SANITY_API_VERSION` (optional; defaults to a pinned date)
- `NEXT_PUBLIC_SANITY_STUDIO_URL` (optional; defaults `http://localhost:3333`)
- `SANITY_API_READ_TOKEN` (required — `token.ts` throws without it)
- `SANITY_API_WRITE_TOKEN` (required for cron promotion + scripts)

**Studio** (`studio/.env`, see `studio/.env.example`):

- `SANITY_STUDIO_PROJECT_ID` (required)
- `SANITY_STUDIO_DATASET` (required)
- `SANITY_STUDIO_PREVIEW_URL`, `SANITY_STUDIO_STUDIO_HOST` (optional)

Env files are gitignored (`.env*` except `.env.example`). Never commit secrets.

## Deployment

- **Frontend → Vercel or Netlify.** Netlify base dir is `frontend`, build
  `npm run build` (`netlify.toml`). Both hosts run the Word-of-the-Day cron.
- **Studio → Sanity hosting** via `npx sanity deploy` (from `/studio`).
- If you deployed via the Sanity + Vercel integration, see
  `vercel-installation-instructions.md`.

## Conventions & gotchas

- **Formatting:** Prettier with `@sanity/prettier-config` (no semicolons, single
  quotes). Run `npm run format` before committing.
- **No trailing test suite name** — verify changes with `npm run lint` and
  `npm run type-check`, plus Storybook stories where relevant.
- **Don't edit generated files:** `frontend/sanity.types.ts`,
  `studio/sanity.types.ts`, `sanity.schema.json`. Regenerate them instead.
- **Backwards-compat exports** exist in `queries.ts` (`allPostsQuery`,
  `postQuery`, etc. alias the `lesson` queries) — prefer the `lesson*` names.
- `debug-storybook.log` and `sanity-next-preview.png` at root are artifacts, not
  source.

## Git workflow

- Default branch: `main`. Do feature work on a dedicated branch and push there;
  do not push to `main` without explicit permission.
- Only open a pull request when explicitly asked.
</content>
</invoke>
