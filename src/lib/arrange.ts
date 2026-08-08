import { subtractIntervals } from "./intervals";
import { newId } from "./id";
import { estimateTravel } from "./travelTime";
import { expandEvents } from "./recurrence";
import type { ArrangeResult, CalEvent, Preference, TravelMode } from "./types";
import {
  addDaysISO,
  eachDayISO,
  localDateTimeISO,
  minutesToHHMM,
  toMs,
  weekStartMonday,
} from "./time";
import { eventContentHash } from "./hash";

export type ArrangeOptions = {
  weekStartISO: string;
  days?: number;
  mode?: TravelMode;
  /** Existing arranged preference events that are pinned (source === manual) stay. */
  nowISO?: string;
};

function preferenceBusyPadding(
  previous: CalEvent | undefined,
  candidateStartMs: number,
  candidateLoc: CalEvent["location"],
  mode: TravelMode
): number {
  if (!previous?.location || !candidateLoc) return 0;
  const travel = estimateTravel(previous.location, candidateLoc, mode);
  if (!travel) return 0;
  const gap = (candidateStartMs - toMs(previous.end)) / 60_000;
  if (gap < travel.durationMin) {
    return travel.durationMin - gap;
  }
  return 0;
}

/**
 * Greedy arranger: sort preferences by priority (1 highest), then earliest-fit
 * within each preference's windows. Deterministic for identical inputs.
 */
export function arrangePreferences(
  events: CalEvent[],
  preferences: Preference[],
  options: ArrangeOptions
): ArrangeResult {
  const days = options.days ?? 7;
  const mode = options.mode ?? "walk";
  const weekStart = weekStartMonday(options.weekStartISO);
  const dayISOs = eachDayISO(weekStart, days);
  const rangeStart = new Date(localDateTimeISO(dayISOs[0], "00:00"));
  const rangeEnd = new Date(localDateTimeISO(addDaysISO(dayISOs[dayISOs.length - 1], 1), "00:00"));
  const nowMs = options.nowISO ? toMs(options.nowISO) : rangeStart.getTime();

  const pinned = events.filter(
    (e) =>
      e.kind === "preference" &&
      e.source === "manual" &&
      toMs(e.start) >= nowMs
  );

  const baseEvents = events.filter((e) => {
    if (e.kind !== "preference") return true;
    if (e.source === "manual") return true;
    // Drop previous arranged blocks in the horizon; they will be re-placed.
    return toMs(e.start) < nowMs || !dayISOs.some((d) => e.start.startsWith(d));
  });

  const expandedBusy = expandEvents(baseEvents, rangeStart, rangeEnd).sort(
    (a, b) => toMs(a.start) - toMs(b.start)
  );

  const placed: CalEvent[] = [...pinned];
  const unmet: ArrangeResult["unmet"] = [];

  const sortedPrefs = [...preferences].sort(
    (a, b) => a.priority - b.priority || a.label.localeCompare(b.label)
  );

  for (const pref of sortedPrefs) {
    let count = placed.filter(
      (p) => p.title === pref.label && p.personId === pref.personId
    ).length;
    const target = pref.targetPerWeek;

    for (const dayISO of dayISOs) {
      if (count >= target) break;
      const dow = new Date(`${dayISO}T12:00:00`).getDay();
      const windows = pref.windows
        .filter((w) => w.day === dow)
        .sort((a, b) => a.startMin - b.startMin);

      for (const win of windows) {
        if (count >= target) break;
        const window = {
          startMs: toMs(localDateTimeISO(dayISO, minutesToHHMM(win.startMin))),
          endMs: toMs(localDateTimeISO(dayISO, minutesToHHMM(win.endMin))),
        };

        const dayBusy = [...expandedBusy, ...placed]
          .filter((e) => e.personId === pref.personId && e.start.startsWith(dayISO))
          .map((e) => ({ startMs: toMs(e.start), endMs: toMs(e.end) }));

        const free = subtractIntervals(window, dayBusy);
        for (const f of free) {
          if (count >= target) break;
          const needMs = pref.durationMin * 60_000;
          if (f.endMs - f.startMs < needMs) continue;

          let startMs = f.startMs;
          const dayEvents = [...expandedBusy, ...placed]
            .filter((e) => e.personId === pref.personId && e.start.startsWith(dayISO))
            .sort((a, b) => toMs(a.start) - toMs(b.start));
          const prev = [...dayEvents].reverse().find((e) => toMs(e.end) <= startMs + needMs);
          const gymLoc = {
            raw: "John Wooden Center",
            building: "John Wooden Center",
            lat: 34.0709,
            lng: -118.4455,
          };
          const pad = preferenceBusyPadding(prev, startMs, gymLoc, mode);
          startMs += pad * 60_000;
          if (f.endMs - startMs < needMs) continue;

          const start = new Date(startMs);
          const end = new Date(startMs + needMs);
          const ev: CalEvent = {
            id: newId("pref"),
            personId: pref.personId,
            title: pref.label,
            start: `${dayISO}T${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}:00`,
            end: `${dayISO}T${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}:00`,
            kind: "preference",
            location: gymLoc,
            source: "arranged",
            updatedAt: new Date().toISOString(),
          };
          ev.contentHash = eventContentHash(ev);
          placed.push(ev);
          count += 1;
        }
      }
    }

    if (count < target) {
      unmet.push({
        preferenceId: pref.id,
        label: pref.label,
        placed: count,
        target,
      });
    }
  }

  return {
    placed: placed.filter((p) => p.source === "arranged" || p.source === "manual"),
    unmet,
  };
}

/** Merge arranged preference events into the calendar, replacing old arranged ones in-horizon. */
export function applyArrangement(
  events: CalEvent[],
  arranged: CalEvent[],
  weekStartISO: string,
  days = 7
): CalEvent[] {
  const dayISOs = new Set(eachDayISO(weekStartMonday(weekStartISO), days));
  const kept = events.filter((e) => {
    if (e.kind !== "preference") return true;
    if (e.source === "manual") return true;
    if (e.source === "arranged" && dayISOs.has(e.start.slice(0, 10))) return false;
    return true;
  });
  return [...kept, ...arranged.filter((a) => a.source === "arranged")];
}
