# IntelliCal

**Pitch:** when2meet, but it already knows your classes and how long it takes to walk across UCLA.

UCLA student schedule from syllabi + friend free-time overlap. Hackathon MVP — no Google Calendar OAuth, mock data only.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## Demo script (90 seconds)

1. **Problem (15s):** Week 1 — four syllabi PDFs + group chat asking "when are you free?" Everyone opens when2meet and paints blocks by hand.
2. **Syllabus → calendar (25s):** On **My Week**, click **Load sample syllabus**, then **Parse into calendar**. CS 31 lectures, discussion, midterm, and final appear on the week grid (color-coded by kind).
3. **Friend overlap (25s):** Switch to **Friend Overlap**. Green cells show shared free time with demo friend Alex across Mon–Fri. Point out Mon/Wed afternoon slots — both free without manual painting.
4. **Walk alerts (15s):** Open **Walk Alerts**. Wed shows a tight Boelter → Bunche transition (CS 31 ends 11:50, office hours at Bunche 12:00 — only 10 min gap, 12 min walk).
5. **Close (10s):** Academic calendar becomes the input to social planning. No OAuth required for the demo.

## What's built

- Mon–Fri week calendar with time gutters and color by event kind (lecture / discussion / exam / busy)
- Regex syllabus parser (`src/lib/parseSyllabus.ts`) — client-side, no API keys
- Friend overlap heatmap: you vs mock friend Alex (`src/lib/overlap.ts`)
- Static UCLA walk-time warnings for tight transitions (`src/lib/walkTimes.ts`)

See `HACKATHON_PLAN.md` for full scope.
