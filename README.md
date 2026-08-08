# IntelliCal

**An intelligent calendar builder for university students.** Feed it your syllabi, and it constructs your term: lectures, discussions, exams, and due dates. Arranged around your life, synced with your existing calendar, and shareable with friends so you can find times you are all free.

**Pitch:** when2meet, but it already knows your classes and how long it takes to walk across UCLA.

> Construction plan: [`BUILD_PLAN.md`](./BUILD_PLAN.md). Product requirements: [`PRD.md`](./PRD.md). Hackathon MVP notes: [`HACKATHON_PLAN.md`](./HACKATHON_PLAN.md).

---

## The problem

Every term starts the same way: a stack of syllabus PDFs, a dozen manual calendar entries, a group chat asking "when is everyone free?", and a when2meet painted by hand. Students end up with a calendar that lists obligations but does not help them plan. No time carved out for the gym, no awareness that two back-to-back classes are a 12-minute walk apart, and no easy way to line up free time with friends.

## What IntelliCal does

### 1. Syllabus intake
Upload or paste a syllabus (PDF or text). IntelliCal extracts and schedules:

- Lecture times (recurring, e.g. M/W 10:00–11:50)
- Discussion / section times
- Exam dates (midterms, finals)
- Key due dates (problem sets, essays, project milestones)

Parsed events land in a review table you correct before committing.

### 2. Thoughtful schedule arrangement
Set preferences for the things that keep you sane:

- Gym / exercise — preferred days, times, and frequency
- Relaxation — protected downtime blocks
- Outings and social time — evenings or weekends you want kept open

IntelliCal places these around academic commitments. Dragging a block pins it so later rearrangements leave it alone.

### 3. Two-way calendar sync
Connect Google Calendar. Sync runs both directions:

- Events already on your external calendar appear in IntelliCal and are respected when arranging.
- Events IntelliCal creates are pushed to a dedicated IntelliCal secondary calendar.
- Edits reconcile without duplicates (last-writer-wins on conflict).

Without OAuth credentials the app stays fully usable in demo mode.

### 4. Location-aware scheduling
Enter your home address. IntelliCal resolves classroom and building names (e.g. "Boelter 3400") against a campus table and:

- Calculates travel time between consecutive activities
- Adds leave-by cues before each activity
- Flags tight transitions where the gap is shorter than the trip

### 5. Share-with-friends view
Generate a share link. A friend who opens it sees when free time overlaps — never event titles or locations. Ideal for hangouts, club meetings, and study groups. Preference blocks count as busy by default, with a per-share toggle to treat them as free.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| UI | React |
| Unit testing | Vitest (Vite-powered) |
| State | Zustand |
| Persistence | Prisma + SQLite |
| Calendar sync | Google Calendar API (OAuth 2.0, optional) |
| Geocoding & travel | Campus table + Distance Matrix (optional) |

## Getting started

```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The demo runs on local sample data with no API keys. For calendar sync and live travel times, copy `.env.example` to `.env.local` and fill in the keys.

```bash
npm run test    # Vitest unit tests
npm run build   # production build
npm start
```

## Demo script (90 seconds)

1. **Problem (15s):** Week 1 — four syllabi + "when are you free?" Everyone paints when2meet by hand.
2. **Syllabus → calendar (25s):** On **My Week**, load the sample syllabus, review parsed events, then commit. Lectures, discussion, and exams land on the grid.
3. **Preferences (15s):** Open **Preferences**, ensure Gym ×3/week is arranged into free evening slots.
4. **Friend overlap (20s):** Open **Share**, copy the demo link or use **Friend Overlap**. Green slots show shared free time with Alex.
5. **Walk alerts (15s):** Open **Walk**. Tight Boelter → Bunche transitions get leave-by cues and warnings.

## Project structure

```
src/
  app/          # App Router pages and API routes
  components/   # Calendar, intake, preferences, share, sync UI
  lib/          # Pure logic: parse, arrange, overlap, travel, sync
  store/        # Zustand calendar store
prisma/         # Schema + SQLite
test/           # Vitest fixtures and unit tests
```

## Roadmap

See [`BUILD_PLAN.md`](./BUILD_PLAN.md) for phases, acceptance criteria, and open decisions.

1. Core calendar + syllabus intake
2. Preference blocks + schedule arrangement
3. Google Calendar two-way sync
4. Addresses, travel times, and transition alerts
5. Share links + free-time overlap
