import { DEMO_WEEK_START } from "./demo-data";
import type { CalEvent, Preference, PreferenceCategory } from "./types";
import { TIMEZONE } from "./types";

export const PREFERENCES_STORAGE_KEY = "intellical:preferences:v1";

/** Seed defaults: soft gym Mon/Wed 6–7pm; hard quiet hours before 10am. */
export const DEFAULT_PREFERENCES: Preference[] = [
  {
    id: "pref-gym",
    userId: "you",
    category: "gym",
    label: "Gym",
    strength: "soft",
    windows: [{ days: [0, 2], startMin: 18 * 60, endMin: 19 * 60 }],
    locationText: "John Wooden Center",
    createdFrom: "manual",
    evidence: { note: "Demo default — Mon/Wed evenings" },
  },
  {
    id: "pref-quiet",
    userId: "you",
    category: "quiet_hours",
    label: "Quiet hours",
    strength: "hard",
    // Grid starts at 8am; protect before 10am Mon–Fri
    windows: [{ days: [0, 1, 2, 3, 4], startMin: 8 * 60, endMin: 10 * 60 }],
    createdFrom: "manual",
    evidence: { note: "No meetings before 10am" },
  },
];

function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function addDaysISO(weekStartISO: string, dayOffset: number): string {
  const [y, m, d] = weekStartISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d + dayOffset);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function kindForCategory(category: PreferenceCategory): CalEvent["kind"] {
  if (category === "gym") return "busy";
  return "busy";
}

/** Expand preference windows into CalEvents for the demo week. */
export function preferencesToEvents(
  prefs: Preference[],
  weekStartISO = DEMO_WEEK_START,
  personId = "you"
): CalEvent[] {
  const events: CalEvent[] = [];
  for (const pref of prefs) {
    if (pref.windows?.length) {
      for (const win of pref.windows) {
        for (const day of win.days) {
          if (day < 0 || day > 4) continue;
          events.push(makePrefEvent(pref, weekStartISO, day, win.startMin, win.endMin, personId));
        }
      }
    } else if (pref.flexible) {
      // Visualize flexible prefs: place duration at start of preferred band on first N weekdays
      const { timesPerWeek, durationMin, preferredBands } = pref.flexible;
      const band = preferredBands[0] ?? { startMin: 18 * 60, endMin: 21 * 60 };
      const n = Math.min(Math.max(timesPerWeek, 1), 5);
      // Spread across Mon–Fri evenly
      const dayStep = Math.max(1, Math.floor(5 / n));
      for (let i = 0; i < n; i++) {
        const day = Math.min(4, i * dayStep);
        const endMin = Math.min(band.startMin + durationMin, band.endMin);
        events.push(
          makePrefEvent(pref, weekStartISO, day, band.startMin, endMin, personId)
        );
      }
    }
  }
  return events;
}

function makePrefEvent(
  pref: Preference,
  weekStartISO: string,
  day: number,
  startMin: number,
  endMin: number,
  personId: string
): CalEvent {
  const date = addDaysISO(weekStartISO, day);
  return {
    id: `pref-ev-${pref.id}-${day}-${startMin}`,
    title: pref.label,
    start: `${date}T${minutesToHHMM(startMin)}:00`,
    end: `${date}T${minutesToHHMM(endMin)}:00`,
    kind: kindForCategory(pref.category),
    personId,
    source: "manual",
    strength: pref.strength,
    preferenceId: pref.id,
    timezone: TIMEZONE,
    building: pref.locationText,
  };
}

export function loadPreferences(): Preference[] {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Preference[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PREFERENCES;
    return parsed;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Preference[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
}

export function createId(prefix = "pref"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Create a soft preference covering one hour on one day (Protect this). */
export function preferenceFromSlot(
  dayISO: string,
  hour: number,
  weekStartISO = DEMO_WEEK_START
): Preference {
  const [y, m, d] = weekStartISO.split("-").map(Number);
  const weekStart = new Date(y, m - 1, d);
  const slot = new Date(`${dayISO}T12:00:00`);
  const dayOffset = Math.round((slot.getTime() - weekStart.getTime()) / 86_400_000);
  const day = Math.max(0, Math.min(4, dayOffset));
  const startMin = hour * 60;
  const endMin = (hour + 1) * 60;
  const label = `Protected ${formatHour(hour)}`;
  return {
    id: createId("protect"),
    userId: "you",
    category: "custom",
    label,
    strength: "soft",
    windows: [{ days: [day], startMin, endMin }],
    createdFrom: "manual",
    evidence: { note: "Protected from empty calendar slot" },
  };
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
}

export function formatMinutes(min: number): string {
  return formatHour(Math.floor(min / 60)) + (min % 60 ? `:${String(min % 60).padStart(2, "0")}` : "");
}
