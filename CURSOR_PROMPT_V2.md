# Paste into Cursor Agent (Phase 1–2 build)

Use with `PRD.md` open in context.

```
You are upgrading IntelliCal from hackathon MVP to a full student scheduling product.

REPO: https://github.com/Anan51/IntelliCal
BRANCH POLICY: create a feature branch from hackathon/mvp-plan (or main if it exists). Open a PR. Never remove the no-OAuth demo path.
READ FIRST: PRD.md (source of truth), README.md, then all of src/.

PITCH: when2meet, but it already knows your classes, preferences, and UCLA walk times.

CURRENT MVP:
- Next 15 + React 19 + TS, dark CSS in globals.css (no Tailwind yet)
- Components: WeekCalendar, SyllabusPaste, OverlapView, WalkAlerts
- Libs: demo-data, parseSyllabus (regex), overlap, walkTimes, types (minimal)
- Demo week 2026-09-28, people you+Alex, static Boelter↔Bunche walk times
- Run: npm install && npm run dev → localhost:3000

IMPLEMENT IN ORDER (Phase 1 then 2):
1) Design: add Tailwind + shadcn/ui; restyle shell/tabs/calendar; keep demo script working; mobile-friendly agenda fallback.
2) Types: Preference, strength hard|soft, EventSource; extend CalEvent.
3) Preferences tab: gym, downtime, quiet hours, custom; localStorage persistence.
4) Calendar rendering: soft prefs visually distinct; Walk alerts remain.
5) Overlap engine modes: strict | balanced (default) | max; UI ModeToggle; demo Alex still works.
6) Google Calendar readonly via Auth.js; merge into week; mock fallback if disconnected.
7) Inference: analyze calendar (or mock history) → SuggestionCards Accept/Edit/Dismiss → Preferences.
8) Update README with new flows; ensure npm run build passes.

CONSTRAINTS from PRD:
- Empty ≠ available (prefs matter)
- Inferences are suggestions only until accepted
- America/Los_Angeles
- Ask before adding paid APIs beyond Google + optional OpenAI syllabus parse

SUCCESS:
- Toggling a gym soft pref changes Friend Overlap results
- Design clearly nicer than MVP
- Demo without OAuth still works end-to-end
```
