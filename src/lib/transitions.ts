import { leaveByLocal, sameLocalDay, toMs } from "./time";
import { estimateTravel } from "./travelTime";
import type { CalEvent, TransitionCue, TravelMode } from "./types";

const BUFFER_MIN = 5;

export function transitionCues(
  events: CalEvent[],
  personId: string,
  mode: TravelMode = "walk",
  home?: { lat: number; lng: number; raw?: string }
): TransitionCue[] {
  const mine = events
    .filter((e) => e.personId === personId)
    .sort((a, b) => toMs(a.start) - toMs(b.start));

  const cues: TransitionCue[] = [];

  for (let i = 0; i < mine.length; i++) {
    const cur = mine[i];
    const next = mine[i + 1];

    if (i === 0 && home && cur.location?.lat != null && cur.location.lng != null) {
      const travel = estimateTravel(
        { raw: home.raw ?? "Home", lat: home.lat, lng: home.lng, building: "Home" },
        cur.location,
        mode
      );
      if (travel && travel.durationMin > 0) {
        cues.push({
          fromEventId: "home",
          toEventId: cur.id,
          leaveBy: leaveByLocal(cur.start, travel.durationMin),
          gapMin: travel.durationMin,
          travelMin: travel.durationMin,
          tight: false,
          fromLabel: "Home",
          toLabel: cur.title,
          approximate: travel.approximate,
        });
      }
    }

    if (!next || !sameLocalDay(cur.start, next.start)) continue;
    const travel = estimateTravel(cur.location, next.location, mode);
    if (!travel || travel.durationMin <= 0) continue;

    const gapMin = Math.round((toMs(next.start) - toMs(cur.end)) / 60_000);
    const tight = gapMin < travel.durationMin + BUFFER_MIN;
    cues.push({
      fromEventId: cur.id,
      toEventId: next.id,
      leaveBy: leaveByLocal(next.start, travel.durationMin),
      gapMin,
      travelMin: travel.durationMin,
      tight,
      fromLabel: cur.title,
      toLabel: next.title,
      approximate: travel.approximate,
    });
  }

  return cues;
}

export function tightOnly(cues: TransitionCue[]): TransitionCue[] {
  return cues.filter((c) => c.tight);
}
