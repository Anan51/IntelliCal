# IntelliCal

UCLA student scheduling web app (Next.js 15 App Router + React 19 + TypeScript). Single self-contained frontend product — no backend, database, auth, or external APIs. All logic is client-side on mock data (`src/lib/demo-data.ts`) plus a static sample file in `public/`. See `README.md` for the product pitch and demo script.

## Cursor Cloud specific instructions

- Single service: the Next.js app. Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`). Node 22 is available and works.
- Run the dev server with `npm run dev` (serves http://localhost:3000). No environment variables, secrets, or services are required — the app runs fully on mock data.
- `npm run build` also runs TypeScript type-checking, so it's the most reliable correctness gate in this repo.
- `npm run lint` is NOT usable non-interactively: the project has no ESLint config, so `next lint` (deprecated) prompts to configure ESLint and blocks on TTY input. Don't rely on it in automation; use `npm run build` for type/compile validation instead.
- The `PRD.md`, `HACKATHON_PLAN.md`, and `CURSOR_PROMPT*.md` files describe an aspirational future stack (Google OAuth, Postgres/SQLite, OpenAI parsing). None of that is implemented — do not try to provision those services.
