import { RRule, rrulestr } from "rrule";
import type { CalEvent } from "./types";
import { durationMin, formatISODate, pad2 } from "./time";

function toLocalParts(date: Date): string {
  return `${formatISODate(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:00`;
}

/**
 * Expand a single event's RRULE into concrete occurrences that intersect [rangeStart, rangeEnd].
 * Events without recurrence are returned as-is when they intersect the range.
 */
export function expandEvent(
  event: CalEvent,
  rangeStart: Date,
  rangeEnd: Date
): CalEvent[] {
  if (!event.recurrence) {
    const s = new Date(event.start);
    const e = new Date(event.end);
    if (e <= rangeStart || s >= rangeEnd) return [];
    return [event];
  }

  const dur = durationMin(event.start, event.end);
  const dtstart = new Date(event.start);
  const rule = rrulestr(event.recurrence, { dtstart }) as RRule;
  const dates = rule.between(rangeStart, rangeEnd, true);

  return dates.map((d, idx) => {
    const end = new Date(d.getTime() + dur * 60_000);
    return {
      ...event,
      id: `${event.id}#${idx}`,
      start: toLocalParts(d),
      end: toLocalParts(end),
      recurrence: undefined,
    };
  });
}

export function expandEvents(
  events: CalEvent[],
  rangeStart: Date,
  rangeEnd: Date
): CalEvent[] {
  return events.flatMap((e) => expandEvent(e, rangeStart, rangeEnd));
}

export function weeklyRRule(days: number[], untilISO?: string): string {
  const map: Record<number, string> = {
    0: "SU",
    1: "MO",
    2: "TU",
    3: "WE",
    4: "TH",
    5: "FR",
    6: "SA",
  };
  const byday = days.map((d) => map[d]).join(",");
  const until = untilISO
    ? `;UNTIL=${untilISO.replace(/[-:]/g, "").slice(0, 8)}T235959Z`
    : "";
  return `FREQ=WEEKLY;BYDAY=${byday}${until}`;
}
