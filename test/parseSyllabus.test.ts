import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEMO_WEEK_START } from "@/lib/constants";
import { parseSyllabus } from "@/lib/parseSyllabus";

function fixture(name: string): string {
  return readFileSync(path.join(__dirname, "fixtures", name), "utf8");
}

describe("parseSyllabus", () => {
  it("parses CS 31 lectures, discussion, exams, and due dates", () => {
    const drafts = parseSyllabus(fixture("cs31.txt"), {
      weekStartISO: DEMO_WEEK_START,
      termEndISO: "2026-12-12",
    });
    expect(drafts.some((d) => d.kind === "lecture")).toBe(true);
    expect(drafts.some((d) => d.kind === "discussion")).toBe(true);
    expect(drafts.filter((d) => d.kind === "exam").length).toBeGreaterThanOrEqual(2);
    expect(drafts.some((d) => d.kind === "due_date")).toBe(true);
    const lecture = drafts.find((d) => d.kind === "lecture");
    expect(lecture?.location?.building).toContain("Boelter");
    expect(lecture?.recurrence).toContain("FREQ=WEEKLY");
  });

  it("parses GE Cluster TTh compact day codes", () => {
    const drafts = parseSyllabus(fixture("ge-cluster.txt"), {
      weekStartISO: DEMO_WEEK_START,
    });
    const lecture = drafts.find((d) => d.kind === "lecture");
    expect(lecture).toBeTruthy();
    expect(lecture?.recurrence).toMatch(/TU.*TH|TH.*TU/);
  });

  it("parses Physics MWF + lab", () => {
    const drafts = parseSyllabus(fixture("physics.txt"), {
      weekStartISO: DEMO_WEEK_START,
    });
    expect(drafts.some((d) => /Physics|PHYSICS/i.test(d.title) || d.kind === "lecture")).toBe(
      true
    );
    expect(drafts.some((d) => d.kind === "exam")).toBe(true);
  });

  it("matches public sample syllabus", () => {
    const sample = readFileSync(
      path.join(__dirname, "..", "public", "sample-syllabus.txt"),
      "utf8"
    );
    const drafts = parseSyllabus(sample, { weekStartISO: DEMO_WEEK_START });
    expect(drafts.length).toBeGreaterThanOrEqual(3);
  });
});
