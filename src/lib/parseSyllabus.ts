import type { CalEvent } from "./types";
import { TIMEZONE } from "./types";
import { DEMO_WEEK_START } from "./demo-data";

const DAY_OFFSET: Record<string, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function normalizeTime(t: string): string {
  const [h, m] = t.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

function parseDays(dayStr: string): number[] {
  const parts = dayStr.split(/[/,&\s]+/).filter(Boolean);
  return parts
    .map((p) => DAY_OFFSET[p.toLowerCase().slice(0, 3)])
    .filter((n) => n !== undefined);
}

function parseDate(dateStr: string): string {
  const m = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return "2026-10-30";
  const year = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${year}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

/** Heuristic parser for hackathon demo. Replace with LLM later if key exists. */
export function parseSyllabus(text: string, personId = "you"): CalEvent[] {
  const events: CalEvent[] = [];
  const lines = text.split(/\r?\n/);
  let i = 0;

  for (const line of lines) {
    const lecture = line.match(
      /Lecture[:\s]+((?:Mon|Tue|Wed|Thu|Fri)[\w/,&\s]*?)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2}).*?(Boelter|Bunche|Royce|Powell)?/i
    );
    const discussion = line.match(
      /Discussion[:\s]+((?:Mon|Tue|Wed|Thu|Fri)[\w/,&\s]*?)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2}).*?(Boelter|Bunche|Royce|Powell)?/i
    );
    const midterm = line.match(
      /Midterm[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4}).*?(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/i
    );
    const finalExam = line.match(
      /Final[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4}).*?(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/i
    );

    if (lecture) {
      const days = parseDays(lecture[1]);
      const startT = normalizeTime(lecture[2]);
      const endT = normalizeTime(lecture[3]);
      const building = lecture[4];
      for (const offset of days) {
        i += 1;
        const date = addDays(DEMO_WEEK_START, offset);
        events.push({
          id: `parsed-lec-${i}-${offset}`,
          title: "CS 31 Lecture",
          start: `${date}T${startT}:00`,
          end: `${date}T${endT}:00`,
          building,
          kind: "lecture",
          personId,
          source: "syllabus",
          strength: "hard",
          timezone: TIMEZONE,
        });
      }
    }

    if (discussion) {
      const days = parseDays(discussion[1]);
      const startT = normalizeTime(discussion[2]);
      const endT = normalizeTime(discussion[3]);
      const building = discussion[4];
      for (const offset of days) {
        i += 1;
        const date = addDays(DEMO_WEEK_START, offset);
        events.push({
          id: `parsed-disc-${i}-${offset}`,
          title: "CS 31 Discussion",
          start: `${date}T${startT}:00`,
          end: `${date}T${endT}:00`,
          building,
          kind: "discussion",
          personId,
          source: "syllabus",
          strength: "hard",
          timezone: TIMEZONE,
        });
      }
    }

    if (midterm) {
      i += 1;
      const date = parseDate(midterm[1]);
      events.push({
        id: `parsed-exam-${i}`,
        title: "Midterm",
        start: `${date}T${normalizeTime(midterm[2])}:00`,
        end: `${date}T${normalizeTime(midterm[3])}:00`,
        kind: "exam",
        personId,
        source: "syllabus",
        strength: "hard",
        timezone: TIMEZONE,
      });
    }

    if (finalExam) {
      i += 1;
      const date = parseDate(finalExam[1]);
      events.push({
        id: `parsed-final-${i}`,
        title: "Final Exam",
        start: `${date}T${normalizeTime(finalExam[2])}:00`,
        end: `${date}T${normalizeTime(finalExam[3])}:00`,
        kind: "exam",
        personId,
        source: "syllabus",
        strength: "hard",
        timezone: TIMEZONE,
      });
    }
  }

  return events;
}
