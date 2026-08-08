import type { CalEvent, Person } from "./types";

export const people: Person[] = [
  { id: "you", name: "You" },
  { id: "alex", name: "Alex" },
];

/** Demo week: Mon 2026-09-28 (UCLA-ish fall vibe) */
export const demoEvents: CalEvent[] = [
  {
    id: "cs31-lec-mon",
    title: "CS 31 Lecture",
    start: "2026-09-28T10:00:00",
    end: "2026-09-28T11:50:00",
    building: "Boelter",
    kind: "lecture",
    personId: "you",
  },
  {
    id: "cs31-lec-wed",
    title: "CS 31 Lecture",
    start: "2026-09-30T10:00:00",
    end: "2026-09-30T11:50:00",
    building: "Boelter",
    kind: "lecture",
    personId: "you",
  },
  {
    id: "ge-tue",
    title: "GE Cluster Lecture",
    start: "2026-09-29T14:00:00",
    end: "2026-09-29T15:15:00",
    building: "Bunche",
    kind: "lecture",
    personId: "you",
  },
  {
    id: "ge-thu",
    title: "GE Cluster Lecture",
    start: "2026-10-01T14:00:00",
    end: "2026-10-01T15:15:00",
    building: "Bunche",
    kind: "lecture",
    personId: "you",
  },
  {
    id: "gym-mon",
    title: "Gym",
    start: "2026-09-28T18:00:00",
    end: "2026-09-28T19:00:00",
    kind: "busy",
    personId: "you",
  },
  {
    id: "alex-busy-tue",
    title: "Alex class",
    start: "2026-09-29T09:00:00",
    end: "2026-09-29T11:00:00",
    kind: "lecture",
    personId: "alex",
  },
  {
    id: "alex-busy-thu",
    title: "Alex class",
    start: "2026-10-01T13:00:00",
    end: "2026-10-01T16:00:00",
    kind: "lecture",
    personId: "alex",
  },
];

export const walkMinutes: Record<string, number> = {
  "Boelter|Bunche": 12,
  "Bunche|Boelter": 12,
  "Boelter|Royce": 10,
  "Royce|Boelter": 10,
  "Bunche|Powell": 8,
  "Powell|Bunche": 8,
};
