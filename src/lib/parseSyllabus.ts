import type { CalEvent } from "./types";

/** Heuristic parser for hackathon demo. Replace with LLM later if key exists. */
export function parseSyllabus(text: string, personId = "you"): CalEvent[] {
  const events: CalEvent[] = [];
  const lines = text.split(/\r?\n/);
  let i = 0;
  for (const line of lines) {
    const lecture = line.match(/Lecture[:\s]+(Mon|Tue|Wed|Thu|Fri).*?(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2}).*?(Boelter|Bunche|Royce|Powell)?/i);
    const midterm = line.match(/Midterm[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4}).*?(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/i);
    if (lecture) {
      i += 1;
      events.push({
        id: `parsed-lec-${i}`,
        title: "Parsed Lecture",
        start: `2026-09-28T${lecture[2].padStart(5, "0")}:00`,
        end: `2026-09-28T${lecture[3].padStart(5, "0")}:00`,
        building: lecture[4],
        kind: "lecture",
        personId,
      });
    }
    if (midterm) {
      i += 1;
      events.push({
        id: `parsed-exam-${i}`,
        title: "Midterm",
        start: `2026-10-30T${midterm[2].padStart(5, "0")}:00`,
        end: `2026-10-30T${midterm[3].padStart(5, "0")}:00`,
        kind: "exam",
        personId,
      });
    }
  }
  return events;
}
