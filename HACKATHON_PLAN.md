# IntelliCal — Hackathon Plan (60 min)

## A. Pitch + demo script

**One-liner:** when2meet, but it already knows your classes and how long it takes to walk across UCLA.

**90-second demo:**
1. (15s) Problem: Week 1 — 4 syllabi PDFs + group chat asking "when are you free?" → everyone opens when2meet and paints by hand.
2. (25s) Paste/upload a sample syllabus → lectures, midterm, final appear on a week calendar.
3. (25s) Open Share view with demo friend "Alex" → green overlap slots (both free).
4. (15s) Optional: flag Boelter → Bunche back-to-back as "tight walk".
5. (10s) Close: academic calendar becomes the input to social planning. No OAuth required for demo.

## B. MVP scope (in / out)

**IN (must ship):**
1. Syllabus text → structured events (lectures / midterm / final) on a week view
2. Friend free-time overlap heatmap (you + 1 demo friend)
3. Mock/hardcoded UCLA-flavored demo data (no Google Calendar OAuth)

**OUT (do not build):**
- Google Calendar OAuth / two-way sync
- Live Google Maps
- Full hobby preference settings UI
- Production auth, multi-tenant, mobile polish

**NICE (only if time after IN):**
- Static UCLA building walk-time table + warning on tight transitions

## C. Stack + file plan

Chosen for empty repo: **Next.js (App Router) + TypeScript + Tailwind**.

Build order:
1. `src/lib/types.ts` — Event, Person, BusyBlock types
2. `src/lib/demo-data.ts` — you + Alex calendars, 2 courses, walk edges
3. `src/lib/parseSyllabus.ts` — regex/heuristic parse of pasted syllabus text (LLM optional later)
4. `src/lib/overlap.ts` — compute free windows for 2 people
5. `src/lib/walkTimes.ts` — static Boelter↔Bunche etc. map + `isTightTransition`
6. `src/components/WeekCalendar.tsx` — render events
7. `src/components/OverlapView.tsx` — green free overlap
8. `src/components/SyllabusPaste.tsx` — textarea → parse → merge into calendar
9. `src/app/page.tsx` — tabs: My Week | Overlap | (Walk alerts)
10. `src/app/api/parse/route.ts` — optional; can keep parse client-side for speed

## D. Demo data to hardcode

**You (Bruin):**
- CS 31 lecture M/W 10:00–11:50 Boelter 3400
- CS 31 discussion F 12:00–12:50 Boelter 5249
- GE Cluster lecture T/Th 14:00–15:15 Bunche 2209
- Midterm: Fri Week 5 10:00–11:50
- Gym preference block: M/W 18:00–19:00 (busy for overlap)

**Friend Alex:**
- Different lecture blocks Tue morning + Thu afternoon busy
- Free most Mon/Wed afternoons → those should light up green

**Walk edges (minutes):**
- Boelter ↔ Bunche: 12
- Boelter ↔ Royce: 10
- Bunche ↔ Powell: 8
- Flag if gap between classes < walk + 2 min

## E. Context still needed (feed Cursor / team)

Answer these while Cursor builds; only **blocking** ones should stop the agent:

| # | Question | Blocking? | Default if unknown |
|---|----------|-----------|--------------------|
| 1 | Sample syllabus text/PDF to parse in demo? | Soft | Use `public/sample-syllabus.txt` (included) |
| 2 | Any LLM API key (OpenAI/Anthropic) in env? | No | Regex parse only |
| 3 | Deploy target for demo (localhost OK)? | No | `npm run dev` localhost |
| 4 | Brand name final (IntelliCal vs BruinSync)? | No | IntelliCal |
| 5 | Second teammate calendar real or mock? | No | Mock "Alex" |
| 6 | Need iCal download export? | No | Skip |
| 7 | Who presents / laptop for `npm run dev`? | Soft | Local demo |

**Artifacts to drop into the repo if you have them:**
- 1 real UCLA syllabus (txt/pdf) → `public/`
- Screenshot of a messy when2meet for the pitch slide (optional)

## F. Success criteria

- [ ] Week view shows at least 2 courses of events from demo data
- [ ] Pasting sample syllabus adds/updates events without crash
- [ ] Overlap tab shows ≥1 green shared free slot with Alex
- [ ] README has pitch + how to run
- [ ] No OAuth; runs with `npm install && npm run dev`

## 60-minute clock

| Min | Focus |
|-----|--------|
| 0–10 | `create-next-app` already stubbed — wire demo-data into WeekCalendar |
| 10–25 | SyllabusPaste + parseSyllabus |
| 25–40 | OverlapView + overlap.ts |
| 40–50 | Walk warnings OR polish UI |
| 50–55 | Demo script dry run + fix crashes |
| 55–60 | README, commit, present |
