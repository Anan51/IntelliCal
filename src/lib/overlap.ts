import type { CalEvent } from "./types";
import { DEMO_WEEK_START } from "./demo-data";

export type Slot = { start: Date; end: Date; dayISO: string };

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

/** Find free slots on a day where neither person has an event. */
export function freeOverlap(
  events: CalEvent[],
  personA: string,
  personB: string,
  dayISO: string,
  windowStartHour = 9,
  windowEndHour = 21,
  slotMinutes = 60
): Slot[] {
  const dayStart = new Date(`${dayISO}T00:00:00`);
  const busy = events.filter((e) => e.personId === personA || e.personId === personB);
  const result: Slot[] = [];
  for (let h = windowStartHour; h < windowEndHour; h += slotMinutes / 60) {
    const start = new Date(dayStart);
    start.setHours(Math.floor(h), (h % 1) * 60, 0, 0);
    const end = new Date(start.getTime() + slotMinutes * 60_000);
    const conflict = busy.some((e) =>
      overlaps(start, end, new Date(e.start), new Date(e.end))
    );
    if (!conflict) result.push({ start, end, dayISO });
  }
  return result;
}

/** Free overlap across Mon–Fri of the demo week. */
export function freeOverlapWeek(
  events: CalEvent[],
  personA: string,
  personB: string,
  weekStartISO = DEMO_WEEK_START,
  days = 5,
  windowStartHour = 9,
  windowEndHour = 21,
  slotMinutes = 60
): Slot[] {
  const all: Slot[] = [];
  const [y, m, d] = weekStartISO.split("-").map(Number);
  for (let day = 0; day < days; day++) {
    const dt = new Date(y, m - 1, d + day);
    const dayISO = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    all.push(
      ...freeOverlap(
        events,
        personA,
        personB,
        dayISO,
        windowStartHour,
        windowEndHour,
        slotMinutes
      )
    );
  }
  return all;
}
