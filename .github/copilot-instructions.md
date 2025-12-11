# Copilot / AI Agent Instructions for Fitnessapp

Purpose: Provide targeted, actionable guidance so an AI coding agent can become productive quickly in this repository.

Quick setup (dev) 🔧
- Install deps: `npm install` (or `pnpm install` / `yarn`).
- Prisma: Run `npx prisma generate` then `npx prisma db push` (DB is SQLite by default).
- Environment: set `DATABASE_URL` (default in `.env` is `file:./dev.db`) and `OPENAI_API_KEY` (for AI endpoints).
- Start dev server: `npm run dev` and open `http://localhost:3000`.
- Create seed data (dev only): visit `http://localhost:3000/api/seed` to create a trainer and client.

Big-picture architecture 🏗️
- Next.js App Router project: UI pages are under `app/`; `page.tsx` is the main entry per route.
- API routes live under `app/api/*/route.ts` (Next.js serverless-style handlers).
- Database: Prisma. `prisma/schema.prisma` defines models (User, Program, WorkoutLog, PlannedWorkout, Measurement).
- Storage convention: Many entities keep structured data as a JSON string in a TEXT column. Examples:
  - `program.exercises` and `plannedWorkout.exercises`: JSON stringified arrays
  - `workoutLog.details`: stringified JSON (the app expects `details`, sometimes with new `actualSets` format)
- OpenAI integrations: `app/api/ai/generate/route.ts` uses `openai` package and env var `OPENAI_API_KEY`. The prompt is in Russian and expects JSON output.
- Frontend state: Very light session management – `localStorage.setItem('user', ...)` holds `id,name,role`. There is no token/auth middleware.

Common development patterns & conventions ✅
- APIs take JSON body via POST, usually with numeric IDs as strings (convert with `parseInt`/`Number`). Example: `fetch('/api/client/program', { method: 'POST', body: JSON.stringify({ userId }) })`.
- Use `cache: 'no-store'` for trainer lists to avoid stale data (see `app/trainer/page.tsx`). Some API routes export `export const dynamic = 'force-dynamic'` to ensure dynamic responses.
- When reading gobbed JSON from DB, always `JSON.parse()` and handle errors safely (try/catch) — e.g., `const exList = JSON.parse(workout.exercises)`.
- When adding exercises/programs/logs, the backend stores the array as a string: call `JSON.stringify(exercises)` before storing in DB on server and `JSON.parse()` on loads.

Data format examples (inspect these files):
- `app/api/client/program/route.ts` - shows how `exercises` get a `historyList` added and then returned as JSON string
- `app/api/client/log/route.ts` - upserts a workout log for the day and uses `details: JSON.stringify(details)` on create/update
- `app/api/programs/assign/route.ts` - example of program assignment: stores `exercises` as `JSON.stringify(exercises)`

OpenAI & prompts ⚙️
- The OpenAI generator in `app/api/ai/generate/route.ts` uses `gpt-4o-mini` and a Russian persona with very strict rules that demand valid JSON responses. Keep tests and caching in mind when calling it.
- Tests with curl (development example):
  ```bash
  curl -X POST http://localhost:3000/api/ai/generate \
    -H "Content-Type: application/json" \
    -d '{"goal":"strength","split":"2day","level":"intermediate","historyContext":"..."}'
  ```
- Ensure `OPENAI_API_KEY` is set as an env var before calling these endpoints.

Security & safety notes ⚠️
- The repository currently stores `OPENAI_API_KEY` and `DATABASE_URL` in `.env` (this repo includes `.env` locally). Avoid committing secrets. If you modify or regenerate keys, rotate them promptly.
- Passwords in the seed are plaintext (`'123'`). A migration/change should be treated as an opt-in feature and require DB migration and frontend login changes.
- Do not unilaterally migrate to hashed passwords without communicating with the repo owner. If you do, include migration scripts and update `api/auth/login` accordingly.

Testing & debugging 🐞
- No automated unit or integration tests exist. Use `npm run dev` and UI to test flows.
- Use Prisma Studio to view DB: `npx prisma studio`.
- Use `console.log()` in route handlers (already present in generator route) for quick debugging.

Files worth reviewing for behavior & patterns (start here):
- `app/api/ai/generate/route.ts` — OpenAI usage + prompt structure
- `app/api/trainer/generate-cycle/route.ts` — cycle generation, planned workouts patterns
- `app/api/client/program/route.ts` — program retrieval and history aggregation
- `app/api/client/log/route.ts` — autosave, upsert of logs, current-day logic
- `app/trainer/workout/[id]/page.tsx` — autosave debounce, `actualSets` format, UI state patterns
- `app/trainer/client/[id]/page.tsx` — client CRM, playlist UI, generator modal
- `prisma/schema.prisma` — core database model definitions
- `app/api/seed/route.ts` — how the dev seed is created (and passwords)

Practical guidance for code changes 🛠️
- Keep UI language consistent (RU) unless explicitly asked to translate.
- Preserve state formats & JSON stringification to avoid breaking existing clients; if you change a DB column's structure or format, provide migration & compatibility logic.
- When changing server APIs, prefer to maintain backward compatibility via optional fields or by supporting both old and new formats (see `app/api/client/program/route.ts` handling `actualSets` vs older `doneWeight/doneReps`).
- For Prisma changes, run `npx prisma db push` or perform migrations and include `prisma migrate dev` calls in PR notes.

Searching & development tips 🧭
- Pattern to find endpoints by feature: `**/app/api/**/route.ts`.
- Use grep for `JSON.stringify(exercises)` or `workoutLog` to identify sections that rely on stringified JSON.

Do not change without confirming 🗣️
- DB & data format transformations (string -> JSON columns, password hashing), auth, and OpenAI key handling are breaking changes — notify the repository owner or open an issue/request a migration plan.

If anything in these notes is unclear or you need more examples, ask and I'll provide refined snippets or add more files to review. Feedback? 👋
