# IntelliCal

**An intelligent calendar builder for university students.** Feed it your syllabi, and it constructs your term: lectures, discussions, exams, and due dates — arranged around your life, synced with your existing calendar, and shareable with friends to find the times you're all free.

> Hackathon MVP lives on `hackathon/mvp-plan` (see `HACKATHON_PLAN.md`). This README describes the full product; `BUILD_PLAN.md` is the detailed construction plan for executing it.

---

## The problem

Every term starts the same way: a stack of syllabus PDFs, a dozen manual calendar entries, a group chat asking "when is everyone free?", and a when2meet painted by hand. Students end up with a calendar that lists their obligations but doesn't help them *plan* — no time carved out for the gym, no awareness that two back-to-back classes are a 12-minute walk apart, and no easy way to line up free time with friends.

## What IntelliCal does

### 1. Syllabus intake
Upload or paste a syllabus (PDF or text). IntelliCal extracts and schedules:

- **Lecture times** (recurring, e.g. M/W 10:00–11:50)
- **Discussion / section times**
- **Exam dates** (midterms, finals)
- **Key due dates** (problem sets, essays, project milestones)

Parsed events land on a term-long calendar you can review and correct before committing.

### 2. Thoughtful schedule arrangement
Your calendar shouldn't just be classes. Set preferences for the things that keep you sane:

- **Gym / exercise** — preferred days, times, and frequency
- **Relaxation** — protected downtime blocks
- **Outings and social time** — evenings or weekends you want kept open

IntelliCal arranges these around your academic commitments and treats them as real events, so they survive when new obligations arrive.

### 3. Two-way calendar sync
Connect Google Calendar (or another provider). Sync runs both directions:

- Events already on your external calendar appear in IntelliCal and are respected when arranging your schedule.
- Events IntelliCal creates (classes, exams, preference blocks) are pushed to your external calendar.
- Edits on either side reconcile without duplicates.

### 4. Location-aware scheduling
Enter your home address. IntelliCal resolves classroom and building addresses from your schedule (sifting building names like "Boelter 3400" into real campus locations) and:

- Calculates travel time between consecutive activities (walk / bike / transit)
- Adds "head out now" lead-time buffers before each activity
- Flags tight transitions where the gap between events is shorter than the trip

### 5. Share-with-friends view
Generate a share link. A friend who opens it sees **when your free time overlaps with theirs** — never the details of your events, just availability. Ideal for:

- Finding hangout times that actually work
- Scheduling club meetings, study groups, and project syncs

Overlap respects both people's preference blocks, so "free" means genuinely free.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) (strict) |
| UI | [React](https://react.dev/) |
| Unit testing / tooling | [Vite](https://vite.dev/) ecosystem — [Vitest](https://vitest.dev/) for fast, Vite-powered tests |
| Calendar sync | Google Calendar API (OAuth 2.0) |
| Geocoding & travel times | Google Maps Platform (Geocoding + Distance Matrix) |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The demo build runs entirely on local sample data — no API keys or OAuth required. For calendar sync and travel times, copy `.env.example` to `.env.local` and provide:

```bash
GOOGLE_CLIENT_ID=        # Google Calendar OAuth
GOOGLE_CLIENT_SECRET=
GOOGLE_MAPS_API_KEY=     # Geocoding + Distance Matrix
```

## Project structure

```
src/
  app/          # Next.js App Router pages and API routes
  components/   # React components (calendar views, intake, share)
  lib/          # Core logic: parsing, overlap, travel times, sync
public/         # Static assets, sample syllabus
```

## Roadmap

Full construction plan with phases, data model, and acceptance criteria: **[`BUILD_PLAN.md`](./BUILD_PLAN.md)**.

1. Core calendar + syllabus intake
2. Preference blocks + schedule arrangement
3. Google Calendar two-way sync
4. Addresses, travel times, and transition alerts
5. Share links + free-time overlap
