import { mergeIntervals, subtractIntervals } from "./intervals";
import { expandEvents } from "./recurrence";
import type { BusyBlock, CalEvent, FreeSlot, Interval } from "./types";
import { eachDayISO, formatISODate, localDateTimeISO, pad2, toMs } from "./time";

function msToLocalISO(ms: number): string {
  const d = new Date(ms);
  return `${formatISODate(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export type FreeBusyOptions = {
  rangeStart: Date;
  rangeEnd: Date;
  /** When true, preference blocks count as free (for hangout planning). */
  prefsAsFree?: boolean;
  dayStartHour?: number;
  dayEndHour?: number;
};

function isBusyKind(event: CalEvent, prefsAsFree: boolean): boolean {
  if (event.kind === "preference" && prefsAsFree) return false;
  return true;
}

export function toBusyBlocks(
  events: CalEvent[],
  options: FreeBusyOptions
): BusyBlock[] {
  const prefsAsFree = options.prefsAsFree ?? false;
  const expanded = expandEvents(events, options.rangeStart, options.rangeEnd).filter((e) =>
    isBusyKind(e, prefsAsFree)
  );
  const intervals = mergeIntervals(
    expanded.map((e) => ({ startMs: toMs(e.start), endMs: toMs(e.end) }))
  );
  return intervals.map((i) => ({
    start: msToLocalISO(i.startMs),
    end: msToLocalISO(i.endMs),
  }));
}

/** Privacy-safe projection: times only, no titles/locations. */
export function projectFreeBusy(
  events: CalEvent[],
  options: FreeBusyOptions
): BusyBlock[] {
  return toBusyBlocks(events, options).map(({ start, end }) => ({ start, end }));
}

export function freeSlotsForPerson(
  events: CalEvent[],
  personId: string,
  weekStartISO: string,
  options: Omit<FreeBusyOptions, "rangeStart" | "rangeEnd"> & {
    days?: number;
    minSlotMin?: number;
  } = {}
): FreeSlot[] {
  const days = options.days ?? 5;
  const dayStartHour = options.dayStartHour ?? 9;
  const dayEndHour = options.dayEndHour ?? 21;
  const minSlotMin = options.minSlotMin ?? 30;
  const prefsAsFree = options.prefsAsFree ?? false;

  const dayISOs = eachDayISO(weekStartISO, days);
  const rangeStart = new Date(localDateTimeISO(dayISOs[0], `${dayStartHour}:00`));
  const rangeEnd = new Date(localDateTimeISO(dayISOs[dayISOs.length - 1], `${dayEndHour}:00`));

  const mine = events.filter((e) => e.personId === personId);
  const expanded = expandEvents(mine, rangeStart, rangeEnd).filter((e) =>
    isBusyKind(e, prefsAsFree)
  );

  const slots: FreeSlot[] = [];
  for (const dayISO of dayISOs) {
    const window: Interval = {
      startMs: toMs(localDateTimeISO(dayISO, `${dayStartHour}:00`)),
      endMs: toMs(localDateTimeISO(dayISO, `${dayEndHour}:00`)),
    };
    const busy = expanded
      .filter((e) => e.start.startsWith(dayISO))
      .map((e) => ({ startMs: toMs(e.start), endMs: toMs(e.end) }));
    const free = subtractIntervals(window, busy);
    for (const f of free) {
      const durationMin = Math.round((f.endMs - f.startMs) / 60_000);
      if (durationMin < minSlotMin) continue;
      slots.push({
        start: msToLocalISO(f.startMs),
        end: msToLocalISO(f.endMs),
        dayISO,
        durationMin,
      });
    }
  }
  return slots;
}

export function overlapFreeSlots(
  events: CalEvent[],
  personA: string,
  personB: string,
  weekStartISO: string,
  options: {
    days?: number;
    dayStartHour?: number;
    dayEndHour?: number;
    prefsAsFree?: boolean;
    minSlotMin?: number;
  } = {}
): FreeSlot[] {
  const a = freeSlotsForPerson(events, personA, weekStartISO, options);
  const bBusy = toBusyBlocks(
    events.filter((e) => e.personId === personB),
    {
      rangeStart: new Date(localDateTimeISO(weekStartISO, "00:00")),
      rangeEnd: new Date(
        localDateTimeISO(
          eachDayISO(weekStartISO, options.days ?? 5).at(-1) ?? weekStartISO,
          "23:59"
        )
      ),
      prefsAsFree: options.prefsAsFree,
    }
  );
  const bIntervals = bBusy.map((x) => ({ startMs: toMs(x.start), endMs: toMs(x.end) }));

  const out: FreeSlot[] = [];
  for (const slot of a) {
    const window = { startMs: toMs(slot.start), endMs: toMs(slot.end) };
    const free = subtractIntervals(window, bIntervals);
    for (const f of free) {
      const durationMin = Math.round((f.endMs - f.startMs) / 60_000);
      if (durationMin < (options.minSlotMin ?? 30)) continue;
      out.push({
        start: msToLocalISO(f.startMs),
        end: msToLocalISO(f.endMs),
        dayISO: slot.dayISO,
        durationMin,
      });
    }
  }
  return out.sort((x, y) => y.durationMin - x.durationMin || toMs(x.start) - toMs(y.start));
}

export function topHangoutSuggestions(slots: FreeSlot[], n = 3): FreeSlot[] {
  return slots.slice(0, n);
}
