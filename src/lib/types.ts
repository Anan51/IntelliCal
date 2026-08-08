export type EventKind =
  | "lecture"
  | "discussion"
  | "exam"
  | "due_date"
  | "preference"
  | "external"
  | "other";

export type EventSource = "syllabus" | "manual" | "sync" | "arranged" | "demo";

export type TravelMode = "walk" | "bike" | "transit";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Location = {
  raw: string;
  building?: string;
  room?: string;
  lat?: number;
  lng?: number;
};

export type CalEvent = {
  id: string;
  personId: string;
  title: string;
  start: string;
  end: string;
  kind: EventKind;
  recurrence?: string;
  location?: Location;
  source: EventSource;
  externalId?: string;
  contentHash?: string;
  updatedAt: string;
};

export type TimeWindow = {
  day: DayOfWeek;
  startMin: number;
  endMin: number;
};

export type Preference = {
  id: string;
  personId: string;
  label: string;
  targetPerWeek: number;
  durationMin: number;
  windows: TimeWindow[];
  priority: 1 | 2 | 3;
};

export type Person = {
  id: string;
  name: string;
  homeAddress?: string;
  homeLat?: number;
  homeLng?: number;
  travelMode: TravelMode;
};

export type ShareLink = {
  token: string;
  personId: string;
  expiresAt: string;
  scope: "free_busy";
  revoked: boolean;
  prefsAsFree: boolean;
};

export type ParsedFieldConfidence = {
  title: number;
  start: number;
  end: number;
  kind: number;
  location: number;
};

export type ParsedEvent = {
  draftId: string;
  title: string;
  start: string;
  end: string;
  kind: EventKind;
  location?: Location;
  recurrence?: string;
  confidence: ParsedFieldConfidence;
};

export type Interval = {
  startMs: number;
  endMs: number;
};

export type BusyBlock = {
  start: string;
  end: string;
};

export type FreeSlot = {
  start: string;
  end: string;
  dayISO: string;
  durationMin: number;
};

export type SyncOp =
  | { op: "create"; local?: CalEvent; remote?: CalEvent }
  | { op: "update"; local: CalEvent; remote: CalEvent; winner: "local" | "remote" }
  | { op: "delete"; side: "local" | "remote"; event: CalEvent };

export type TravelEstimate = {
  durationMin: number;
  approximate: boolean;
  mode: TravelMode;
};

export type TransitionCue = {
  fromEventId: string;
  toEventId: string;
  leaveBy: string;
  gapMin: number;
  travelMin: number;
  tight: boolean;
  fromLabel: string;
  toLabel: string;
  approximate: boolean;
};

export type ArrangeResult = {
  placed: CalEvent[];
  unmet: { preferenceId: string; label: string; placed: number; target: number }[];
};

export const EVENT_KINDS: readonly EventKind[] = [
  "lecture",
  "discussion",
  "exam",
  "due_date",
  "preference",
  "external",
  "other",
] as const;

export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
