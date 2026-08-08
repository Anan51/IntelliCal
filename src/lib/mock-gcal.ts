/**
 * Mock Google Calendar history for demo connect (Phase 1 — no OAuth).
 * Real Auth.js + calendar.readonly comes in Phase 2.
 */
import type { CalEvent } from "./types";
import { TIMEZONE } from "./types";
import type { Preference } from "./types";

/** Extra personal busy blocks as if pulled from GCal */
export const MOCK_GCAL_EVENTS: CalEvent[] = [
  {
    id: "gcal-study-tue",
    title: "Study group",
    start: "2026-09-29T16:00:00",
    end: "2026-09-29T17:30:00",
    kind: "busy",
    personId: "you",
    source: "gcal",
    strength: "hard",
    timezone: TIMEZONE,
  },
  {
    id: "gcal-club-thu",
    title: "ACM meeting",
    start: "2026-10-01T18:00:00",
    end: "2026-10-01T19:00:00",
    kind: "busy",
    personId: "you",
    source: "gcal",
    strength: "hard",
    timezone: TIMEZONE,
  },
];

export type PrefSuggestion = {
  id: string;
  label: string;
  evidence: string;
  draft: Preference;
};

/** Explainable suggestions from mock history (PRD FR-L5). */
export const MOCK_PREF_SUGGESTIONS: PrefSuggestion[] = [
  {
    id: "sug-gym",
    label: "Protect gym Mon/Wed evenings?",
    evidence: "Seen as Gym on your calendar pattern · 6× in demo history",
    draft: {
      id: "pref-sug-gym",
      userId: "you",
      category: "gym",
      label: "Gym",
      strength: "soft",
      windows: [{ days: [0, 2], startMin: 18 * 60, endMin: 19 * 60 }],
      locationText: "John Wooden Center",
      createdFrom: "inference",
      evidence: { note: "Mock GCal pattern · Mon/Wed 6–7pm" },
    },
  },
  {
    id: "sug-focus",
    label: "Protect a Tue/Thu focus block?",
    evidence: "Recurring free afternoons often used for deep work",
    draft: {
      id: "pref-sug-focus",
      userId: "you",
      category: "focus",
      label: "Focus",
      strength: "soft",
      windows: [{ days: [1, 3], startMin: 15 * 60, endMin: 17 * 60 }],
      createdFrom: "inference",
      evidence: { note: "Mock suggestion from calendar gaps" },
    },
  },
];
