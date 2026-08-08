/**
 * IntelliCal core types (Phase 1).
 *
 * Day convention for Preference.windows[].days: 0 = Mon … 4 = Fri
 * (matches the Mon–Fri week grid). Weekend not modeled in Phase 1.
 * Timezone default: America/Los_Angeles.
 */

export type Strength = "hard" | "soft";

export type EventSource = "syllabus" | "gcal" | "manual" | "inferred" | "share";

export type OverlapMode = "strict" | "balanced" | "max";

export type EventKind =
  | "lecture"
  | "discussion"
  | "exam"
  | "busy"
  | "other";

export type PreferenceCategory =
  | "gym"
  | "downtime"
  | "social"
  | "focus"
  | "quiet_hours"
  | "custom";

export type CalEvent = {
  id: string;
  title: string;
  start: string; // ISO local-ish
  end: string;
  building?: string;
  kind: EventKind;
  personId: string;
  /** Optional Phase 1 fields — demo remains compatible without them */
  source?: EventSource;
  strength?: Strength; // classes default hard
  preferenceId?: string;
  timezone?: string; // America/Los_Angeles
};

export type Person = {
  id: string;
  name: string;
};

export type PreferenceWindow = {
  /** 0=Mon … 4=Fri */
  days: number[];
  startMin: number;
  endMin: number;
};

export type Preference = {
  id: string;
  userId: string; // "you" for demo
  category: PreferenceCategory;
  label: string;
  strength: Strength;
  windows?: PreferenceWindow[];
  flexible?: {
    timesPerWeek: number;
    durationMin: number;
    preferredBands: { startMin: number; endMin: number }[];
  };
  locationText?: string;
  createdFrom?: "manual" | "inference";
  evidence?: { note?: string };
};

export const TIMEZONE = "America/Los_Angeles";

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
