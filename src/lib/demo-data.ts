import { ALEX_ID, DEMO_WEEK_START, YOU_ID } from "./constants";
import { eventContentHash } from "./hash";
import { resolveLocation } from "./resolveLocation";
import type { CalEvent, Person, Preference, ShareLink } from "./types";

export { ALEX_ID, DEMO_WEEK_START, YOU_ID };

export const people: Person[] = [
  {
    id: YOU_ID,
    name: "You",
    homeAddress: "Sproul Hall, UCLA",
    homeLat: 34.0721,
    homeLng: -118.4502,
    travelMode: "walk",
  },
  {
    id: ALEX_ID,
    name: "Alex",
    travelMode: "walk",
  },
];

function ev(
  partial: Omit<CalEvent, "updatedAt" | "source" | "contentHash"> & {
    source?: CalEvent["source"];
    building?: string;
  }
): CalEvent {
  const location = partial.location
    ?? (partial.building ? resolveLocation(partial.building) : undefined);
  const { building: _b, ...rest } = partial;
  const base: CalEvent = {
    ...rest,
    location,
    source: partial.source ?? "demo",
    updatedAt: "2026-09-01T00:00:00.000Z",
  };
  return { ...base, contentHash: eventContentHash(base) };
}

export const demoEvents: CalEvent[] = [
  ev({
    id: "cs31-lec-mon",
    title: "CS 31 Lecture",
    start: "2026-09-28T10:00:00",
    end: "2026-09-28T11:50:00",
    building: "Boelter 3400",
    kind: "lecture",
    personId: YOU_ID,
  }),
  ev({
    id: "cs31-lec-wed",
    title: "CS 31 Lecture",
    start: "2026-09-30T10:00:00",
    end: "2026-09-30T11:50:00",
    building: "Boelter 3400",
    kind: "lecture",
    personId: YOU_ID,
  }),
  ev({
    id: "cs31-disc-fri",
    title: "CS 31 Discussion",
    start: "2026-10-02T12:00:00",
    end: "2026-10-02T12:50:00",
    building: "Boelter 5249",
    kind: "discussion",
    personId: YOU_ID,
  }),
  ev({
    id: "ge-tue",
    title: "GE Cluster Lecture",
    start: "2026-09-29T14:00:00",
    end: "2026-09-29T15:15:00",
    building: "Bunche 2209",
    kind: "lecture",
    personId: YOU_ID,
  }),
  ev({
    id: "ge-thu",
    title: "GE Cluster Lecture",
    start: "2026-10-01T14:00:00",
    end: "2026-10-01T15:15:00",
    building: "Bunche 2209",
    kind: "lecture",
    personId: YOU_ID,
  }),
  ev({
    id: "oh-wed",
    title: "TA Office Hours",
    start: "2026-09-30T12:00:00",
    end: "2026-09-30T13:00:00",
    building: "Bunche 2209",
    kind: "other",
    personId: YOU_ID,
  }),
  ev({
    id: "cs31-midterm",
    title: "CS 31 Midterm",
    start: "2026-10-30T10:00:00",
    end: "2026-10-30T11:50:00",
    building: "Boelter 3400",
    kind: "exam",
    personId: YOU_ID,
  }),
  ev({
    id: "cs31-pset3",
    title: "CS 31 Problem Set 3",
    start: "2026-10-15T23:59:00",
    end: "2026-10-15T23:59:00",
    kind: "due_date",
    personId: YOU_ID,
  }),
  ev({
    id: "ge-midterm",
    title: "GE Cluster Midterm",
    start: "2026-11-05T14:00:00",
    end: "2026-11-05T15:15:00",
    building: "Bunche 2209",
    kind: "exam",
    personId: YOU_ID,
  }),
  ev({
    id: "ge-essay",
    title: "GE Cluster Essay",
    start: "2026-10-22T17:00:00",
    end: "2026-10-22T17:00:00",
    kind: "due_date",
    personId: YOU_ID,
  }),
  ev({
    id: "cs31-final",
    title: "CS 31 Final",
    start: "2026-12-10T15:00:00",
    end: "2026-12-10T18:00:00",
    building: "Boelter 3400",
    kind: "exam",
    personId: YOU_ID,
  }),
  ev({
    id: "ge-final",
    title: "GE Cluster Final",
    start: "2026-12-12T08:00:00",
    end: "2026-12-12T11:00:00",
    building: "Bunche 2209",
    kind: "exam",
    personId: YOU_ID,
  }),
  ev({
    id: "alex-busy-tue",
    title: "Econ Lecture",
    start: "2026-09-29T09:00:00",
    end: "2026-09-29T11:00:00",
    building: "Bunche",
    kind: "lecture",
    personId: ALEX_ID,
  }),
  ev({
    id: "alex-busy-thu",
    title: "Lab",
    start: "2026-10-01T13:00:00",
    end: "2026-10-01T16:00:00",
    building: "Boelter",
    kind: "lecture",
    personId: ALEX_ID,
  }),
  ev({
    id: "alex-gym-mon",
    title: "Gym",
    start: "2026-09-28T17:00:00",
    end: "2026-09-28T18:30:00",
    building: "Wooden",
    kind: "preference",
    personId: ALEX_ID,
    source: "arranged",
  }),
];

export const demoPreferences: Preference[] = [
  {
    id: "pref-gym",
    personId: YOU_ID,
    label: "Gym",
    targetPerWeek: 3,
    durationMin: 60,
    priority: 1,
    windows: [
      { day: 1, startMin: 17 * 60, endMin: 20 * 60 },
      { day: 2, startMin: 17 * 60, endMin: 20 * 60 },
      { day: 3, startMin: 17 * 60, endMin: 20 * 60 },
      { day: 4, startMin: 17 * 60, endMin: 20 * 60 },
      { day: 5, startMin: 17 * 60, endMin: 20 * 60 },
    ],
  },
  {
    id: "pref-relax",
    personId: YOU_ID,
    label: "Relaxation",
    targetPerWeek: 2,
    durationMin: 45,
    priority: 2,
    windows: [
      { day: 0, startMin: 14 * 60, endMin: 18 * 60 },
      { day: 6, startMin: 14 * 60, endMin: 18 * 60 },
      { day: 3, startMin: 19 * 60, endMin: 21 * 60 },
    ],
  },
  {
    id: "pref-social",
    personId: YOU_ID,
    label: "Social",
    targetPerWeek: 1,
    durationMin: 90,
    priority: 3,
    windows: [
      { day: 5, startMin: 18 * 60, endMin: 22 * 60 },
      { day: 6, startMin: 18 * 60, endMin: 22 * 60 },
    ],
  },
];

export const demoShareLink: ShareLink = {
  token: "demo-share-alex",
  personId: YOU_ID,
  expiresAt: "2027-01-01T00:00:00.000Z",
  scope: "free_busy",
  revoked: false,
  prefsAsFree: false,
};

/** @deprecated use STATIC_WALK_MIN via travelTime */
export const walkMinutes: Record<string, number> = {
  "Boelter|Bunche": 12,
  "Bunche|Boelter": 12,
  "Boelter|Royce": 10,
  "Royce|Boelter": 10,
  "Bunche|Powell": 8,
  "Powell|Bunche": 8,
};
