import { describe, expect, it } from "vitest";
import { DEMO_WEEK_START, demoEvents } from "@/lib/demo-data";
import { overlapFreeSlots, projectFreeBusy, topHangoutSuggestions } from "@/lib/freeBusy";
import { addDaysISO, localDateTimeISO } from "@/lib/time";
import type { CalEvent } from "@/lib/types";

describe("freeBusy", () => {
  it("projects busy blocks without titles", () => {
    const busy = projectFreeBusy(
      demoEvents.filter((e) => e.personId === "you"),
      {
        rangeStart: new Date(localDateTimeISO(DEMO_WEEK_START, "00:00")),
        rangeEnd: new Date(localDateTimeISO(addDaysISO(DEMO_WEEK_START, 5), "23:59")),
      }
    );
    expect(busy.length).toBeGreaterThan(0);
    for (const b of busy) {
      expect(Object.keys(b).sort()).toEqual(["end", "start"]);
    }
  });

  it("finds overlap between you and alex", () => {
    const slots = overlapFreeSlots(demoEvents, "you", "alex", DEMO_WEEK_START, {
      days: 5,
      minSlotMin: 60,
    });
    expect(slots.length).toBeGreaterThan(0);
    const top = topHangoutSuggestions(slots, 3);
    expect(top.length).toBeLessThanOrEqual(3);
    expect(top[0].durationMin).toBeGreaterThanOrEqual(top.at(-1)?.durationMin ?? 0);
  });

  it("treats preference blocks as free when toggled", () => {
    const withGym: CalEvent[] = [
      ...demoEvents,
      {
        id: "gym",
        personId: "you",
        title: "Gym",
        start: "2026-09-28T18:00:00",
        end: "2026-09-28T19:00:00",
        kind: "preference",
        source: "arranged",
        updatedAt: "2026-09-01T00:00:00.000Z",
      },
    ];
    const coversGymHour = (slots: { start: string; end: string }[]) =>
      slots.some((s) => s.start <= "2026-09-28T18:00:00" && s.end >= "2026-09-28T19:00:00");

    const busyPrefs = overlapFreeSlots(withGym, "you", "alex", DEMO_WEEK_START, {
      prefsAsFree: false,
      minSlotMin: 60,
    });
    const freePrefs = overlapFreeSlots(withGym, "you", "alex", DEMO_WEEK_START, {
      prefsAsFree: true,
      minSlotMin: 60,
    });
    expect(coversGymHour(busyPrefs)).toBe(false);
    expect(coversGymHour(freePrefs)).toBe(true);
  });
});
