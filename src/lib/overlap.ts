import { DEMO_WEEK_START } from "./constants";
import { overlapFreeSlots, topHangoutSuggestions } from "./freeBusy";
import type { CalEvent, FreeSlot } from "./types";

export type Slot = {
  start: Date;
  end: Date;
  dayISO: string;
  durationMin: number;
};

function toSlot(f: FreeSlot): Slot {
  return {
    start: new Date(f.start),
    end: new Date(f.end),
    dayISO: f.dayISO,
    durationMin: f.durationMin,
  };
}

/** Compatibility wrapper used by UI — backed by freeBusy overlap. */
export function freeOverlapWeek(
  events: CalEvent[],
  personA: string,
  personB: string,
  weekStartISO = DEMO_WEEK_START,
  days = 5,
  windowStartHour = 9,
  windowEndHour = 21,
  _slotMinutes = 60,
  prefsAsFree = false
): Slot[] {
  return overlapFreeSlots(events, personA, personB, weekStartISO, {
    days,
    dayStartHour: windowStartHour,
    dayEndHour: windowEndHour,
    prefsAsFree,
    minSlotMin: 60,
  }).map(toSlot);
}

export { overlapFreeSlots, topHangoutSuggestions };
