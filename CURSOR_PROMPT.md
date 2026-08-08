# Paste this into Cursor (Agent)

```
You are building IntelliCal for a UCLA campus-leads hackathon with ~1 hour left.

READ FIRST: HACKATHON_PLAN.md and the existing repo structure. Follow that plan. Work ONLY on branch hackathon/mvp-plan (do not commit to main).

PRODUCT
- Pitch: "when2meet, but it already knows your classes and how long it takes to walk across UCLA."
- Audience: SWE campus leads. Demo must look real; mock data is fine.
- NO Google Calendar OAuth. NO live maps. NO production auth.

MVP (priority order — stop when time runs out, but finish 1 then 2):
1. Week calendar rendering demo UCLA courses from src/lib/demo-data.ts
2. Syllabus paste box → parse (regex/heuristics OK) → add events to the week
3. Friend overlap view: you vs mock friend Alex → highlight shared free slots
4. Nice-to-have: static walk-time warnings for tight Boelter↔Bunche transitions

CONSTRAINTS
- Stack: Next.js App Router + TypeScript + Tailwind (already stubbed if present)
- Prefer client-side parse for speed; API route optional
- Keep UI simple and clean; judges are SWEs — clear data model > flashy CSS
- If something is blocking, ask ONE concrete question, then continue with the defaults in HACKATHON_PLAN.md section E

SUCCESS CRITERIA
- npm run dev shows My Week with demo classes
- Pasting public/sample-syllabus.txt updates the calendar
- Overlap tab shows green shared free time with Alex
- App does not require any OAuth secrets

CONTEXT TO FIGURE OUT AS YOU GO (do not block on these — use defaults):
- If no LLM key: regex parse only
- If no real syllabus PDF: use public/sample-syllabus.txt
- Brand name: IntelliCal
- Deploy: localhost is enough for demo

IMPLEMENT now in the file order from HACKATHON_PLAN.md section C. Commit in small chunks on hackathon/mvp-plan. When done, print a 5-bullet "how to demo" for the presenter.
```
