import type { CalEvent, OverlapMode } from "./types";
import { DEMO_WEEK_START } from "./demo-data";

export type Slot = { start: Date; end: Date; dayISO: string };

export type OverlapOptions = {
  mode?: OverlapMode;
  weekStartISO?: string;
  days?: number;
  windowStartHour?: number;
  windowEndHour?: number;
  slotMinutes?: number;
};

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

/** Whether an event blocks a slot under the given overlap mode. */
export function eventBlocksSlot(event: CalEvent, mode: OverlapMode): boolean {
  const strength = event.strength ?? "hard";
  // Soft prefs only block in balanced mode
  if (strength === "soft") {
    return mode === "balanced";
  }
  // Hard events (classes, hard prefs) always block
  // strict and max share the same busy set in v1
  return true;
}

function busyEventsForPeople(
  events: CalEvent[],
  personA: string,
  personB: string,
  mode: OverlapMode
): CalEvent[] {
  return events.filter(
    (e) =>
      (e.personId === personA || e.personId === personB) &&
      eventBlocksSlot(e, mode)
  );
}

/** Find free slots on a day where neither person is blocked under mode. */
export function freeOverlap(
  events: CalEvent[],
  personA: string,
  personB: string,
  dayISO: string,
  windowStartHour = 9,
  windowEndHour = 21,
  slotMinutes = 60,
  mode: OverlapMode = "balanced"
): Slot[] {
  const dayStart = new Date(`${dayISO}T00:00:00`);
  const busy = busyEventsForPeople(events, personA, personB, mode);
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
  options: OverlapOptions | string = {}
): Slot[] {
  // Back-compat: 4th arg used to be weekStartISO string
  const opts: OverlapOptions =
    typeof options === "string" ? { weekStartISO: options } : options;

  const {
    mode = "balanced",
    weekStartISO = DEMO_WEEK_START,
    days = 5,
    windowStartHour = 9,
    windowEndHour = 21,
    slotMinutes = 60,
  } = opts;

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
        slotMinutes,
        mode
      )
    );
  }
  return all;
}
