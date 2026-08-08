import { newId } from "./id";
import { resolveLocation } from "./resolveLocation";
import { expandEvent, weeklyRRule } from "./recurrence";
import { scanSyllabusImportantDates } from "./syllabusFilter";
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
  const compact = raw.replace(/[^A-Za-z]/g, "");
  if (/^(MWF|MW|MF|TR|TTh|MTWRF)$/i.test(compact)) {
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

function courseTitle(text: string): string {
  const m = text.match(/^([A-Z]{2,10}(?:\s+[A-Z]{2,10})?\s*\d{1,3}[A-Z]?)\b/m);
  return m?.[1]?.replace(/\s+/g, " ").trim() ?? "Course";
}

function firstWeekDateForDay(weekStartISO: string, day: number): string {
  const monday = parseISODate(weekStartISO);
  const mondayDow = monday.getDay();
  const offsetToMonday = mondayDow === 1 ? 0 : mondayDow === 0 ? -6 : 1 - mondayDow;
  const base = new Date(monday);
  base.setDate(base.getDate() + offsetToMonday);
  const targetOffset = day === 0 ? 6 : day - 1;
  base.setDate(base.getDate() + targetOffset);
  return formatISODate(base);
}

function parseMeetingSchedule(text: string, options: ParseSyllabusOptions): ParsedEvent[] {
  const title = courseTitle(text);
  const drafts: ParsedEvent[] = [];

  for (const line of text.split(/\r?\n/)) {
    const meeting = line.match(
      /(Lecture|Discussion|Section|Lab)[:\s]+([A-Za-z][\w/,&\s]*?)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})(?:\s+(.+))?/i
    );
    if (!meeting) continue;

    const kindRaw = meeting[1].toLowerCase();
    const kind: EventKind =
      kindRaw === "lecture"
        ? "lecture"
        : kindRaw === "discussion" || kindRaw === "section"
          ? "discussion"
          : "other";
    const days = parseDayList(meeting[2]);
    if (days.length === 0) continue;

    const startT = normalizeHHMM(meeting[3]);
    const endT = normalizeHHMM(meeting[4]);
    const locRaw = meeting[5]?.trim().replace(/\s+/g, " ");
    const location = locRaw ? resolveLocation(locRaw) : undefined;
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
  }

  return drafts;
}

function dedupeDrafts(drafts: ParsedEvent[]): ParsedEvent[] {
  const seen = new Set<string>();
  const out: ParsedEvent[] = [];
  for (const d of drafts) {
    const key = `${d.kind}|${d.start}|${d.end}|${d.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(d);
  }
  return out;
}

export type ParseSyllabusOptions = {
  weekStartISO: string;
  termEndISO?: string;
  /** When true, only return exam/quiz/deadline hits from the important-date filter. */
  importantDatesOnly?: boolean;
};

/**
 * Parse a syllabus into calendar drafts.
 * 1) Text-filter important dates (midterms, finals, quizzes, homework, projects)
 * 2) Extract recurring lecture/discussion/lab meetings
 * Review UI must confirm before commits.
 */
export function parseSyllabus(
  text: string,
  options: ParseSyllabusOptions
): ParsedEvent[] {
  const important = scanSyllabusImportantDates(text);
  if (options.importantDatesOnly) return important;

  const meetings = parseMeetingSchedule(text, options);
  return dedupeDrafts([...meetings, ...important]).sort((a, b) =>
    a.start.localeCompare(b.start)
  );
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
