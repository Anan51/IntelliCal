import { walkMinutes } from "./demo-data";
import type { CalEvent } from "./types";

export type WalkWarning = {
  message: string;
  from: CalEvent;
  to: CalEvent;
  gapMin: number;
  walkMin: number;
};

export function walkBetween(a?: string, b?: string): number | null {
  if (!a || !b || a === b) return 0;
  return walkMinutes[`${a}|${b}`] ?? null;
}

export function tightTransitions(events: CalEvent[], personId: string): WalkWarning[] {
  const mine = events
    .filter((e) => e.personId === personId)
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const warnings: WalkWarning[] = [];
  for (let i = 0; i < mine.length - 1; i++) {
    const cur = mine[i];
    const next = mine[i + 1];
    const sameDay =
      new Date(cur.start).toDateString() === new Date(next.start).toDateString();
    if (!sameDay) continue;
    const gapMin = (+new Date(next.start) - +new Date(cur.end)) / 60_000;
    const walk = walkBetween(cur.building, next.building);
    if (walk != null && walk > 0 && gapMin < walk + 2) {
      warnings.push({
        message: `${cur.title} → ${next.title}: ${Math.round(gapMin)} min gap, ~${walk} min walk (${cur.building ?? "?"} → ${next.building ?? "?"})`,
        from: cur,
        to: next,
        gapMin: Math.round(gapMin),
        walkMin: walk,
      });
    }
  }
  return warnings;
}
