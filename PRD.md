# IntelliCal — Product Requirements Document (v1.0)

> Status: Post-hackathon MVP → full product plan  
> Repo: https://github.com/Anan51/IntelliCal  
> Active branch: `hackathon/mvp-plan` (also GitHub default branch)  
> Local path: `/Users/m/cursor_projects/IntelliCal`  
> Last merged: [PR #1](https://github.com/Anan51/IntelliCal/pull/1) — demo-ready MVP  
> Audience for this doc: Cursor agents + human builders fleshing the app beyond the hackathon demo  
> School context: UCLA (Bruin), expandable to other campuses later

---

## 1. Vision

**One-liner:** when2meet, but it already knows your classes, your preferences, and how long it takes to walk across UCLA.

**Product vision:** IntelliCal turns fragmented student life (syllabi PDFs, Canvas/Bruin Learn, Google Calendar, group chats, when2meet) into one living schedule that:
1. Ingests academic obligations automatically
2. Protects personal time (gym, downtime, social) with explicit preferences *and* learned patterns
3. Makes finding time with friends / project groups / clubs a one-link action instead of manual availability painting
4. Understands campus geography so “free on paper” isn’t “impossible to walk”

**Target moment (hero job):** Week 0 / Week 1 of a UCLA quarter — student just got 4–5 syllabi, already has club + work + gym habits, and friends are asking “when are you free?”

---

## 2. Problem statement

### 2.1 The real problem (not “students need another calendar”)

Academic life lives in PDFs and LMS pages. Personal + social life lives in Google Calendar, iMessage, Discord, and when2meet. Nothing connects them, so students constantly re-enter the same week by hand.

### 2.2 Evidence / UCLA-specific pain

| Pain | Why it matters at UCLA |
|------|------------------------|
| Syllabus → calendar busywork | 4–5 courses × messy PDFs every quarter; easy to miss midterms |
| when2meet friction | Clubs, CS projects, hangouts all use it; manual paint + no GCal sync |
| Campus walking time | North ↔ South campus; Boelter ↔ Bunche etc. 10-min breaks are often fake free time |
| Preference invisibility | Gym / downtime / “no meetings before 11” aren’t modeled, so overlap tools treat every empty slot as social-ready |
| Calendar fragmentation | Bruin Learn calendar ≠ syllabus dates ≠ personal GCal ≠ friend schedules |

### 2.3 Competitive landscape (positioning)

| Tool | Does | Gap vs IntelliCal |
|------|------|-------------------|
| SyllabAI / SyllabusSync | Syllabus → calendar | No friend overlap, no campus walk, no prefs |
| when2meet / WhenMeet | Group availability paint | No academic ingest, painful mobile, no prefs |
| Google Calendar | Source of truth for many | Doesn’t parse syllabi or find friend overlap |
| BruinBot (UCLA) | Course *planning* / what to take | Different job; don’t compete on “which classes” |
| Easy Class Break (UCLA ext) | Walk-time between classes in planner | Enrollment-time only, not living quarter schedule |

**Wedge:** Academic calendar + preferences + geography → social/meeting scheduling. Not “another syllabus parser” and not “another when2meet.”

---

## 3. Goals and non-goals

### 3.1 Goals (next product phase)

1. **Functional depth** — real preference system, calendar connect (read), editable learned suggestions, multi-friend share links
2. **Better design** — polished, mobile-friendly, trust-worthy calendar UX (students live on phones)
3. **Smarter free time** — free ≠ available; respect soft blocks (gym, downtime) with adjustable strength
4. **Learning loop** — infer habit windows from existing calendar history; let user confirm/adjust
5. **Ship path** — Vercel deploy + Google OAuth for Calendar read; keep syllabus path working offline/demo

### 3.2 Non-goals (for v1 full product)

- Replacing MyUCLA / enrollment / degree planning (BruinBot territory)
- Live turn-by-turn campus navigation
- Full LMS scrape of every Bruin Learn assignment forever (nice later; syllabus + calendar first)
- Automatic booking of friends’ calendars without consent
- Marketplace / tutoring / notes features

---

## 4. Users and personas

### 4.1 Primary: “Week-1 Bruin” (you)

- 1st–3rd year, 3–5 courses, lives on/near campus or commutes
- Uses Google Calendar somewhat inconsistently
- Dreads when2meet for every club + project
- Wants gym 3×/week and some protected downtime

### 4.2 Secondary: Friend / project partner (Alex)

- Opens a share link, connects calendar or pastes availability
- Doesn’t want to create an account if possible (magic link OK)

### 4.3 Tertiary: Club officer / TA

- Needs recurring overlap for 5–15 people
- Later phase (v1.2+); design data model so N people works

---

## 5. GitHub / engineering context (as of 2026-08-08)

### 5.1 Repository

| Field | Value |
|-------|--------|
| Remote | `https://github.com/Anan51/IntelliCal.git` |
| Visibility | Public |
| Default branch | `hackathon/mvp-plan` (set because repo was empty; first push) |
| Local clone | `/Users/m/cursor_projects/IntelliCal` |
| Related PR | https://github.com/Anan51/IntelliCal/pull/1 (MERGED) |

### 5.2 Branch history

```
144c8a0 Merge pull request #1 from Anan51/cursor/intellical-mvp-demo-4cba
b5e07b2 feat: demo-ready IntelliCal MVP with week calendar, overlap, and walk alerts
0e4b297 Add hackathon MVP plan, Cursor prompt, and demo scaffold.
```

**Working branch for continued build:** keep using `hackathon/mvp-plan` OR create `main` from it and open feature branches (`feat/preferences`, `feat/gcal-oauth`, `feat/design-system`). Recommended:

1. Create `main` from current `hackathon/mvp-plan`
2. Set `main` as default on GitHub
3. Feature branches → PRs into `main`

### 5.3 Stack today

- **Next.js 15** App Router + **React 19** + **TypeScript**
- Styling: custom dark CSS in `src/app/globals.css` (Tailwind NOT installed yet despite early plan mention)
- State: React `useState` on client page only (no DB, no auth)
- Syllabus parse: client-side regex in `src/lib/parseSyllabus.ts` (no LLM)
- No Google APIs, no env secrets required for demo
- Run: `npm install && npm run dev` → http://localhost:3000

### 5.4 File map (current)

```
IntelliCal/
├── README.md                 # pitch + demo script
├── HACKATHON_PLAN.md         # original 60-min plan
├── CURSOR_PROMPT.md          # paste prompt for MVP
├── PRD.md                    # this document
├── package.json
├── public/sample-syllabus.txt
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx          # tabs: My Week | Friend Overlap | Walk Alerts
    │   └── globals.css       # dark theme tokens + layout
    ├── components/
    │   ├── WeekCalendar.tsx  # Mon–Fri grid 8am–9pm, color by kind
    │   ├── SyllabusPaste.tsx # load sample + parse
    │   ├── OverlapView.tsx   # green shared free slots
    │   └── WalkAlerts.tsx    # tight transition list
    └── lib/
        ├── types.ts          # CalEvent, Person (minimal)
        ├── demo-data.ts      # you + Alex events, walkMinutes, DEMO_WEEK_START
        ├── parseSyllabus.ts  # regex lecture/discussion/midterm/final
        ├── overlap.ts        # freeOverlap, freeOverlapWeek
        └── walkTimes.ts      # tightTransitions
```

### 5.5 Data model today (minimal)

```ts
type CalEvent = {
  id: string;
  title: string;
  start: string; // ISO local-ish
  end: string;
  building?: string;
  kind: "lecture" | "discussion" | "exam" | "busy" | "other";
  personId: string;
};

type Person = { id: string; name: string };
```

**Gaps vs product needs:** no Preference, no SoftBlock strength, no source (syllabus|gcal|manual|inferred), no recurrence rule, no share-link entity, no user auth id, no timezone field, no course id.

### 5.6 Demo data semantics

- Week start: `2026-09-28` (Mon)
- You: CS 31 M/W Boelter, discussion Fri, GE T/Th Bunche, TA OH Wed Bunche (creates walk alert after CS 31), gym M/W 6–7pm as `busy`
- Alex: Tue morning class, Thu afternoon lab, Mon gym overlapping your evening
- Overlap highlight: Mon/Wed afternoons generally free for both
- Walk edge: Boelter↔Bunche = 12 min; flag if gap < walk + 2

### 5.7 Known MVP limitations (fix intentionally)

- No persistence (refresh loses parsed syllabus adds)
- No auth / multi-device
- Overlap is binary busy/free; gym is hard-busy, not soft preference
- Parser titles often hardcode “CS 31 Lecture” rather than reading course name robustly
- No PDF upload (text paste / sample only)
- No real GCal
- Desktop-first CSS; mobile grid will feel cramped
- Default branch naming is hackathon-era

---

## 6. Product principles

1. **Empty ≠ available.** Preferences and inferred habits reduce true free time.
2. **Human always wins.** Inferences are suggestions; one-tap adjust/dismiss.
3. **Demo without secrets, product with OAuth.** Keep a rich mock mode forever.
4. **Campus-aware.** Geography is a first-class constraint at UCLA.
5. **Share should feel like when2meet, smarter.** Zero-friction join for friends.
6. **Trust > clever.** Show why a slot is free or blocked (“gym preference”, “12 min walk”).

---

## 7. Feature requirements (full product)

### 7.1 Syllabus intake (enhance existing)

**User stories**
- As a student, I paste or upload syllabi and see lectures/sections/exams on my week and term views.
- As a student, I can fix bad parses before they stick.

**Requirements**
- FR-S1: Support paste text + upload PDF (pdf.js or server extract)
- FR-S2: Extract: course name, lecture/discussion recurrence, midterms, finals, office hours if present
- FR-S3: Review UI (editable table) before commit to calendar
- FR-S4: Optional LLM parse when `OPENAI_API_KEY` / similar present; regex fallback always
- FR-S5: Dedupe against existing events (time+title similarity)
- FR-S6: Tag `source: "syllabus"` on events

**Acceptance**
- Sample + 1 real UCLA syllabus produce ≥90% of dated exams correctly after review step

### 7.2 Calendar connect (Google first)

**User stories**
- As a student, I connect Google Calendar so IntelliCal sees existing busy times.
- As a student, I choose which calendars are read (school, personal, club).
- As a student, I can disconnect anytime.

**Requirements**
- FR-C1: Google OAuth 2.0 with Calendar **readonly** scope initially (`calendar.readonly`)
- FR-C2: Import busy blocks for current week + next 2 weeks (expand later)
- FR-C3: Map GCal events → `CalEvent` with `source: "gcal"`, preserve calendar color/name
- FR-C4: Two-way sync is **phase 2** — v1 writes optional “IntelliCal” calendar only if user opts in (`calendar.events` scope later)
- FR-C5: Mock mode remains default when not connected
- FR-C6: Store tokens securely (server session / encrypted DB); never expose refresh token to client

**Acceptance**
- Connected user sees GCal lectures/meetings on My Week within 30s of OAuth
- Disconnect clears tokens and reverts to mock/syllabus-only

### 7.3 Preferences: downtime, gym, social, quiet hours (NEW — priority)

**User stories**
- As a student, I set how often and when I want gym / downtime / social buffer.
- As a student, I mark preferences as **hard** (never schedule over) or **soft** (prefer not).
- As a friend looking at overlap, I see when they’re truly open — not just class-free.

**Preference types (v1)**

| Type | Examples | Default strength |
|------|----------|------------------|
| `gym` | Mon/Wed/Fri evenings 60–90 min | soft |
| `downtime` | nightly wind-down, Sunday reset | soft |
| `social` | preferred hangout windows | soft (positive bias) |
| `focus` | deep work blocks | soft |
| `sleep` / quiet hours | no meetings before 10am / after 10pm | hard |
| `commute` | leave dorm/home buffers | hard |

**Requirements**
- FR-P1: Preferences settings page/tab with clear controls:
  - Category, days of week, time window OR “flexible N times/week”, duration, strength (hard/soft), location optional (e.g. John Wooden Center)
- FR-P2: Soft preferences appear on calendar as distinct style (dashed / muted), not same as classes
- FR-P3: Overlap engine modes:
  - **Strict:** hard blocks + classes only
  - **Balanced (default):** hard + soft prefs count as busy for “ideal hangout”
  - **Max availability:** classes + hard only (ignore soft)
- FR-P4: One-click “protect this” on any empty slot → creates soft preference
- FR-P5: Persist preferences (localStorage MVP → DB when auth exists)
- FR-P6: Share link respects owner’s selected overlap mode

**UI sketch**
- Tab: **Preferences**
- Cards: Gym | Downtime | Quiet hours | Custom
- Each card: schedule chips + strength toggle + “suggest from my calendar” button

### 7.4 Learn from calendar → suggest preferences (NEW — differentiator)

**User stories**
- As a student, after I connect GCal, IntelliCal suggests “You usually go to the gym Tue/Thu 6–7pm — protect that?”
- As a student, I accept, edit, or dismiss each suggestion.

**Algorithm (v1 — explainable, not ML magic)**
1. Pull last 4–8 weeks of GCal events (readonly)
2. Cluster recurring personal events by normalized title keywords: `gym`, `workout`, `wooden`, `run`, `therapy`, `shift`, `work`, etc.
3. Also detect unnamed recurring busy patterns (same weekday + hour ≥ 3 occurrences)
4. Rank suggestions by frequency × recency
5. Present top 3–7 suggestions with evidence (“seen 6 times in 8 weeks”)

**Requirements**
- FR-L1: “Analyze my calendar” action post-OAuth
- FR-L2: Suggestion cards: Accept → Preference, Edit, Dismiss (dismiss remembered)
- FR-L3: Never auto-write hard blocks without acceptance
- FR-L4: Show evidence trail for trust
- FR-L5: Works in mock mode with synthetic history for demos

**Acceptance**
- Demo path: connect (or load mock history) → 3 suggestions → accept gym → overlap updates

### 7.5 Friend share / overlap (enhance existing)

**User stories**
- As a student, I create a share link for hangout / meeting / study session.
- As a friend, I open the link, connect calendar or paint availability, see overlap.
- As a student, I filter overlap by duration needed (30/60/90 min) and time-of-day.

**Requirements**
- FR-O1: Create Share with: title, duration, date range, overlap mode (strict/balanced/max)
- FR-O2: Friend join via link; optional name; GCal connect OR manual paint grid
- FR-O3: Heatmap for 2–N people (v1: 2–5)
- FR-O4: Click slot → copy time / create hold event (local or optional GCal write)
- FR-O5: Replace hardcoded Alex with share-session participants
- FR-O6: Keep “Demo with Alex” button for pitch mode

### 7.6 Campus walking / travel buffers (enhance existing)

**Requirements**
- FR-W1: Expand static UCLA building graph (major GA buildings + Hill dorms hubs)
- FR-W2: Auto-insert travel buffer suggestions between geographically distant back-to-backs
- FR-W3: Optional Google Distance Matrix / walking later; static table is fine for v1
- FR-W4: Overlap should optionally subtract travel if meeting location known (phase 1.1)

### 7.7 Design / UX system (NEW — priority)

**Goals:** Feel calm, academic, modern — closer to Linear/Notion calendar than when2meet 2008.

**Requirements**
- FR-D1: Adopt a real design system: Tailwind + shadcn/ui recommended for speed/quality
- FR-D2: Responsive: phone week view (horizontal day swipe or agenda) + desktop grid
- FR-D3: Visual language:
  - Classes: solid saturated chips by kind
  - Soft prefs: tinted / striped
  - Hard prefs: solid muted
  - Overlap free: green glow cells
  - Walk warnings: amber
- FR-D4: Empty states with clear CTAs (Add syllabus / Connect calendar / Set preferences)
- FR-D5: Accessibility: keyboard tabs, contrast AA, aria labels on grid
- FR-D6: Microcopy in plain student voice (no enterprise jargon)
- FR-D7: Brand: IntelliCal wordmark + simple mark; UCLA-adjacent blue/gold accents OK but not trademark-infringing logos

**Key screens**
1. Onboarding (3 steps): courses → calendar → preferences
2. My Week (default home)
3. Preferences
4. Share / Overlap
5. Walk Alerts (can merge into My Week as badges)
6. Settings (calendars connected, data export/delete)

---

## 8. Proposed data model (next)

```ts
type EventSource = "syllabus" | "gcal" | "manual" | "inferred" | "share";
type EventKind =
  | "lecture" | "discussion" | "exam" | "office_hours"
  | "work" | "gym" | "downtime" | "social" | "focus"
  | "travel" | "other";

type Strength = "hard" | "soft";

type CalEvent = {
  id: string;
  userId: string;
  title: string;
  start: string; // ISO with timezone
  end: string;
  timezone: string; // America/Los_Angeles
  building?: string;
  locationText?: string;
  kind: EventKind;
  source: EventSource;
  strength: Strength; // classes default hard
  courseId?: string;
  gcalEventId?: string;
  preferenceId?: string;
  metadata?: Record<string, unknown>;
};

type Preference = {
  id: string;
  userId: string;
  category: "gym" | "downtime" | "social" | "focus" | "quiet_hours" | "custom";
  label: string;
  strength: Strength;
  // either fixed windows:
  windows?: { days: number[]; startMin: number; endMin: number }[];
  // or flexible:
  flexible?: { timesPerWeek: number; durationMin: number; preferredBands: { startMin: number; endMin: number }[] };
  locationText?: string;
  createdFrom?: "manual" | "inference";
  evidence?: { gcalEventIds?: string[]; note?: string };
};

type ShareSession = {
  id: string;
  hostUserId: string;
  title: string;
  durationMin: number;
  rangeStart: string;
  rangeEnd: string;
  mode: "strict" | "balanced" | "max";
  participantIds: string[];
};
```

---

## 9. Technical architecture (target)

```
[Next.js App Router]
  UI (shadcn) → Client calendar state (Zustand or React Query)
       │
       ├─ /api/parse          (syllabus PDF/text → events; optional LLM)
       ├─ /api/auth/[...]*    (NextAuth / Auth.js — Google provider)
       ├─ /api/gcal/sync      (fetch busy + events)
       ├─ /api/preferences    (CRUD)
       ├─ /api/infer          (analyze calendar → suggestions)
       └─ /api/share/[id]     (create/join overlap sessions)

[Persistence]
  Early: SQLite/Turso or Postgres (Neon) via Prisma/Drizzle
  Absolute MVP increment: localStorage + optional export JSON

[External]
  Google Calendar API (readonly → optional write calendar)
  Optional: OpenAI/Anthropic for syllabus parse
```

**Env vars (future)**
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
DATABASE_URL=
OPENAI_API_KEY=          # optional
```

**Deploy:** Vercel project linked to `Anan51/IntelliCal`, production branch `main`.

---

## 10. UX flows

### 10.1 Onboarding
1. Land → “Build your Bruin week”
2. Add courses (syllabus paste/upload) → review events
3. Connect Google Calendar (skip allowed)
4. “We noticed patterns” suggestions OR manual Preferences
5. Land on My Week with confetti-lite empty-state completion checklist

### 10.2 Preference adjustment
1. Open Preferences or click a soft block on calendar
2. Drag resize / change strength / convert to hard
3. Overlap previews update live

### 10.3 Share hangout
1. Share → “Find time with friends” → duration 60m → Balanced mode
2. Copy link
3. Friend opens → Connect GCal or paint → sees green ideal slots
4. Host confirms slot → optional “Add hold to my calendar”

---

## 11. Overlap engine rules (spec)

For participant set P, candidate slot S:

1. S conflicts with any **hard** event for any p ∈ P → reject
2. If mode = `balanced`: any **soft** preference overlap → reject (or score penalty)
3. If mode = `max`: ignore soft
4. If meeting location set: ensure each participant has travel buffer from previous hard event (optional flag)
5. Score remaining slots:
   - + preferred `social` windows
   - + afternoon bias if hangout
   - − adjacent to exams (heavy day)
6. Return top slots + heatmap

---

## 12. Phased roadmap

### Phase 0 — Done (hackathon MVP)
- [x] Week grid, syllabus paste regex, overlap vs Alex, walk alerts, dark CSS, mock data

### Phase 1 — Preferences + design foundation (next, ~1 week)
- [ ] Tailwind + shadcn redesign
- [ ] Preferences tab + data model + localStorage persistence
- [ ] Soft vs hard rendering on WeekCalendar
- [ ] Overlap modes (strict/balanced/max)
- [ ] Onboarding checklist empty states
- [ ] Create `main` branch; feature PRs

### Phase 2 — Google Calendar read + inference
- [ ] Auth.js Google login
- [ ] Pull busy/events; merge into week
- [ ] Infer suggestions UI
- [ ] Accept/edit/dismiss → Preferences
- [ ] Deploy to Vercel

### Phase 3 — Share links + multi-friend
- [ ] ShareSession API + DB
- [ ] Friend join flow (GCal or paint)
- [ ] Duration filters, copy/hold slot
- [ ] Replace demo Alex path as default

### Phase 4 — Syllabus intelligence + campus graph
- [ ] PDF upload + LLM parse + review table
- [ ] Expanded UCLA walk graph + travel autosuggest
- [ ] Optional write to “IntelliCal” GCal calendar
- [ ] Bruin Learn ICS subscribe helper (docs + import)

### Phase 5 — Growth / campus expansion
- [ ] Club-sized groups (10+)
- [ ] Other UC campuses building packs
- [ ] Mobile PWA polish

---

## 13. Design direction (concrete)

**Theme:** “Night library” — deep navy/ink backgrounds, electric blue accents, soft gold warning, mint overlap.

**Typography:** Geist / Inter; clear hierarchy; tabular nums for times.

**Calendar interactions:**
- Drag to create soft preference
- Click event → sheet with Edit / Strength / Delete
- Toggle “Show preferences” / “Show travel”

**Component inventory to add**
- `PreferenceEditor`, `SuggestionCard`, `OnboardingWizard`, `ShareCreateDialog`, `EventSheet`, `ModeToggle`, `BuildingSelect`

---

## 14. Success metrics

| Metric | Target (campus pilot) |
|--------|------------------------|
| Time to first full week built | < 10 minutes |
| % users who set ≥1 preference | ≥ 60% |
| % of share links with ≥1 friend join | ≥ 40% |
| when2meet replacement intent (survey) | ≥ 50% “likely” |
| Parse correction rate | < 25% events edited |

Qualitative: “I stopped painting when2meet for hangouts.”

---

## 15. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| GCal OAuth scope anxiety | Readonly first; clear copy; mock mode |
| Bad syllabus parses destroy trust | Always review step; easy edit |
| Soft prefs make overlap look “empty” | Mode toggle + explainers |
| UCLA building graph incomplete | Crowdsource list; unknown → no warning (don’t false-alarm) |
| Scope creep vs course planner | Hard non-goal: no degree audit |

---

## 16. Open questions (product)

1. Brand final: **IntelliCal** vs BruinSync vs other?
2. Is Google Calendar enough for v1, or also Apple/Outlook ICS upload?
3. Should soft gym blocks hide from friends as “Busy” or “Gym (soft)”?
4. Do we need UCLA SSO / campus login, or Google-only?
5. Persistence: local-first OK for pilot, or DB immediately?
6. Meeting location in share flow v1 or later?
7. Any real syllabi + anonymized GCal screenshots for fixtures?

---

## 17. Context pack for Cursor (copy into agent)

```
You are upgrading IntelliCal from hackathon MVP to a full student scheduling product.

REPO: https://github.com/Anan51/IntelliCal
BRANCH: work from latest main or hackathon/mvp-plan; open PRs; don't destroy demo mode.
READ: PRD.md (source of truth), README.md, HACKATHON_PLAN.md, and all of src/.

PITCH: when2meet, but it already knows your classes, preferences, and UCLA walk times.

CURRENT MVP (keep working):
- Next 15 + React 19 + TS
- WeekCalendar, SyllabusPaste, OverlapView, WalkAlerts
- Regex syllabus parse, mock you+Alex data, static walk graph
- No auth, no DB, no Tailwind yet

BUILD NEXT (Phase 1 → 2), in order:
1. Design system: add Tailwind + shadcn; restyle existing tabs without breaking demo script
2. Extend types for Preference, strength, source; persist prefs to localStorage
3. Preferences UI (gym, downtime, quiet hours, custom) with hard/soft
4. Render soft prefs on calendar; update overlap engine with modes strict/balanced/max
5. Google Calendar readonly OAuth (Auth.js) + merge events; keep mock fallback
6. Infer preferences from GCal history with Accept/Edit/Dismiss cards
7. Share link sessions (can stub with in-memory/localStorage before DB)

CONSTRAINTS:
- Never remove the no-OAuth demo path (Demo with Alex + sample syllabus)
- Prefer explainable inference over opaque ML
- America/Los_Angeles timezone
- Ask before adding paid APIs beyond Google + optional OpenAI parse

DONE when:
- Preferences change overlap results visibly
- Connected calendar events show on My Week
- At least one inference → accepted preference path works in UI
- npm run build passes; README updated
```

---

## 18. Appendix — original feature wishlist (mapped)

| Original idea | Status | Plan |
|---------------|--------|------|
| Syllabus intake (schedule) | MVP done (text) | Phase 4 PDF/LLM + review |
| Calendar of exams/lectures/sections | MVP done (mock week) | Persist + term view |
| Thoughtful schedule for gym/relax/outings | Partial (hardcoded gym busy) | Phase 1 Preferences |
| Two-way sync GCal | Not started | Phase 2 read; Phase 4 optional write |
| Address + distance / when to leave | MVP static walk alerts | Phase 4 expand graph |
| Classroom/building sift | Partial building field | Building directory |
| Share-with-friends overlap | MVP vs Alex | Phase 3 share links |
| Preference time for hobbies | Not started | Phase 1 + Phase 2 inference |

---

*End of PRD v1.0 — maintain this file as decisions land; bump to v1.1 when Phase 1 ships.*
