import { newId } from "./id";
import { resolveLocation } from "./resolveLocation";
import { expandEvent, weeklyRRule } from "./recurrence";
import type { CalEvent, EventKind, ParsedEvent } from "./types";
import { addDaysISO, normalizeHHMM, parseISODate, formatISODate } from "./time";

const DAY_TOKEN: Record<string, number> = {
  su: 0,
  sun: 0,
  sunday: 0,
  m: 1,
  mo: 1,
  mon: 1,
  monday: 1,
  t: 2,
  tu: 2,
  tue: 2,
  tues: 2,
  tuesday: 2,
  w: 3,
  we: 3,
  wed: 3,
  wednesday: 3,
  th: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  f: 5,
  fr: 5,
  fri: 5,
  friday: 5,
  sa: 6,
  sat: 6,
  saturday: 6,
};

function parseDayList(raw: string): number[] {
  // Supports "Mon/Wed", "MWF", "TTh", "Mon, Wed, Fri"
  const compact = raw.replace(/[^A-Za-z]/g, "");
  if (/^(MWF|MW|MF|TR|TTh|MWF|MTWRF)$/i.test(compact)) {
    const map: Record<string, number[]> = {
      mwf: [1, 3, 5],
      mw: [1, 3],
      mf: [1, 5],
      tr: [2, 4],
      tth: [2, 4],
      mtwrf: [1, 2, 3, 4, 5],
    };
    return map[compact.toLowerCase()] ?? [];
  }

  const parts = raw.split(/[/,&\s]+/).filter(Boolean);
  const days: number[] = [];
  for (const p of parts) {
    const key = p.toLowerCase().slice(0, 3);
    const d = DAY_TOKEN[key] ?? DAY_TOKEN[p.toLowerCase()];
    if (d !== undefined && !days.includes(d)) days.push(d);
  }
  return days;
}

function parseDate(dateStr: string, fallbackYear = 2026): string {
  const m = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return `${fallbackYear}-10-30`;
  const year = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${year}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

function courseTitle(text: string): string {
  const m = text.match(/^([A-Z]{2,4}\s*\d{1,3}[A-Z]?)\b/m);
  return m?.[1]?.replace(/\s+/, " ") ?? "Course";
}

function firstWeekDateForDay(weekStartISO: string, day: number): string {
  // weekStartISO is Monday
  const monday = parseISODate(weekStartISO);
  const mondayDow = monday.getDay();
  const offsetToMonday = mondayDow === 1 ? 0 : mondayDow === 0 ? -6 : 1 - mondayDow;
  const base = new Date(monday);
  base.setDate(base.getDate() + offsetToMonday);
  const targetOffset = day === 0 ? 6 : day - 1;
  base.setDate(base.getDate() + targetOffset);
  return formatISODate(base);
}

export type ParseSyllabusOptions = {
  weekStartISO: string;
  termEndISO?: string;
};

/**
 * Heuristic syllabus parser. Returns draft ParsedEvents with confidence scores.
 * Never auto-commits — caller must show a review UI.
 */
export function parseSyllabus(
  text: string,
  options: ParseSyllabusOptions
): ParsedEvent[] {
  const title = courseTitle(text);
  const drafts: ParsedEvent[] = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const meeting = line.match(
      /(Lecture|Discussion|Section|Lab)[:\s]+([A-Za-z][\w/,&\s]*?)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})(?:\s+(.+))?/i
    );
    if (meeting) {
      const kindRaw = meeting[1].toLowerCase();
      const kind: EventKind =
        kindRaw === "lecture"
          ? "lecture"
          : kindRaw === "discussion" || kindRaw === "section"
            ? "discussion"
            : "other";
      const days = parseDayList(meeting[2]);
      const startT = normalizeHHMM(meeting[3]);
      const endT = normalizeHHMM(meeting[4]);
      const locRaw = meeting[5]?.trim().replace(/\s+/g, " ");
      const location = locRaw ? resolveLocation(locRaw) : undefined;
      if (days.length === 0) continue;

      const firstDay = firstWeekDateForDay(options.weekStartISO, days[0]);
      drafts.push({
        draftId: newId("draft"),
        title: `${title} ${meeting[1]}`,
        start: `${firstDay}T${startT}:00`,
        end: `${firstDay}T${endT}:00`,
        kind,
        location,
        recurrence: weeklyRRule(days, options.termEndISO),
        confidence: {
          title: 0.7,
          start: 0.9,
          end: 0.9,
          kind: 0.95,
          location: location?.building ? 0.85 : 0.4,
        },
      });
      continue;
    }

    const exam = line.match(
      /(Midterm|Final(?:\s*Exam)?|Exam)[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4}).*?(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/i
    );
    if (exam) {
      const date = parseDate(exam[2]);
      const label = /final/i.test(exam[1]) ? "Final Exam" : /midterm/i.test(exam[1]) ? "Midterm" : "Exam";
      drafts.push({
        draftId: newId("draft"),
        title: `${title} ${label}`,
        start: `${date}T${normalizeHHMM(exam[3])}:00`,
        end: `${date}T${normalizeHHMM(exam[4])}:00`,
        kind: "exam",
        confidence: {
          title: 0.8,
          start: 0.9,
          end: 0.9,
          kind: 0.95,
          location: 0.2,
        },
      });
      continue;
    }

    const due = line.match(
      /(Due|Deadline|Assignment|Problem Set|Essay|Project)[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})(?:.*?(\d{1,2}:\d{2}))?/i
    );
    if (due) {
      const date = parseDate(due[2]);
      const time = due[3] ? normalizeHHMM(due[3]) : "23:59";
      drafts.push({
        draftId: newId("draft"),
        title: `${title} ${due[1]}`,
        start: `${date}T${time}:00`,
        end: `${date}T${time}:00`,
        kind: "due_date",
        confidence: {
          title: 0.6,
          start: 0.75,
          end: 0.75,
          kind: 0.8,
          location: 0.1,
        },
      });
    }
  }

  return drafts;
}

/** Expand recurring drafts into concrete week events for calendar merge preview. */
export function materializeParsedWeek(
  drafts: ParsedEvent[],
  weekStartISO: string,
  personId: string
): CalEvent[] {
  const rangeStart = parseISODate(weekStartISO);
  const rangeEnd = parseISODate(addDaysISO(weekStartISO, 7));
  const now = new Date().toISOString();

  return drafts.flatMap((d) => {
    const base: CalEvent = {
      id: d.draftId,
      personId,
      title: d.title,
      start: d.start,
      end: d.end,
      kind: d.kind,
      location: d.location,
      recurrence: d.recurrence,
      source: "syllabus",
      updatedAt: now,
    };
    return expandEvent(base, rangeStart, rangeEnd);
  });
}
