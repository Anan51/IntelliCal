import { walkMinutes } from "./demo-data";
import type { CalEvent } from "./types";

export function walkBetween(a?: string, b?: string): number | null {
  if (!a || !b || a === b) return 0;
  return walkMinutes[`${a}|${b}`] ?? null;
}

export function tightTransitions(events: CalEvent[], personId: string) {
  const mine = events
    .filter((e) => e.personId === personId)
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const warnings: string[] = [];
  for (let i = 0; i < mine.length - 1; i++) {
    const cur = mine[i];
    const next = mine[i + 1];
    const gapMin = (+new Date(next.start) - +new Date(cur.end)) / 60_000;
    const walk = walkBetween(cur.building, next.building);
    if (walk != null && gapMin < walk + 2) {
      warnings.push(
        `${cur.title} → ${next.title}: ${gapMin} min gap, ~${walk} min walk (${cur.building} → ${next.building})`
      );
    }
  }
  return warnings;
}
