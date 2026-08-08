# IntelliCal — Construction Plan

Execution handoff document. Work top to bottom: each phase is independently shippable, has explicit acceptance criteria, and builds on the previous one. Read `README.md` first for the product description.

## Ground rules

- **Stack:** Next.js (App Router) + TypeScript (strict mode) + React. Vitest for unit tests (Vite-powered). No other frameworks without a documented reason.
- **Branching:** feature branches off `hackathon/mvp-plan`; one PR per phase or coherent slice.
- **Types first:** every phase starts by extending `src/lib/types.ts`. Core logic lives in `src/lib/` as pure functions with unit tests; React components stay thin.
- **Exhaustive switches:** all switches over union types (`EventKind`, `SyncStatus`, etc.) must have a `never`-typed default case.
- **Imports at top of file** — no inline imports.
- **Secrets:** never committed. All external-API code must degrade gracefully when env vars are absent (feature hidden or mocked), so the app always runs with `npm install && npm run dev`.

## Architecture overview

```
Browser (React) ── Next.js App Router
   │                    │
   │                    ├── /api/parse        syllabus → structured events
   │                    ├── /api/sync/*       Google Calendar OAuth + two-way sync
   │                    ├── /api/geo/*        geocoding + travel-time lookups (server-side, key stays private)
   │                    └── /api/share/*      share-link create / resolve
   │
src/lib/ (pure, unit-tested)
   parseSyllabus · arrange · overlap · travelTime · syncReconcile
   │
Persistence: start with SQLite via Prisma (single `DATABASE_URL`), swappable to Postgres for deploy.
```

## Data model (extend `src/lib/types.ts`, mirror in Prisma schema)

```ts
type EventKind = "lecture" | "discussion" | "exam" | "due_date" | "preference" | "external" | "other";

type CalEvent = {
  id: string;
  personId: string;
  title: string;
  start: string;              // ISO 8601
  end: string;                // ISO 8601
  kind: EventKind;
  recurrence?: RRuleString;   // RFC 5545, for weekly lectures/discussions
  location?: Location;
  source: "syllabus" | "manual" | "sync" | "arranged";
  externalId?: string;        // Google Calendar event id when synced
};

type Location = { raw: string; building?: string; room?: string; lat?: number; lng?: number };

type Preference = {
  id: string;
  personId: string;
  label: string;              // "Gym", "Relaxation", "Social"
  targetPerWeek: number;      // desired sessions per week
  durationMin: number;
  windows: TimeWindow[];      // acceptable day-of-week + time ranges
  priority: 1 | 2 | 3;        // used when arranging around conflicts
};

type Person = { id: string; name: string; homeAddress?: string; travelMode: "walk" | "bike" | "transit" };

type ShareLink = { token: string; personId: string; expiresAt: string; scope: "free_busy" };
```

---

## Phase 1 — Core calendar + syllabus intake

**Goal:** paste/upload a syllabus, get a correct, editable term calendar.

1. **Calendar views** — `WeekCalendar` and `TermOverview` components rendering `CalEvent[]` with recurrence expansion (use `rrule` package). Event create/edit/delete via a modal; all state in a single `useCalendar` store (Zustand or React context — pick one, document it).
2. **Text parsing** — `src/lib/parseSyllabus.ts`: heuristic/regex extraction of recurring meeting times ("MWF 10:00–10:50"), exam dates, and dated deadlines. Return `ParsedEvent[]` with per-field confidence.
3. **PDF intake** — `/api/parse` accepts PDF upload, extracts text (`pdf-parse`), feeds it to the same parser. Optional LLM assist behind `OPENAI_API_KEY` (or equivalent): when present, use LLM extraction with the regex parser as validator/fallback; when absent, regex only.
4. **Review step** — parsed events appear in a confirm/correct table (editable title, kind, times) before merging into the calendar. Never auto-commit parses.
5. **Persistence** — Prisma + SQLite; CRUD API routes; calendar loads from DB on start.

**Tests:** parser unit tests against ≥3 real syllabi fixtures in `test/fixtures/` (include `public/sample-syllabus.txt`); recurrence expansion tests across quarter boundaries and DST.

**Accept when:** a real syllabus PDF produces lectures + discussion + exams on the week view with ≤2 manual corrections; data survives reload.

## Phase 2 — Preferences + schedule arrangement

**Goal:** gym/relaxation/social time becomes first-class, automatically placed.

1. **Preference settings UI** — CRUD for `Preference` records (label, frequency, duration, acceptable windows, priority).
2. **Arranger** — `src/lib/arrange.ts`: pure function `(events, preferences, horizon) → CalEvent[]` that places preference blocks into free windows. Greedy placement by priority, then earliest-fit within each preference's windows; deterministic given the same inputs. Placed blocks get `source: "arranged"`.
3. **Re-arrangement** — when new academic events land (e.g. a second syllabus), re-run the arranger for *future, non-manually-pinned* preference blocks only. A user who drags a block pins it (`source` flips to `"manual"`).
4. **Conflict surfacing** — if a preference can't hit `targetPerWeek`, show a non-blocking warning listing what squeezed it out.

**Tests:** arranger unit tests — full satisfaction, partial satisfaction, zero free windows, priority ordering, pin stability across re-runs.

**Accept when:** adding "Gym ×3/week, 60 min, M–F 17:00–20:00" places 3 blocks avoiding all classes; importing a new syllabus relocates unpinned blocks and never touches pinned ones.

## Phase 3 — Google Calendar two-way sync

**Goal:** IntelliCal and Google Calendar reflect each other without duplicates.

1. **OAuth** — Auth.js (NextAuth) with Google provider, `calendar.events` scope. Store refresh tokens server-side, encrypted.
2. **Pull** — import external events as `kind: "external"`, `source: "sync"`, keyed by `externalId`. External events are read-only in IntelliCal and are respected by the arranger.
3. **Push** — IntelliCal-created events (classes, exams, preference blocks) are written to a dedicated **"IntelliCal" secondary calendar** in the user's Google account. This isolates our writes, makes duplicate-cleanup trivial, and lets users toggle visibility natively.
4. **Reconciliation** — `src/lib/syncReconcile.ts`: pure diff function `(localEvents, remoteEvents) → {create, update, delete}[]` using `externalId` + content hash. Google's `updated` timestamp wins remote-vs-local conflicts (last-writer-wins; document this). Use incremental sync tokens; on token expiry, full resync.
5. **Sync triggers** — on login, on manual "Sync now", and polling every 15 min while the app is open. (Webhook push channels are a later optimization; don't build now.)
6. **No-credentials mode** — without `GOOGLE_CLIENT_ID`/`SECRET`, the Sync settings panel shows "not configured" and everything else works.

**Tests:** reconciliation unit tests — fresh import, local edit, remote edit, both-edited conflict, remote delete, duplicate-prevention on re-import.

**Accept when:** a Google event blocks arranger placement; an IntelliCal exam appears in Google under the IntelliCal calendar; editing it in Google updates IntelliCal on next sync; repeated syncs create zero duplicates.

## Phase 4 — Location + travel time

**Goal:** the calendar knows where things are and when you must leave.

1. **Address sifting** — `src/lib/resolveLocation.ts`: parse `Location.raw` (e.g. "Boelter 3400") against a campus building table (`src/lib/data/buildings.ts`: name, aliases, lat/lng — seed with UCLA; keep the table per-campus so others can be added). Unmatched strings fall back to Google Geocoding via `/api/geo/geocode` when a key is present.
2. **Home address** — settings field on `Person`; geocode once, cache lat/lng.
3. **Travel times** — `/api/geo/travel` wrapping Distance Matrix, keyed by `(origin, destination, mode)` and cached in DB (campus pairs are static; cache indefinitely, cap table size). Without an API key, fall back to straight-line-distance walking estimate (5 km/h × 1.3 path factor) and label estimates as approximate.
4. **Departure cues + tight-transition flags** — for consecutive events at different locations: render a "leave by HH:MM" cue on the earlier event; if `gap < travelTime + 5 min buffer`, badge the pair as a tight transition. First event of the day gets a home-departure cue.
5. **Arranger integration** — arranger treats travel time as occupied: a preference block can't start within `travelTime` of the previous event's end at a different location.

**Tests:** location resolver (exact, alias, room-number stripping, unresolvable); tight-transition math including the buffer boundary; arranger-with-travel placement.

**Accept when:** back-to-back classes in distant buildings show a flag and correct leave-by time; gym blocks are never placed unreachably; app still runs keyless with estimates.

## Phase 5 — Share links + free-time overlap

**Goal:** one link answers "when are we both free?"

1. **Share link** — `/api/share` mints a random `token` (128-bit, URL-safe) → `ShareLink` row with expiry (default 30 days) and `scope: "free_busy"`. Settings UI to create/revoke.
2. **Free/busy projection** — `src/lib/freeBusy.ts`: `(events, dayBounds) → BusyBlock[]`. Only start/end times cross the trust boundary — titles, kinds, and locations never leave the server for shared views.
3. **Overlap view** — `/share/[token]` page: visitor sees the owner's busy blocks; if the visitor is logged in, render both schedules with shared free windows highlighted, ranked by length. "Suggest top 3 hangout times" summary above the grid. Logged-out visitors see owner availability only, with a sign-in prompt to compare.
4. **Preference-aware freeness** — preference blocks count as busy by default with a per-share toggle ("treat my gym/relaxation time as free"), since hanging out sometimes replaces the gym.
5. **Revocation & expiry** — revoked/expired tokens render a friendly dead-link page; no data.

**Tests:** free/busy projection (overlapping events, all-day, recurring); overlap computation (none, partial, full); token expiry/revocation; assert the share API response contains no event titles.

**Accept when:** User A sends a link, logged-in User B sees correct shared free windows and top suggestions; revoking kills the link; shared payloads contain times only.

---

## Cross-cutting requirements

- **Timezones:** store UTC ISO strings; render in the user's IANA timezone. Test DST transitions explicitly (recurring lectures must not drift in March/November).
- **CI:** GitHub Actions on every PR — `tsc --noEmit`, `next lint`, `vitest run`, `next build`. All green before merge.
- **Quality bars:** keyboard-navigable calendar and labeled controls (a11y); week view interactive < 2 s on seeded demo data; server-side validation on every API route (share endpoints are unauthenticated by design).
- **Demo mode:** keep `src/lib/demo-data.ts` working so the full flow is demoable with zero credentials.

## Suggested delivery order & dependencies

```
Phase 1 (calendar + intake)
   └─► Phase 2 (preferences + arranger)
          ├─► Phase 3 (two-way sync)      ← independent of 4 & 5, needs arranger to respect external events
          ├─► Phase 4 (location + travel) ← needs arranger for travel-aware placement
          └─► Phase 5 (share + overlap)   ← needs free/busy over arranged calendar
```

Phases 3, 4, 5 are parallelizable across contributors once Phase 2 lands.

## Open decisions (defaults chosen; revisit only if they bite)

| Decision | Default | Revisit if… |
|---|---|---|
| DB | SQLite via Prisma | deploying multi-user → Postgres (schema is compatible) |
| Client state | single store (Zustand) | server components make it redundant |
| LLM parsing | optional, behind env key | regex accuracy < 80 % on fixture syllabi |
| Sync conflicts | last-writer-wins | users report lost edits → per-field merge |
| Maps vendor | Google Maps Platform | cost → OpenRouteService + Nominatim |
