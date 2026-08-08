# IntelliCal

**Pitch:** when2meet, but it already knows your classes, preferences, and how long it takes to walk across UCLA.

UCLA student schedule from syllabi + personal preferences + friend free-time overlap. Phase 1 demo — no Google Calendar OAuth, mock data + localStorage only.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm install
npm run build
npm start
```

## Demo script (~90–110 seconds)

1. **Problem (15s):** Week 1 — four syllabi PDFs + group chat asking "when are you free?" Everyone opens when2meet and paints blocks by hand. Empty calendar slots aren't always social-ready.
2. **Syllabus → calendar (20s):** On **My Week**, click **Load sample syllabus**, then **Parse into calendar**. CS 31 lectures, discussion, midterm, and final appear on the week grid (color-coded by kind). Soft gym / quiet-hour prefs show as dashed or muted blocks.
3. **Preferences (15s):** Open **Preferences**. Gym is soft Mon/Wed 6–7pm; quiet hours are hard before 10am. Toggle gym hard ↔ soft. Refresh — prefs survive via localStorage. Optionally click an empty hour on My Week → **Protect this**.
4. **Friend overlap (25s):** Switch to **Friend Overlap**. Mode defaults to **Balanced** (soft prefs count as busy). Green cells = shared free time with Alex. Switch to **Max** or **Strict** — soft gym frees up Wed 6–7pm for hangouts. Soft prefs show as generic **Busy** on the friend view (labels stay private).
5. **Walk alerts (15s):** Open **Walk Alerts**. Wed shows a tight Boelter → Bunche transition (CS 31 ends 11:50, office hours at Bunche 12:00 — only 10 min gap, 12 min walk).
6. **Close (10s):** Academic calendar + prefs become the input to social planning. No OAuth required for the demo.

## What's built (Phase 1)

- **Night library** design inspired by Notion Calendar / Cron: sidebar nav, hairline week grid, tabular time gutters — not a card stack
- **Preferences** is a first-class screen (sidebar): one-tap templates for Gym, Quiet mornings, Downtime, Focus, Social, Custom; fixed days **or** flexible N×/week; hard/soft; location; localStorage
- Protect-this on empty My Week hours; click a preference block to edit strength / delete
- Overlap modes: **strict** | **balanced** (default) | **max**
- Soft prefs: dashed hatch on owner calendar; friend view shows **Busy** only
- Mobile agenda fallback; walk alerts inline on My Week + Walks page
- Regex syllabus parser — client-side, no API keys
- Demo friend Alex hardcoded (no OAuth)

## Design notes

- Soft preferences: dashed / striped tint on owner calendar
- Hard preferences: solid muted
- Classes: saturated by kind
- Friend overlap never leaks preference labels (shows "Busy")
- Day convention for preference windows: `0 = Mon … 4 = Fri`

## Out of scope (later phases)

Google OAuth / Auth.js, calendar inference suggestions, real share links, PDF/LLM syllabus parse, DB persistence.

See `PRD.md` for the full product plan and `HACKATHON_PLAN.md` for original MVP scope.
