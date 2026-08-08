import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEMO_WEEK_START } from "@/lib/constants";
import { parseSyllabus } from "@/lib/parseSyllabus";
import {
  extractDateISO,
  filterImportantDates,
  scanSyllabusImportantDates,
} from "@/lib/syllabusFilter";

const testSyllabus = readFileSync(
  path.join(__dirname, "..", "public", "test-syllabus.txt"),
  "utf8"
);

describe("syllabusFilter", () => {
  it("parses numeric and named dates", () => {
    expect(extractDateISO("Midterm: 10/21/2026 11:00-12:15")).toBe("2026-10-21");
    expect(extractDateISO("due on October 17, 2026 at 23:59")).toBe("2026-10-17");
    expect(extractDateISO("December 5, 2026 23:59")).toBe("2026-12-05");
  });

  it("scans the fake test syllabus for important dates", () => {
    const hits = filterImportantDates(testSyllabus);
    expect(hits.length).toBeGreaterThanOrEqual(10);
    expect(hits.some((h) => h.kind === "exam" && /midterm/i.test(h.label))).toBe(true);
    expect(hits.some((h) => h.kind === "exam" && /final/i.test(h.label))).toBe(true);
    expect(hits.some((h) => h.kind === "exam" && /quiz/i.test(h.label))).toBe(true);
    expect(hits.some((h) => h.kind === "due_date" && /homework/i.test(h.label))).toBe(true);
    expect(hits.some((h) => h.kind === "due_date" && /project/i.test(h.label))).toBe(true);
    // Noise lines should not become calendar events
    expect(hits.every((h) => !/office hours/i.test(h.line))).toBe(true);
    expect(hits.every((h) => !/late work/i.test(h.line))).toBe(true);
  });

  it("converts hits into calendar drafts", () => {
    const drafts = scanSyllabusImportantDates(testSyllabus);
    expect(drafts.every((d) => d.kind === "exam" || d.kind === "due_date")).toBe(true);
    expect(drafts.some((d) => d.start.startsWith("2026-12-11"))).toBe(true);
    expect(drafts.some((d) => d.start.startsWith("2026-11-18"))).toBe(true);
  });

  it("parses full syllabus including meetings + important dates", () => {
    const drafts = parseSyllabus(testSyllabus, {
      weekStartISO: DEMO_WEEK_START,
      termEndISO: "2026-12-12",
    });
    expect(drafts.some((d) => d.kind === "lecture")).toBe(true);
    expect(drafts.some((d) => d.kind === "discussion")).toBe(true);
    expect(drafts.filter((d) => d.kind === "exam").length).toBeGreaterThanOrEqual(4);
    expect(drafts.filter((d) => d.kind === "due_date").length).toBeGreaterThanOrEqual(4);
  });

  it("supports importantDatesOnly mode", () => {
    const drafts = parseSyllabus(testSyllabus, {
      weekStartISO: DEMO_WEEK_START,
      importantDatesOnly: true,
    });
    expect(drafts.every((d) => d.kind === "exam" || d.kind === "due_date")).toBe(true);
    expect(drafts.some((d) => d.kind === "lecture")).toBe(false);
  });
});
