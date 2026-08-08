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

1. **Problem (10s):** Week 1 — syllabi + “when are you free?” Empty slots aren’t always social-ready.
2. **Week (20s):** Open **Week**. Classes show as Google Calendar–style solid blocks; soft/hard prefs use muted fills with a left rail. Click empty hour → Protect time.
3. **Connect calendar (20s):** Click **Connect calendar** (demo import — real Google OAuth is Phase 2). Extra busy blocks appear; accept a preference suggestion from calendar patterns.
4. **Preferences (15s):** Open **Preferences**. One-tap templates, hard/soft, fixed or flexible. Survives refresh (localStorage).
5. **Find time (20s):** **Balanced** hides soft gym from hangouts with Alex; switch **Max** to ignore soft. Soft prefs show as Busy (no label leak).
6. **Walks (10s):** Wed Boelter → Bunche tight gap.

## Calendar connect

Phase 1 uses a **demo Connect calendar** that imports mock Google Calendar busy blocks and preference suggestions (Accept / Dismiss). Real Google OAuth + `calendar.readonly` is Phase 2 — no secrets required for the demo.

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
