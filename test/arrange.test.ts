import { describe, expect, it } from "vitest";
import { applyArrangement, arrangePreferences } from "@/lib/arrange";
import { DEMO_WEEK_START, demoEvents, demoPreferences } from "@/lib/demo-data";
import type { CalEvent } from "@/lib/types";

describe("arrangePreferences", () => {
  it("places gym target when evenings are free", () => {
    const result = arrangePreferences(demoEvents, demoPreferences, {
      weekStartISO: DEMO_WEEK_START,
    });
    const gym = result.placed.filter((e) => e.title === "Gym" && e.source === "arranged");
    expect(gym.length).toBe(3);
    for (const g of gym) {
      const conflicts = demoEvents.filter(
        (e) =>
          e.personId === g.personId &&
          e.start < g.end &&
          g.start < e.end
      );
      expect(conflicts).toHaveLength(0);
    }
  });

  it("reports unmet when no free windows exist", () => {
    const packed: CalEvent[] = [
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
    ].map((day, i) => ({
      id: `block-${i}`,
      personId: "you",
      title: "Packed",
      start: `${day}T08:00:00`,
      end: `${day}T21:00:00`,
      kind: "other" as const,
      source: "manual" as const,
      updatedAt: "2026-09-01T00:00:00.000Z",
    }));
    const result = arrangePreferences(packed, [demoPreferences[0]], {
      weekStartISO: DEMO_WEEK_START,
      days: 5,
    });
    expect(result.placed.filter((p) => p.source === "arranged")).toHaveLength(0);
    expect(result.unmet[0]?.placed).toBe(0);
  });

  it("keeps pinned manual preference blocks across rearrange", () => {
    const first = arrangePreferences(demoEvents, demoPreferences, {
      weekStartISO: DEMO_WEEK_START,
    });
    const pinned = {
      ...first.placed[0],
      source: "manual" as const,
      id: "pinned-gym",
    };
    const withPin = applyArrangement(
      [...demoEvents, pinned],
      first.placed,
      DEMO_WEEK_START
    );
    const second = arrangePreferences(withPin, demoPreferences, {
      weekStartISO: DEMO_WEEK_START,
    });
    const merged = applyArrangement(withPin, second.placed, DEMO_WEEK_START);
    expect(merged.some((e) => e.id === "pinned-gym" && e.source === "manual")).toBe(true);
  });

  it("respects priority ordering", () => {
    const prefs = [
      { ...demoPreferences[2], priority: 1 as const, targetPerWeek: 5, durationMin: 120 },
      { ...demoPreferences[0], priority: 3 as const, targetPerWeek: 3 },
    ];
    const result = arrangePreferences(demoEvents, prefs, {
      weekStartISO: DEMO_WEEK_START,
      days: 5,
    });
    const social = result.placed.filter((e) => e.title === "Social");
    expect(social.length).toBeGreaterThan(0);
  });
});
