import { tightOnly, transitionCues } from "./transitions";
import type { CalEvent, TransitionCue, TravelMode } from "./types";

export type WalkWarning = {
  message: string;
  from: CalEvent;
  to: CalEvent;
  gapMin: number;
  walkMin: number;
  leaveBy: string;
  approximate: boolean;
};

export function tightTransitions(
  events: CalEvent[],
  personId: string,
  mode: TravelMode = "walk"
): WalkWarning[] {
  const byId = new Map(events.map((e) => [e.id, e]));
  return tightOnly(transitionCues(events, personId, mode)).flatMap((cue) => {
    const from = byId.get(cue.fromEventId);
    const to = byId.get(cue.toEventId);
    if (!from || !to) return [];
    return [
      {
        message: `${cue.fromLabel} → ${cue.toLabel}: ${cue.gapMin} min gap, ~${cue.travelMin} min ${mode}${cue.approximate ? " (est.)" : ""}`,
        from,
        to,
        gapMin: cue.gapMin,
        walkMin: cue.travelMin,
        leaveBy: cue.leaveBy,
        approximate: cue.approximate,
      },
    ];
  });
}

export function allTransitionCues(
  events: CalEvent[],
  personId: string,
  mode: TravelMode = "walk",
  home?: { lat: number; lng: number; raw?: string }
): TransitionCue[] {
  return transitionCues(events, personId, mode, home);
}
