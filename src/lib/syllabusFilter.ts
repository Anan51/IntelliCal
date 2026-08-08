import { newId } from "./id";
import { resolveLocation } from "./resolveLocation";
import type { EventKind, ParsedEvent } from "./types";
import { normalizeHHMM } from "./time";

const MONTHS: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

/** Lines that usually carry calendar-worthy academic dates. */
const IMPORTANT_LINE =
  /\b(midterm|final(?:\s+exam)?|exam|quiz|homework|problem\s*set|assignment|project|essay|deadline|due|submission|proposal)\b/i;

const SKIP_LINE =
  /\b(office\s*hours|no\s+class|late\s+work|instructor|university|course\s+meetings)\b/i;

const DATE_NUMERIC = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
const DATE_NAMED =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/i;
const TIME_RANGE = /(\d{1,2}:\d{2})\s*(?:a\.?m\.?|p\.?m\.?)?\s*[-–]\s*(\d{1,2}:\d{2})\s*(?:a\.?m\.?|p\.?m\.?)?/i;
const TIME_SINGLE = /(?:at\s+)?(\d{1,2}:\d{2})\s*(a\.?m\.?|p\.?m\.?)?/i;
const LOCATION_TAIL = /\b([A-Za-z][A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d{2,5}[A-Za-z]?)\b/;

export type DateHit = {
  line: string;
  dateISO: string;
  label: string;
  kind: EventKind;
  startTime: string;
  endTime: string;
  locationRaw?: string;
};

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function extractDateISO(text: string, fallbackYear = 2026): string | null {
  const numeric = text.match(DATE_NUMERIC);
  if (numeric) {
    const year = numeric[3].length === 2 ? 2000 + Number(numeric[3]) : Number(numeric[3]);
    return toISODate(year, Number(numeric[1]), Number(numeric[2]));
  }
  const named = text.match(DATE_NAMED);
  if (named) {
    const month = MONTHS[named[1].toLowerCase().replace(/\.$/, "")];
    if (!month) return null;
    return toISODate(Number(named[3]), month, Number(named[2]));
  }
  void fallbackYear;
  return null;
}

function classifyKind(line: string): EventKind {
  // Submission/due language wins over the word "final" in "final submission".
  if (
    /\b(homework|problem\s*set|assignment|project|essay|deadline|due|submission|proposal)\b/i.test(
      line
    )
  ) {
    return "due_date";
  }
  if (/\b(midterm|final\s+exam|exam|quiz)\b/i.test(line) || /^final\b/i.test(line.trim())) {
    return "exam";
  }
  return "other";
}

function labelFromLine(line: string, kind: EventKind, course: string): string {
  const cleaned = line
    .replace(DATE_NUMERIC, "")
    .replace(DATE_NAMED, "")
    .replace(TIME_RANGE, "")
    .replace(TIME_SINGLE, "")
    .replace(LOCATION_TAIL, "")
    .replace(/[:\-–—]/g, " ")
    .replace(/\b(due|by|on|at|is|the|deadline|submission)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length >= 3) {
    return course ? `${course} ${cleaned}` : cleaned;
  }
  if (kind === "exam") {
    if (/final/i.test(line)) return `${course} Final Exam`.trim();
    if (/midterm/i.test(line)) return `${course} Midterm`.trim();
    if (/quiz/i.test(line)) return `${course} Quiz`.trim();
    return `${course} Exam`.trim();
  }
  return `${course} Deadline`.trim();
}

function extractTimes(line: string, kind: EventKind): { startTime: string; endTime: string } {
  const range = line.match(TIME_RANGE);
  if (range) {
    return { startTime: normalizeHHMM(range[1]), endTime: normalizeHHMM(range[2]) };
  }
  const single = line.match(TIME_SINGLE);
  if (single) {
    let hour = Number(single[1].split(":")[0]);
    const mins = single[1].split(":")[1] ?? "00";
    const meridiem = single[2]?.toLowerCase() ?? "";
    if (meridiem.startsWith("p") && hour < 12) hour += 12;
    if (meridiem.startsWith("a") && hour === 12) hour = 0;
    const startTime = `${String(hour).padStart(2, "0")}:${mins.padStart(2, "0")}`;
    return { startTime, endTime: startTime };
  }
  if (kind === "due_date") return { startTime: "23:59", endTime: "23:59" };
  return { startTime: "12:00", endTime: "13:00" };
}

function courseTitle(text: string): string {
  const m = text.match(/^([A-Z]{2,10}(?:\s+[A-Z]{2,10})?\s*\d{1,3}[A-Z]?)\b/m);
  return m?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

/**
 * Scan syllabus text for important academic dates (exams, quizzes, deadlines).
 * Ignores noise lines like office hours and late-policy prose.
 */
export function filterImportantDates(text: string): DateHit[] {
  const course = courseTitle(text);
  const hits: DateHit[] = [];
  const seen = new Set<string>();

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.length < 8) continue;
    if (SKIP_LINE.test(line) && !IMPORTANT_LINE.test(line)) continue;
    if (!IMPORTANT_LINE.test(line)) continue;

    const dateISO = extractDateISO(line);
    if (!dateISO) continue;

    const kind = classifyKind(line);
    if (kind !== "exam" && kind !== "due_date") continue;

    const { startTime, endTime } = extractTimes(line, kind);
    const loc = line.match(LOCATION_TAIL)?.[1];
    const label = labelFromLine(line, kind, course);
    const key = `${kind}|${dateISO}|${startTime}|${label.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    hits.push({
      line,
      dateISO,
      label,
      kind,
      startTime,
      endTime,
      locationRaw: loc,
    });
  }

  return hits.sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.startTime.localeCompare(b.startTime));
}

/** Convert important-date hits into reviewable ParsedEvent drafts. */
export function importantDatesToDrafts(hits: DateHit[]): ParsedEvent[] {
  return hits.map((hit) => {
    const location = hit.locationRaw ? resolveLocation(hit.locationRaw) : undefined;
    return {
      draftId: newId("draft"),
      title: hit.label,
      start: `${hit.dateISO}T${hit.startTime}:00`,
      end: `${hit.dateISO}T${hit.endTime}:00`,
      kind: hit.kind,
      location,
      confidence: {
        title: 0.85,
        start: 0.9,
        end: hit.startTime === hit.endTime ? 0.8 : 0.9,
        kind: 0.95,
        location: location?.building ? 0.85 : 0.25,
      },
    };
  });
}

export function scanSyllabusImportantDates(text: string): ParsedEvent[] {
  return importantDatesToDrafts(filterImportantDates(text));
}
